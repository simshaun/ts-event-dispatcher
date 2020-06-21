# ts-event-dispatcher

![CI](https://github.com/IndelibleVI/ts-event-dispatcher/workflows/CI/badge.svg?branch=master)

This is a simple library that allows your application components to communicate with each other by dispatching events and listening to them.

## Installation

```
npm install ivi-ts-event-dispatcher
```

## Usage

Events are identified by a unique name of your choosing. Any number of listeners might be listening for them.
When an event is dispatched, data about that specific event is passed to listeners so that they have the information they need.


### The EventDispatcher

Generally, you would create a single dispatcher and share it throughout your application. It maintains a registry of listeners.
When an event is dispatched via the dispatcher, it notifies all listeners registered with that event.

```ts
import { EventDispatcher } from 'ivi-ts-event-dispatcher';

const dispatcher = new EventDispatcher();
```

### Dispatching an Event

Suppose you want to trigger an event when a user signs up on your website.
Your event name might be `user.created`. When dispatching the event, you'll pass a User object to the listeners.

```ts
const data = { user, timestamp: 12345 }; // contrived
dispatcher.dispatch('user.created', data);
```

### Event Listeners

Event listeners are simple, callable functions that you register with the event dispatcher.
The EventDispatcher passes your app-specific event data and a special context object (more on that later) to listeners when
their event is dispatched.

```ts
import { EventListener } from 'ivi-ts-event-dispatcher';

const listener: EventListener = (data) => {
  // ... do something ...
}
dispatcher.addListener('user.created', listener);
```

The `addListener()` method takes two or three arguments:
1. An event name.
2. A callable function to execute when the event is dispatched.
3. An optional priority, defined as a positive or negative integer (defaults to `0`). The higher the number, the earlier the listener
   is called. If two listeners have the same priority, they are executed in the order they were added to the dispatcher.


### Stopping Event Propagation

Sometimes it may make sense for a listener to prevent the next listeners from being called. This can be accomplished with the
special context object mentioned earlier. It's passed to event listeners as the second argument and can be used to stop event propagation.

```ts
const listener: EventListener = (data, ev) => {
  // ... do something ...
  // Stop further propagation:
  ev.stopPropagation();
}
```

If you need to detect if propagation is stopped, the dispatcher returns the context object from `dispatch()`.

```ts
const context = dispatcher.dispatch('user.created', data);
console.log(context.isPropagationStopped);
```

## Full Example

```ts
import { EventDispatcher, EventListener } from 'ivi-ts-event-dispatcher';

const dispatcher = new EventDispatcher();

// Set up an event listener.
const listener: EventListener = (data, ev) => {
  // ... do something ...
  sendWelcomeEmail(data.user);

  // Optionally, stop next listeners from being called.
  ev.stopPropagation();
}

// Register it in the dispatcher
dispatcher.addListener("user.created", listener);

// Dispatch the event
dispatcher.dispatch("user.created", { user });
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
