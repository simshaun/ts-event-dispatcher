import 'jest-extended'
import { EventDispatcher, EventDispatcherContext } from '../src'

describe('EventDispatcher', () => {
  test('it dispatches events', async () => {
    const eventKey = 'fake_event'
    const dispatcher = new EventDispatcher<{
      [eventKey]: { foo: string }
    }>()

    const listener1 = jest.fn()
    const listener2 = jest.fn()
    dispatcher.addListener(eventKey, listener1)
    dispatcher.addListener(eventKey, listener2)

    const data = { foo: 'foo' }
    await dispatcher.dispatch(eventKey, data)

    expect(listener1).toBeCalledWith(data, expect.objectContaining({ isPropagationStopped: false }))
    expect(listener2).toBeCalledWith(data, expect.objectContaining({ isPropagationStopped: false }))
  })

  test('it allows stopPropagation', async () => {
    const dispatcher = new EventDispatcher()
    const eventKey = 'fake_event'

    const listener1 = jest.fn(async (_data, context) => {
      return new Promise(resolve => {
        setTimeout(() => {
          context.stopPropagation()
          resolve()
        }, 10)
      })
    })
    const listener2 = jest.fn()
    dispatcher.addListener(eventKey, listener1)
    dispatcher.addListener(eventKey, listener2)
    const context = await dispatcher.dispatch(eventKey, {})

    expect(listener1).toBeCalled()
    expect(listener2).not.toBeCalled()
    expect(context.isPropagationStopped).toBeTrue()
  })

  test('it dispatches events by priority', async () => {
    const dispatcher = new EventDispatcher()
    const eventKey = 'fake_event'

    const john = jest.fn()
    const sally = jest.fn(async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve(), 10)
      })
    })
    const sue = jest.fn()
    const tim = jest.fn()
    dispatcher.addListener(eventKey, john)
    dispatcher.addListener(eventKey, sally, 5)
    dispatcher.addListener(eventKey, sue, 5)
    dispatcher.addListener(eventKey, tim, 4)
    await dispatcher.dispatch(eventKey, {})

    // Higher-priority called before lower priority:
    expect(sally).toHaveBeenCalledBefore(tim)
    expect(sue).toHaveBeenCalledBefore(tim)

    expect(sally).toHaveBeenCalledBefore(john)
    expect(sue).toHaveBeenCalledBefore(john)

    expect(tim).toHaveBeenCalledBefore(john)

    // Same-priority called by order of registration:
    expect(sally).toHaveBeenCalledBefore(sue)
  })

  test('it can dispatch multiple times', async () => {
    const dispatcher = new EventDispatcher()
    const eventKey = 'fake_event'

    const listener1 = jest.fn()
    const listener2 = jest.fn()
    dispatcher.addListener(eventKey, listener1)
    dispatcher.addListener(eventKey, listener2)

    await dispatcher.dispatch(eventKey, {})
    await dispatcher.dispatch(eventKey, {})

    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledTimes(2)
  })

  test('it can dispatch without listeners', async () => {
    const dispatcher = new EventDispatcher()
    await dispatcher.dispatch('fake_event', {})
  })

  test('it returns context', async () => {
    const dispatcher = new EventDispatcher()
    const context = await dispatcher.dispatch('fake_event', {})
    expect(context).toBeObject()
    expect(context).toHaveProperty('eventName')
    expect(context.eventName).toBe('fake_event')
  })

  // This isn't really a test. It's just here to glance at in the IDE and make sure there's no TS issues.
  test('it allows type-unsafe "non-registered" events', () => {
    interface RegisteredEvent {
      listeners: number
    }
    interface NonRegisteredEvent {
      foo: boolean
    }
    const dispatcher = new EventDispatcher<{ registered_event: RegisteredEvent }>()
    dispatcher.addListener('registered_event', data => {
      // No TS errors? Cool!
    })
    dispatcher.addListener('nonregistered_event', (data: NonRegisteredEvent) => {
      // No TS errors? Cool!
    })
    dispatcher.dispatch('registered_event', { listeners: 5 })
    dispatcher.dispatch('nonregistered_event', { foo: false } as NonRegisteredEvent)
    // Still no TS errors? Great!
  })
})

describe('EventDispatcherContext', () => {
  test('it stops propagation', () => {
    const context = new EventDispatcherContext('test.event')
    expect(context.isPropagationStopped).toBe(false)
    context.stopPropagation()
    expect(context.isPropagationStopped).toBe(true)
  })
})
