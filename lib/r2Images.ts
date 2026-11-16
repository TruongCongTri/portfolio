import manifest from './r2Images.json';
import { fromManifest } from './r2Image';

export type R2ImageId = keyof typeof manifest;

/** A public image on R2 by its path under assets/images, without extension, e.g. "projects/thanh-hoang/01". */
export const r2Image = (id: R2ImageId) => fromManifest(manifest, id);
