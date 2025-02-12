import * as ActionTypes from '../actions/auth';
import {loginType} from '../utils/authTypes';

export default function auth(state = {
    authType: loginType.GOOGLE,
    login: null,
    password: null,
    isFetching: false,
    isDemo: false,
    showAutoLogoutDialog: false,
    secondsToAutoLogout: null,
    errorMessage: null,
    showCloseAllUserSessionsDialog: false,
    showAnotherPageOpenedModal: false,
    isWaitingForCloseAnotherPageOpenedModal: false
}, action) {

    switch (action.type) {

        case ActionTypes.REQUEST_SESSION:
            return Object.assign({}, state, {
                isFetching: true
            });

        case ActionTypes.RECEIVE_SESSION: {
            return Object.assign({}, state, {
                isFetching: false,
                isDemo: action.isDemo,
                lastUpdated: action.receivedAt
            });
        }

        case ActionTypes.SET_AUTOLOGOUT_COUNTDOWN_TIMER: {
            const showAutoLogoutDialog = action.secondsToAutoLogout !== null;
            return Object.assign({}, state, {
                showAutoLogoutDialog,
                secondsToAutoLogout: action.secondsToAutoLogout
            });
        }

        case ActionTypes.LOGIN_ERROR:
            return Object.assign({}, state, {
                errorMessage: action.errorMessage
            });

        case ActionTypes.SHOW_CLOSE_ALL_USER_SESSIONS_DIALOG:
            return Object.assign({}, state, {
                showCloseAllUserSessionsDialog: action.shouldShow
            });

        case ActionTypes.TOGGLE_ANOTHER_PAGE_OPENED_MODAL:
            return {
                ...state,
                showAnotherPageOpenedModal: action.shouldShow,
                isWaitingForCloseAnotherPageOpenedModal: !action.shouldShow
            };

        case ActionTypes.SET_WAITING_FOR_CLOSE_ANOTHER_PAGE_OPENED_MODAL:
            return {
                ...state,
                isWaitingForCloseAnotherPageOpenedModal: true
            };

        case ActionTypes.SETUP_AUTH:
            return {
                ...state,
                authType: action.authType,
                login: action.login,
                password: action.password
            };

        default:
            return state;
    }
}
