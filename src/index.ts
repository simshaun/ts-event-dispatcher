/**
 * Arbitrary string specific to your domain.
 */
export type EventName = string

/**
 * Arbitrary object specific to your domain.
 */
export type EventData = object

/**
 * The EventDispatcher expects listeners to match this signature.
 */
export type EventListener<TEventName extends EventName, TEventData extends EventData> = (
  data: TEventData,
  context: EventDispatcherContext<TEventName>
) => void

// Reason for jsdoc @type: https://github.com/microsoft/TypeScript/issues/1778#issuecomment-383334526

/**
 * A map of event names and expected data types.
 * @type {Object.<EventName, EventData>}
 */
export interface EventOverview {
  [key: string]: EventData
}

type ListenerTuple = [number, EventListener<EventName, EventData>]
type ListenerMap = Map<EventName, ListenerTuple[]>
type OrderedListenerMap = Map<EventName, EventListener<EventName, EventData>[]>

export interface EventDispatcher<TEventOverview extends EventOverview> {
  dispatch<TEventName extends Extract<keyof TEventOverview, string>>(
    eventName: TEventName,
    eventData: TEventOverview[TEventName]
  ): EventDispatcherContext<TEventName>
  addListener<TEventName extends Extract<keyof TEventOverview, string>>(
    eventName: TEventName,
    listener: EventListener<TEventName, TEventOverview[TEventName]>,
    priority?: number
  ): void
}

/**
 * When an event is dispatched, the dispatcher passes an instance of this class to the listeners.
 */
export class EventDispatcherContext<TEventName extends EventName> {
  public readonly eventName: TEventName
  public isPropagationStopped: boolean = false

  constructor(eventName: TEventName) {
    this.eventName = eventName
  }

  public stopPropagation(): void {
    this.isPropagationStopped = true
  }
}

export class EventDispatcher<TEventOverview extends EventOverview> implements EventDispatcher<TEventOverview> {
  private listeners: ListenerMap = new Map()
  private orderedListeners: OrderedListenerMap = new Map() // a cache

  public dispatch<TEventName extends Extract<keyof TEventOverview, string>>(
    eventName: TEventName,
    eventData: TEventOverview[TEventName] & { [key: string]: any }
  ): EventDispatcherContext<TEventName> {
    const listeners = this.getListeners(eventName)
    const context = new EventDispatcherContext<TEventName>(eventName)

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
  public addListener<TEventName extends Extract<keyof TEventOverview, string>>(
    eventName: TEventName,
    listener: EventListener<TEventName, TEventOverview[TEventName]>,
    priority: number = 0
  ) {
    const tuples: ListenerTuple[] = this.listeners.get(eventName) || []
    tuples.push([priority, listener as EventListener<EventName, EventData>])
    this.listeners.set(eventName, tuples)
    // Reset the cache:
    this.orderedListeners.delete(eventName)
  }

  private getOrderedListeners(eventName: EventName): EventListener<EventName, EventData>[] {
    const tuples: ListenerTuple[] = this.listeners.get(eventName) || []
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
      .map(t => t[1])
  }

  private getListeners(eventName: EventName): EventListener<EventName, EventData>[] {
    if (this.orderedListeners.has(eventName)) {
      // https://github.com/microsoft/TypeScript/issues/13086
      // Force type since TypeScript doesn't recognize the `has` condition as a type-guard.
      return this.orderedListeners.get(eventName) as EventListener<EventName, EventData>[]
    }

    const orderedListeners = this.getOrderedListeners(eventName)
    this.orderedListeners.set(eventName, orderedListeners)
    return orderedListeners
  }
}
