export interface Template {
  /** Unique id; also the thumbnail file name (src/assets/thumbs/<id>.png) */
  id: string;
  /** Position in the picker */
  order: number;
  name: string;
  desc: string;
  /** Suggested file name */
  file: string;
  src: string;
  /** Extra files copied next to the main file (e.g. a .cls the template needs) */
  files?: { name: string; src: string }[];
}
