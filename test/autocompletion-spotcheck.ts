/**
 * Because the dispatcher is typed, an IDE should provide autocompletion of
 * event names when adding a listener or dispatching an event.
 *
 * The dispatcher also accepts unknown event names.
 * The name parameter boils down to `(keyof KnownEvents) | string`.
 *
 * However, the string union breaks autocompletion of the known event names.
 * In order to get autocompletion of known event names, but also allow
 * arbitrary values, I use a special LiteralUnion type.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/29729
 */

import { EventDispatcher } from '../src'

interface UserEventData {
  userID: Number
  locked: Boolean
}

export function UserEventData(): UserEventData {
  return {
    userID: null,
    locked: false,
  }
}

const dispatcher = new EventDispatcher<{ user_created: UserEventData }>()

// IDE should provide autocompletion of event name & data
dispatcher.addListener('user_created', data => {
  console.log(data.userID)
})
dispatcher.dispatch('user_created', { userID: 1, locked: true })

// This should not cause any TS errors:
dispatcher.addListener('unknown_event', data => {
  console.log(data)
})
dispatcher.dispatch('unknown_event', 'data')
