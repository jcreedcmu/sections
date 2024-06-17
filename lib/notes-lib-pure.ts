const NONCE_DATE = '0';

// This is data that I don't want to save inline in my notesfiles, but
// elsewhere. I expect it to be mostly stuff I expect to edit in-gui,
// not from a text editor.
export type SidecarData = {
  rating: Record<string, number>, // key is guid, value is most likely in [-1,2]
}

export type ServerData = {
  items: ParsedItem[],
  sidecar: SidecarData,
}

type Attrs = Record<string, string>;

export type Item = {
  date: string,
  file: string,
  body: string,
  meta?: string,
  attrs: Attrs,
};

export type ParsedItem = {
  date: string,
  file: string,
  body: string,
  meta: Record<string, string> | undefined,
  tags: string[],
  attrs: Attrs,
}

const delim = /((?:^=== .*$)|(?:^--- META: .*$))\n/m;

export function parseMeta(meta: string): Record<string, string> {
  const rv: Record<string, string> = {};
  const withoutParens = meta.match(/^\((.*)\)$/);
  if (withoutParens == null) {
    throw new Error(`weird metadata ${meta}, expected parens around it`);
  }
  const parts = withoutParens[1].split(/\s+/).filter(x => x.length > 0);
  if (parts.length % 2 != 0)
    throw new Error(`weird metadata ${meta}, expected key-value pairs, instead got an odd number of things`);
  for (let i = 0; i < parts.length; i += 2) {
    rv[parts[i].replace(/^:/, '')] = parts[i + 1];
  }
  return rv;
}

export function unparseMeta(meta: Record<string, string>): string {
  const kvs = Object.entries(meta).sort((a, b) => a[0].localeCompare(b[0]));
  const flattened = kvs.map(([k, v]) => `:${k} ${v}`).join(' ');
  return `(${flattened})`;
}

export function struct_of_notes(file: string, text: string): Item[] {
  const parts = text.split(delim);
  const rv: Item[] = [];

  // drop anything before first delimiter
  if (!parts[0].match(delim))
    parts.shift();

  // should now only have headers and bodies
  if (parts.length % 2 != 0) {
    throw new Error(`Headers and bodies should occur in pairs`);
  }

  let date = NONCE_DATE;

  for (let i = 0; i < parts.length; i += 2) {
    let body = parts[i + 1];
    let header = parts[i];
    let attrs: Attrs = {};
    let meta: string | undefined = undefined;

    // extract attrs from body
    {
      const m = body.match(/^((?:@(?:[a-z-]+): [^\n]*\n)+)\n(.*)$/s);
      if (m) {
        m[1].split('\n').forEach(x => {
          const mm = x.match(/^@([a-z-]+): (.*)$/);
          if (mm) {
            attrs[mm[1]] = mm[2];
          }
        });
        body = m[2];
      }
    }

    // trim whitespace from body
    body = body.replace(/^\n+/, '');
    body = body.replace(/\n+$/, '');

    {
      const m = header.match(/^(=== (?:.*)|---) META: (.*)$/);
      if (m) {
        header = m[1];
        meta = m[2];
      }
    }

    {
      const m = header.match(/^=== ([\d.]+)$/);
      if (m) {
        date = m[1];
      }
    }
    const item: Item = { date, body, file, meta, attrs };
    rv.push(item);
  }
  return rv;
}

export function notes_of_struct(items: Item[]): { [k: string]: string[] } {
  const rv: { [k: string]: string[] } = {};
  const lastDate: { [k: string]: string } = {};
  for (const item of items) {
    const file = item.file;
    if (!(file in rv)) {
      rv[file] = [];
      lastDate[file] = NONCE_DATE;
    };

    const slug = (item.date === lastDate[file]) ? '---' : `=== ${item.date}`;
    const headerLine = item.meta === undefined ? slug : `${slug} META: ${item.meta}`;

    const attrKeys = Object.keys(item.attrs);
    attrKeys.sort();
    const attrStr = attrKeys.map(k => `@${k}: ${item.attrs[k]}\n`).join('');;
    const body = (attrKeys.length > 0 ? attrStr + '\n' : '\n') + item.body
    const text = `${headerLine}\n${body}\n\n`;
    rv[file].push(text);
    lastDate[file] = item.date;
  }
  return rv;
}

function canonicalize_tags(tags: string[]): string[] {
  return tags.map(x => x.replace(/^\s+/, '').replace(/\s+$/, '')).sort((a, b) => a.localeCompare(b));
}

export function parsed_item_of_item(item: Item): ParsedItem {
  let canonicalId: string | undefined = undefined;
  let meta: undefined | Record<string, string>;

  if (item.meta !== undefined) {
    meta = parseMeta(item.meta);
  }
  else {
    // Some sort of error if we don't have meta?
  }
  const { attrs, body, date, file } = item;
  const { tag: raw_tags, ...other_attrs } = attrs;
  let tags: string[] = [];
  if (raw_tags != undefined && raw_tags.match(/\S/)) {
    tags = canonicalize_tags(raw_tags.split(/,\s*/));
  }
  return { attrs: other_attrs, body, date, file, meta, tags };
}

export function item_of_parsed_item(pitem: ParsedItem): Item {
  const { attrs, body, date, file, meta, tags } = pitem;
  let new_attrs = attrs;
  if (tags.length > 0) {
    const raw_tags = canonicalize_tags(tags).join(', ');
    new_attrs = { ...attrs, tag: raw_tags };
  };
  const raw_meta = meta == undefined ? undefined : unparseMeta(meta);
  return { attrs: new_attrs, body, date, file, meta: raw_meta };
}
