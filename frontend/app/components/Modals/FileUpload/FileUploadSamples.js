import React, { Component } from 'react';
import { connect } from 'react-redux';

import FileUploadSamplesRow from './FileUploadSamplesRow';

export default class FileUploadSamples extends Component {
    constructor(...args) {
        super(...args);
        this.state = {searchWord: ''};
    }

    render() {
        let { dispatch, closeModal, samplesList: {samples}} = this.props;
        if (!this.props.editableFieldsList || !this.props.editableFieldsList.length) {
            console.error('No editable fields found');
            return null;
        }
        if (this.state.searchWord.length > 0) {
            let searchWord = this.state.searchWord.toLowerCase();
            samples = samples.filter(el => ~el.fileName.toLocaleLowerCase().indexOf(searchWord));
        }
        return (
            <div>
                <div className="navbar navbar-search-full">
                    <div className="navbar-search">
                        <div className="navbar-search-field">
                          <input type="text" placeholder="Search available samples" onChange={e => this.setState({ searchWord: e.target.value })}
                               className="form-control material-input"/>
                        </div>
                    </div>
                </div>
                <div className="panel-group panel-group-scroll">
                    {samples.map(
                        sample => (
                            <FileUploadSamplesRow
                                sample={sample}
                                fields={this.props.editableFieldsList}
                                key={sample.id}
                                samples={samples}
                                dispatch={dispatch}
                                closeModal={closeModal}
                            />
                        )
                    )}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { samplesList } = state;
    return { samplesList }
}

export default connect(mapStateToProps)(FileUploadSamples)