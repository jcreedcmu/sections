import { Point } from "./lib/types";
import { NavState } from "./state";

export type Action =
  | { t: 'increment' }
  | { t: 'save' }
  | { t: 'mouseDown', p_in_canvas: Point }
  | { t: 'setNavState', navState: NavState }
  ;

export type Dispatch = (action: Action) => void;
