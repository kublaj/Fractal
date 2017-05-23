import { VNode, VNodeData } from './vnode'
import { Module } from 'snabbdom/modules/module'
import { computeEvent, InputData, ModuleAPI } from '../../core'

export interface OnGlobal {
  [event: string]: InputData
}

function getContainer (lastContainer) {
  let elm = (<any> lastContainer).elm
  ? (<VNode> lastContainer).elm.childNodes[0] : lastContainer.childNodes[0]
  return elm
}

export const globalListenersModule = (mod: ModuleAPI, state: { lastContainer: VNode | Element }): Module => {

  function invokeHandler(handler: InputData, event?: Event): void {
    if (handler instanceof Array && typeof handler[0] === 'string') {
      // call function handler
      event.preventDefault()
      event.stopPropagation()
      requestAnimationFrame(() => {
        setTimeout(() => {
          mod.dispatch(computeEvent(event, handler))
        }, 0)
      })
    } else if (handler instanceof Array) {
      // call multiple handlers
      for (var i = 0; i < handler.length; i++) {
        invokeHandler(handler[i])
      }
    } else if (handler === 'ignore') {
      // TODO: document ignored and passed view event handlers
      // this handler is ignored
      event.preventDefault()
      event.stopPropagation()
    } else if (handler === '' && handler === undefined) {
      // this handler is passed
      return
    } else {
      mod.error('ViewInterface-eventListenersModule', 'event handler of type ' + typeof handler + 'are not allowed, data: ' + JSON.stringify(handler))
    }
  }

  function handleEvent(event: Event, vnode: VNode) {
    var name = event.type,
        global = (vnode.data as VNodeData).global

    // call event handler(s) if exists
    if (global && global[name]) {
      invokeHandler(global[name], event)
    }
  }

  function createListener() {
    return function handler(event: Event) {
      handleEvent(event, (handler as any).vnode)
    }
  }

  function updateEventListeners(oldVnode: VNode, vnode?: VNode): void {
    var oldGlobal = (oldVnode.data as VNodeData).global,
        oldListener = (oldVnode as any).listener,
        global = vnode && (vnode.data as VNodeData).global,
        name: string

    // optimization for reused immutable handlers
    if (oldGlobal === global) {
      return
    }

    // remove existing listeners which no longer used
    if (oldGlobal && oldListener) {
      // if element changed or deleted we remove all existing listeners unconditionally
      if (!global) {
        for (name in oldGlobal) {
          // remove listener if element was changed or existing listeners removed
          let elm = getContainer(state.lastContainer)
          elm.removeEventListener(name, oldListener, false)
        }
      } else {
        for (name in oldGlobal) {
          // remove listener if existing listener removed
          if (!global[name]) {
            let elm = getContainer(state.lastContainer)
            elm.removeEventListener(name, oldListener, false)
          }
        }
      }
    }

    // add new listeners which has not already attached
    if (global) {
      // reuse existing listener or create new
      var listener = (vnode as any).listener = (oldVnode as any).listener || createListener()
      // update vnode for listener
      listener.vnode = vnode

      // if element changed or added we add all needed listeners unconditionally
      if (!oldGlobal) {
        for (name in global) {
          // add listener if element was changed or new listeners added
          let elm = getContainer(state.lastContainer)
          elm.addEventListener(name, listener, false)
        }
      } else {
        for (name in global) {
          // add listener if new listener added
          if (!oldGlobal[name]) {
            let elm = getContainer(state.lastContainer)
            elm.addEventListener(name, listener, false)
          }
        }
      }
    }
  }

  return {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners,
  } as any
}

export default globalListenersModule