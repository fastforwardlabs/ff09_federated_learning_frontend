import React, { Component } from 'react'
import Factory from './Factory'
import {
  maitenanceCheck,
  strategies,
  strategy_names,
  factory_colors,
  makeName,
} from './Constants'
import ProfitGraph from './ProfitGraph'
import AverageGraph from './AverageGraph'
import { commas } from './Utilties'

function compare(a, b) {
  if (a[1] > b[1]) {
    return -1
  }
  if (a[1] < b[1]) {
    return 1
  }
  return 0
}

let averages_length = 400

class Competitors extends Component {
  constructor(props) {
    super(props)
    this.averages = [...Array(props.competitor_number)].map(n => [])
    this.comp_profits = [...Array(props.competitor_number)].map(n => [])
    this.histories = [...Array(props.competitor_number)].map(n => [
      [strategy_names[0], 0],
    ])
    this.strategies = [...Array(props.competitor_number)].map(
      n => strategy_names[0]
    )
    this.setCompProfits = this.setCompProfits.bind(this)
    this.setCompHistories = this.setCompHistories.bind(this)
    this.setStrategies = this.setStrategies.bind(this)
    this.factory_names = [...Array(props.competitor_number)].map(n =>
      makeName()
    )
  }

  setAverage(i, average) {
    let this_array = this.averages[i]
    if (this_array.length > averages_length - 1) {
      this_array.shift()
    }
    this_array.push(average)
  }

  setCompProfits(i, profit) {
    let this_array = this.comp_profits[i]
    if (this_array.length > averages_length - 1) {
      this_array.shift()
    }
    this_array.push(profit)
  }

  setCompHistories(i, entry) {
    let this_array = this.histories[i]
    this_array.push(entry)
  }

  setStrategies(i, strategy_name) {
    this.strategies[i] = strategy_name
  }

  render() {
    let for_ordering = [this.props.your_profits, ...this.comp_profits]
    let to_order = for_ordering.map((p, i) => [i, p[p.length - 1]])
    to_order.sort(compare)
    let ordered = {}
    for (let i = 0; i < to_order.length; i++) {
      ordered[to_order[i][0]] = i
    }

    let combined_profits = [this.props.your_profits, ...this.comp_profits]
    let combined = [this.props.your_average_profits, ...this.averages]
    let combined_histories = [this.props.your_history, ...this.histories]

    // average profit order
    // if (this.averages[0][0] !== undefined) {
    //   let to_order = this.averages.map((f, i) => [i, f[f.length - 1]])
    //   to_order.sort(compare)
    //   for (let i = 0; i < to_order.length; i++) {
    //     ordered[to_order[i][0]] = i
    //   }
    // }
    return (
      <div>
        <ProfitGraph
          averages={combined_profits}
          colors={factory_colors}
          histories={combined_histories}
          width={700}
          height={200}
          counter={this.props.counter}
        />
        {true ? null : (
          <AverageGraph
            averages={combined}
            colors={factory_colors}
            width={800}
            height={200}
          />
        )}
        <div style={{ marginBottom: 10 }}>Competitors</div>
        <div style={{ display: 'grid' }}>
          <div
            style={{
              border: 'solid 1px black',
              padding: 10,
              marginBottom: 10,
              order: ordered[0],
            }}
          >
            <div
              style={{
                background: factory_colors[0],
                color: '#fff',
                padding: 4,
              }}
            >
              Your Factory
            </div>
            <div>
              profit: $
              {this.props.your_profits.length > 0
                ? commas(
                    this.props.your_profits[this.props.your_profits.length - 1]
                  )
                : null}
            </div>
            <div>
              {this.props.your_history.map((entry, i) => (
                <span>
                  <span style={{ border: 'solid 1px black' }}>
                    {entry[0]},{' '}
                    {i === this.props.your_history.length - 1
                      ? this.props.counter - entry[1]
                      : this.props.your_history[i + 1][1]}{' '}
                    cycles
                  </span>
                </span>
              ))}
            </div>
            <div>maintained: {this.props.your_maintained}</div>
            <div>explosions: {this.props.your_explosions}</div>
          </div>
          {[...Array(this.props.competitor_number)].map((n, i) => (
            <Factory
              engine_number={4}
              name={this.factory_names[i]}
              index={i}
              engines={this.props.engines}
              keys={this.props.keys}
              ranges={this.props.ranges}
              counter={this.props.counter}
              strategy={this.strategies[i]}
              visible_engines={false}
              strategy={this.strategies[i]}
              setAverage={this.setAverage.bind(this)}
              setCompProfits={this.setCompProfits}
              order={ordered[i + 1]}
              color={factory_colors[i + 1]}
              setCompHistories={this.setCompHistories}
              setStrategies={this.setStrategies}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default Competitors
