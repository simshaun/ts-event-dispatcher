# ts-event-dispatcher

![Version](https://img.shields.io/npm/v/@foxandfly/ts-event-dispatcher)
![CI](https://github.com/FoxAndFly/ts-event-dispatcher/workflows/CI/badge.svg?branch=master)
![Size](https://img.shields.io/bundlephobia/min/@foxandfly/ts-event-dispatcher)
![License](https://img.shields.io/github/license/foxandfly/ts-event-dispatcher)
[![Coverage](https://coveralls.io/repos/github/FoxAndFly/ts-event-dispatcher/badge.svg?branch=master)](https://coveralls.io/github/FoxAndFly/ts-event-dispatcher?branch=master)

This is a simple library that allows your application components to communicate
with each other by dispatching events and listening to them.


## Installation

```
npm i @foxandfly/ts-event-dispatcher
```


## Usage

Events are identified by a unique name of your choosing. Any number of
listeners might be listening for them. When an event is dispatched, data about
that specific event is passed to listeners so that they have the information they need.


### The EventDispatcher

Generally, you would create a single dispatcher and share it throughout your
application. It maintains a registry of listeners. When an event is dispatched
via the dispatcher, it notifies all listeners registered with that event.

```ts
import { EventDispatcher } from '@foxandfly/ts-event-dispatcher'

const dispatcher = new EventDispatcher()
```

### Dispatching an Event

Suppose you want to trigger an event when a user signs up on your website.
Your event name might be `user.created`. When dispatching the event, you'll
pass a User object to the listeners.

```ts
dispatcher.dispatch('user.created', { user, timestamp: 12345 })
```

### Event Listeners

Event listeners are simple, callable functions that you register with the event
dispatcher. The EventDispatcher passes your app-specific event data and a
special context object (more on that later) to listeners when their event is
dispatched.

```ts
dispatcher.addListener('user.created', (data) => {
  // ... do something ...
})
```

The `addListener()` method takes two or three arguments:
1. An event name.
2. A callable function to execute when the event is dispatched.
3. An optional priority (defaults to `0`), defined as a positive or negative
   integer. The higher the number, the earlier the listener is called. If two
   listeners have the same priority, they are executed in the order they were
   added to the dispatcher.


### Stopping Event Propagation

Sometimes it may make sense for a listener to prevent the next listeners from
being called. This can be accomplished with the special context object
mentioned earlier. It's passed to event listeners as the second argument and
can be used to stop event propagation.

```ts
const listener = (data, ev) => {
  // ... do something ...
  // Stop further propagation:
  ev.stopPropagation()
}
```

If you need to detect if propagation is stopped, the dispatcher returns the
context object from `dispatch()`.

```ts
const context = dispatcher.dispatch('user.created', data)
console.log(context.isPropagationStopped)
```

## Full Example

```ts
import { EventDispatcher } from '@foxandfly/ts-event-dispatcher'

const dispatcher = new EventDispatcher()

// Set up an event listener
dispatcher.addListener('user.created', (data, ev) => {
  // ... do something ...
  sendWelcomeEmail(data.user)

  // Optionally, stop next listeners from being called.
  ev.stopPropagation()
})

// Dispatch the event
dispatcher.dispatch('user.created', { user })
```

## TypeScript Example

```ts
import { EventDispatcher } from '@foxandfly/ts-event-dispatcher'

interface User { name: string }
interface UserEvent { user: User }

// Provide a map of event names and data expectations.
const dispatcher = new EventDispatcher<{
  'user.created': UserEvent
}>()

// TypeScript will check both the event name and the listener signature.
dispatcher.addListener('user.created', (data, ev) => {
  // ... do something ...
  sendWelcomeEmail(data.user)

  // Optionally, stop next listeners from being called.
  ev.stopPropagation()
})

// TypeScript will check both the event name and the data signature.
dispatcher.dispatch('user.created', {
  user: 'John',           // causes TypeScript error
  user: { name: 'Sue' },  // good
  additionalProp: 123,    // causes TypeScript error
})
```


-----

## TSDX Bootstrap

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

Commands:

```
npm start
npm run build
npm test
```
