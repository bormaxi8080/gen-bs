import { initSearchInResultsParams } from './variantsTable'
import { changeFileUploadProgress } from './fileUpload'
/*
 * action types
 */
export const WS_CREATE_CONNECTION = 'WS_CREATE_CONNECTION';
export const WS_RECEIVE_ERROR = 'WS_RECEIVE_ERROR';
export const WS_RECEIVE_AS_ERROR = 'WS_RECEIVE_AS_ERROR';
export const WS_RECEIVE_CLOSE= 'WS_RECEIVE_MESSAGE';
export const WS_SEND_MESSAGE = 'WS_SEND_MESSAGE';

export const WS_TABLE_MESSAGE = 'WS_TABLE_MESSAGE';
export const WS_PROGRESS_MESSAGE = 'WS_PROGRESS_MESSAGE';
export const WS_OTHER_MESSAGE = 'WS_OTHER_MESSAGE';
export const REQUEST_ANALYZE = 'REQUEST_ANALYZE';


/*
 * other consts
 */


/*
 * action creators
 */
export function createWsConnection(wsConn) {
  return {
    type: WS_CREATE_CONNECTION,
    wsConn
  }
}

function tableMessage(wsData) {
  return {
    type: WS_TABLE_MESSAGE,
    wsData
  }
}

function progressMessageRouter(wsData) {
  return (dispatch, getState) => {
    dispatch(progressMessage(wsData))

    if (getState().fileUpload.operationId === wsData.operationId) {
      dispatch(changeFileUploadProgress(wsData.result.progress))
    }
  }
}

function progressMessage(wsData) {
  return {
    type: WS_PROGRESS_MESSAGE,
    wsData
  }
}

function receiveError(err) {
  return {
    type: WS_RECEIVE_ERROR,
    err 
  };
}

function asError(err) {
  return {
    type: WS_RECEIVE_AS_ERROR,
    err 
  };
}

function otherMessage(wsData) {
  return {
    type: WS_OTHER_MESSAGE,
    wsData
  };
}

function receiveMessage(msg) {
  return (dispatch, getState) => {
    const wsData = JSON.parse(JSON.parse(msg));
    console.log('wsData.result', wsData.result);
    console.log('wsData.operationId', wsData.operationId);
    if (wsData.result) {
      if (wsData.result.sampleId) {

        dispatch(tableMessage(wsData))

      } else if(wsData.result.progress) {
        dispatch(progressMessageRouter(wsData));
      } else if(wsData.result.error) {
        dispatch(asError(wsData.result.error));
      } else {
        dispatch(otherMessage(wsData));
      }
    } else {
      dispatch(otherMessage(wsData));
    }
  }
}

function receiveClose(msg) {
  return {
    type: WS_RECEIVE_CLOSE,
    msg 
  }
}

function sended(msg) {
  return {
    type: WS_SEND_MESSAGE,
    msg
  }
}

export function subscribeToWs(sid) {
  return (dispatch, getState) => {
    const conn = getState().websocket.wsConn;
    conn.onopen = event => {
      conn.send(JSON.stringify({ session_id: sid }));
    };
    conn.onmessage = event => dispatch(receiveMessage(JSON.stringify(event.data)));
    conn.onerror = event => dispatch(receiveError(event.data));
    conn.onclose = event => dispatch(receiveClose(event.data));
  }
}

export function send(msg) {
  return (dispatch, getState) => {

    const conn = getState().websocket.wsConn;
    conn.send(msg);
    return dispatch(sended(msg));
  };
}

export function requestAnalyze() {
  return {
    type: REQUEST_ANALYZE
  };
}


