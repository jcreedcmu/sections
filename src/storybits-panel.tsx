import * as React from 'react';
import { AppState } from "./state";
import { renderTags } from './render-tag';
import { Dispatch } from './action';
import { Skull, Heart, SolidHeart } from './svg-graphics';
import { ParsedItem } from './notes-lib';
import { parseNotesDate } from './util';

export type StoryPanelState = {
  currentItemId: string | undefined,
};

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

function renderItemId(state: AppState, id: string, dispatch: Dispatch): JSX.Element | undefined {
  const item = state.data.items.find(item => item.meta?.id == id);
  if (item == undefined) {
    console.error(`Couldn't find item with id {id}`);
    return undefined;
  }
  return renderItem(state, item, dispatch);
}

function renderItem(state: AppState, item: ParsedItem, dispatch: Dispatch): JSX.Element {

  const { tags, attrs, body, date, file, meta } = item;


  const id = meta?.id;

  if (id == undefined) {
    throw new Error(`id undefined`);
  }

  const maybeTitle = attrs.title != undefined ? <h2>{attrs.title}</h2> : undefined;
  const { title: _, ...otherAttrs } = attrs;
  const maybeAttrs = Object.keys(otherAttrs).length > 0 ? 'otherAttrs=' + JSON.stringify(otherAttrs) : undefined;
  const rating = state.data.sidecar.rating[id] ?? 0;
  const entryClassName = rating < 0 ? 'faded' : undefined;
  const rv = <div>
    {date}<br />
    <span className="guid">{id}</span>
    {renderLikes(id, rating, dispatch)}<br />
    {maybeTitle}{maybeAttrs}<br /><pre>{body}</pre>
  </div>;
  return rv;
}

function renderLeftItem(state: AppState, sbstate: StoryPanelState, item: ParsedItem, dispatch: Dispatch): JSX.Element {
  const { tags, attrs, body, date, file, meta } = item;
  const id = meta?.id;

  function rowOnMouseDown(id: string) {
    dispatch({ t: 'setCurrentItem', id });
  }

  if (id == undefined) {
    throw new Error(`id undefined`);
  }

  const PREFIX_LIMIT = 25;
  const effectiveTitle = attrs.title ?? '(' + body.substring(0, PREFIX_LIMIT) + (body.length >= PREFIX_LIMIT ? '...' : '') + ')';
  const { title: _, ...otherAttrs } = attrs;
  const rowStyle: React.CSSProperties = {
  };
  const rating = state.data.sidecar.rating[id] ?? 0;
  if (rating == -1) {
    rowStyle.opacity = '50%';
  }
  if (rating == 1) {
    rowStyle.backgroundColor = '#fee';
  }
  if (rating == 2) {
    rowStyle.backgroundColor = '#faa';
  }
  if (id == sbstate.currentItemId) {
    rowStyle.boxShadow = '0px 0px 5px 5px #47c';
    rowStyle.zIndex = 1000;
    rowStyle.position = 'relative';
  }
  if (attrs.title == undefined) {
    rowStyle.backgroundColor = 'yellow';
  }

  return <tr key={id} onMouseDown={e => rowOnMouseDown(id)} style={rowStyle}><td>{effectiveTitle}</td></tr>;
}

export function storybitsPanel(state: AppState, sbstate: StoryPanelState, dispatch: Dispatch): JSX.Element {
  const { data: { items } } = state;

  const leftRows: JSX.Element[] = [];

  let prevYear: number | undefined;

  for (const item of items) {
    const { tags, attrs, body, date, file, meta } = item;
    const { year, month, day } = parseNotesDate(date);
    if (!(tags.includes('storybits') || file == 'CONWORLD'))
      continue;
    if (year != prevYear) {
      const yearStyle: React.CSSProperties = {
        fontSize: '1.5em',
        backgroundColor: '#ddd',
        cursor: 'default',
      };
      leftRows.push(<tr style={yearStyle}><td>{year}</td></tr>);
    }
    leftRows.push(renderLeftItem(state, sbstate, item, dispatch));
    prevYear = year;
  }
  const leftContent = <table><tbody>{leftRows}</tbody></table>;
  const rightContent = sbstate.currentItemId == undefined ? undefined : renderItemId(state, sbstate.currentItemId, dispatch);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
  };
  const leftStyle: React.CSSProperties = {
    flexGrow: 0,
    flexBasis: '200px',
    overflowY: 'scroll',
    overflowX: 'hidden',
    fontSize: '0.75em',
    fontFamily: 'sans-serif',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'pointer',
  };
  const rightStyle: React.CSSProperties = {
    flexGrow: 1,
    flexBasis: 0,
    overflowY: 'scroll',
    overflowX: 'hidden',
    backgroundColor: sbstate.currentItemId == undefined ? '#eef' : undefined,
    padding: '1em',
    borderLeft: '1px solid #aaa',
  };

  return <div className="fixed-panel">
    <div style={containerStyle}>
      <div style={leftStyle}>{leftContent}</div>
      <div style={rightStyle}>{rightContent}</div>
    </div>
  </div>;
}
