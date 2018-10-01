import React, { Component } from 'react'

let key_selector = 'RUL_predict_full'
let display_keys = ['engine_no', 'RUL', 'RUL_predict_full', 'RUL_predict_small']
let stats = ['maintenance', 'exploded', 'produced']

class Simulator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      start: this.props.counter,
      produced: 0,
      maintenance: 0,
      exploded: 0,
      engine_selector: this.getEngineSelector(),
    }
  }

  getEngineSelector() {
    return Math.floor(Math.random() * 99 + 1)
  }

  componentDidUpdate(prevState, prevProps) {
    let { engine_selector } = this.state
    let { engines } = this.props
    let engine = engines[engine_selector]
    let c = this.getC()
    let maintenance_trigger = engine[c][key_selector] < 20
    if (maintenance_trigger) {
      this.setState(function(state, props) {
        return {
          start: props.counter,
          engine_selector: this.getEngineSelector(),
          maintenance: state.maintenance + 1,
          produced:
            state.produced + props.engines[state.engine_selector].length,
        }
      })
    }
    let explosion_trigger = engine[c]['RUL'] === 0
    if (explosion_trigger) {
      this.setState(function(state, props) {
        return {
          start: props.counter,
          engine_selector: this.getEngineSelector(),
          exploded: state.exploded + 1,
          produced:
            state.produced + props.engines[props.engine_selector].length,
        }
      })
    }
  }

  getC() {
    let { counter } = this.props
    let { start } = this.state
    return counter - start
  }

  render() {
    let { engine_selector } = this.state
    let { engines } = this.props
    let c = this.getC()
    let engine = engines[engine_selector]
    let er = engine[c]
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${display_keys.length +
            stats.length}, 1fr)`,
          fontFamily: 'monospace',
          fontSize: '18px',
        }}
      >
        {[
          display_keys.map(k => (
            <div style={{ borderRight: 'solid 1px black', padding: '0 10px' }}>
              {k}
            </div>
          )),
          stats.map(k => {
            return (
              <div
                style={{ borderRight: 'solid 1px black', padding: '0 10px' }}
              >
                {k}
              </div>
            )
          }),
          display_keys.map(k => (
            <div
              style={{
                textAlign: 'right',
                borderRight: 'solid 1px black',
                padding: '0 10px',
              }}
            >
              {Math.round(er[k])}
            </div>
          )),
          stats.map(k => (
            <div style={{ borderRight: 'solid 1px black', padding: '0 10px' }}>
              {k === 'produced' ? c + this.state.produced : this.state[k]}
            </div>
          )),
        ]}
      </div>
    )
  }
}

export default Simulator
