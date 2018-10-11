import React, { Component } from 'react'
import { sum, last } from 'lodash'
import {
  strategy_names,
  mCheck,
  maintained_delay,
  exploded_delay,
  calculateProfit,
  repair_color,
  maintain_color,
  makeName,
  requirement_strings,
  factory_colors,
  profit_array_length,
} from './Constants'
import { commas, compare } from './Utilties'
import FlipMove from 'react-flip-move'
import Dials from './Dial2'
import LeaderGraph from './LeaderGraph'
import LatestEvent from './LatestEvent'

let small_font = '13px'
let smaller_font = '13px'
let larger_font = '18px'

let factory_number = 4
let engine_number = 4
let data_scientist_pause = 400
let federation_offer_pause = 400

let speed_bound = 10

class Paperclips extends Component {
  constructor(props) {
    super(props)
    this.state = {
      counter: 0,
      speed: 2,
      playing: true,
    }
    this.initialize.bind(this)
    this.initialize()
  }

  initialize() {
    let engine_length = this.props.engines.length
    this.factories = [...Array(factory_number)]
    // cycles, maintained, failed
    this.factories_state = this.factories.map(n => [0, 0, 0])
    this.factory_names = [
      'Your Factory',
      ...[...Array(factory_number - 1)].map(n => makeName()),
    ]
    this.factories_strategies = this.factories.map((n, i) => {
      return [[strategy_names[0], 0]]
    })
    this.simulation_limits = this.factories.map((n, i) => 3 - i)
    this.factory_upgrades = this.factories.map(n => [false, false])
    this.factory_engines_empty = [...Array(engine_number)]
    this.factory_profits = this.factories.map(n => [0])
    this.engine_lookup = this.factories.map((n, i) =>
      [...Array(engine_number)].map((n, j) => i * factory_number + j)
    )
    this.getNewEngine = () => Math.floor(Math.random() * engine_length)
    this.engines = [...Array(factory_number * engine_number)].map(n =>
      this.getNewEngine()
    )
    this.engine_strategies = this.engines.map(n => null)
    // offset, maintained, failed
    this.engine_state = this.engines.map(n => [0, 0, 0])
    this.engine_delays = this.engines.map(n => [0, 0])
    this.togglePlay = this.togglePlay.bind(this)
    this.reset = this.reset.bind(this)
    this.adjustSpeed.bind(this)
  }

  adjustSpeed(e) {
    this.setState({ speed: speed_bound + 1 - parseInt(e.target.value) }, () => {
      this.play()
    })
  }

  reset() {
    this.props.reset()
  }

  componentDidMount() {
    this.play()
  }
  play() {
    window.cancelAnimationFrame(this.animating)
    let count = 0
    let start = () => {
      if (count === this.state.speed) {
        this.setState({ counter: this.state.counter + 1 })
        count = 0
      }
      count++
      if (this.state.playing) {
        this.animating = window.requestAnimationFrame(start)
      }
    }
    this.animating = window.requestAnimationFrame(start)
  }

  togglePlay() {
    if (this.state.playing) {
      this.pause()
    } else {
      this.setState({ playing: true })
      this.play()
    }
  }

