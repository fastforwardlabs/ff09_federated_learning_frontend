import React, { Component } from 'react'
import { maitenanceCheck, strategies, strategy_names } from './Constants'

class StrategyChooser extends Component {
  setStrategy(n) {
    this.props.setStrategy(n)
  }
  render() {
    return (
      <div>
        {strategy_names.map(n => {
          let available = false
          if (n === 'preventative') {
            if (this.props.exploded >= 4) {
              available = true
            }
          }
          return (
            <div>
              {n === this.props.strategy ? (
                this.props.strategy
              ) : (
                <button
                  disabled={!available}
                  onClick={this.setStrategy.bind(this, n)}
                >
                  {n}
                </button>
              )}{' '}
              {n === 'preventative' ? this.props.failure_mean : null}
            </div>
          )
        })}
      </div>
    )
  }
}

export default StrategyChooser
