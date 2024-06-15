import { produce } from 'immer';
import { AppState, hashOfNavState } from './state';
import { Action } from './action';
import { Item } from './notes-lib';

export function reduce(state: AppState, action: Action): AppState {
  switch (action.t) {
    case 'increment': {
      return produce(state, s => {
        s.counter++;
      });
    }
    case 'save': {
      return produce(state, s => {
        s.effects.push({ t: 'save', items: state.items });
      });
    }
    case 'mouseDown': {
      const { x, y } = action.p_in_canvas;
      return produce(state, s => {
        s.debugStr = `clicked at (${x}, ${y})`;
      });
    }
    case 'setNavState': {
      return produce(state, s => {
        s.effects.push({ t: 'setHash', hash: hashOfNavState(action.navState) });
        s.navState = action.navState;
      });
    }
    case 'giveGuid': {
      const oldMeta = state.items[action.itemIx].meta;
      const newMeta = produce(oldMeta ?? {}, m => {
        m.id = action.guid;
      });
      return produce(state, s => {
        s.items[action.itemIx].meta = newMeta;
      });
    }
  }
}
