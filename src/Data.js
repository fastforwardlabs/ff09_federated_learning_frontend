import React, { Component } from 'react'
import { selected_features } from './Constants'
import * as _ from 'lodash'

let prediction_keys = ['local_model', 'federated_model']
let number_key = 'engine_no'

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
      let response = await fetch(`${process.env.PUBLIC_URL}/data/main2.json`)
      let json = await response.json()
      let reducer = (accumulator, current, index) => {
        if (index === 0) {
          accumulator.push([current])
        } else {
          let last_group = accumulator[accumulator.length - 1]
          let last_slice = last_group[last_group.length - 1]
          if (last_slice.engine_no === current.engine_no) {
            last_group.push(current)
          } else {
            accumulator.push([current])
          }
        }
        return accumulator
      }
      let keys = Object.keys(json[0])
      let key_columns = keys.map(k => json.map(r => r[k]))
      let ranges = key_columns.map(column =>
        column.reduce(
          (total, current) => {
            return [Math.min(total[0], current), Math.max(total[1], current)]
          },
          [column[0], column[0]]
        )
      )
      // special case ranges
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        if (['time', 'RUL_local', 'RUL_federated'].includes(key)) {
          ranges[i][0] = 0
          if (['RUL_local', 'RUL_federated'].includes(key)) {
            ranges[i][1] = Math.max(
              ranges[keys.indexOf('RUL_local')][1],
              ranges[keys.indexOf('RUL_federated')][1]
            )
          }
        }
      }
      let engines = json.reduce(reducer, [])
      this.setDataState({
        engines,
        keys,
        ranges,
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
