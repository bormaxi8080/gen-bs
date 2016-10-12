import React from 'react';
import {connect} from 'react-redux';

import DialogBase from './DialogBase';
import config from '../../../config';
import {closeAllUserSessionsAsync, showCloseAllUserSessionsDialog} from '../../actions/auth';

class CloseAllUserSessionsModal extends DialogBase {
    renderTitleContents() {
        return (
            <div>Other Session is Opened</div>
        );
    }

    renderFooterContents() {
        return (
            <button type='button'
                    onClick={() => this._closeAllSessions()}
                    className='btn btn-default'
            >
                <span>Close Other Session</span>
            </button>
        );
    }

    renderBodyContents() {
        return (<div>
            We have another your session opened. If you want to close it and start a new one here,
            please press the button below or just close the dialog.
        </div>);
    }

    onCloseModal() {
        this._closeAllSessions();
    }

    _closeAllSessions() {
        const {dispatch} = this.props;
        dispatch(closeAllUserSessionsAsync())
            .then(() => {
                dispatch(showCloseAllUserSessionsDialog(false));
                window.location = config.LOGIN_URL;
            });
    }
}

export default connect(() => ({}))(CloseAllUserSessionsModal);