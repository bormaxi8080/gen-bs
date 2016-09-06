import _ from 'lodash';

import * as ActionTypes from '../actions/fields';
import {ImmutableHashedArray} from '../utils/immutable';
import FieldUtils from '../utils/fieldUtils';

const initialState = {
    isFetching: {
        samples: false,
        sources: false
    },
    sampleFieldsHashedArray: ImmutableHashedArray.makeFromArray([]),
    editableFields: [],
    sourceFieldsList: [],
    totalFieldsHashedArray: ImmutableHashedArray.makeFromArray([])
};

function reduceReceiveFields(action, state) {
    const fields = FieldUtils.sortAndAddLabels(action.fields);

    return Object.assign({}, state, {
        isFetching: Object.assign({}, state.isFetching, {
            samples: false
        }),
        sampleFieldsHashedArray: ImmutableHashedArray.makeFromArray(fields),
        lastUpdated: action.receivedAt
    });
}

function reduceReceiveTotalFields(action, state) {
    const totalFields = FieldUtils.sortAndAddLabels(action.fields);
    const editableFields = _.filter(totalFields, ['isEditable', true]);
    const sourceFields = _.filter(totalFields, (field) => field.sourceName !== 'sample');
    return Object.assign({}, state, {
        isFetching: Object.assign({}, state.isFetching, {
            sources: false
        }),
        totalFieldsHashedArray: ImmutableHashedArray.makeFromArray(totalFields),
        sourceFieldsList: sourceFields,
        editableFields,
        lastUpdated: action.receivedAt
    });
}

function reduceRequestTotalFields(action, state) {
    return Object.assign({}, state, {
        isFetching: Object.assign({}, state.isFetching, {
            sources: true
        })
    });
}

export default function fields(state = initialState, action) {

    switch (action.type) {

        case ActionTypes.RECEIVE_FIELDS:
            return reduceReceiveFields(action, state);

        case ActionTypes.REQUEST_TOTAL_FIELDS:
            return reduceRequestTotalFields(action, state);

        case ActionTypes.RECEIVE_TOTAL_FIELDS:
            return reduceReceiveTotalFields(action, state);

        default:
            return state;
    }
}
