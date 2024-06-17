import * as React from 'react';
import { Dispatch, SplitVariant } from './action';
import { AppState } from "./state";
import { renderTags } from './render-tag';
import { arrayJoin } from './lib/util';



function idButton(itemIx: number, dispatch: Dispatch) {
  return <button onMouseDown={(e) => { dispatch({ t: 'giveGuid', guid: crypto.randomUUID(), itemIx }) }}>give guid</button>;
}

function splitButton(itemIx: number, dispatch: Dispatch, variant: SplitVariant) {
  return <button onMouseDown={(e) => { dispatch({ t: 'splitItem', itemIx, variant }) }}>split ({variant.t})</button>;
}

export function anomaliesPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const { data: { items } } = state;
  const renderItems = items.flatMap((item, ix) => {
    const { tags, attrs, body, date, file, meta } = item;
    const t = typeof (meta);
    if (!item.body.match(new RegExp('^---$', 'm'))) return [];
    if (tags.includes('math')) return [];
    const id = meta?.id;
    const buttons: (JSX.Element | string)[] = [
      splitButton(ix, dispatch, { t: 'copy' }),
      splitButton(ix, dispatch, { t: 'meta' }),
      splitButton(ix, dispatch, { t: 'none' }),
    ];
    if (id != undefined)
      buttons.unshift(id);
    else
      buttons.unshift(idButton(ix, dispatch));

    // XXX This use of ix as key is bad --- I should be using id once I ensure every item has id
    return [<tr key={ix}><td>{file}/{date}<br />
      <span className="guid">{arrayJoin(buttons, <br />)}</span></td>
      <td>{renderTags(tags, dispatch)}</td><td><pre>{body}</pre></td></tr>];
  });
  return <div className="panel"><table className="zebra"><tbody>{renderItems}</tbody></table></div>;
}
