/**
 * Converts every raster source in assets/images to WebP, uploads it to Cloudflare R2 and writes the
 * manifests the app reads image URLs, sizes and blur placeholders from:
 *
 *   npm run images:upload        (run `npm run images` first if a portrait / get-in-touch source changed)
 *
 * - assets/images/<path>.(png|jpg|jpeg|webp)  → assets/webp/<path>.webp (local copy, gitignored)
 *                                            → R2: images/<path>.<content hash>.webp
 * - assets/images/private/…                  → lib/r2Images.private.json (server-only: private projects)
 * - everything else                          → lib/r2Images.json
 *
 * A pre-processed WebP already in assets/webp (written by `npm run images`, e.g. the trimmed portrait)
 * is uploaded as-is instead of re-encoding the source. Keys carry a content hash, so objects are
 * immutable: unchanged images are skipped, and a changed image gets a new URL (no stale caches).
 *
 * Needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET (read from .env).
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  HeadObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

const SRC = 'assets/images';
const OUT = 'assets/webp';
const PREFIX = 'images';
/** Widest image Next's optimizer is asked for in practice (full-bleed heroes on 2× screens). */
const MAX_WIDTH = 2560;

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
for (const [name, value] of Object.entries({ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET })) {
  if (!value) throw new Error(`${name} is not set (add it to .env)`);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

// WebGL (the hero's ChromaticPortrait) loads its texture with crossOrigin="anonymous": allow GETs.
await s3.send(
  new PutBucketCorsCommand({
    Bucket: R2_BUCKET,
    CORSConfiguration: {
      CORSRules: [{ AllowedOrigins: ['*'], AllowedMethods: ['GET', 'HEAD'], AllowedHeaders: ['*'], MaxAgeSeconds: 86400 }],
    },
  }),
);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) yield full;
  }
}

const exists = async (file) => stat(file).then(() => true, () => false);

async function objectExists(Key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key }));
    return true;
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404) return false;
    throw error;
  }
}

const manifests = { public: {}, private: {} };
let uploaded = 0;
let skipped = 0;

for await (const file of walk(SRC)) {
  // "projects/thanh-hoang/01", "private/projects/film-files/hero", "portrait", …
  const id = path.relative(SRC, file).replace(/\\/g, '/').replace(/\.[^.]+$/, '');
  const webpPath = path.join(OUT, `${id}.webp`);
  const preprocessed = !file.endsWith('.webp') && (await exists(webpPath)) && (await stat(webpPath)).mtimeMs >= (await stat(file)).mtimeMs;

  let webp;
  if (preprocessed) {
    webp = await readFile(webpPath);
  } else {
    webp = await sharp(file)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toBuffer();
    await mkdir(path.dirname(webpPath), { recursive: true });
    await writeFile(webpPath, webp);
  }

  const { width, height } = await sharp(webp).metadata();
  // Same 8px-wide blur preview Next generates for static imports.
  const blur = await sharp(webp).resize(8, Math.max(1, Math.round((8 * height) / width))).webp({ quality: 70 }).toBuffer();
  const hash = createHash('sha256').update(webp).digest('hex').slice(0, 10);
  const key = `${PREFIX}/${id}.${hash}.webp`;

  if (await objectExists(key)) {
    skipped++;
  } else {
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: webp,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    uploaded++;
  }

  const isPrivate = id.startsWith('private/');
  const name = isPrivate ? id.slice('private/'.length) : id;
  manifests[isPrivate ? 'private' : 'public'][name] = {
    key,
    width,
    height,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
  };
  console.log(`${uploaded + skipped}. ${key}  ${width}×${height}  ${(webp.length / 1024) | 0} KB${preprocessed ? '  (pre-processed)' : ''}`);
}

const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
await writeFile('lib/r2Images.json', `${JSON.stringify(sorted(manifests.public), null, 2)}\n`);
await writeFile('lib/r2Images.private.json', `${JSON.stringify(sorted(manifests.private), null, 2)}\n`);
console.log(`\nUploaded ${uploaded}, already in R2 ${skipped}. Manifests: lib/r2Images.json, lib/r2Images.private.json`);
