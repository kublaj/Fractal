import { Context, Component, ev } from '../../src'
import { styleGroup, StyleGroup } from '../../utils/style'
import { hashMap, HashMap } from 'mori'
import { evolve, get } from '../../utils/mori'

import { ViewInterface } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let state = ({key}) => hashMap<string, string>(
  'key', key,
  'count', 0,
)

let actions = {
  Set: (count: number) => evolve('count', () => count),
  Inc: () => evolve('count', x => x + 1),
}

let inputs = (ctx: Context) => ({
  set: n => actions.Set(n),
  inc: () => actions.Inc(),
})

let view: ViewInterface = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: get(s, 'key'),
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.count]: true },
      on: {
        click: ev(ctx, 'inc'),
      },
    }, `${get(s, 'count')}`),
  ])
}

let style: StyleGroup = {
  base: {
    padding: '10px',
    backgroundColor: 'grey',
  },
  count: {
    width: '30px',
    height: '30px',
    margin: '10px',
    borderRadius: '50%',
    color: 'white',
    backgroundColor: '#4343EC',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

let mDef: Component = {
  name,
  state,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

