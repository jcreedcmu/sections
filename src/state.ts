import { AppProps } from "./app";
import { Effect } from "./effect";
import { ParsedItem } from "./notes-lib";

export type NavState =
  | { t: 'storybits' }
  | { t: 'tags' }
  | { t: 'query-tag', tag: string }
  ;

export type AppState = {
  counter: number,
  effects: Effect[],
  debugStr: string,
  items: ParsedItem[],
  navState: NavState,
}

export function navStateOfHash(hash: string): NavState {
  if (hash.match(/^#tags$/))
    return { t: 'tags' };
  let m;
  if (m = hash.match(/^#query-tag=(.*)$/)) {
    return { t: 'query-tag', tag: m[1] };
  }
  return { t: 'storybits' };
}

export function hashOfNavState(navState: NavState): string {
  switch (navState.t) {
    case 'storybits': return '';
    case 'tags': return '#tags';
    case 'query-tag': return `#query-tag=${navState.tag}`;
  }
}

export function mkState(props: AppProps): AppState {
  const { data: { items }, hash } = props;
  const navState = navStateOfHash(hash);
  return { counter: 0, effects: [], debugStr: '', items, navState };
}
