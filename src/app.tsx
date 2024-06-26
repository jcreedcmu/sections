import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { doEffect } from './effect';
import { extractEffects } from './lib/extract-effects';
import { useEffectfulReducer } from './lib/use-effectful-reducer';
import { ParsedItem, ServerData, get_collected_lines, linkRegexp } from './notes-lib';
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
  collectedIds: Set<string>, // ids that appear in COLLECTED
};

export type AppProps = {
  data: AugmentedServerData,
  hash: string,
};

export type LeftItemRef = React.RefObject<HTMLTableRowElement>;

export type ExtraPanelProps = {
  leftItemRef: LeftItemRef,
};

function getPanel(state: AppState, dispatch: Dispatch, pprops: ExtraPanelProps): JSX.Element {
  const ns = state.navState;
  switch (ns.t) {
    case 'storybits': return storybitsPanel(state, ns.sbstate, dispatch, pprops);
    case 'tags': return tagsPanel(state, dispatch);
    case 'query-tag': return queryTagPanel(state, ns.tag, dispatch);
    case 'collected': return collectedPanel(state, dispatch);
  }
}

export function App(props: AppProps): JSX.Element {
  const leftItemRef = React.useRef<HTMLTableRowElement>(null);
  const [state, dispatch] = useEffectfulReducer(mkState(props), extractEffects(reduce), doEffect(leftItemRef));
  const { counter } = state;
  const { data: { items } } = props;
  function onHashChange() {
    dispatch({ t: 'setNavState', navState: navStateOfHash(document.location.hash) });
  }
  const onKeyDown = (e: KeyboardEvent) => {
    dispatch({ t: 'keyDown', code: e.code });
  };

  React.useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  });
  return <>
    <Navbar dispatch={dispatch} navState={state.navState} />
    {getPanel(state, dispatch, { leftItemRef })}

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

function precomputeCollectedIds(collected: string): Set<string> {
  const linesRec = get_collected_lines(collected);
  const rv = new Set<string>();
  for (const key of Object.keys(linesRec)) {
    const lines = linesRec[key];
    lines.forEach(line => {
      for (const match of line.matchAll(linkRegexp)) {
        const [substr, file, id, title] = match;
        rv.add(id);
      }
    });
  }
  return rv;
}

export async function init() {
  const req = new Request('/json/data.json');
  const data: ServerData = await (await fetch(req)).json();
  const props: AppProps = {
    data: {
      ...data,
      indexOfId: precomputeIndexOfId(data.items),
      collectedIds: precomputeCollectedIds(data.collected),
    },
    hash: window.location.hash,
  };
  const root = createRoot(document.querySelector('.app')!);
  root.render(<App {...props} />);
}
