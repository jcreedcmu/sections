import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { doEffect } from './effect';
import { extractEffects } from './lib/extract-effects';
import { useEffectfulReducer } from './lib/use-effectful-reducer';
import { ParsedItem, ServerData } from './notes-lib';
import { reduce } from './reduce';
import { AppState, mkState, navStateOfHash } from './state';
import { Navbar } from './navbar';
import { storybitsPanel } from './storybits-panel';
import { tagsPanel } from './tags-panel';
import { queryTagPanel } from './query-tag-panel';
import { Dispatch } from './action';

export type AppProps = {
  data: ServerData,
  hash: string,
};

function getPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const ns = state.navState;
  switch (ns.t) {
    case 'storybits': return storybitsPanel(state, ns.sbstate, dispatch);
    case 'tags': return tagsPanel(state, dispatch);
    case 'query-tag': return queryTagPanel(state, ns.tag, dispatch);
  }
}

export function App(props: AppProps): JSX.Element {
  const [state, dispatch] = useEffectfulReducer(mkState(props), extractEffects(reduce), doEffect);
  const { counter } = state;
  const { data: { items } } = props;
  function onHashChange() {
    dispatch({ t: 'setNavState', navState: navStateOfHash(document.location.hash) });
  }
  React.useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  });
  return <>
    <Navbar dispatch={dispatch} navState={state.navState} />
    {getPanel(state, dispatch)}

  </>;
}

export async function init() {
  const req = new Request('/json/data.json');
  const data: ServerData = await (await fetch(req)).json();
  const props: AppProps = {
    data,
    hash: window.location.hash,
  };
  const root = createRoot(document.querySelector('.app')!);
  root.render(<App {...props} />);
}
