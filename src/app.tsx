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
import { collectedPanel } from './collected-panel';

export type AugmentedServerData = ServerData & {
  indexOfId: Record<string, number>,
};

export type AppProps = {
  data: AugmentedServerData,
  hash: string,
};

function getPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const ns = state.navState;
  switch (ns.t) {
    case 'storybits': return storybitsPanel(state, ns.sbstate, dispatch);
    case 'tags': return tagsPanel(state, dispatch);
    case 'query-tag': return queryTagPanel(state, ns.tag, dispatch);
    case 'collected': return collectedPanel(state, dispatch);
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

// XXX I may need to be careful about any runtime modifications to items
// invalidating this
function precomputeIndexOfId(items: ParsedItem[]): Record<string, number> {
  const rv: Record<string, number> = {};
  items.forEach((item, ix) => {
    const id = item.meta?.id;
    if (id != undefined) {
      rv[id] = ix;
    }
  });
  return rv;
}

export async function init() {
  const req = new Request('/json/data.json');
  const data: ServerData = await (await fetch(req)).json();
  const indexOfId = precomputeIndexOfId(data.items);
  const props: AppProps = {
    data: { ...data, indexOfId },
    hash: window.location.hash,
  };
  const root = createRoot(document.querySelector('.app')!);
  root.render(<App {...props} />);
}
