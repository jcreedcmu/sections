import * as React from 'react';
import { Dispatch } from './action';

function getEntryId(target: string): string | undefined {
  if (0) {
    // Here's some code whereby I could be more lenient and match raw
    // guids, but I think I'd prefer not to and be more explicit in my
    // data.
    if (target.length == 36 && target.match(/^[-a-f0-9]+$/)) {
      return target;
    }
  }
  const m = target.match(/^([A-Z]*?)\/(.*)$/);
  if (m) {
    return m[2];
  }
  return undefined;
}

export function renderLink(target: string, text: string, dispatch: Dispatch): JSX.Element {
  const entryId = getEntryId(target);
  if (entryId != undefined) {
    return <a href={`#entry=${entryId}`}>{text}</a >;
  }
  else {
    return <a target="_blank" href={target}>{text}</a>;
  }
}

export function renderAttrChip(text: string): JSX.Element {
  return <div className="attr-chip">{text}</div>;
}

export function renderImage(path: string): JSX.Element {
  const stripped = path.replace(/^\//, '');
  return <img src={`/image/${stripped}`} />;
}

export type MarkupRole =
  | 'link'
  | 'attr'
  | 'image'
  ;

function renderResult(role: MarkupRole, match: RegExpExecArray, dispatch: Dispatch): (JSX.Element | string)[] {
  switch (role) {
    case 'link': return [renderLink(match[1], match[2], dispatch)];
    case 'attr': return [renderAttrChip(match[1])];
    case 'image': return [renderImage(match[1])];
  }
}

export function renderMarkup(raw: string, dispatch: Dispatch): JSX.Element {
  const matchers: { role: MarkupRole, regexp: RegExp }[] = [
    { regexp: /link:\[(.*?)\]\[(.*?)\]/g, role: 'link' },
    { regexp: /@([a-z]+):/g, role: 'attr' },
    { regexp: /image:\[(.*?)\]/g, role: 'image' },
  ];
  const results = matchers.flatMap(matcher => Array.from(raw.matchAll(matcher.regexp)).map(m => {
    return {
      role: matcher.role, match: m
    };
  }))
    .sort((a, b) => a.match.index - b.match.index);

  let rv: (JSX.Element | string)[] = [];
  let lastIndex = 0;
  for (const { role, match } of results) {
    if (match.index < lastIndex) {
      continue;
    }
    if (match.index > lastIndex) {
      rv.push(raw.substring(lastIndex, match.index));
    }
    rv.push(...renderResult(role, match, dispatch));
    lastIndex = match.index + match[0].length;
  }
  if (raw.length > lastIndex) {
    rv.push(raw.substring(lastIndex, raw.length));
  }
  return <>{rv}</>;
}

export function renderItemBody(body: string, dispatch: Dispatch): JSX.Element {
  return <pre>{renderMarkup(body, dispatch)}</pre>;
}
