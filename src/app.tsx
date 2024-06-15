import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { doEffect } from './effect';
import { extractEffects } from './lib/extract-effects';
import { useEffectfulReducer } from './lib/use-effectful-reducer';
import { ParsedItem } from './notes-lib';
import { reduce } from './reduce';
import { AppState, mkState } from './state';
import { Navbar } from './navbar';
import { storybitsPanel } from './storybits-panel';
import { tagsPanel } from './tags-panel';
import { queryTagPanel } from './query-tag-panel';
import { Dispatch } from './action';

export type AppProps = {
  items: ParsedItem[],
  color: string,
};

function getPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const ns = state.navState;
  switch (ns.t) {
    case 'storybits': return storybitsPanel(state, dispatch);
    case 'tags': return tagsPanel(state, dispatch);
    case 'query-tag': return queryTagPanel(state, ns.tag, dispatch);
  }
}

export function App(props: AppProps): JSX.Element {
  const [state, dispatch] = useEffectfulReducer(mkState(props.items), extractEffects(reduce), doEffect);
  const { counter } = state;
  const { items } = props;

  return <>
    <Navbar dispatch={dispatch} navState={state.navState} />
    <div className="panel">
      {getPanel(state, dispatch)}
    </div>

  </>;
}

export async function init() {
  const req = new Request('/json/data.json');
  const items: ParsedItem[] = await (await fetch(req)).json();
  const props: AppProps = {
    items,
    color: '#f0f',
  };
  const root = createRoot(document.querySelector('.app')!);
  root.render(<App {...props} />);
}
