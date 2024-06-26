import * as React from 'react';
import { Dispatch } from './action';
import { NavState } from './state';

export type NavbarProps = {
  dispatch: Dispatch,
  navState: NavState,
};

export function Navbar(props: NavbarProps): JSX.Element {
  const { dispatch } = props;
  function navButton(name: string, navState: NavState): JSX.Element {
    const classNames = ['nav-button'];
    if (props.navState.t == navState.t) { classNames.push('active'); }
    return <div className={classNames.join(' ')} onMouseDown={() => { dispatch({ t: 'setNavState', navState }) }}>{name}</div>
  }
  // XXX clicking on Storybits button shouldn't clear storybits panel state, ideally
  return <div className="topnav">
    {navButton('Storybits', { t: 'storybits', sbstate: { currentItemId: undefined } })}
    {navButton('Tags', { t: 'tags' })}
    {navButton('Collected', { t: 'collected' })}
    <div className="nav-spacer" />
    <div className="nav-button nav-green" onMouseDown={(e) => { dispatch({ t: 'save' }) }}>Save</div>
  </div >
}
