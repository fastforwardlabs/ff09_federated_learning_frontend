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
      modal: false,
    }
    this.initialize.bind(this)
    this.initialize()
    this.last_render = null
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
    this.play = this.play.bind(this)
    this.reset = this.reset.bind(this)
    this.ff = this.ff.bind(this)
    this.ffing = false
    this.auto_upgrade = false
    this.tutorial_mode = true
    this.adjustSpeed.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.openUpgrade = this.openUpgrade.bind(this)
    this.yesUpgrade = this.yesUpgrade.bind(this)
    this.requirements = [...Array(factory_number)].map(n => [null, null, null])
    this.round_delays = [...Array(factory_number)].map(n => null)
  }

  openModal() {
    this.setState({ modal: true, playing: false })
  }

  closeModal() {
    this.setState({ modal: false, playing: true })
    this.play()
  }

  openUpgrade() {
    this.openModal()
  }

  yesUpgrade() {
    let upgrade_index = 0
    for (let i = 0; i < this.requirements[0].length; i++) {
      if (this.requirements[0][i] !== null) upgrade_index = i + 1
    }
    this.factories_strategies[0].push([
      strategy_names[upgrade_index],
      this.state.counter,
    ])
    this.closeModal()
  }

  setYourStrategy(strat, available) {
    if (available === undefined || available === true) {
      if (strat !== last(this.factories_strategies[0])[0]) {
        this.auto_upgrade = false
        this.factories_strategies[0].push([strat, this.state.counter])
      }
    }
  }

  adjustSpeed(e) {
    this.setState({ speed: speed_bound + 1 - parseInt(e.target.value) }, () => {
      this.play()
    })
  }

  ff() {
    this.ffing = true
    let restart = false
    if (this.state.playing === true) {
      restart = true
      this.pause()
    }
    let jump = 1000
    let me = this
    let playCallback = () => {
      setTimeout(() => {
        this.ffing = false
        if (restart) {
          me.setState({ playing: true })
          me.play()
        }
      }, 0)
    }
    for (let i = 0; i < jump; i++) {
      if (i === jump - 1) {
        setTimeout(() => {
          this.setState(function(state, props) {
            return {
              counter: state.counter + 1,
            }
          }, playCallback)
        }, 0)
      } else {
        setTimeout(() => {
          this.setState(function(state, props) {
            return {
              counter: state.counter + 1,
            }
          })
        }, 0)
      }
    }
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

        let your_factory = fi === 0
        let auto_upgrade =
          !your_factory || (your_factory && this.auto_upgrade === true)
        let tutorial_mode = your_factory && this.tutorial_mode

        let requirements = this.requirements[fi]
        let round_delay = this.round_delays[fi]

        if (requirements[0] === null) {
          if (factory_state[2] >= 4) {
            console.log('what the hell')
            console.log(this.round_delays[fi])
            if (round_delay === null) {
              this.round_delays[fi] = this.state.counter + 1
            }
            if (round_delay === this.state.counter) {
              console.log('matches')
              this.requirements[fi][0] = this.state.counter
              if (tutorial_mode) {
                console.log('open it')
                setTimeout(() => {
                  this.openUpgrade(strategy_names[1])
                }, 0)
              }
            }
          }
        } else {
          if (requirements[1] === null) {
            if (
              this.state.counter >
              this.requirements[fi][0] + data_scientist_pause
            ) {
              this.requirements[fi][1] = this.state.counter
              if (tutorial_mode) {
                this.openUpgrade(strategy_names[2])
              }
            }
          } else {
            if (this.requirements[fi][2] === null) {
              if (
                this.state.counter >
                this.requirements[fi][1] + data_scientist_pause
              ) {
                this.requirements[fi][2] = this.state.counter
                if (tutorial_mode) {
                  this.openUpgrade(strategy_names[3])
                }
              }
            }
          }
        }

        if (
          factory_strategy === strategy_names[0] &&
          simulation_limit > 0 &&
          this.requirements[fi][0] !== null
        ) {
          if (auto_upgrade) {
            this.factories_strategies[fi].push([
              strategy_names[1],
              this.state.counter,
            ])
          }
        } else if (
          factory_strategy === strategy_names[1] &&
          simulation_limit > 1 &&
          this.requirements[fi][1] !== null
        ) {
          if (auto_upgrade) {
            this.factories_strategies[fi].push([
              strategy_names[2],
              this.state.counter,
            ])
          }
        } else if (
          factory_strategy === strategy_names[2] &&
          simulation_limit > 2 &&
          this.requirements[fi][2] !== null
        ) {
          if (auto_upgrade) {
            this.factories_strategies[fi].push([
              strategy_names[3],
              this.state.counter,
            ])
          }
        }
      }
    }

    if (this.state.counter === 2000 && this.state.modal === false) {
      this.openUpgrade()
    }
  }

  render() {
    let profits = this.factory_profits.map((p, i) => [last(p), i])
    profits.sort(compare)

    let render_counter = this.state.counter

    let upgrade_index = 0
    for (let i = 0; i < this.requirements[0].length; i++) {
      if (this.requirements[0][i] !== null) upgrade_index = i + 1
    }

    let leaderboard = profits.map((n, sorted_i) => {
      let fi = profits[sorted_i][1]
      let factory_state = this.factories_state[fi]
      return (
        <div
          key={`factory_${fi}`}
          style={{
            border: 'solid 1px black',
            marginBottom: 10,
            background: 'white',
          }}
        >
          <div
            style={{
              background: factory_colors[fi],
              color: 'white',
              fontSmoothing: 'antialiased',
              padding: '5px 10px',
            }}
          >
            {this.factory_names[fi]}
          </div>
          <div style={{ padding: '5px 10px 10px' }}>
            <div style={{ fontSize: larger_font }}>
              ${commas(calculateProfit(factory_state))} profit
            </div>
            <div style={{ padding: '5px 0 5px' }}>
              <div style={{ fontSize: '12px' }}>STRATEGY HISTORY:</div>
              {this.factories_strategies[fi].map((n, i) => {
                let ri = this.factories_strategies[fi].length - 1 - i
                let color =
                  ri === this.factories_strategies[fi].length - 1
                    ? 'black'
                    : '#999'
                let current = ri === this.factories_strategies[fi].length - 1
                return (
                  <div style={{ color: color }}>
                    <strong>{this.factories_strategies[fi][ri][0]}</strong>
                    {current
                      ? ''
                      : ` for ${this.factories_strategies[fi][ri + 1][1] -
                          this.factories_strategies[fi][ri][1]} cycles`}
                  </div>
                )
              })}
            </div>
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

    let to_render = (
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
              gridTemplateColumns: 'auto 100px auto auto',
              gridColumnGap: 5,
              textAlign: 'right',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
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
            </div>
            <div style={{ paddingRight: 5 }}>
              {commas(render_counter + 1)} cycles
            </div>
            <div>
              <button
                className="top-button"
                onClick={this.togglePlay}
                style={{ width: '60px' }}
              >
                {this.state.playing ? 'pause' : 'play'}
              </button>
            </div>
            <div>
              <button
                className="top-button"
                onClick={this.reset}
                style={{ width: '60px' }}
              >
                reset
              </button>
            </div>

            {false && this.state.counter > 2000 ? (
              <div>
                <button onClick={this.ff} style={{ width: '60px' }}>
                  skip 1000
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {this.ffing ? (
          'fast-forwarding'
        ) : (
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
                        fontSmoothing: 'antialiased',
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
                      {!this.ffing
                        ? this.factory_engines_empty.map((n, ei) => {
                            let engine_flat_i = fi * factory_number + ei
                            let engine = this.props.engines[
                              this.engines[engine_flat_i]
                            ]
                            let engine_state = this.engine_state[engine_flat_i]
                            let this_time =
                              render_counter -
                              this.engine_state[engine_flat_i][0]
                            let rev = engine[this_time]
                            let maintaining =
                              this.engine_delays[engine_flat_i][0] > 0
                            let repairing =
                              this.engine_delays[engine_flat_i][1] > 0
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
                                      counter={render_counter}
                                      this_time={this_time}
                                      keys={this.props.keys}
                                      ranges={this.props.ranges}
                                      engine={engine}
                                      strategy={
                                        this.engine_strategies[engine_flat_i]
                                      }
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
                          })
                        : null}
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
              <div
                style={{
                  border: 'solid 1px black',
                  marginBottom: 10,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: -12,
                    top: '50%',
                    width: '12px',
                    height: '1px',
                    background: 'black',
                  }}
                />
                <div
                  style={{
                    padding: '5px 10px 5px',
                    background: factory_colors[0],
                    color: 'white',
                  }}
                >
                  Your Strategy
                </div>
                <div style={{}}>
                  {strategy_names.map((n, i) => {
                    let checked = n === last(this.factories_strategies[0])[0]
                    let available = true
                    let requirement_info
                    if (i === 1) {
                      available = this.requirements[0][0] !== null
                      requirement_info =
                        ': ' + this.factories_state[0][2] + '/4'
                    } else if (i === 2) {
                      available = this.requirements[0][1] !== null
                      requirement_info = ': none available yet'
                    } else if (i === 3) {
                      available = this.requirements[0][2] !== null
                      requirement_info = ': no offer yet'
                    }
                    let requirement_string = requirement_strings[i]
                    let additional_classes = ''
                    if (checked) additional_classes += ' selected'
                    if (!available) additional_classes += ' disabled'
                    return (
                      <div
                        className={'hoverinner' + additional_classes}
                        onClick={this.setYourStrategy.bind(this, n, available)}
                        style={{
                          background: available ? 'white' : '#ddd',
                          cursor: available ? 'pointer' : 'not-allowed',
                          padding: '5px 10px',
                        }}
                      >
                        {requirement_string !== null ? (
                          <div
                            style={{
                              fontSize: small_font,
                              paddingBottom: '2px',
                            }}
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
                        <div>
                          <input
                            type="radio"
                            checked={checked}
                            disabled={!available}
                            style={{
                              position: 'relative',
                              top: '-1px',
                              marginRight: '2px',
                            }}
                          />{' '}
                          <span
                            className="hoverinner-target"
                            style={{ fontWeight: checked ? 700 : 400 }}
                          >
                            {n}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: 10 }}>Leaderboard</div>
                <div style={{ marginBottom: 10 }}>
                  <LeaderGraph
                    width={this.props.ww / 2 - 20}
                    height={200}
                    counter={render_counter}
                    factory_profits={this.factory_profits}
                    factories_strategies={this.factories_strategies}
                  />
                </div>
                <LatestEvent
                  factories_strategies={this.factories_strategies}
                  factory_names={this.factory_names}
                  counter={render_counter}
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
        )}

        {this.state.modal ? (
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              height: '100vh',
              width: '100%',
              background: 'rgba(0,0,0,0.2)',
              display: 'grid',
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            <div
              style={{
                background: 'white',
                width: '600px',
                border: 'solid 1px black',
              }}
            >
              <div
                style={{
                  background: 'black',
                  color: 'white',
                  fontSmoothing: 'antialiased',
                  padding: '5px 10px',
                }}
              >
                Strategy upgrade available
              </div>
              <div style={{ padding: '15px 15px 10px' }}>
                {upgrade_index === 3 ? (
                  <div>
                    <p>Finish line!</p>
                    <div>
                      Standings:
                      <div>{leaderboard}</div>
                    </div>
                    <div>
                      <button
                        className="top-button variable"
                        onClick={this.closeModal}
                      >
                        Keep playing
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>
                      Do you want to upgrade to {strategy_names[upgrade_index]}?
                    </p>
                    <div style={{ padding: '5px 0' }}>
                      <button
                        onClick={this.yesUpgrade}
                        className="top-button variable"
                      >
                        Yes
                      </button>
                      <span>&nbsp;&nbsp;</span>
                      <button
                        className="top-button variable"
                        onClick={this.closeModal}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    )

    if (this.ffing) {
      return this.last_render
    } else {
      this.last_render = to_render
      return to_render
    }
  }
}

export default Paperclips
