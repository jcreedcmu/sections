import * as React from 'react';
import { AppState } from "./state";
import { renderTags } from './render-tag';
import { Dispatch } from './action';

function idButton(itemIx: number, dispatch: Dispatch) {
  return <button onMouseDown={(e) => { dispatch({ t: 'giveGuid', guid: crypto.randomUUID(), itemIx }) }}>give guid</button>;
}

export function storybitsPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const { items } = state;
  const renderItems = items.flatMap((item, ix) => {
    const { tags, attrs, body, date, file, meta } = item;
    const t = typeof (meta);
    if (!tags.includes('storybits')) return [];
    const id = meta?.id;
    const idShower = (id == undefined) ? idButton(ix, dispatch) : id;
    // XXX This use of ix as key is bad --- I should be using id once I ensure every item has id
    return [<tr key={ix}><td>{date}<br />
      <span className="guid">{idShower}</span></td>
      <td>{renderTags(tags, dispatch)}</td><td><pre>{body}</pre></td></tr>];
  });
  return <table className="zebra"><tbody>{renderItems}</tbody></table>;
}
