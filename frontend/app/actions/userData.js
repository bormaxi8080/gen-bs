import { analyze, changeSample, changeView } from './ui'
import { fetchFields } from './fields'

/*
 * action types
 */
export const RECEIVE_USERDATA = 'RECEIVE_USERDATA'
export const REQUEST_USERDATA = 'REQUEST_USERDATA'


/*
 * Other constants
 */
const USERDATA_URL = 'http://localhost:8888/api/data'
//const USERDATA_URL = 'http://ec2-52-91-166-29.compute-1.amazonaws.com:8080/api/data'


/*
 * action creators
 */
function requestUserdata() {
  return {
    type: REQUEST_USERDATA
  }
}

function receiveUserdata(json) {
  return {
    type: RECEIVE_USERDATA,
    userData: json,
    receivedAt: Date.now()
  }
}

export function fetchUserdata() {

  return (dispatch, getState ) => {

    dispatch(requestUserdata())

    return $.ajax(USERDATA_URL, {
        'type': 'GET',
         'headers': { "X-Session-Id": getState().auth.sessionId}
      })
      .then(json => {
        const sampleId = json.samples[0].id || null
        const view = json.views[0] || null
        const sample = json.samples[0] || null
        dispatch(receiveUserdata(json))
        dispatch(changeView(json.views, view.id))
        dispatch(changeSample(json.samples, sample.id))
        dispatch(analyze(sample.id, view.id, null))
        dispatch(fetchFields(sampleId))
      })

      // TODO:
      // catch any error in the network call.
  }
}

