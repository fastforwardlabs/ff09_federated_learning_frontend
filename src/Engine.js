import React, { Component } from 'react'
import { sample } from 'lodash'
import { formatTime } from './Utilties'
import PredictGraph from './PredictGraph'
import {
  maitenanceCheck,
  strategies,
  strategy_names,
  maintained_delay,
  exploded_delay,
  selected_features,
  factory_colors,
  repair_color,
  maintain_color,
} from './Constants'
import Dial from './Dial'

class Engine extends Component {
  constructor(props) {
    super(props)
    this.fake_state = {
      maintained: 0,
      exploded: 0,
      offset: 0,
      engine: sample(props.engines),
      start: 0,
      maintained_delay_count: 0,
      exploded_delay_count: 0,
      maintain_status: false,
      explode_status: false,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let { engines, keys, counter, strategy } = this.props
    let { offset, engine } = this.fake_state
    let this_time = counter - offset
    let next_rev = engine[this_time + 1]
    this.props.setMaintainStatus(this.props.index, false)
    this.props.setExplodeStatus(this.props.index, false)
    this.fake_state.maintain_status = false
    this.fake_state.explode_status = false
    if (this.fake_state.maintained_delay_count > 0) {
      this.fake_state.offset = this.fake_state.offset + 1
      if (this.fake_state.maintained_delay_count === 1) {
        this.fake_state.offset = this.props.counter + 1
        this.fake_state.engine = sample(this.props.engines)
      }
      this.fake_state.maintained_delay_count =
        this.fake_state.maintained_delay_count - 1
    } else if (this.fake_state.exploded_delay_count > 0) {
      this.fake_state.offset = this.fake_state.offset + 1
      if (this.fake_state.exploded_delay_count === 1) {
        this.fake_state.offset = this.props.counter + 1
        this.fake_state.engine = sample(this.props.engines)
      }
      this.fake_state.exploded_delay_count =
        this.fake_state.exploded_delay_count - 1
    } else {
      this.props.addCycles()
      if (
        next_rev &&
        maitenanceCheck(next_rev, this.props.strategy, this.props.failure_mean)
      ) {
        this.fake_state.offset = this.fake_state.offset + 1
        this.fake_state.maintained = this.fake_state.maintained + 1
        this.fake_state.maintained_delay_count = maintained_delay
        this.props.setMaintainStatus(this.props.index, true)
        this.props.addMaintained()
        this.fake_state.maintain_status = true
      } else if (next_rev === undefined) {
        this.fake_state.offset = this.fake_state.offset + 1
        this.fake_state.exploded = this.fake_state.exploded + 1
        this.fake_state.exploded_delay_count = exploded_delay
        this.props.setExplodeStatus(this.props.index, true)
        this.props.addExploded(this_time)
        this.fake_state.explode_status = true
      }
    }
  }

  render() {
    if (this.props.visible_engines) {
      let { engines, keys, counter } = this.props
      let { offset, engine, maintained, exploded } = this.fake_state
      let this_time = counter - offset
      let rev = engine[this_time]
      let background = 'white'
      let maintaining = this.fake_state.maintained_delay_count > 0
      let repairing = this.fake_state.exploded_delay_count > 0
      let status_color = 'white'
      let text_color = 'black '
      if (maintaining) {
        status_color = maintain_color
      }
      if (repairing) {
        status_color = repair_color
      }
      return (
        <div>
          <div
            style={{
              color: 'black',
              border: 'solid 1px black',
              marginBottom: 10,
              fontSize: '12px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: status_color,
                color: text_color,
              }}
            >
              <div
                style={{
                  padding: '5px 10px 5px',
                }}
              >
                TURBOFAN {this.props.index + 1}
              </div>
              {!maintaining && !repairing ? (
                <div style={{ padding: '5px 10px 5px' }}>
                  CYCLES: {rev.time}
                </div>
              ) : null}
              {maintaining ? (
                <div
                  style={{
                    padding: '5px 10px 5px',
                  }}
                >
                  MAINTAINING: {this.fake_state.maintained_delay_count}
                </div>
              ) : null}
              {repairing ? (
                <div
                  style={{
                    padding: '5px 10px 5px',
                  }}
                >
                  REPAIRING: {this.fake_state.exploded_delay_count}
                </div>
              ) : null}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                paddingBottom: '5px',
                gridColumnGap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: '12px', padding: '5px 10px 5px' }}>
                  SENSORS
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 40px)',
                    gridColumnGap: 10,
                    gridRowGap: 10,
                    padding: '0 10px',
                  }}
                >
                  <Dial
                    width={40}
                    height={40}
                    this_time={this_time}
                    engine={this.fake_state.engine}
                    strategy={this.props.strategy}
                    ranges={this.props.ranges}
                    keys={this.props.keys}
                    counter={this.props.counter}
                  />
                </div>
              </div>
              <div style={{ paddingRight: 10 }}>
                <div style={{ fontSize: '12px', padding: '5px 0 0' }}>
                  STRATEGY
                </div>
                <div
                  style={{
                    padding: '3px 0 4px',
                    maxWidth: 200 + 10 + 2 + 2,
                    // border: `solid 1px ${factory_colors[0]}`,
                    // background: factory_colors[0],
                  }}
                >
                  <PredictGraph
                    counter={this.props.counter}
                    width={200}
                    height={128 - 10 - 9}
                    this_time={this_time}
                    engine={this.fake_state.engine}
                    strategy={this.props.strategy}
                    ranges={this.props.ranges}
                    keys={this.props.keys}
                    failure_mean={this.props.failure_mean}
                    background={
                      repairing
                        ? repair_color
                        : maintaining
                          ? maintain_color
                          : 'white'
                    }
                  />
                </div>
              </div>
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
                }}
              >
                MAINTAINED: {maintained}
              </div>
              <div
                style={{
                  padding: '5px 10px',
                }}
              >
                FAILED: {exploded}
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}

export default Engine
