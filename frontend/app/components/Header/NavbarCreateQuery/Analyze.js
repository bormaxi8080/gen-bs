import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Overlay, Tooltip } from 'react-bootstrap'


export default class Analyze extends Component {

  render() {

    const { isAnalyzeTooltipVisible } = this.props.ui

    const tooltip = <Tooltip id="analyze_button_tooltip">Analyze current sample with current filters and view</Tooltip>;

    const overlayProps = {
      show: isAnalyzeTooltipVisible,
      container: this,
      target: () => ReactDOM.findDOMNode(this.refs.analyze_tooltip_target)

    };
    return (

        <div className="table-cell">
            <div className="btn-group btn-group-submit"
              data-localize="query.analyze.help"
              ref="analyze_tooltip_target"
              >  
              <button className="btn btn-rounded btn-alt-primary" type="button" onClick={this.props.clicked}>
                 <span data-localize="query.analyze.title">Analyze</span>
              </button>
            <Overlay {...overlayProps} placement="bottom">
                { tooltip }
            </Overlay>
            </div>

        </div>

    )
  }
}