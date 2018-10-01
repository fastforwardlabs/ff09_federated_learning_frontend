import React, { Component } from 'react'
import Factory from './Factory'
import {
  maitenanceCheck,
  strategies,
  strategy_names,
  factory_colors,
  makeName,
} from './Constants'
import AverageGraph from './AverageGraph'

function compare(a, b) {
  if (a[1] > b[1]) {
    return -1
  }
  if (a[1] < b[1]) {
    return 1
  }
  return 0
}

class Competitors extends Component {
  constructor(props) {
    super(props)
    this.averages = [...Array(props.competitor_number)].map(n => [])
    this.factory_names = [...Array(props.competitor_number)].map(n =>
      makeName()
    )
  }

  setAverage(i, average) {
    let this_array = this.averages[i]
    if (this_array.length > 200 - 1) {
      this_array.shift()
    }
    this_array.push(average)
  }

  render() {
    let ordered = { 0: 0, 1: 1, 2: 2, 3: 3 }
    if (this.averages[0][0] !== undefined) {
      let to_order = this.averages.map((f, i) => [i, f[f.length - 1]])
      to_order.sort(compare)
      for (let i = 0; i < to_order.length; i++) {
        ordered[to_order[i][0]] = i
      }
    }
    return (
      <div>
        <AverageGraph
          averages={this.averages}
          colors={factory_colors}
          width={400}
          height={100}
        />
        <div>Competitors</div>
        <div style={{ display: 'grid' }}>
          {[...Array(this.props.competitor_number)].map((n, i) => (
            <Factory
              engine_number={4}
              name={this.factory_names[i]}
              index={i}
              engines={this.props.engines}
              keys={this.props.keys}
              ranges={this.props.ranges}
              counter={this.props.counter}
              visible_engines={false}
              strategy={strategy_names[0]}
              setAverage={this.setAverage.bind(this)}
              order={ordered[i]}
              color={factory_colors[i]}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default Competitors
