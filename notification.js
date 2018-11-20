const xs = require('xstream').default
const { div, button, ul } = require('@cycle/dom')
const { makeCollection } = require('@cycle/state')

function intent ({ DOM, time }) {
  const deleteClick$ = DOM.select('.delete').events('click')

  const delayedDelete$ = xs.of(null).compose(time.delay(5000))

  return { deleteClick$, delayedDelete$ }
}

function model ({ deleteClick$, delayedDelete$ }) {
  return xs.merge(
    deleteClick$.mapTo(() => undefined),
    delayedDelete$.mapTo(() => undefined)
  )
}

function view ({ type, message }) {
  return div(`.notification .is-${type}`, [
    button('.delete'),
    `${message}`
  ])
}

function Notification (sources) {
  return {
    DOM: sources.state.stream.map(view),
    state: model(intent(sources))
  }
}

module.exports = makeCollection({
  item: Notification,
  itemKey: childState => childState.key,
  itemScope: key => key,
  collectSinks (instances) {
    return {
      DOM: instances.pickCombine('DOM').map(ul),
      state: instances.pickMerge('state')
    }
  }
})
