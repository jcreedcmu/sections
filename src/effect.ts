import { Item, ParsedItem, ServerData } from './notes-lib';
import { Dispatch } from "./action";
import { AppState } from "./state";
import { LeftItemRef } from './app';

export type Effect =
  | { t: 'save', data: ServerData }
  | { t: 'setHash', hash: string }
  | { t: 'scrollItemIntoView' }
  ;

export function doEffect(leftItemRef: LeftItemRef): (state: AppState, dispatch: Dispatch, effect: Effect) => void {
  return (state, dispatch, effect) => {
    switch (effect.t) {
      case 'save': {
        (async () => {
          console.log('example side effect. writing to file on server side.');
          const req = new Request('/save', {
            method: 'POST',
            body: JSON.stringify(effect.data),
            headers: {
              'Content-type': 'text/json',
            },
          });
          try {
            const res = await fetch(req);
            if (res.status != 200) {
              alert(`HTTP error
${res.status} ${res.statusText}
${await res.text()}`);
            }
            else {
              alert('Success!\n\n' + await res.text());
            }
          }
          catch (e) {
            console.log('fetch error', e);
          }
        })();
      } break;
      case 'setHash': {
        window.location.hash = effect.hash;
      } break;
      case 'scrollItemIntoView': {
        if (leftItemRef.current != null) {
          leftItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } break;
    }
  };
}
