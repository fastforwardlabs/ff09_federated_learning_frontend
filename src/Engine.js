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
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let { engines, keys, counter, strategy } = this.props
    let { offset, engine } = this.fake_state
    let this_time = counter - offset
    let next_rev = engine[this_time + 1]
    if (this.fake_state.maintained_delay_count > 0) {
      this.fake_state.offset = counter + 1
      this.fake_state.maintained_delay_count =
        this.fake_state.maintained_delay_count - 1
    } else if (this.fake_state.exploded_delay_count > 0) {
      this.fake_state.offset = counter + 1
      this.fake_state.exploded_delay_count =
        this.fake_state.exploded_delay_count - 1
    } else {
      this.props.addCycles()
      if (
        next_rev &&
        maitenanceCheck(next_rev, this.props.strategy, this.props.failure_mean)
      ) {
        this.fake_state.engine = sample(this.props.engines)
        this.fake_state.offset = counter + 1
        this.fake_state.maintained = this.fake_state.maintained + 1
        this.fake_state.maintained_delay_count = maintained_delay
        this.props.addMaintained()
      } else if (next_rev === undefined) {
        this.fake_state.engine = sample(this.props.engines)
        this.fake_state.offset = counter + 1
        this.fake_state.exploded = this.fake_state.exploded + 1
        this.fake_state.exploded_delay_count = exploded_delay
        this.props.addExploded(this_time)
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
      if (this.fake_state.maintained_delay_count > 0) {
        background = 'orange'
      } else if (this.fake_state.exploded_delay_count > 0) {
        background = 'red'
      }
      return (
        <div>
          <div
            style={{
              padding: 10,
              color: 'black',
              border: 'solid 1px black',
              marginBottom: 10,
              background: background,
            }}
          >
            {this.fake_state.maintained_delay_count > 0 ? (
              <div>Maintaining {this.fake_state.maintained_delay_count}</div>
            ) : null}
            {this.fake_state.exploded_delay_count > 0 ? (
              <div>Repairing {this.fake_state.exploded_delay_count}</div>
            ) : null}

            {this.fake_state.maintained_delay_count > 0 ||
            this.fake_state.exploded_delay_count > 0 ? null : (
              <div>{rev.time} cycles</div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridColumnGap: 10,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 40px)',
                  gridColumnGap: 10,
                  gridRowGap: 10,
                  padding: '10px 0',
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
              <PredictGraph
                counter={this.props.counter}
                width={200}
                height={68 * 2 - 14 * 2 + 10}
                this_time={this_time}
                engine={this.fake_state.engine}
                strategy={this.props.strategy}
                ranges={this.props.ranges}
                keys={this.props.keys}
                failure_mean={this.props.failure_mean}
              />
            </div>
            <div>maintained {maintained}</div>
            <div>exploded {exploded}</div>
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}

export default Engine
