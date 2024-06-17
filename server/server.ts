import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { dataDir, get_all_items, path_of_file, safe_to_overwrite, } from '../lib/notes-lib';
import { ServerData, SidecarData, item_of_parsed_item, notes_of_struct, parsed_item_of_item } from '../lib/notes-lib-pure';
import { canonicalize } from './canonicalize';

const app = express();
const sidecarFile = path.join(dataDir, 'sidecar.json');

// Expects BODY to by JSON-encoded ServerData
app.post('/save', (req, res) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    const { items, sidecar }: ServerData = JSON.parse(data);
    const files = notes_of_struct(items.map(item_of_parsed_item));
    const paths = [...Object.keys(files), 'sidecar.json'].map(path_of_file);
    const unsafe_paths = paths.filter(path => !safe_to_overwrite(path));

    if (unsafe_paths.length > 0) {
      const appendNewline = (x: string) => `   ${x}\n`;
      const msg = `Refusing to proceed because there are uncommitted changes to:
 ${unsafe_paths.map(appendNewline).join('')}`;
      res.status(500);
      res.end(msg);
      return;
    }

    let msg = '';
    for (const notesFile of Object.keys(files)) {
      const path = path_of_file(notesFile);
      msg += `Generating ${notesFile}...\n`;
      fs.writeFileSync(path, files[notesFile].join('').replace(/\n$/, ''), 'utf8');
    }

    // write sidecar data
    const json = canonicalize(sidecar);
    if (json == undefined) {
      res.status(500);
      res.end(`${msg}\n ... but couldn't canonicalize sidecar data`);
      return;
    }
    msg += `Generating sidecar.json...\n`;
    fs.writeFileSync(sidecarFile, json, 'utf8');
    res.status(200);
    res.end(msg);
  });
});

app.use('/json/data.json', (req, res) => {
  const items = get_all_items().map(parsed_item_of_item);
  const sidecar: SidecarData = JSON.parse(fs.readFileSync(sidecarFile, 'utf8'));
  const data: ServerData = {
    items,
    sidecar,
  };
  res.json(data);
});

app.use('/', express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT == undefined ? 8000 : parseInt(process.env.PORT);

app.listen(PORT, '127.0.0.1', function() {
  console.log(`listening on port ${PORT}`);
});
