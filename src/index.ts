export type EventKey = string
export type EventListener = (data: object, context: EventDispatcherContext) => void

type ListenerTuple = [number, EventListener]
type ListenerMap = Map<EventKey, ListenerTuple[]>
type OrderedListenerMap = Map<EventKey, EventListener[]>

export interface EventDispatcher {
  dispatch(eventKey: EventKey, eventData: object): void
  addListener(eventKey: EventKey, listener: EventListener, priority: number): void
}

export class EventDispatcherContext {
  public readonly eventName: EventKey
  public isPropagationStopped: boolean = false

  constructor(eventName: EventKey) {
    this.eventName = eventName
  }

  public stopPropagation(): void {
    this.isPropagationStopped = true
  }
}

export class EventDispatcher implements EventDispatcher {
  private listeners: ListenerMap = new Map()
  private orderedListeners: OrderedListenerMap = new Map() // a cache

  public dispatch(eventKey: EventKey, eventData: object): EventDispatcherContext {
    const listeners = this.getListeners(eventKey)
    const context = new EventDispatcherContext(eventKey)

    for (const listener of listeners) {
      listener(eventData, context)
      if (context.isPropagationStopped) {
        return context
      }
    }

    return context
  }

  /**
   * Greater priority-number listeners are called first.
   * Listeners with the same priority are called in the order they were registered.
   */
  public addListener(eventKey: EventKey, listener: EventListener, priority: number = 0) {
    const tuples: ListenerTuple[] = this.listeners.get(eventKey) || []
    tuples.push([priority, listener])
    this.listeners.set(eventKey, tuples)
    // Reset the cache:
    this.orderedListeners.delete(eventKey)
  }

  private getOrderedListeners(eventKey: EventKey): EventListener[] {
    const tuples: ListenerTuple[] = this.listeners.get(eventKey) || []
    return tuples
      .sort((a, b) => {
        if (a[0] > b[0]) {
          return -1
        }
        if (a[0] < b[0]) {
          return 1
        }
        return 0
      })
      .map((t) => t[1])
  }

  private getListeners(eventKey: EventKey): EventListener[] {
    if (this.orderedListeners.has(eventKey)) {
      // forced type is hacky, but is easiest way I found to make TypeScript be quiet.
      return this.orderedListeners.get(eventKey) as EventListener[]
    }

    const orderedListeners = this.getOrderedListeners(eventKey)
    this.orderedListeners.set(eventKey, orderedListeners)
    return orderedListeners
  }
}
