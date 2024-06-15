import * as React from 'react';
import { Dispatch } from './action';

export function renderTag(tag: string, dispatch: Dispatch): JSX.Element {
  const onMouseDown = (e: React.MouseEvent) => {
    dispatch({ t: 'setNavState', navState: { t: 'query-tag', tag } });
  };
  return <div onMouseDown={onMouseDown} className="tag">{tag}</div>;
}

export function renderTags(tags: string[], dispatch: Dispatch): JSX.Element[] {
  return tags.map(tag => renderTag(tag, dispatch));
}
