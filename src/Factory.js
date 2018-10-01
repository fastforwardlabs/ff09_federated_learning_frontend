import React, { Component } from 'react'
import Engine from './Engine'
import {
  cycle_profit,
  maitained_penalty,
  exploded_penalty,
  maintained_delay,
  exploded_delay,
} from './Constants'
import StrategyChooser from './StrategyChoooser'
import { maitenanceCheck, strategies, strategy_names } from './Constants'
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
    this.offset = this.props.counter
    this.strategy = this.props.strategy
    this.addCycles = this.addCycles.bind(this)
    this.addMaintained = this.addMaintained.bind(this)
    this.addExploded = this.addExploded.bind(this)
    this.setStrategy = this.setStrategy.bind(this)
  }

  addCycles() {
    this.cycles = this.cycles + 1
  }

  addMaintained() {
    this.maintained = this.maintained + 1
  }

  addExploded(this_time) {
    if (!this.failure_mean) {
      this.failure_mean = this_time
    } else {
      this.failure_mean =
        (this.failure_mean * this.exploded + this_time) / (this.exploded + 1)
    }
    this.exploded = this.exploded + 1
  }

  componentDidUpdate(prevProps) {
    if (prevProps.counter !== this.props.counter) {
      let this_time = this.props.counter - this.offset
      this.profit =
        this.cycles * this.props.engine_number -
        this.maintained * maitained_penalty -
        this.exploded * exploded_penalty
      this.average_profit =
        this.profit / Math.max(this_time, 1) / this.props.engine_number
      if (this.props.setAverage !== undefined) {
        this.props.setAverage(this.props.index, this.average_profit)
      }
    }
  }

  setStrategy(strategy_name) {
    this.strategy = strategy_name
  }

  render() {
    let profit_display = commas(this.profit)
    let this_time = this.props.counter - this.offset
    let average_profit_display = commas(roundTwo(this.average_profit))
    return (
      <div
        style={{
          order: this.props.order !== undefined ? this.props.order : 0,
          background: this.props.color || 'transparent',
          marginBottom: 10,
        }}
      >
        {this.props.visible_engines ? (
          <div
            style={{
              border: 'solid 1px black',
              padding: '10px',
            }}
          >
            <div>factory</div>
            <StrategyChooser
              setStrategy={this.setStrategy}
              strategy={this.strategy}
              exploded={this.exploded}
              maintained={this.maintained}
              failure_mean={this.failure_mean}
            />
            <div
              style={{
                border: 'dotted 1px black',
                padding: 5,
                fontSize: '14px',
              }}
            >
              <div>Profit formula</div>
              <div>Profit per engine per cycle: ${cycle_profit}</div>
              <div>Per engine maintenance cost: ${maitained_penalty}</div>
              <div>Maintenance delay: {formatTime(maintained_delay)}</div>
              <div>Per engine explosion repair cost: ${exploded_penalty}</div>
              <div>Exploded delay: {formatTime(exploded_delay)}</div>
            </div>
            <div>profit: ${profit_display}</div>
            <div>average profit per engine: ${average_profit_display}</div>
            <div>cycles: {this.cycles}</div>
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
                strategy={this.strategy}
                ww={this.props.ww}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              border: 'solid 1px black',
              padding: '10px',
            }}
          >
            {this.props.name ? <div>{this.props.name}</div> : null}
            <div>profit: ${profit_display}</div>
            <div>average profit per engine: ${average_profit_display}</div>
            <div>strategy: {this.props.strategy}</div>
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
