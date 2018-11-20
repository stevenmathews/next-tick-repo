import test from 'ava'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import toHtml from 'snabbdom-to-html'
import { withState } from '@cycle/state'
import htmlLooksLike from 'html-looks-like'
import { mockTimeSource } from '@cycle/time'
import { mockDOMSource, ul } from '@cycle/dom'

import Notifications from './notification'

test.cb('Displays a notification for 5 seconds', t => {
  const time = mockTimeSource({ interval: 2500 })

  const key = '1518131676454'

  const emptyHtml = `
    <ul class="___notifications"></ul>
  `

  const notificationHtml = `
    <ul class="___notifications">
      <div class="notification is-success ___${key}">
        <button class="delete "></button>
        Notification
      </div>
    </ul>
  `

  const expectedDOMValues = {
    a: emptyHtml,
    b: notificationHtml
  }

  const expectedStateValues = {
    a: { notifications: [] },
    b: { notifications: [{ message: 'Notification', key, type: 'success' }] }
  }

  const notification = { message: 'Notification', key, type: 'success' }

  const addNotification = {
    a: ({ notifications }) => ({notifications: notifications.concat(notification)})
  }

  const addNotification$ = time.diagram('--a--', addNotification)
  const expectedState$   = time.diagram('a-b-a', expectedStateValues)
  const expectedDOM$     = time.diagram('a-b-a', expectedDOMValues)

  const app = sources => {
    time.assertEqual(sources.state.stream, expectedState$)

    const notifications = isolate(Notifications, 'notifications')(sources)

    return {
      DOM: notifications.DOM,
      state: xs.merge(
        xs.of(() => ({ notifications: [] })),
        notifications.state,
        addNotification$
      )
    }
  }

  const sinks = withState(app)({ DOM: mockDOMSource({}), time })

  const DOM$ = sinks.DOM.map(toHtml)

  time.assertEqual(DOM$, expectedDOM$, htmlLooksLike)
  time.run(t.end)
})
