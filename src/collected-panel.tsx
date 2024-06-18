import * as React from 'react';
import { AppState } from "./state";
import { renderTag } from './render-tag';
import { Dispatch } from './action';
import { render_collected } from './notes-lib';

export function collectedPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const text = render_collected(state.data);
  const words = text.split(/\s+/).filter(x => x.length).length;
  return <div className="panel"><b>Total Words</b>: {words}<br />
    <pre>{text}</pre></div>
}
