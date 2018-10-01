import React from 'react'
import * as _ from 'lodash'

class Turbines extends React.Component {
  constructor(props) {
    super(props)
    this.advanceLoop = this.advanceLoop.bind(this)
    this.rogue_state = { turbine_state: [...Array(5)] }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.counter !== prevProps.counter) {
      this.tick()
    }
  }

  advanceLoop(state_string, repair_condition, replace_condition) {
    let new_turbine_state = this.rogue_state[state_string].map((ts, i) => {
      if (ts === undefined) {
        ts = {
          start: this.props.counter,
          repaired: 0,
          replaced: 0,
          pointer: 0,
        }
      } else {
        ts.pointer = ts.pointer + 1
      }
      let end_of_loop = this.props.loops[i].length - 1
      if (ts.pointer > end_of_loop) {
        ts.pointer = ts.pointer % end_of_loop
        console.log('moduloed', ts.pointer)
      }
      let state = this.props.loops[i][ts.pointer]
      if (this.props.repair_condition(state)) {
        ts.repaired = ts.repaired + 1
        ts.pointer = ts.pointer + state.RUL + 1
      }
      if (state.RUL === 0) {
        ts.replaced = ts.replaced + 1
      }
      return ts
    })
    this.rogue_state[state_string] = new_turbine_state
    window.rogue_state = {}
    window.rogue_state[state_string] = new_turbine_state
  }

  advanceLoops() {
    this.advanceLoop('turbine_state')
  }

  tick() {
    this.advanceLoops()
  }

  render() {
    let { repairs, replacements } = this.rogue_state.turbine_state.reduce(
      (total, t) => {
        if (t) {
          return {
            repairs: total.repairs + t.repaired,
            replacements: total.replacements + t.replaced,
          }
        } else {
          return total
        }
      },
      {
        repairs: 0,
        replacements: 0,
      }
    )
    return (
      <div>
        {this.rogue_state.turbine_state.map((t, i) => {
          return (
            <div>
              {this.rogue_state.turbine_state[0] &&
              this.rogue_state.turbine_state[0].start !== undefined ? (
                <div
                  style={{
                    borderBottom: 'solid 1px black',
                    borderRight: 'solid 1px black',
                  }}
                >
                  <div>Turbine {i + 1}</div>
                  <div>repaired: {t.repaired}</div>
                  <div>replaced: {t.replaced}</div>
                </div>
              ) : null}
            </div>
          )
        })}
        <div>repairs: {repairs}</div>
        <div>replacements: {replacements}</div>
      </div>
    )
  }
}

export default Turbines
