import { produce } from 'immer';
import { AppState, hashOfNavState } from './state';
import { Action } from './action';
import { Item, ParsedItem } from './notes-lib';

export function reduce(state: AppState, action: Action): AppState {
  switch (action.t) {
    case 'increment': {
      return produce(state, s => {
        s.counter++;
      });
    }
    case 'save': {
      return produce(state, s => {
        s.effects.push({ t: 'save', data: state.data });
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
      const oldMeta = state.data.items[action.itemIx].meta;
      const newMeta = produce(oldMeta ?? {}, m => {
        m.id = action.guid;
      });
      return produce(state, s => {
        s.data.items[action.itemIx].meta = newMeta;
      });
    }
    case 'splitItem': {
      const oldItem = state.data.items[action.itemIx];
      const parts = oldItem.body.split(/\n?---\n\n?/);
      const newItems: ParsedItem[] = [
        { ...oldItem, body: parts[0] },
        ...parts.slice(1).map(part => {
          let newTags = oldItem.tags;
          if (action.variant.t == 'none') {
            newTags = [];
          }
          if (action.variant.t == 'meta') {
            newTags = ['storybits-meta'];
          }
          return ({
            ...oldItem,
            tags: newTags,
            body: part,
            meta: { id: crypto.randomUUID() },
          })
        })
      ];
      return produce(state, s => {
        s.data.items.splice(action.itemIx, 1, ...newItems);
      });
    }
    case 'setRating': {
      return produce(state, s => {
        s.data.sidecar.rating[action.id] = action.rating;
      });
    }
    case 'setCurrentItem': {
      const ns = state.navState;
      if (ns.t == 'storybits') {
        const newNavState = produce(ns, s => {
          s.sbstate = {
            currentItemId: action.id
          };
        });
        return produce(state, s => {
          s.navState = newNavState;
          s.effects.push({ t: 'setHash', hash: hashOfNavState(newNavState) });
        });
      }
      else {
        console.error(`setCurrentItem: incompatible navState`);
        return state;
      }
    }
    case 'scrollItemIntoView': {
      return produce(state, s => {
        s.effects.push({ t: 'scrollItemIntoView' });
      });
    }
  }
}
