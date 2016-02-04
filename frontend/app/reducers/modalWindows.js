import * as ActionTypes from '../actions/modalWindows'

export default function modalWindows(state = {
  views: { showModal: false  },
  filters: { showModal: false  }
  }, action) {

  switch (action.type) {
    case ActionTypes.OPEN_MODAL:
      return Object.assign({}, state, {
        [action.modalName]: {showModal: true}
      });
    case ActionTypes.CLOSE_MODAL:
      return Object.assign({}, state, {
        [action.modalName]: {showModal: false}
      });

    default:
      return state
  }
}
