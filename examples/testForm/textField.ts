import { Context, Component, ev, execute } from '../../src'
import { action } from '../../src/utils/component'
import { styleGroup, StyleGroup, placeholderColor } from '../../src/utils/style'

import { ViewInterface } from '../../src/interfaces/view'
import h from 'snabbdom/h'

let name = 'TextField'

let state = ({key}) => ({
  key,
  count: 0,
  focus: false,
  placeholder: 'Text...',
})

let actions = {
  SetValue: (value: string) => state => {
    state.value = value
    return state
  },
  SetFocus: (value: string) => state => {
    state.focus = value
    return state
  },
}

let inputs = (ctx: Context) => ({
  action: action(actions),
})

let view: ViewInterface = (ctx, s) => {
  let style = ctx.space.style
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    h('input', {
      class: { [style.input]: true },
      attrs: {
        placeholder: s.placeholder,
      },
      on: {
        keydown: ev(ctx, 'action', 'SetValue', ['target', 'value']),
        focus: ev(ctx, 'action', ['SetFocus', true]),
        blur: ev(ctx, 'action', ['SetFocus', false]),
      },
    }, `${s.count}`),
    h('div', { class: { [style.underlineContainer]: true } }, [
      h('div', {
        class: {
          [style.underline]: true,
          [style.underlineActive]: s.focus,
        },
      }),
    ]),
  ])
}

const style: StyleGroup = {
  base: {
    width: '100%',
  },
  input: {
    width: '100%',
    border: '0px',
    outline: 'none',
    fontFamily: 'sans-serif',
    fontSize: '18px',
    color: '#5E6060',
    ...placeholderColor('#AEB8B9'),
  },
  underlineContainer: {
    width: '100%',
    height: '1px',
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '1px solid #AEB8B9',
  },
  underline: {
    width: '0px',
    height: '2px',
    backgroundColor: '#3f51b5',
    transition: 'width 0.3s',
  },
  underlineActive: {
    width: '100%',
  },
}

let mDef: Component = {
  name,
  spaces: {
    style,
  },
  state,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef
