import React, { Component } from 'react'
import { commas } from './Utilties'

class LastStrategies extends Component {
  render() {
    return (
      <div
        style={{
          overflow: 'hidden',
        }}
      >
        <div style={{}}>
          {this.props.history.map((entry, i) => {
            let ri = this.props.history.length - 1 - i
            let rentry = this.props.history[ri]
            return (
              <div style={{}}>
                <div>
                  <span>
                    {ri !== this.props.history.length - 1 ? (
                      <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                        <strong>{rentry[0]}</strong> for{' '}
                        {Math.round(
                          ((this.props.history[ri + 1][1] -
                            this.props.history[ri][1]) /
                            this.props.counter) *
                            100
                        ) + '% of cycles'}
                      </span>
                    ) : (
                      <span>
                        <strong>{rentry[0]}</strong> for{' '}
                        {Math.round(
                          ((this.props.counter - this.props.history[ri][1]) /
                            this.props.counter) *
                            100
                        ) + '% of cycles'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default LastStrategies
