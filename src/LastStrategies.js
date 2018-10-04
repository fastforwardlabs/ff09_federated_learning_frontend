import React, { Component } from 'react'

class LastStrategies extends Component {
  render() {
    return (
      <div style={{ overflow: 'hidden' }}>
        {this.props.history
          .slice()
          .reverse()
          .map((entry, i) => {
            let ri = this.props.history.length - 1 - i
            return (
              <div
                style={{ float: 'left', border: 'solid 1px black', padding: 5 }}
              >
                <div>{entry[0]}</div>
                <div style={{ fontSize: '0.8em' }}>
                  {ri === this.props.history.length - 1
                    ? this.props.counter - entry[1]
                    : this.props.history[ri + 1][1]}{' '}
                  cycles
                </div>
              </div>
            )
          })}
      </div>
    )
  }
}

export default LastStrategies
