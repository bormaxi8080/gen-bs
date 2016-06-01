import React from 'react';
import {Modal} from 'react-bootstrap';

import {viewBuilderSaveAndSelectView} from '../../../actions/viewBuilder';

export default class ViewBuilderFooter extends React.Component {

    render() {
        const {confirmButtonParams} = this.props;

        return (
            <Modal.Footer>
                <button
                    onClick={() => this.cancelOnClick()}
                    type='button'
                    className='btn btn-default'
                    data-dismiss='modal'
                >
                    <span data-localize='actions.cancel'>Cancel</span>
                </button>

                <button
                    onClick={(e) => this.selectOnClick(e)}
                    type='submit'
                    className='btn btn-primary'
                    disabled={confirmButtonParams.disabled}
                    title={confirmButtonParams.title}
                >
                    <span data-localize='actions.save_select.title'>{confirmButtonParams.caption}</span>
                </button>
            </Modal.Footer>
        );
    }

    cancelOnClick() {
        this.props.closeModal();
    }

    selectOnClick(e) {
        e.preventDefault();
        this.props.dispatch(viewBuilderSaveAndSelectView());
    }

}
