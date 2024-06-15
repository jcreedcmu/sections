import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { get_all_items, path_of_file, safe_to_overwrite, } from './notes-lib';
import { ParsedItem, item_of_parsed_item, notes_of_struct, parsed_item_of_item } from './notes-lib-pure';


const app = express();

// Expects BODY to by JSON-encoded ParsedItem[]
app.post('/save', (req, res) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    const items: ParsedItem[] = JSON.parse(data);
    const files = notes_of_struct(items.map(item_of_parsed_item));
    const paths = Object.keys(files).map(path_of_file);
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
    res.status(200);
    res.end(msg);
  });
});

// data.json is JSON-encoded ParsedItem[]
app.use('/json/data.json', (req, res) => {
  const data = get_all_items().map(parsed_item_of_item);
  res.json(data);
});

app.use('/', express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT == undefined ? 8000 : parseInt(process.env.PORT);

app.listen(PORT, '127.0.0.1', function() {
  console.log(`listening on port ${PORT}`);
});
