import * as React from 'react';
import { AppState } from "./state";
import { renderTags } from './render-tag';
import { Dispatch } from './action';
import { Skull, Heart, SolidHeart } from './svg-graphics';

function renderLikes(id: string, rating: number, dispatch: Dispatch) {
  const skullProps = rating == -1 ? { fill: "#000" } : { stroke: "#777", strokeWidth: 2, fill: "none" };
  const heart1Props = rating >= 1 ? { fill: "#f00" } : { stroke: "#f00", fill: "none" };
  const heart2Props = rating >= 2 ? { fill: "#f00" } : { stroke: "#f00", fill: "none" };
  return <div className="likes-container">
    <Skull {...skullProps} onMouseDown={(e) => { dispatch({ t: 'setRating', id, rating: rating == -1 ? 0 : -1 }); }} />
    <SolidHeart {...heart1Props} onMouseDown={(e) => { dispatch({ t: 'setRating', id, rating: rating == 1 ? 0 : 1 }); }} />
    <SolidHeart {...heart2Props} onMouseDown={(e) => { dispatch({ t: 'setRating', id, rating: rating == 2 ? 0 : 2 }); }} />
  </div>;
}

export function storybitsPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const { data: { items } } = state;
  const renderItems = items.flatMap((item, ix) => {
    const { tags, attrs, body, date, file, meta } = item;
    const t = typeof (meta);
    if (!(tags.includes('storybits') || file == 'CONWORLD')) return [];
    const id = meta?.id;

    if (id == undefined) {
      throw new Error(`id undefined`);
    }

    const maybeTitle = attrs.title != undefined ? <h5>{attrs.title}</h5> : undefined;
    const { title: _, ...otherAttrs } = attrs;
    const maybeAttrs = Object.keys(otherAttrs).length > 0 ? 'otherAttrs=' + JSON.stringify(otherAttrs) : undefined;
    return [<tr key={id}><td>{date}<br />
      <span className="guid">{id}</span></td>
      <td>{renderLikes(id, state.data.sidecar.rating[id] ?? 0, dispatch)}</td><td>{maybeTitle}{maybeAttrs}<pre>{body}</pre></td></tr>];
  });
  return <table className="zebra"><tbody>{renderItems}</tbody></table>;
}
