import * as React from 'react';

function renderLink(target: string, text: string): JSX.Element {
  const m = target.match(/^([A-Z]*?)\/(.*)$/);
  if (m) {
    return <a href='#'>{text}</a>;
  }
  else {
    return <a target="_blank" href={target}>{text}</a>;
  }
}

export function renderItemBody(body: string): JSX.Element {
  const matches = Array.from(body.matchAll(/link:\[(.*?)\]\[(.*?)\]/g));
  let rv: (JSX.Element | string)[] = [];
  let lastIndex = 0;
  for (const match of matches) {
    if (match.index > lastIndex) {
      rv.push(body.substring(lastIndex, match.index));
    }
    rv.push(renderLink(match[1], match[2]));
    lastIndex = match.index + match[0].length;
  }
  if (body.length > lastIndex) {
    rv.push(body.substring(lastIndex, body.length));
  }
  return <pre>{rv}</pre>;
}
