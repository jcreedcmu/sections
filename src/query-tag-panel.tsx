import * as React from 'react';
import { AppState } from "./state";
import { renderTags } from './render-tag';
import { Dispatch } from './action';

export function queryTagPanel(state: AppState, tag: string, dispatch: Dispatch): JSX.Element {
  const { data: { items } } = state;
  const renderItems = items.flatMap((item, ix) => {
    const { tags, attrs, body, date, file, meta } = item;
    const t = typeof (meta);
    if (!tags.includes(tag)) return [];
    // XXX This use of ix as key is bad --- I should be using id once I ensure every item has id
    return [<tr key={ix}><td>{date}<br />
      <span className="guid">{meta?.id ?? ''}</span></td>
      <td>{renderTags(tags, dispatch)}</td><td><pre>{body}</pre></td></tr>];
  });
  return <table className="zebra"><tbody>{renderItems}</tbody></table>;
}
