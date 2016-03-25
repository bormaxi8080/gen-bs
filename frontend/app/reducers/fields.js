import * as ActionTypes from '../actions/fields'

function updateFieldsSamples(field) {
    // patch field because some properties may not exists
    return Object.assign({}, field, {
        label: field.label ? field.label : field.name
    });
}

export default function fields(state = {
    isFetching: {samples: false, sources: false},
    list: [],
    sourceFieldsList: []
}, action) {

    switch (action.type) {

        case ActionTypes.REQUEST_FIELDS:
            return Object.assign({}, state, {
                isFetching: Object.assign({}, state.isFetching, {
                    samples: true
                })
            });

        case ActionTypes.RECEIVE_FIELDS:
            const fields = action.fields.map(updateFieldsSamples);
            const editableFields = _.filter(fields, 'is_editable', true);
            const idToFieldHash = _.reduce(fields, (result, field) => {
                result[field.id] = field;
                return result;
            });
            return Object.assign({}, state, {
                isFetching: Object.assign({}, state.isFetching, {
                    samples: false
                }),
                list: fields,
                editableFields,
                idToFieldHash,
                lastUpdated: action.receivedAt
            });

        case ActionTypes.REQUEST_SOURCE_FIELDS:
            return Object.assign({}, state, {
                isFetching: Object.assign({}, state.isFetching, {
                    sources: true
                })
            });

        case ActionTypes.RECEIVE_SOURCE_FIELDS:
            let sourceFields = action.sourceFields.map(updateFieldsSamples);
            return Object.assign({}, state, {
                isFetching: Object.assign({}, state.isFetching, {
                    sources: false
                }),
                sourceFieldsList: sourceFields,
                lastUpdated: action.receivedAt
            });

        default:
            return state;
    }
}
