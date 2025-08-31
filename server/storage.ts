import fs from 'fs';
import path from 'path';

export function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

export function runDirFor(id: string) {
  const p = path.resolve('runs', id);
  ensureDir(p);
  return p;
}

export function listFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile());
}