  pause() {
    this.setState({ playing: false })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.counter !== this.state.counter) {
      for (let fi = 0; fi < factory_number; fi++) {
        let factory_state = this.factories_state[fi]
        let factory_strategy = last(this.factories_strategies[fi])[0]
        let simulation_limit = this.simulation_limits[fi]
        let upgrades = this.factory_upgrades[fi]
        let last_switch = last(this.factories_strategies[fi])[1]

        // Simulate (you want to run after last render)
        if (factory_strategy === strategy_names[0] && simulation_limit > 0) {
          if (factory_state[2] >= 4) {
            this.factories_strategies[fi].push([
              strategy_names[1],
              this.state.counter,
            ])
          }
        } else if (
          factory_strategy === strategy_names[1] &&
          simulation_limit > 1
        ) {
          if (!upgrades[0]) {
            if (this.state.counter > data_scientist_pause + last_switch) {
              upgrades[0] = true
            }
          } else {
            this.factories_strategies[fi].push([
              strategy_names[2],
              this.state.counter,
            ])
          }
        } else if (
          factory_strategy === strategy_names[2] &&
          simulation_limit > 2
        ) {
          if (!upgrades[1]) {
            if (this.state.counter > federation_offer_pause + last_switch) {
              upgrades[1] = true
            }
          } else {
            this.factories_strategies[fi].push([
              strategy_names[3],
              this.state.counter,
            ])
          }
        }

        for (let ei = 0; ei < engine_number; ei++) {
          let engine_flat_i = fi * factory_number + ei
          let this_time =
            this.state.counter - this.engine_state[engine_flat_i][0]
          let next_time = this_time + 1
          let engine_id = this.engines[engine_flat_i]
          let engine = this.props.engines[engine_id]
          let engine_state = this.engine_state[engine_flat_i]
          let engine_delays = this.engine_delays[engine_flat_i]
          let rev = engine[next_time]
          let rendered_rev = engine[this_time]

          if (engine_delays[0] > 0) {
            // maintaining
            engine_state[0] += 1
            engine_delays[0] -= 1
            if (engine_delays[0] === 0) {
              engine_state[0] = this.state.counter
              this.engines[engine_flat_i] = this.getNewEngine()
            }
          } else if (engine_delays[1] > 0) {
            // repairing
            engine_state[0] += 1
            engine_delays[1] -= 1
            if (engine_delays[1] === 0) {
              engine_state[0] = this.state.counter
              this.engines[engine_flat_i] = this.getNewEngine()
            }
          } else {
            // engine strategy from factory strategy unless it is being maintaied/repaired
            this.engine_strategies[engine_flat_i] = factory_strategy

            if (mCheck(rendered_rev, this.engine_strategies[engine_flat_i])) {
              // maintained
              engine_delays[0] = maintained_delay
              engine_state[0] += 1
              // add maintained
              engine_state[1] += 1
              factory_state[1] += 1
            } else if (rev === undefined) {
              engine_delays[1] = exploded_delay
              engine_state[0] += 1
              // add failed
              engine_state[2] += 1
              factory_state[2] += 1
            } else {
              factory_state[0] += 1
            }
          }
        }
        let factory_profit = calculateProfit(factory_state)
        let profit_array = this.factory_profits[fi]
        if (profit_array.length > profit_array_length) {
          profit_array.shift()
        }
        profit_array.push(factory_profit)
      }
    }
  }

  render() {
    let profits = this.factory_profits.map((p, i) => [last(p), i])
    profits.sort(compare)

    let leaderboard = profits.map((n, sorted_i) => {
      let fi = profits[sorted_i][1]
      let factory_state = this.factories_state[fi]
      return (
        <div
          key={`factory_${fi}`}
          style={{ border: 'solid 1px black', marginBottom: 10 }}
        >
          <div
            style={{
              background: factory_colors[fi],
              color: 'white',
              padding: '5px 10px',
            }}
          >
            {this.factory_names[fi]}
          </div>
          <div style={{ padding: '5px 10px 10px' }}>
            <div style={{ fontSize: larger_font }}>
              ${commas(calculateProfit(factory_state))} profit
            </div>
            <div>{last(this.factories_strategies[fi])[0]}</div>
            {this.factory_engines_empty.map((n, ei) => {
              let engine_flat_i = fi * factory_number + ei
              let engine = this.props.engines[this.engines[engine_flat_i]]
              let engine_state = this.engine_state[engine_flat_i]
              let this_time =
                this.state.counter - this.engine_state[engine_flat_i][0]
              let rev = engine[this_time]
              let maintaining = this.engine_delays[engine_flat_i][0] > 0
              let repairing = this.engine_delays[engine_flat_i][1] > 0
            })}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                fontSize: smaller_font,
                textTransform: 'uppercase',
              }}
            >
              <div>total maintained: {factory_state[1]}</div>
              <div>total failed: {factory_state[2]}</div>
            </div>
          </div>
        </div>
      )
    })

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '42px 1fr',
        }}
      >
        <div
          style={{
            padding: 10,
            borderBottom: 'solid 1px black',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>Factory Simulator</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto auto 110px',
              gridColumnGap: 5,
              textAlign: 'right',
            }}
          >
            <div>
              <button onClick={this.reset} style={{ width: '60px' }}>
                reset
              </button>
            </div>
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto auto auto',
                  alignItems: 'center',
                  gridColumnGap: 5,
                  padding: '0 5px',
                }}
              >
                <div style={{ fontSize: '12px' }}>SPEED:</div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  onChange={this.adjustSpeed.bind(this)}
                  step={1}
                  value={speed_bound + 1 - this.state.speed}
                  style={{
                    width: '60px',
                  }}
                />
                <div style={{ fontSize: '12px' }}>
                  {speed_bound + 1 - this.state.speed}
                </div>
              </div>
            </div>
            <div>
              <button onClick={this.togglePlay} style={{ width: '60px' }}>
                {this.state.playing ? 'pause' : 'play'}
              </button>
            </div>
            <div>{commas(this.state.counter + 1)} cycles</div>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            padding: 10,
            gridColumnGap: 10,
            height: 'calc(100vh - 40px)',
            overflow: 'auto',
          }}
        >
          <div>
            {this.factories.slice(0, 1).map((n, fi) => {
              let factory_state = this.factories_state[fi]
              return (
                <div
                  key={`factory_${fi}`}
                  style={{
                    marginBottom: 20,
                    border: 'solid 1px black',
                  }}
                >
                  <div
                    style={{
                      background: factory_colors[fi],
                      color: 'white',
                      padding: '5px 10px',
                    }}
                  >
                    {this.factory_names[fi]}
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ marginBottom: 10, fontSize: larger_font }}>
                      ${commas(last(this.factory_profits[fi]))} profit
                    </div>
                    <div
                      style={{
                        marginBottom: 5,
                        fontSize: smaller_font,
                        textTransform: 'uppercase',
                      }}
                    >
                      TURBOFANS:
                    </div>
                    {this.factory_engines_empty.map((n, ei) => {
                      let engine_flat_i = fi * factory_number + ei
                      let engine = this.props.engines[
                        this.engines[engine_flat_i]
                      ]
                      let engine_state = this.engine_state[engine_flat_i]
                      let this_time =
                        this.state.counter - this.engine_state[engine_flat_i][0]
                      let rev = engine[this_time]
                      let maintaining = this.engine_delays[engine_flat_i][0] > 0
                      let repairing = this.engine_delays[engine_flat_i][1] > 0
                      let background = 'white'
                      if (maintaining) background = maintain_color
                      if (repairing) background = repair_color
                      return (
                        <div
                          key={`engine_${engine_flat_i}`}
                          style={{
                            marginBottom: 10,
                            border: 'solid 1px black',
                          }}
                        >
                          <div
                            style={{
                              fontSize: smaller_font,
                              background: background,
                              textTransform: 'uppercase',
                              padding: '5px 10px 5px',
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                            }}
                          >
                            <div>cycles: {rev.time}</div>
                            <div>
                              {maintaining
                                ? `maintaining: ${
                                    this.engine_delays[engine_flat_i][0]
                                  }`
                                : null}
                              {repairing
                                ? `repairing: ${
                                    this.engine_delays[engine_flat_i][1]
                                  }`
                                : null}
                            </div>
                          </div>
                          <div style={{ padding: '5px 10px 10px' }}>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 202px',
                                fontSize: smaller_font,
                                textTransform: 'uppercase',
                              }}
                            >
                              <div>sensors:</div>
                              <div>strategy:</div>
                            </div>
                            <div style={{ padding: '5px 0 5px' }}>
                              <Dials
                                counter={this.state.counter}
                                this_time={this_time}
                                keys={this.props.keys}
                                ranges={this.props.ranges}
                                engine={engine}
                                strategy={this.engine_strategies[engine_flat_i]}
                                width={660}
                                height={150}
                                maintaining={maintaining}
                                repairing={repairing}
                              />
                            </div>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                fontSize: smaller_font,
                                textTransform: 'uppercase',
                              }}
                            >
                              <div>maintained: {engine_state[1]}</div>
                              <div>failed: {engine_state[2]}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        fontSize: smaller_font,
                        textTransform: 'uppercase',
                      }}
                    >
                      <div>total maintained: {factory_state[1]}</div>
                      <div>total failed: {factory_state[2]}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div>
            <div style={{ marginBottom: 10 }}>Your strategy</div>
            <div
              style={{
                marginBottom: 10,
                borderTop: 'solid 1px black',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}
            >
              {strategy_names.map((n, i) => {
                let checked = n === last(this.factories_strategies[0])[0]
                let available = true
                let requirement_info
                let borderRounding = {}
                if (i === 1) {
                  available = this.factories_state[0][2] >= 4
                  requirement_info = ': ' + this.factories_state[0][2] + '/4'
                } else if (i === 2) {
                  available = this.factory_upgrades[0][0]
                  requirement_info = ': none available yet'
                } else if (i === 3) {
                  available = this.factory_upgrades[0][1]
                  requirement_info = ': no offer yet'
                  borderRounding = {
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                  }
                } else {
                  borderRounding = {
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }
                }
                let requirement_string = requirement_strings[i]
                return (
                  <div
                    style={{
                      background: available ? 'white' : '#ddd',
                      border: 'solid 1px black',
                      borderTop: 'none',
                      padding: '2px',
                      ...borderRounding,
                    }}
                  >
                    {requirement_string !== null ? (
                      <div
                        style={{ fontSize: small_font, padding: '3px 5px 0px' }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            textTransform: 'uppercase',
                          }}
                        >
                          requirement
                        </span>{' '}
                        {available ? '✓' : '☐'} {requirement_string}
                        {available ? null : requirement_info}
                      </div>
                    ) : null}
                    <div style={{ padding: '2px 5px 5px' }}>
                      <input
                        type="radio"
                        checked={checked}
                        disabled={!available}
                        style={{ position: 'relative', top: '-1px' }}
                      />{' '}
                      <span style={{ fontWeight: checked ? 700 : 400 }}>
                        {n}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div>
              <div style={{ marginBottom: 10 }}>Leaderboard</div>
              <div style={{ marginBottom: 10 }}>
                <LeaderGraph
                  width={this.props.ww / 2 - 20}
                  height={200}
                  counter={this.state.counter}
                  factory_profits={this.factory_profits}
                  factories_strategies={this.factories_strategies}
                />
              </div>
              <LatestEvent
                factories_strategies={this.factories_strategies}
                factory_names={this.factory_names}
                counter={this.state.counter}
              />

              <FlipMove
                duration={250}
                enterAnimation={false}
                leaveAnimation={false}
              >
                {leaderboard}
              </FlipMove>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Paperclips
