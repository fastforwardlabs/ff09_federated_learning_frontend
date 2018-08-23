import React, { Component } from 'react'
import { stateControl } from './stateControl'
import queryString from 'query-string'
import { button_reset } from './Constants'

class HistoryItem extends Component {
  handleClick(e) {
    this.props.timeTravel()
    this.props.handleChange(queryString.parse(this.props.config.string))
    e.preventDefault()
  }

  render() {
    return (
      <a
        href="#"
        style={{
          color: 'black',
          display: 'block',
          width: '100%',
          textAlign: 'left',
          outline: 'none',
          textDecoration: 'none',
          background:
            this.props.active_time &&
            this.props.active_time === this.props.config.time
              ? '#bbb'
              : 'transparent',
          ...this.props.style,
        }}
        onClick={this.handleClick.bind(this)}
      >
        {this.props.children}
      </a>
    )
  }
}

export default stateControl(HistoryItem)
