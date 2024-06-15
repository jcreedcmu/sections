import * as React from 'react';
import { AppState } from "./state";
import { renderTag } from './render-tag';
import { Dispatch } from './action';

export function tagsPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const { data: { items } } = state;
  const tagCounts: Record<string, number> = {};
  items.forEach(item => {
    item.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    });
  });
  const renderItems: JSX.Element[] = Object.entries(tagCounts)
    .sort(([ka, va], [kb, vb]) => (vb - va) || ka.localeCompare(kb))
    .map(([key, value]) => {
      return <tr><td>{renderTag(key, dispatch)}</td><td>{value}</td></tr>;
    });
  return <table className="zebra"><tbody>{renderItems}</tbody></table>;
}
