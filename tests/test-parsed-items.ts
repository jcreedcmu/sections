import { Item, item_of_parsed_item, notes_of_struct, parsed_item_of_item, struct_of_notes } from '../src/notes-lib';

const canonical_item: Item = {
  attrs: { tag: 'bar, foo', title: 'blap', next: 'link:[NOTES/xxx][title]' },
  body: 'here is some body text',
  date: '2024.06.13',
  file: 'IDEAS',
  meta: '(:acl private :id 31032ffd-4e87-4ecf-bd05-148be6c063d5)',
};

const canonical_item_no_tags: Item = {
  attrs: { title: 'blap', next: 'link:[NOTES/xxx][title]' },
  body: 'here is some body text',
  date: '2024.06.13',
  file: 'IDEAS',
  meta: '(:acl private :id 31032ffd-4e87-4ecf-bd05-148be6c063d5)',
};

describe('item', () => {
  test('should survive round trip of parsing', () => {

    const twin = item_of_parsed_item(parsed_item_of_item(canonical_item));
    expect(twin).toEqual(canonical_item);
  });

  test('should survive round trip of parsing if there are no tags', () => {

    const twin = item_of_parsed_item(parsed_item_of_item(canonical_item_no_tags));
    expect(twin).toEqual(canonical_item_no_tags);
  });

  test('should canonicalize order of tags and metadata', () => {
    const item: Item = {
      attrs: { tag: 'foo, bar', title: 'blap', next: 'link:[NOTES/xxx][title]' },
      body: 'here is some body text',
      date: '2024.06.13',
      file: 'IDEAS',
      meta: '(:id 31032ffd-4e87-4ecf-bd05-148be6c063d5 :acl private)',
    };

    const twin = item_of_parsed_item(parsed_item_of_item(item));
    expect(twin).toEqual(canonical_item);
  });

  test('should canonicalize spacing of tags', () => {
    const item: Item = {
      attrs: { tag: 'bar,foo', title: 'blap', next: 'link:[NOTES/xxx][title]' },
      body: 'here is some body text',
      date: '2024.06.13',
      file: 'IDEAS',
      meta: '(:acl private :id 31032ffd-4e87-4ecf-bd05-148be6c063d5)',
    };

    const twin = item_of_parsed_item(parsed_item_of_item(item));
    expect(twin).toEqual(canonical_item);
  });

  test('should survive round trip of serialization', () => {
    const notes = notes_of_struct([canonical_item]);
    const struct = struct_of_notes('IDEAS', notes['IDEAS'].join(''));
    expect(struct[0]).toEqual(canonical_item);
  });

  test('should survive round trip of serialization if there are no tags', () => {
    const notes = notes_of_struct([canonical_item_no_tags]);
    const struct = struct_of_notes('IDEAS', notes['IDEAS'].join(''));
    expect(struct[0]).toEqual(canonical_item_no_tags);
  });
});

describe('text item', () => {
  test('should survive parsing round-trip', () => {
    const text = `=== 2024.06.13 META: (:acl private :id 31032ffd-4e87-4ecf-bd05-148be6c063d5)
@next: link:[NOTES/xxx][title]
@tag: bar, foo
@title: blap

here is some body text`;
    const struct = struct_of_notes('IDEAS', text);
    expect(struct[0]).toEqual(canonical_item);
  });

  test('should canonicalize attribute order and whitespace', () => {
    const text = `=== 2024.06.13 META: (:acl private :id 31032ffd-4e87-4ecf-bd05-148be6c063d5)
@title: blap
@tag: bar, foo
@next: link:[NOTES/xxx][title]

here is some body text

`;
    const struct = struct_of_notes('IDEAS', text);
    expect(struct[0]).toEqual(canonical_item);
  });

  test('should canonicalize various things if we fully parse', () => {
    const text = `=== 2024.06.13 META: ( :id 31032ffd-4e87-4ecf-bd05-148be6c063d5  :acl private )
@title: blap
@tag: foo,bar
@next: link:[NOTES/xxx][title]

here is some body text

`;
    const struct = struct_of_notes('IDEAS', text);
    const parsed = parsed_item_of_item(struct[0]);
    expect(parsed).toEqual(parsed_item_of_item(canonical_item));
  });

  test('should throw exception various things if bad meta', () => {
    const text = `=== 2024.06.13 META: ( :id 31032ffd-4e87-4ecf-bd05-148be6c063d5  :acl  )
@title: blap
@tag: foo,bar
@next: link:[NOTES/xxx][title]

here is some body text

`;
    const tryparse = () => {
      const struct = struct_of_notes('IDEAS', text);
      const parsed = parsed_item_of_item(struct[0]);
    }
    expect(tryparse).toThrow('odd number of things');
  });

  test('should survive full parsing round-trip if there are no tags', () => {
    const text = `=== 2024.06.13 META: (:acl private :id 31032ffd-4e87-4ecf-bd05-148be6c063d5)
@next: link:[NOTES/xxx][title]
@title: blap

here is some body text

`;
    const struct = struct_of_notes('IDEAS', text);
    const item = item_of_parsed_item(parsed_item_of_item(struct[0]));
    const twin = notes_of_struct([item]);
    expect(twin.IDEAS[0]).toEqual(text);
  });
});
