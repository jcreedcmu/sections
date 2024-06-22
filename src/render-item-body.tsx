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

export function renderItemBody(body: string, dispatch: Dispatch): JSX.Element {
  const matches = Array.from(body.matchAll(/link:\[(.*?)\]\[(.*?)\]/g));
  let rv: (JSX.Element | string)[] = [];
  let lastIndex = 0;
  for (const match of matches) {
    if (match.index > lastIndex) {
      rv.push(body.substring(lastIndex, match.index));
    }
    rv.push(renderLink(match[1], match[2], dispatch));
    lastIndex = match.index + match[0].length;
  }
  if (body.length > lastIndex) {
    rv.push(body.substring(lastIndex, body.length));
  }
  return <pre>{rv}</pre>;
}
