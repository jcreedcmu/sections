import { get_all_items } from '../lib/notes-lib'
import { parsed_item_of_item } from '../lib/notes-lib-pure';

const items = get_all_items().map(parsed_item_of_item);

type Renaming = {
  guid: string,
  title: string,
};
const renamings: Renaming[] = [];

items.forEach(item => {
  if (item.body.match(/Bah, all the links/)) {
    return;
  }
  if (item.tags.includes('storybits-summary')) {
    item.body.split(/\n/).filter(x => x.length).forEach(line => {
      let m;
      if (m = line.match(/- link:\[[A-Z]+\/([-a-f0-9]+)\]\[.*?\] (.*)/)) {
        const guid = m[1];
        let title = m[2];
        const ratingRe = / \(..?\)/;
        if (title.match(ratingRe)) {
          title = title.replace(ratingRe, '');
        }
        const matchedItem = items.find(it => it.meta?.id == guid);
        if (matchedItem == undefined) {
          console.log(`### Couldn't find ${guid}`);
          return;
        }
        renamings.push({ guid, title });
      }
    });
  }
});

console.log(JSON.stringify(renamings, null, 2));
