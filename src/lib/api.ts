import { invoke } from '@tauri-apps/api/core';

export interface CompileResult {
  ok: boolean;
  pdfPath: string | null;
  output: string;
  log: string;
  durationMs: number;
}

export const compile = (path: string) => invoke<CompileResult>('compile', { path });
export const readText = (path: string) => invoke<string>('read_text', { path });
export const writeText = (path: string, contents: string) =>
  invoke<void>('write_text', { path, contents });
export const copyFile = (from: string, to: string) => invoke<void>('copy_file', { from, to });
export const fileExists = (path: string) => invoke<boolean>('file_exists', { path });
export const readBytes = async (path: string) =>
  new Uint8Array(await invoke<ArrayBuffer>('read_bytes', { path }));

export interface UserTemplate {
  name: string;
  file: string;
  src: string;
}
export const listUserTemplates = () => invoke<UserTemplate[]>('list_user_templates');

export const basename = (p: string) => p.split('/').pop() ?? p;
export const dirname = (p: string) => p.slice(0, Math.max(0, p.lastIndexOf('/'))) || '/';
