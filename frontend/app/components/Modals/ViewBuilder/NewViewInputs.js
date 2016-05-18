import React from 'react';
import {connect} from 'react-redux';
import {viewBuilderSelectView, viewBuilderChangeAttr} from '../../../actions/viewBuilder';


export default class NewViewInputs extends React.Component {

    render() {

        const {viewBuilder, validationMessage} = this.props;
        const newView = viewBuilder.editedView;

        return (
            <div className='collapse in copyview'>
                { validationMessage &&
                <div className='alert alert-help'>
                        <span data-localize='views.setup.selector.description'>
                            {validationMessage}
                        </span>
                </div>
                }
                <div className='row grid-toolbar row-noborder row-new-item'>
                    <div className='col-sm-6'>
                        <label data-localize='views.setup.new.name.title'>New View</label>
                        <input
                            type='text'
                            className='form-control text-primary'
                            data-localize='views.setup.new.name.help'
                            placeholder='Set view name a copy'
                            value={newView.name}
                            onChange={(e) => this.onNameChange(e.target.value)}
                        />
                    </div>
                    <div className='col-sm-6'>
                        <label data-localize='general.description'>Description</label>
                        <div className='input-group'>
                            <input
                                type='text'
                                className='form-control'
                                data-localize='views.setup.new.description'
                                placeholder='Set view description (optional)'
                                value={newView.description}
                                onChange={(e) => this.onDescriptionChange(e.target.value)}
                            />
                            <div className='input-group-btn btn-group-close'>
                                <button type='button' className='btn-link-default' type='button'
                                        onClick={() => this.onCancelClick()}>
                                    <i className='md-i'>close</i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    onNameChange(name) {
        const {editedView} = this.props.viewBuilder;
        this.props.dispatch(viewBuilderChangeAttr({
            name,
            description: editedView.description
        }));
    }

    onDescriptionChange(description) {
        const {editedView} = this.props.viewBuilder;
        this.props.dispatch(viewBuilderChangeAttr({
            name: editedView.name,
            description
        }));
    }

    onCancelClick() {
        const {editedView} = this.props.viewBuilder;
        this.props.dispatch(viewBuilderSelectView(this.props.views, editedView.originalViewId));
    }

}

function mapStateToProps(state) {
    const {viewBuilder, userData: {views}} = state;
    return {
        views,
        viewBuilder
    };
}

export default connect(mapStateToProps)(NewViewInputs);
