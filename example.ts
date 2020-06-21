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