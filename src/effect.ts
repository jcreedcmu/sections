import { Item, ParsedItem } from './notes-lib';
import { Dispatch } from "./action";
import { AppState } from "./state";

export type Effect =
  | { t: 'save', items: ParsedItem[] }
  ;

export function doEffect(state: AppState, dispatch: Dispatch, effect: Effect): void {
  switch (effect.t) {
    case 'save': {
      (async () => {
        console.log('example side effect. writing to file on server side.');
        const req = new Request('/save', {
          method: 'POST',
          body: JSON.stringify(effect.items),
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
  }
}
