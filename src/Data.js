import React, { Component } from 'react'

let prediction_keys = ['local_model', 'federated_model']

class Data extends Component {
  constructor(props) {
    super(props)
    this.state = {
      engines_loaded: false,
    }
    this.setDataState = this.setDataState.bind(this)
  }

  componentDidMount() {
    let request = async () => {
      let response = await fetch(`${process.env.PUBLIC_URL}/data/engines.json`)
      let json = await response.json()
      let reducer = (accumulator, current) => {
        if (accumulator[current.engine_no] !== undefined) {
          accumulator[current.engine_no].push(current)
        } else {
          accumulator[current.engine_no] = [current]
        }
        return accumulator
      }
      let engines = json.reduce(reducer, {})
      let engine_names = Object.keys(engines)
      let engine_keys = Object.keys(engines[engine_names[0]][0]).filter(
        key => !prediction_keys.includes(key)
      )
      this.setDataState({
        engines,
        engine_names,
        engine_keys,
        prediction_keys,
        engines_loaded: true,
      })
    }
    request()
  }

  setDataState(stateChanges, callback) {
    const newState = Object.assign({}, this.state, stateChanges)
    this.setState(newState, callback)
  }

  render() {
    return (
      <div className="Data">
        {React.Children.map(this.props.children, child => {
          return React.cloneElement(child, {
            ...this.state,
            setDataState: this.setDataState,
          })
        })}
      </div>
    )
  }
}

export default Data
