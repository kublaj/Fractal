import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  clone,
  styles,
} from '../../core'
import { View, h } from '../..//interfaces/view'

import * as List from './List'
import * as Note from './Note'

export const name = 'Root'

export const state = {
  _nest: <any> {
    List: clone(List),
    Note: styles({ base: { width: 'calc(100% - 400px)' }})(clone(Note)),
  },
}

export type S = typeof state

export const inputs: Inputs = F => ({
  $List_select: async item => {
    await F.toChild('Note', 'setNote', item)
  },
  $Note_set: async ([name, value]) => {
    let note = F.stateOf('Note')
    await F.toChild('List', '_action', ['SetItem', [note.idx, note.title, note.body]])
  },
})

export const actions: Actions<S> = {
}

const view: View<S> = F => s => {
  let style = F.ctx.groups.style

  return h('div', {
    key: F.ctx.name,
    class: { [style.base]: true },
  }, [
    F.vw('List'),
    F.vw('Note'),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    display: 'flex',
    overflow: 'auto',
    fontFamily: 'Sans serif',
    color: '#292828',
  },
}

export const groups = { style }
