import * as React from 'react';
import { Dispatch } from './action';
import { AppState } from "./state";
import { renderTags } from './render-tag';



function idButton(itemIx: number, dispatch: Dispatch) {
  return <button onMouseDown={(e) => { dispatch({ t: 'giveGuid', guid: crypto.randomUUID(), itemIx }) }}>give guid</button>;
}

export function anomaliesPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const { data: { items } } = state;
  const renderItems = items.flatMap((item, ix) => {
    const { tags, attrs, body, date, file, meta } = item;
    const t = typeof (meta);
    if (!item.body.match(new RegExp('^---$', 'm'))) return [];
    if (tags.length == 0 || tags.includes('math')) return [];
    const id = meta?.id;
    const idShower = (id == undefined) ? idButton(ix, dispatch) : id;
    // XXX This use of ix as key is bad --- I should be using id once I ensure every item has id
    return [<tr key={ix}><td>{date}<br />
      <span className="guid">{idShower}</span></td>
      <td>{renderTags(tags, dispatch)}</td><td><pre>{body}</pre></td></tr>];
  });
  return <table className="zebra"><tbody>{renderItems}</tbody></table>;
}
