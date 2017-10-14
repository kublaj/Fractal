import { HandlerMsg, HandlerObject } from './handler'
import { InterfaceHelpers } from './interface'
import { InputHelpers } from './input'
import { Module } from './module'

export interface Component<S> {
  // the changing stuff (AKA variables)
  state?: S
  // Inputs are dispatchers of actions and tasks
  inputs?: Inputs
  // unique way to change the state
  actions?: Actions<S>
  // a way to suscribe to external events and perform continous side effects (recalculated on every state change)
  interfaces: Interfaces
  // general purpose groups, commonly used for styles
  groups?: {
    [name: string]: Group
  }
}

export interface Components {
  [name: string]: Component<any>
}

export interface Interfaces {
  [name: string]: Interface<any, any>
}

export type Group = any

export interface Inputs {
  (helpers: InputHelpers): InputIndex
}

export interface InputIndex {
  [name: string]: Input
}

export interface Input {
  (data?: any): void
}

export interface Action<S> {
  (data?: any): Update<S>
}

export interface Actions<S> {
  [name: string]: Action<S>
}

export interface EventOptions {
  default?: boolean
  listenPrevented?: boolean
  selfPropagated?: boolean // only for global events
}

// is the data of an event, refers to some event of a component - Comunications stuff
/* NOTE: function strings can be:
  - '*': which means, serialize all the event object
  - 'other': which means, serialize the 'other' attribute of the event object
*/
export interface InputData extends Array<any> {
  0: string // component index identifier
  1: string // input name
  2?: any // context parameter
  3?: any // a param function string / value is optional
  4?: EventOptions
}

// event data comes from an interface / task handler as a result of processing InputData - Comunications stuff
export interface EventData extends Array<any> {
  0: string // component index identifier
  1: string // input name
  2?: any // context parameter from InputData (contextual)
  3?: any // data from an interface / task handler ( result of function or value )
  4?: 'pair' | 'fn' | 'context'
}

export interface Update<S> {
  (state: S): S
}

export interface Interface<Type, S>{
  (helpers: InterfaceHelpers) : CtxInterface<Type, S>
}

export interface CtxInterface<Type, S> {
  (state: S): Promise<Type> | Type
}

export interface CtxInterfaceIndex {
  [name: string]: CtxInterface<any, any>
}

// a task executes some kind of side effect (output) - Comunications stuff
export interface Task extends Array<any> {
  0: string // task name
  1?: HandlerMsg // task data
}

// describes an excecution context
export interface Context {
  // name for that component in the index
  id: string
  // sintax sugar: the name is the last part of the id (e.g. the id is Main$child the name is child)
  name: string
  state: { [name: string]: any }
  inputs: InputIndex
  actions: Actions<any>
  interfaces: CtxInterfaceIndex
  interfaceValues: { // caches interfaces
    [name: string]: any
  }
  // groups of the component (related to a component space)
  groups: {
    [name: string]: Group,
  },
  // global component index
  components: ContextIndex
  groupHandlers: {
    [name: string]: HandlerObject
  }
  taskHandlers: {
    [name: string]: HandlerObject
  }
  interfaceHandlers: {
    [name: string]: HandlerObject
  }
  // lock state for cosistency
  stateLocked: boolean
  // action queue
  actionQueue: Update<any>[],
  // global flags delegation
  global: {
    // record all actions
    record: boolean
    records: UpdateRecord[]
    // flag for manually disable rendering workflow, useful in SSR for performance
    render: boolean
  },
  // delegated flag
  hotSwap: boolean
  // root context delegation
  rootCtx: Context
  // input hooks delegation
  beforeInput? (ctxIn: Context, inputName: string, data: any): void
  afterInput? (ctxIn: Context, inputName: string, data: any): void
  // error and warning delegation
  warn: {
    (source: string, description: string): void
  }
  error: {
    (source: string, description: string): void
  },
}

export interface UpdateRecord {
  id: string
  update: Update<any>
}

export interface ContextIndex {
  [id: string]: Context
}

export type Executable<S> = Update<S> | Task

export type GenericExecutable<S> = Update<S> | Task | Executable<any>[]

export interface RunModule {
  (root: Component<any>, DEV: boolean, viewCb?): Promise<Module>
}
