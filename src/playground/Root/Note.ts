import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  Interface,
  _,
  getStyle,
} from '../../core'
import { View, h } from '../../interfaces/view'

export const state = {
  activeChild: '',
  id: '',
  title: '',
  body: '',
  count: 0,
  _timestamp: 0,
}

export type S = typeof state

export const inputs: Inputs = F => ({
  init: async () => {
    if (typeof window !== 'undefined') {
      F.toIt('self')
    }
  },
  self: async () => {
    await new Promise(res => {
      setTimeout(() => res(), 1000)
    })
    await F.toAct('Inc')
    F.toIt('self')
  },
  set: async ([name, value]) => {
    let s: S = F.stateOf()
    await F.runIt(['db', ['setItemProps', s.id, { [name]: value }]])
  },
  setNoteFromId: async id => {
    let s: S = F.stateOf()
    if (s.id !== '') {
      await F.runIt(['db', ['unsubscribe', F.ctx.id, s.id]])
    }
    let note = await F.runIt(['db', ['subscribe', F.ctx.id, id, F.in('setNote', _, '*')]])
    await F.toAct('SetNote', ['set', id, note])
  },
  setNote: async ([evName, id, item]) => {
    await F.toAct('SetNote', [evName, id, item])
    if (evName === 'remove') {
      await F.toIt('removed')
    }
  },
  removed: async () => {},
})

export const actions: Actions<S> = {
  Inc: async () => async s => {
    s.count++
    return s
  },
  SetNote: ([evName, id, item]) => s => ({
    ...s,
    id,
    ...evName === 'add' || evName === 'set'
      ? item
      : evName === 'remove'
      ? { id: '' }
      : {}
  }),
}

const route: Interface<any, S> = F => async s => [
  [F.ctx.id, s.activeChild],
]

const view: View<S> = async F => async s => {
  let style = getStyle(F)

  return h('div', {
    key: F.ctx.name,
    class: style('base'),
  }, s.id == '' ? [
    h('div', {
      class: style('title'),
    }, 'No one selected ... time: ' + s.count),
  ] : [
    h('input', {
      class: style('title'),
      props: { value: s.title },
      on: { change: F.in('set', 'title', ['target', 'value']) },
    }),
    h('textarea', {
      class: style('body'),
      props: { value: s.body },
      on: { change: F.in('set', 'body', ['target', 'value']) },
    }),
  ])
}

export const interfaces: Interfaces = { route, view }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  title: {
    width: '100%',
    fontSize: '34px',
    paddingBottom: '20px',
    border: 'none',
    outline: 'none',
  },
  body: {
    width: '100%',
    height: 'calc(100% - 63px)',
    fontSize: '21px',
    color: '#484747',
    border: 'none',
    outline: 'none',
  },
}

export const groups = { style }
