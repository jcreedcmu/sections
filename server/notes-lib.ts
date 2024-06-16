import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Item, struct_of_notes } from './notes-lib-pure';

export const dataDir = path.join(__dirname, '../../../self');

export const ALL_NOTES_FILES: string[] = [
  'NOTES', 'IDEAS', 'IDEAS-2011-2016', 'CONWORLD', 'STORYMETA'
];

export function path_of_file(notesFile: string): string {
  return path.join(dataDir, notesFile);
}

export function safe_to_overwrite(filePath: string): boolean {
  const z = cp.spawnSync('git', ['status', '--porcelain=v1', filePath], { cwd: path.dirname(filePath) });
  if (z.error) {
    throw z.error;
  }
  return (!(z.stdout && z.stdout.length > 0));
}

export function get_all_items(): Item[] {
  const items: Item[] = [];
  ALL_NOTES_FILES.forEach(notesFile => {
    const lines = fs.readFileSync(path_of_file(notesFile), 'utf8');
    items.push(...struct_of_notes(notesFile, lines));
  });

  items.sort((a, b) => a.date.localeCompare(b.date));

  items.forEach(item => {
    if (!item.date.match(/^\d\d\d\d\.\d\d\.\d\d$/) && item.date !== '0')
      console.warn('WARNING: bad date', item);
  });

  return items;
}
