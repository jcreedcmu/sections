import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { NotesWriteError, dataDir, get_all_items, get_collected, path_of_file, safe_to_overwrite, write_all_data, } from '../lib/notes-lib';
import { ServerData, SidecarData, item_of_parsed_item, notes_of_struct, parsed_item_of_item } from '../lib/notes-lib-pure';
import { canonicalize } from './canonicalize';

const app = express();
const sidecarFile = path.join(dataDir, 'sidecar.json'); // XXX import from lib

app.use('/image', (req, res) => {

  const path = req.path.toString();
  const allowed = path.match(new RegExp('^/home/jcreed/art')) ||
    path.match(new RegExp('^/home/jcreed/self/whiteboard'));
  if (allowed) {
    res.end(fs.readFileSync(path));
  }
  else {
    res.status(404);
    res.end('not found');
  }
});

// Expects BODY to by JSON-encoded ServerData
app.post('/save', (req, res) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    try {
      const msg = write_all_data(JSON.parse(data) as ServerData);
      res.status(200);
      res.end(msg);
    }
    catch (e) {
      if (e instanceof NotesWriteError) {
        res.status(500);
        res.end(e.message);
        return;
      }
      else {
        throw e;
      }
    }
  });
});

app.use('/json/data.json', (req, res) => {
  const items = get_all_items().map(parsed_item_of_item);
  const sidecar: SidecarData = JSON.parse(fs.readFileSync(sidecarFile, 'utf8'));
  const collected = get_collected();
  const data: ServerData = {
    items,
    sidecar,
    collected,
  };
  res.json(data);
});

app.use('/', express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT == undefined ? 8000 : parseInt(process.env.PORT);

app.listen(PORT, '127.0.0.1', function() {
  console.log(`listening on port ${PORT}`);
});
