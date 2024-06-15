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

export function mkState(items: ParsedItem[]): AppState {
  return { counter: 0, effects: [], debugStr: '', items, navState: { t: 'storybits' } };
}
