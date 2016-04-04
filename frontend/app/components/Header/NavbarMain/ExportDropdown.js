import React, {Component} from 'react';
import {Nav, NavDropdown, MenuItem} from 'react-bootstrap';

import {exportToFile} from '../../../actions/savedFiles';
import ComponentBase from '../../shared/ComponentBase';

export default class ExportDropdown extends ComponentBase {

    constructor(props) {
        super(props)
    }

    get haveSelectedVariants() {
        const {selectedSearchKeysToVariants} = this.props;
        return !!Object.keys(selectedSearchKeysToVariants).length;
    }

    render() {
        const exportDropdownTitle = this.renderExportButtonTitle();
        return (
            <div>
                <Nav>
                    <NavDropdown title={exportDropdownTitle}
                                 id="export-dropdown"
                                 onSelect={(e, item) => this.onExportItemSelected(e, item)}
                                 disabled={!this.haveSelectedVariants}
                    >
                        <MenuItem eventKey="csv">CSV</MenuItem>
                        <MenuItem eventKey="sql">SQL</MenuItem>
                        <MenuItem eventKey="txt">Text</MenuItem>
                    </NavDropdown>
                </Nav>
            </div>
        );
    }

    renderExportButtonTitle() {
        if (!this.haveSelectedVariants) {
            return (<span>Export</span>);
        } else {
            const {selectedSearchKeysToVariants} = this.props;
            const selectedVariantsCount = Object.keys(selectedSearchKeysToVariants).length;
            return (<span>Export<span className="badge badge-warning">{selectedVariantsCount}</span></span>);
        }
    }

    onExportItemSelected(event, selectedKey) {
        event.preventDefault();

        const {
            dispatch,
            selectedSearchKeysToVariants
        } = this.props;

        if (_.isEmpty(selectedSearchKeysToVariants)) {
            console.log('Nothing is selected for export.');
            return;
        }

        dispatch(exportToFile(selectedKey));
    }
}

ExportDropdown.propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    selectedSearchKeysToVariants: React.PropTypes.object.isRequired
};
