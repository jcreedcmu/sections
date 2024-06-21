import * as React from 'react';
import { AppState } from "./state";
import { renderTag } from './render-tag';
import { Dispatch } from './action';
import { render_collected } from './notes-lib';

function countWords(text: string): number {
  return text.split(/\s+/).filter(x => x.length).length;
}

export function collectedPanel(state: AppState, dispatch: Dispatch): JSX.Element {
  const { fullText: text, sectionText } = render_collected(state.data);


  const wordCount: JSX.Element[] = [];
  sectionText.forEach(({ body, header }) => {
    wordCount.push(<>{header}: <b>{countWords(body)}</b><br /></>);
  });
  wordCount.push(<br />);
  wordCount.push(<>Total: <b>{countWords(text)}</b><br /></>);

  return <div className="panel"><div>{wordCount}</div>
    <pre>{text}</pre></div>
}
