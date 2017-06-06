import _ from 'lodash';

import * as ActionTypes from '../actions/viewBuilder';
import {entityType} from '../utils/entityTypes';
import * as i18n from '../utils/i18n';
import immutableArray from '../utils/immutableArray';

const INITIAL_STATE = {
    editingView: null,
    originalView: null,
    editingViewIsNew: false,
    editingViewParentId: '',
    allowedFields: null
};

function getNextDirection(direction) {
    if (!direction) {
        return 'asc';
    }
    const switcher = {
        'asc': 'desc',
        'desc': null
    };

    return switcher[direction];
}

function createViewItem(fieldId) {
    return {
        fieldId,
        keywords: []
    };
}

function reduceVBuilderStartEdit(state, action) {
    const {view, newViewInfo, allowedFields, languageId} = action;
    const editingView = newViewInfo ?
        i18n.changeEntityText(
            {
                ...view,
                type: entityType.USER,
                id: null
            },
            languageId,
            {
                name: newViewInfo.name
            }
        ) :
        view;
    return Object.assign({}, state, {
        editingView: editingView,
        originalView: editingView,
        editingViewIsNew: !!newViewInfo,
        editingViewParentId: view.id,
        allowedFields
    });
}

function reduceVBuilderSaveEdit(state) {
    return state;
}

function reduceVBuilderEndEdit(state) {
    return {
        ...state,
        ...INITIAL_STATE
    };
}

function reduceVBuilderDeleteColumn(state, action) {
    return {
        ...state,
        editingView: {
            ...state.editingView,
            viewListItems: immutableArray.remove(state.editingView.viewListItems, action.viewItemIndex)
        }
    };
}

function reduceVBuilderAddColumn(state, action) {
    const newViewItem = createViewItem(action.columnFieldId);
    return {
        ...state,
        editingView: {
            ...state.editingView,
            viewListItems: immutableArray.insertBefore(state.editingView.viewListItems, action.viewItemIndex, newViewItem)
        }
    };
}

function reduceVBuilderChangeAttr(state, action) {
    return {
        ...state,
        editingView: i18n.changeEntityText(
            state.editingView,
            action.languageId,
            {
                name: action.name,
                description: action.description
            }
        )
    };
}

function reduceVBuilderChangeColumn(state, action) {
    const changedViewItem = createViewItem(action.fieldId);
    return {
        ...state,
        editingView: {
            ...state.editingView,
            viewListItems: immutableArray.assign(state.editingView.viewListItems, action.viewItemIndex, changedViewItem)
        }
    };
}

function reduceVBuilderChangeSortColumn(state, action) {
    const viewItems = [...state.editingView.viewListItems];
    const firstSortItemIndex = _.findIndex(viewItems, {sortOrder: 1});
    const secondSortItemIndex = _.findIndex(viewItems, {sortOrder: 2});
    const selectedSortItemIndex = _.findIndex(viewItems, {fieldId: action.fieldId});
    const selectedOrder = action.sortOrder;
    const selectedDirection = getNextDirection(action.sortDirection);
    if (selectedSortItemIndex == secondSortItemIndex || selectedSortItemIndex == firstSortItemIndex) {
        viewItems[selectedSortItemIndex] = Object.assign({}, viewItems[selectedSortItemIndex], {
            sortDirection: selectedDirection
        });
        if (selectedDirection == null) {
            viewItems[selectedSortItemIndex] = Object.assign({}, viewItems[selectedSortItemIndex], {
                sortOrder: null
            });
            if (selectedSortItemIndex == firstSortItemIndex && secondSortItemIndex != -1) {
                viewItems[secondSortItemIndex] = Object.assign({}, viewItems[secondSortItemIndex], {
                    sortOrder: 1
                });
            }
        }
    } else {
        const oldSortItemIndex = _.findIndex(viewItems, {sortOrder: selectedOrder});
        if (oldSortItemIndex != -1) {
            viewItems[oldSortItemIndex] = Object.assign({}, viewItems[oldSortItemIndex], {
                sortOrder: null,
                sortDirection: null
            });
        }
        viewItems[selectedSortItemIndex] = Object.assign({}, viewItems[selectedSortItemIndex], {
            sortDirection: selectedDirection,
            sortOrder: firstSortItemIndex == -1 ? 1 : selectedOrder
        });
    }
    return Object.assign({}, state, {
        editingView: Object.assign({}, state.editingView, {
            viewListItems: viewItems
        })
    });
}

function reduceVBuilderSetItemKeywords(state, action) {
    return {
        ...state,
        editingView: {
            ...state.editingView,
            viewListItems: immutableArray.assign(state.editingView.viewListItems, action.viewItemIndex, {keywords: action.keywordsIds})
        }
    };
}

function reduceVBuilderOnSave(state, action) {
    return {
        ...state,
        onSaveAction: action.onSaveAction,
        onSaveActionProperty: action.onSaveActionProperty
    };
}

export default function viewBuilder(state = {
    ...INITIAL_STATE,
    isFetching: false
}, action) {

    switch (action.type) {
        case ActionTypes.VBUILDER_START_EDIT:
            return reduceVBuilderStartEdit(state, action);
        case ActionTypes.VBUILDER_SAVE_EDIT:
            return reduceVBuilderSaveEdit(state);
        case ActionTypes.VBUILDER_END_EDIT:
            return reduceVBuilderEndEdit(state);
        case ActionTypes.VBUILDER_DELETE_COLUMN:
            return reduceVBuilderDeleteColumn(state, action);
        case ActionTypes.VBUILDER_ADD_COLUMN:
            return reduceVBuilderAddColumn(state, action);
        case ActionTypes.VBUILDER_CHANGE_ATTR:
            return reduceVBuilderChangeAttr(state, action);
        case ActionTypes.VBUILDER_CHANGE_COLUMN:
            return reduceVBuilderChangeColumn(state, action);
        case ActionTypes.VBUILDER_CHANGE_SORT_COLUMN:
            return reduceVBuilderChangeSortColumn(state, action);
        case ActionTypes.VBUILDER_SET_ITEM_KEYWORDS:
            return reduceVBuilderSetItemKeywords(state, action);
        case ActionTypes.VBUILDER_ON_SAVE:
            return reduceVBuilderOnSave(state, action);
        default:
            return state;
    }
}
