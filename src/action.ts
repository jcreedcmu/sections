import { Point } from "./lib/types";
import { NavState } from "./state";

export type SplitVariant =
  | { t: 'copy' }
  | { t: 'meta' }
  | { t: 'none' }
  ;

export type Action =
  | { t: 'increment' }
  | { t: 'save' }
  | { t: 'mouseDown', p_in_canvas: Point }
  | { t: 'setNavState', navState: NavState }
  | { t: 'giveGuid', itemIx: number, guid: string }
  | { t: 'splitItem', itemIx: number, variant: SplitVariant } // XXX deprecated
  | { t: 'setRating', id: string, rating: number }
  | { t: 'setCurrentItem', id: string }
  | { t: 'scrollItemIntoView' }
  ;

export type Dispatch = (action: Action) => void;
