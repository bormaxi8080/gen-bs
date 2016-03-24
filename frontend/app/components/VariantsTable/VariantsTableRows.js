import React, { Component } from 'react';
import {OverlayTrigger,Popover,Button} from 'react-bootstrap'
import classNames from 'classnames';

import VariantsTableEmpty from './VariantsTableEmpty';
import CommentEditPopover from './VariantsTableComment';
import VariantsTableRow from './VariantsTableRow';

import { getNextPartOfData, createComment } from '../../actions/variantsTable';

export default class VariantsTableRows extends Component {

    render() {
        const sampleRows = this.props.variants;
        const { currentVariants } = this.props.ws;
        const { sort } = this.props.variantsTable.searchInResultsParams;
        const { isFilteringOrSorting} = this.props.variantsTable;
        const { searchParams,ui } = this.props;
        const currentView = searchParams ? _.find(ui.views, view => view.id === searchParams.viewId) : null;

        return (
            <tbody className="table-variants-body"
                   id="variants_table_body"
                   ref="variantsTableBody">
            {this.renderTableBody(sampleRows, sort, isFilteringOrSorting, currentView)}
            {this.renderWaitingIfNeeded(isFilteringOrSorting, currentVariants)}
            </tbody>
        );
    }

    componentDidMount() {
        const containerElement = document.getElementsByClassName('table-variants-container').item(0);
        const scrollElement = this.refs.variantsTableBody;
        console.log('scrollElement', scrollElement);
        console.log('containerElement', containerElement.clientHeight);
        scrollElement.style.height = `${containerElement.clientHeight - 100}px`;

        scrollElement.addEventListener('scroll', this.handleScroll.bind(this));
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.variants !== nextProps.variants;
    }

    componentWillUnmount() {
        const scrollElement = this.refs.variantsTableBody;
        scrollElement.removeEventListener('scroll', this.handleScroll);
    }

    renderTableBody(rows, sortState, isFilteringOrSorting, currentView) {
        if (isFilteringOrSorting || !currentView) {
            return (
                <tr>
                    <td colSpan="100">
                        <div className="table-loader">Loading...<i className="md-i">autorenew</i>
                        </div>
                    </td>
                </tr>
            );
        } else {
            return _.map(rows, (row, index) => this.renderRow(row, index, sortState, currentView));
        }
    }

    handleScroll(e) {
        //console.log('scroll', e);
        const { currentVariants } = this.props.ws;
        if (!currentVariants) {
            return;
        }
        const el = e.target;
        const variantsLength = currentVariants.length;

        if (el.scrollHeight - el.scrollTop === el.clientHeight
            && variantsLength > this.props.variantsTable.searchInResultsParams.limit - 1) {
            this.props.dispatch(getNextPartOfData());
        }
    }

    getMainFieldValue(col_name,row_fields){
        const mainField = _.find( this.props.fields.list, field => field.name === col_name);
        return _.find( row_fields, field => field.field_id === mainField.id).value
    }

    renderRow(row, rowIndex, sortState, currentView) {
        return (
            <VariantsTableRow key={rowIndex}
                              row={row}
                              rowIndex={rowIndex}
                              sortState={sortState}
                              currentView={currentView}
            />
        );
    }

    renderWaitingIfNeeded(isFilteringOrSorting, currentVariants) {
        const variantsLength = (!currentVariants) ? 0 : currentVariants.length;
        if (!isFilteringOrSorting && variantsLength > 99) {
            return (
                <tr>
                    <td colSpan="100">
                        <div className="table-loader">Loading...<i className="md-i">autorenew</i>
                        </div>
                    </td>
                </tr>
            );
        } else {
            return null;
        }
    }
}
