import React, { Component } from 'react'
import Engine from './Engine'
import {
  cycle_profit,
  maitained_penalty,
  exploded_penalty,
  maintained_delay,
  exploded_delay,
  data_scientist_cost,
  strategy_names,
  factory_colors,
} from './Constants'
import StrategyChooser from './StrategyChoooser'
import { formatTime, roundTwo, commas } from './Utilties'
import { mean } from 'lodash'

class Factory extends Component {
  constructor(props) {
    super(props)
    this.cycles = 0
    this.maintained = 0
    this.exploded = 0
    this.profit = 0
    this.average_profit = 0
    this.failure_mean = null
    this.data_scientist = false
    this.offset = this.props.counter
    this.addCycles = this.addCycles.bind(this)
    this.addMaintained = this.addMaintained.bind(this)
    this.addExploded = this.addExploded.bind(this)
    this.setStrategy = this.setStrategy.bind(this)
    this.hireDataScientist = this.hireDataScientist.bind(this)
    this.history = [[strategy_names[0], 0]]
  }

  addCycles() {
    this.cycles = this.cycles + 1
  }

  addMaintained() {
    this.maintained = this.maintained + 1
    if (this.props.setYourMaintained !== undefined) {
      this.props.setYourMaintained()
    }
  }

  addExploded(this_time) {
    if (!this.failure_mean) {
      this.failure_mean = this_time
    } else {
      this.failure_mean =
        (this.failure_mean * this.exploded + this_time) / (this.exploded + 1)
    }
    this.exploded = this.exploded + 1
    if (this.props.setYourExplosions !== undefined) {
      this.props.setYourExplosions()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.counter !== this.props.counter) {
      let this_time = this.props.counter - this.offset
      let ds_cost = this.data_scientist ? data_scientist_cost : 0
      this.profit =
        this.cycles * this.props.engine_number * cycle_profit -
        this.maintained * maitained_penalty -
        this.exploded * exploded_penalty -
        ds_cost
      this.average_profit =
        this.profit / Math.max(this_time, 1) / this.props.engine_number
      if (this.props.setAverage !== undefined) {
        this.props.setAverage(this.props.index, this.average_profit)
      }
      if (this.props.setYourProfit !== undefined) {
        this.props.setYourProfit(this.profit)
      }
      if (this.props.setYourAverageProfit !== undefined) {
        this.props.setYourAverageProfit(this.average_profit)
      }
      if (this.props.setCompProfits !== undefined) {
        this.props.setCompProfits(this.props.index, this.profit)
      }
      // Simulated
      let last_switch = this.history[this.history.length - 1][1]
      if (this.props.simulate) {
        if (this.exploded >= 4 && this.props.strategy === strategy_names[0]) {
          this.setStrategy(strategy_names[1])
        }
        if (this.props.strategy === strategy_names[1]) {
          if (this.props.counter > last_switch + 100) {
            if (!this.data_scientist && this.profit > ds_cost) {
              this.hireDataScientist()
            }
          }
        }
        if (this.data_scientist && this.props.strategy === strategy_names[1]) {
          if (this.props.counter > last_switch + 100) {
            this.setStrategy(strategy_names[2])
          }
        }
        if (this.props.strategy === strategy_names[2]) {
          if (this.props.counter > last_switch + 100) {
            this.setStrategy(strategy_names[3])
          }
        }
      }
      if (!this.props.visible_engines) {
        if (this.props.index !== 0) {
          if (this.exploded >= 4 && this.props.strategy === strategy_names[0]) {
            this.setStrategy(strategy_names[1])
          }
          if (this.props.index !== 1) {
            if (this.props.strategy === strategy_names[1]) {
              if (this.props.counter > last_switch + 100) {
                if (!this.data_scientist && this.profit > ds_cost) {
                  this.hireDataScientist()
                }
              }
            }
            if (
              this.props.strategy === strategy_names[1] &&
              this.data_scientist
            ) {
              if (this.props.counter > last_switch + 100) {
                this.setStrategy(strategy_names[2])
              }
            }
          }
        }
      }
    }
  }

