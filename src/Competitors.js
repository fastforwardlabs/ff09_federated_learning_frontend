import React, { Component } from 'react'
import Factory from './Factory'
import {
  maitenanceCheck,
  strategies,
  strategy_names,
  factory_colors,
  makeName,
  maintain_color,
  repair_color,
} from './Constants'
import ProfitGraph from './ProfitGraph'
import AverageGraph from './AverageGraph'
import { commas } from './Utilties'
import LastStrategies from './LastStrategies'
import FlipMove from 'react-flip-move'
import { max } from 'lodash'

function compare(a, b) {
  if (a[0] > b[0]) {
    return -1
  }
  if (a[0] < b[0]) {
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
    // this.histories = [...Array(props.competitor_number)].map((n, i) => [
    //   [strategy_names[i], 0],
    // ])
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
    this.grid = null
  }

  setAverage(i, average) {
    let this_array = this.averages[i]
    if (this_array.length > averages_length - 1) {
      this_array.shift()
    }
    this_array.push(average)
    if (this.grid) this.grid.forceGridAnimation()
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

    let last_entries = combined_histories.map(h => h[h.length - 1][1])
    let last_max = max(last_entries)
    let last_index = last_entries.indexOf(last_max)
    let last_group = combined_histories[last_index]
    let last = last_group[last_group.length - 1]
    let last_name = ['Your Factory', ...this.factory_names][last_index]
    let last_color = factory_colors[last_index]

    let factories = null
    let ordered_factories = null
    if (combined_profits[0][0] !== undefined) {
      factories = [
        [
          combined_profits[0][combined_profits[0].length - 1],
          <div
            style={{
              border: 'solid 1px black',
              background: 'white',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                background: factory_colors[0],
                color: '#fff',
                padding: '5px 10px',
              }}
            >
              Your Factory
            </div>

            <div style={{ padding: '5px 10px 0', fontSize: '18px' }}>
              {this.props.your_profits.length > 0
                ? '$' +
                  commas(
                    this.props.your_profits[this.props.your_profits.length - 1]
                  ) +
                  ' profit'
                : null}
            </div>
            <div style={{ padding: '5px 10px 5px' }}>
              <div style={{ fontSize: '12px', paddingBottom: '2px' }}>
                STRATEGY HISTORY:
              </div>
              <LastStrategies
                history={this.props.your_history}
                counter={this.props.counter}
                color={factory_colors[0]}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  padding: '5px 10px',
                  background: this.props.your_maintain_status
                    ? maintain_color
                    : 'white',
                }}
              >
                TOTAL MAINTAINED: {this.props.your_maintained}
              </div>
              <div
                style={{
                  padding: '5px 10px',
                  background: this.props.your_explode_status
                    ? repair_color
                    : 'white',
                }}
              >
                TOTAL FAILED: {this.props.your_explosions}
              </div>
            </div>
          </div>,
        ],
        ...[...Array(this.props.competitor_number)].map((n, i) => [
          combined_profits[i + 1][combined_profits[i + 1].length - 1],
          <div key={this.factory_names[i]}>
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
              setAverage={this.setAverage.bind(this)}
              setCompProfits={this.setCompProfits}
              order={ordered[i + 1]}
              color={factory_colors[i + 1]}
              setCompHistories={this.setCompHistories}
              setStrategies={this.setStrategies}
              autoUpgrade={false}
            />
          </div>,
        ]),
      ]
    }

    if (factories) {
      let sorted = factories.sort(compare)
      ordered_factories = sorted.map(f => f[1])
    }

    return (
      <div style={{ padding: '10px 10px 0', border: 'solid 1px black' }}>
        <div style={{ padding: '0 0 10px' }}>Leaderboard</div>
        <div style={{ paddingBottom: 10 }}>
          <ProfitGraph
            averages={combined_profits}
            colors={factory_colors}
            histories={combined_histories}
            strategies={[this.props.your_strategy, ...this.strategies]}
            width={700}
            height={200}
            counter={this.props.counter}
          />
        </div>
        <div style={{ marginBottom: 10, fontSize: '14px' }}>
          <span style={{ fontSize: '12px' }}>LATEST EVENT: </span>
          {last[1] === 0 ? (
            <span>Simulation started {this.props.counter} cycles ago.</span>
          ) : (
            <span style={{}}>
              <span
                style={{
                  background: last_color,
                  color: 'white',
                  padding: '0 2px',
                }}
              >
                {last_name}
              </span>{' '}
              changed strategy to <strong>{last[0]}</strong>{' '}
              {commas(this.props.counter - last[1])} cycles ago.
            </span>
          )}
        </div>
        <FlipMove duration={250} enterAnimation={false} leaveAnimation={false}>
          {ordered_factories}
        </FlipMove>
      </div>
    )
  }
}

export default Competitors
