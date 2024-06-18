import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Item, ParsedItem, ServerData, SidecarData, item_of_parsed_item, notes_of_struct, struct_of_notes } from './notes-lib-pure';
import { canonicalize } from '../server/canonicalize';

export const dataDir = path.join(__dirname, '../../../self');
export const sidecarFile = path.join(dataDir, 'sidecar.json');
export const collectedFile = path.join(dataDir, 'COLLECTED');

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

export class NotesWriteError extends Error { }

export function write_all_items(items: ParsedItem[]): string {
  let rv = '';

  const files = notes_of_struct(items.map(item_of_parsed_item));
  const paths = [...Object.keys(files), 'sidecar.json'].map(path_of_file);
  const unsafe_paths = paths.filter(path => !safe_to_overwrite(path));

  if (unsafe_paths.length > 0) {
    const appendNewline = (x: string) => `   ${x}\n`;
    const msg = `Refusing to proceed because there are uncommitted changes to:
${unsafe_paths.map(appendNewline).join('')}`;
    throw new NotesWriteError(msg);
  }

  let msg = '';
  for (const notesFile of Object.keys(files)) {
    const path = path_of_file(notesFile);
    msg += `Generating ${notesFile}...\n`;
    fs.writeFileSync(path, files[notesFile].join('').replace(/\n$/, ''), 'utf8');
  }

  return msg;
}

export function write_sidecar(sidecar: SidecarData): string {
  let msg = '';

  const json = canonicalize(sidecar);
  if (json == undefined) {
    throw new NotesWriteError(`${msg}\n ... but couldn't canonicalize sidecar data`);
  }
  msg += `Generating sidecar.json...\n`;
  fs.writeFileSync(sidecarFile, json, 'utf8');

  return msg;
}

export function write_all_data(data: ServerData): string {
  return write_all_items(data.items) + write_sidecar(data.sidecar);
}

export function get_collected(): string {
  return fs.readFileSync(collectedFile, 'utf8');
}
