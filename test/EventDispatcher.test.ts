import 'jest-extended'
import { EventDispatcher, EventDispatcherContext } from '../src'

describe('EventDispatcher', () => {
  test('it dispatches events', () => {
    const dispatcher = new EventDispatcher()
    const eventKey = 'fake_event'

    const listener1 = jest.fn()
    const listener2 = jest.fn()
    dispatcher.addListener(eventKey, listener1)
    dispatcher.addListener(eventKey, listener2)

    const data = { foo: 'foo' }
    dispatcher.dispatch(eventKey, data)

    expect(listener1).toBeCalledWith(data, expect.objectContaining({ isPropagationStopped: false }))
    expect(listener2).toBeCalledWith(data, expect.objectContaining({ isPropagationStopped: false }))
  })

  test('it allows stopPropagation', () => {
    const dispatcher = new EventDispatcher()
    const eventKey = 'fake_event'

    const listener1 = jest.fn((data: any, context: EventDispatcherContext) => context.stopPropagation())
    const listener2 = jest.fn()
    dispatcher.addListener(eventKey, listener1)
    dispatcher.addListener(eventKey, listener2)
    const context = dispatcher.dispatch(eventKey, {})

    expect(listener1).toBeCalled()
    expect(listener2).not.toBeCalled()
    expect(context.isPropagationStopped).toBeTrue()
  })

  test('it dispatches events by priority', () => {
    const dispatcher = new EventDispatcher()
    const eventKey = 'fake_event'

    const john = jest.fn()
    const sally = jest.fn()
    const sue = jest.fn()
    const tim = jest.fn()
    dispatcher.addListener(eventKey, john)
    dispatcher.addListener(eventKey, sally, 5)
    dispatcher.addListener(eventKey, sue, 5)
    dispatcher.addListener(eventKey, tim, 4)
    dispatcher.dispatch(eventKey, {})

    // Higher-priority called before lower priority:
    expect(sally).toHaveBeenCalledBefore(tim)
    expect(sue).toHaveBeenCalledBefore(tim)

    expect(sally).toHaveBeenCalledBefore(john)
    expect(sue).toHaveBeenCalledBefore(john)

    expect(tim).toHaveBeenCalledBefore(john)

    // Same-priority called by order of registration:
    expect(sally).toHaveBeenCalledBefore(sue)
  })

  test('it can dispatch multiple times', () => {
    const dispatcher = new EventDispatcher()
    const eventKey = 'fake_event'

    const listener1 = jest.fn()
    const listener2 = jest.fn()
    dispatcher.addListener(eventKey, listener1)
    dispatcher.addListener(eventKey, listener2)

    dispatcher.dispatch(eventKey, {})
    dispatcher.dispatch(eventKey, {})

    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledTimes(2)
  })

  test('it can dispatch without listeners', () => {
    const dispatcher = new EventDispatcher()
    dispatcher.dispatch('fake_event', {})
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
