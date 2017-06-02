
// side effects for log functionality

import { clone } from './core'
import { stateOf } from './core/input'

export const warn = (source: string, description: string) =>
  console.warn(`source: ${source}, description: ${description}`)

export const error = (source: string, description: string) =>
  console.error(`source: ${source}, description: ${description}`)

export const beforeInput = (ctx, inputName, data) => {
  let state = stateOf(ctx)()
  if (typeof state === 'object') {
    state = clone(state)
  }
  // <any> until groupCollapsed issue in TS repo is merged https://github.com/Microsoft/TypeScript/pull/15630
  ;(<any> console.groupCollapsed)(
    `%c input %c${inputName} %cfrom %c${ctx.id}`,
    'color: #626060; font-size: 12px;',
    'color: #3b3a3a; font-size: 14px;',
    'color: #626060; font-size: 12px;',
    'color: #3b3a3a; font-size: 14px;'
  )
  console.info('%c input data  ', 'color: rgb(9, 157, 225); font-weight: bold;', data)
  console.info('%c prev state  ', 'color: #AFAFAF; font-weight: bold;', state)
}

// color for actions (not yet implemented) #58C6F8

export const afterInput = (ctx, inputName, data) => {
  let state = stateOf(ctx)()
  if (typeof state === 'object') {
    state = clone(state)
  }
  console.info('%c next state  ', 'color: #3CA43F; font-weight: bold;', state)
  console.groupEnd()
}

export const logFns = {
  warn,
  error,
  beforeInput,
  afterInput,
}
