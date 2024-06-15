import { ServerData } from "../server/server-types";
import { AppProps } from "./app";
import { Effect } from "./effect";
import { ParsedItem } from "./notes-lib";

export type NavState =
  | { t: 'storybits' }
  | { t: 'tags' }
  | { t: 'query-tag', tag: string }
  | { t: 'anomalies' }
  ;

export type AppState = {
  counter: number,
  effects: Effect[],
  debugStr: string,
  data: ServerData,
  navState: NavState,
}

export function navStateOfHash(hash: string): NavState {
  if (hash.match(/^#tags$/)) return { t: 'tags' };
  if (hash.match(/^#anomalies$/)) return { t: 'anomalies' };
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
    case 'anomalies': return '#anomalies';
  }
}

export function mkState(props: AppProps): AppState {
  const { data, hash } = props;
  const navState = navStateOfHash(hash);
  return { counter: 0, effects: [], debugStr: '', data, navState };
}
