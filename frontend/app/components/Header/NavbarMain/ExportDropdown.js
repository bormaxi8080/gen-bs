import React from 'react';
import {Nav, NavDropdown, MenuItem} from 'react-bootstrap';

import {exportToFile} from '../../../actions/savedFiles';
import ComponentBase from '../../shared/ComponentBase';

export default class ExportDropdown extends ComponentBase {

    constructor(props) {
        super(props);
    }

    haveSelectedVariants() {
        const {selectedRowIndices} = this.props;
        return !_.isEmpty(selectedRowIndices);
    }

    render() {
        const {p} = this.props;
        const exportDropdownTitle = this.renderExportButtonTitle();
        return (
            <div>
                <Nav>
                    <NavDropdown title={exportDropdownTitle}
                                 id='export-dropdown'
                                 onSelect={(e, item) => this.onExportItemSelected(e, item)}
                                 disabled={!this.haveSelectedVariants()}
                    >
                        <MenuItem eventKey='csv'>{p.t('navBar.exports.formats.csv')}</MenuItem>
                        <MenuItem eventKey='sql'>{p.t('navBar.exports.formats.sql')}</MenuItem>
                        <MenuItem eventKey='txt'>{p.t('navBar.exports.formats.txt')}</MenuItem>
                    </NavDropdown>
                </Nav>
            </div>
        );
    }

    renderExportButtonTitle() {
        const {p} = this.props;
        if (!this.haveSelectedVariants()) {
            return (<span><span className='hidden-xs'>{p.t('navBar.exports.popupHeader')}</span><span className='visible-xs'><span className='dropdown-menu-header'>{p.t('navBar.exports.popupCaption')}</span><i className='md-i md-cloud_download md-replace-to-close'></i></span></span>);
        } else {
            const {selectedRowIndices} = this.props;
            const selectedVariantsCount = selectedRowIndices.length;
            return (<span><span className='hidden-xs'>{p.t('navBar.exports.popupHeader')}</span><span className='visible-xs'><span className='dropdown-menu-header'>{p.t('navBar.exports.popupCaption')}</span><i className='md-i md-cloud_download md-replace-to-close'></i></span><span className='badge badge-warning'>{selectedVariantsCount}</span></span>);
        }
    }

    onExportItemSelected(event, selectedKey) {
        event.preventDefault();

        const {
            dispatch,
            selectedRowIndices
        } = this.props;

        if (_.isEmpty(selectedRowIndices)) {
            console.log('Nothing is selected for export.');
            return;
        }

        dispatch(exportToFile(selectedKey));
    }
}

ExportDropdown.propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    selectedRowIndices: React.PropTypes.array.isRequired
};
