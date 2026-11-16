import 'server-only';
import manifest from './r2Images.private.json';
import { fromManifest } from './r2Image';

export type PrivateR2ImageId = keyof typeof manifest;

/**
 * A private project's image (source in assets/images/private/…). Kept in its own manifest, imported only
 * on the server, so the list of private projects' images never ships in the browser bundle.
 */
export const privateR2Image = (id: PrivateR2ImageId) => fromManifest(manifest, id);