  setStrategy(strategy_name) {
    this.history.push([strategy_name, this.props.counter])
    if (this.props.setYourStrategy !== undefined) {
      this.props.setYourStrategy(strategy_name)
    }
    if (this.props.setStrategies !== undefined) {
      this.props.setStrategies(this.props.index, strategy_name)
    }
    if (this.props.setYourHistory !== undefined) {
      this.props.setYourHistory([strategy_name, this.props.counter - 1])
    }
    if (this.props.setCompHistories !== undefined) {
      this.props.setCompHistories(this.props.index, [
        strategy_name,
        this.props.counter - 1,
      ])
    }
  }

  hireDataScientist() {
    this.data_scientist = true
    let kinda_strategy = 'hired data scientist'
    this.history.push([kinda_strategy, this.props.counter])
    if (this.props.setYourHistory !== undefined) {
      this.props.setYourHistory([kinda_strategy, this.props.counter - 1])
    }
    if (this.props.setCompHistories !== undefined) {
      this.props.setCompHistories(this.props.index, [
        kinda_strategy,
        this.props.counter - 1,
      ])
    }
    if (this.props.hireYourDataScientist !== undefined) {
      this.props.hireYourDataScientist()
    }
  }

  render() {
    let profit_display = commas(this.profit)
    let this_time = this.props.counter - this.offset
    let average_profit_display = commas(roundTwo(this.average_profit))
    return (
      <div
        style={{
          order: this.props.order !== undefined ? this.props.order : 0,
          marginBottom: 10,
        }}
      >
        {this.props.visible_engines ? (
          <div
            style={{
              border: 'solid 1px black',
              padding: '10px',
              background: factory_colors[0],
              color: '#fff',
            }}
          >
            <div style={{}}>Your Factory</div>
            <div />
            <div
              style={{
                border: 'dotted 1px black',
                padding: 5,
                fontSize: '14px',
                display: 'none',
              }}
            >
              <div>Profit formula</div>
              <div>Profit per engine per cycle: ${cycle_profit}</div>
              <div>Per engine maintenance cost: ${maitained_penalty}</div>
              <div>Maintenance delay: {formatTime(maintained_delay)}</div>
              <div>Per engine explosion repair cost: ${exploded_penalty}</div>
              <div>Exploded delay: {formatTime(exploded_delay)}</div>
              <div>Data scientist cost: ${commas(data_scientist_cost)}</div>
            </div>
            <div>profit: ${profit_display}</div>
            {/* <div>average profit per engine: ${average_profit_display}</div> */}
            <div>maintained: {this.maintained}</div>
            <div>exploded: {this.exploded}</div>
            {[...Array(this.props.engine_number)].map((n, i) => (
              <Engine
                key={i}
                engines={this.props.engines}
                keys={this.props.keys}
                counter={this.props.counter}
                addCycles={this.addCycles}
                addMaintained={this.addMaintained}
                addExploded={this.addExploded}
                failure_mean={this.failure_mean}
                ranges={this.props.ranges}
                visible_engines={this.props.visible_engines}
                strategy={this.props.strategy}
                ww={this.props.ww}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              border: 'solid 1px black',
              padding: '10px',
              background: this.props.color || 'transparent',
              color: '#fff',
            }}
          >
            {this.props.name ? <div>{this.props.name}</div> : null}
            <div>profit: ${profit_display}</div>
            {/* <div>average profit per engine: ${average_profit_display}</div> */}
            <div>strategy: {this.props.strategy}</div>
            <div>
              {this.history.map((entry, i) => (
                <span>
                  <span style={{ border: 'solid 1px black' }}>
                    {entry[0]},{' '}
                    {i === this.history.length - 1
                      ? this.props.counter - entry[1]
                      : this.history[i + 1][1]}{' '}
                    cycles
                  </span>
                </span>
              ))}
            </div>
            <div>maintained: {this.maintained}</div>
            <div>exploded: {this.exploded}</div>
            <div>
              {[...Array(this.props.engine_number)].map((n, i) => (
                <Engine
                  key={i}
                  engines={this.props.engines}
                  keys={this.props.keys}
                  counter={this.props.counter}
                  addCycles={this.addCycles}
                  addMaintained={this.addMaintained}
                  addExploded={this.addExploded}
                  visible_engines={this.props.visible_engines}
                  strategy={this.props.strategy}
                  failure_mean={this.failure_mean}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default Factory
