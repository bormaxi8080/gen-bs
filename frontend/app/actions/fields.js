import HttpStatus from 'http-status';

import apiFacade from '../api/ApiFacade';
import {handleError} from './errorHandler';

/*
 * action types
 */

export const REQUEST_FIELDS = 'REQUEST_FIELDS';
export const RECEIVE_FIELDS = 'RECEIVE_FIELDS';

export const REQUEST_TOTAL_FIELDS = 'REQUEST_TOTAL_FIELDS';
export const RECEIVE_TOTAL_FIELDS = 'RECEIVE_TOTAL_FIELDS';

const SAMPLE_FIELDS_NETWORK_ERROR = 'Cannot get sample fields (network error). You can reload page and try again.';
const SAMPLE_FIELDS_SERVER_ERROR = 'Cannot get sample fields (server error). You can reload page and try again.';

const TOTAL_FIELDS_NETWORK_ERROR = 'Cannot get list of all fields (network error). You can reload page and try again.';
const TOTAL_FIELDS_SERVER_ERROR = 'Cannot get list of all fields (server error). You can reload page and try again.';

const samplesClient = apiFacade.samplesClient;

/*
 * action creators
 */
function requestFields() {
    return {
        type: REQUEST_FIELDS
    };
}

export function receiveFields(fields) {
    return {
        type: RECEIVE_FIELDS,
        fields: fields || [],
        receivedAt: Date.now()
    };
}

export function fetchFields(sampleId) {

    return (dispatch) => {
        dispatch(requestFields());

        return new Promise((resolve) => {
            samplesClient.getFields(sampleId, (error, response) => {
                if (error) {
                    dispatch(handleError(null, SAMPLE_FIELDS_NETWORK_ERROR));
                } else if (response.status !== HttpStatus.OK) {
                    dispatch(handleError(null, SAMPLE_FIELDS_SERVER_ERROR));
                } else {
                    dispatch(receiveFields(response.body));
                }
                resolve();
            });
        });
    };
}

function requestTotalFields() {
    return {
        type: REQUEST_TOTAL_FIELDS
    };
}

export function receiveTotalFields(json) {
    return {
        type: RECEIVE_TOTAL_FIELDS,
        fields: json,
        receivedAt: Date.now()
    };
}

export function fetchTotalFields() {

    return (dispatch) => {
        dispatch(requestTotalFields());

        samplesClient.getAllFields((error, response) => {
            if (error) {
                dispatch(handleError(null, TOTAL_FIELDS_NETWORK_ERROR));
            } else if (response.status !== HttpStatus.OK) {
                dispatch(handleError(null, TOTAL_FIELDS_SERVER_ERROR));
            } else {
                dispatch(receiveTotalFields(response.body));
            }
        });
    };
}
