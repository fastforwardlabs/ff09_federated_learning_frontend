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
  makeNames,
  requirement_strings,
  factory_colors,
  profit_array_length,
  finish,
  strategy_descriptions,
  cycle_profit,
  money_finish,
  exploded_penalty,
  maitained_penalty,
  getKey,
} from './Constants'
import { formatTime, commas, compare } from './Utilties'
import FlipMove from 'react-flip-move'
import Dials from './Dial2'
import Turboprogress from './Turboprogress.js'
import Turbodial from './Turbodial'
import YourStrategy from './YourStrategy'
import TurboGraph from './Turbograph'
import LatestEvent from './LatestEvent'
import Turbofan from './Turbofan'
import corr_img from './images/corr.png'
import prev_img from './images/prev.png'
import loc_img from './images/loc.png'
import fed_img from './images/fed.png'
import { scale as chroma_scale } from 'chroma-js'
import Modal from './Modal'
import { max } from 'lodash'

let line_height = 21

let factory_number = 4
let engine_number = 4
let data_scientist_pause = 500 - 1
let federation_offer_pause = 500 - 1

let speed_bound = 10

let graph_offset = 100

let finish_line = finish

let test = 10
let event_limit = 10

let maintain_scale = chroma_scale(['#fff', maintain_color]).domain([
  0,
  event_limit,
])
let repair_scale = chroma_scale(['#fff', repair_color]).domain([0, event_limit])

class Paperclips extends Component {
  constructor(props) {
    super(props)
    this.state = {
      counter: null,
      playing: true,
      modal: false,
      modal_state: null,
      modal_display: false,
      your_strategy: strategy_names[0],
      engine_rerender: 0,
      harmless_render: 0,
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
    this.factory_names = ['Your Factory', ...makeNames(3)]
    this.factories_strategies = this.factories.map((n, i) => {
      return [[strategy_names[0], 0]]
    })
    this.simulation_limits = this.factories.map((n, i) => 3 - i)
    this.factory_upgrades = this.factories.map(n => [false, false])
    this.factory_engines_empty = [...Array(engine_number)]
    this.factory_profits = this.factories.map(n => [0])
    this.factory_events = this.factories.map(n => [0, 0])
    this.engine_lookup = this.factories.map((n, i) =>
      [...Array(engine_number)].map((n, j) => i * factory_number + j)
    )
    this.getNewEngine = () => Math.floor(Math.random() * engine_length)
    this.engines = [...Array(factory_number * engine_number)].map(n =>
      this.getNewEngine()
    )
    this.your_factory_ribbon = [...Array(engine_number)].map(n => [0])
    this.your_strategy_switch = [false]
    this.your_engine_strategies = [...Array(engine_number)].map(n => [true])
    this.your_factory_flash = [...Array(engine_number)].map(n => [false, false])
    this.engine_strategies = this.engines.map(n => strategy_names[0])
    // offset, maintained, failed
    this.engine_state = this.engines.map(n => [0, 0, 0])
    this.engine_delays = this.engines.map(n => [0, 0])
    this.togglePlay = this.togglePlay.bind(this)
    this.play = this.play.bind(this)
    this.reset = this.reset.bind(this)
    this.ff = this.ff.bind(this)
    this.ffing = false
    this.tutorial_mode = true
    this.modal_close_play = true
    this.adjustSpeed.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.keepPlaying = this.keepPlaying.bind(this)
    this.openUpgrade = this.openUpgrade.bind(this)
    this.incrementToMax = this.incrementToMax.bind(this)
    this.upgradeYourStrat = this.upgradeYourStrat.bind(this)
    this.requirements = [...Array(factory_number)].map(n => [null, null, null])
    this.round_delays = [...Array(factory_number)].map(n => null)
    this.keep_playing = false
    this.openInfo = this.openInfo.bind(this)
    this.info_index = null
    this.setModalState = this.setModalState.bind(this)
    this.openTurbofanInfo = this.openTurbofanInfo.bind(this)
    this.hypnodrones_released = false
    this.releaseTheHypnodrones = this.releaseTheHypnodrones.bind(this)
  }

  upgradeYourStrat(strat) {
    this.factories_strategies[0].push([strat, this.state.counter])
    this.setState({ your_strategy: strat })
  }

  openModal() {
    document.body.style.overflow = 'hidden'
    this.modal_close_play = this.state.playing
    this.setState({ modal: true })
    setTimeout(() => {
      this.setState({ modal_display: true })
    }, 100)
  }

  openInfo(info_index) {
    this.setModalState('strategy_info')
    this.info_index = info_index
    this.openModal()
  }

  openTurbofanInfo() {
    this.setModalState('turbofan')
    this.openModal()
  }

  setModalState(new_state) {
    this.setState({ modal_state: new_state })
  }

  closeModal() {
    document.body.style.overflow = 'initial'
    this.setState({ modal_display: false })
    setTimeout(() => {
      this.setState({ modal: false })
      if (this.modal_close_play) {
        this.play()
      }
    }, 100)
  }

  keepPlaying() {
    this.keep_playing = true
    this.setState({ modal: false })
    this.play()
  }

  releaseTheHypnodrones() {
    this.hypnodrones_released = true
    this.setState({ modal: false })
    this.play()
  }

  openUpgrade(modal_state) {
    this.setState({ modal_state: modal_state })
    this.openModal()
  }

  setYourStrategy(strat, available) {
    if (available === undefined || available === true) {
      if (strat !== last(this.factories_strategies[0])[0]) {
        if (this.props.auto_upgrade) {
          this.props.toggleAuto()
        }
        this.upgradeYourStrat(strat)
      }
    }
  }

  adjustSpeed(e) {
    this.props.adjustSpeed(e)
    this.play()
  }

  incrementToMax() {
    setTimeout(() => {
      this.setState(
        function(state, props) {
          return {
            counter: state.counter + 1,
          }
        },
        () => {
          let max_last_profit = max(this.factory_profits.map(p => last(p)))
          if (max_last_profit < money_finish) this.incrementToMax()
        }
      )
    }, 0)
  }

  ff(finish) {
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
    if (finish) {
      // go to money finish
      // this.incrementToMax()
    } else {
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
  }

  reset() {
    this.props.reset()
  }

  keyCheck(e) {
    if (e.keyCode === 27) {
      //Do whatever when esc is pressed
      this.closeModal()
    } else if (e.keyCode === 32) {
      if (!this.state.modal_display) {
        this.togglePlay()
      }
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyCheck.bind(this), false)
    this.setState(
      {
        counter: 0,
      },
      () => {
        this.play()
      }
    )
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyCheck, false)
  }

  play() {
    window.cancelAnimationFrame(this.animating)
    let count = 0
    let start = () => {
      if (count === this.props.speeds[this.props.speed]) {
        this.setState({ counter: this.state.counter + 1 })
        count = 0
      }
      count++
      if (this.state.playing && this.state.modal === false) {
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
    let stack = false
    if (this.props.ww < 940) stack = true

    if (this.props.show_intro && this.state.counter === 0) {
      this.setState({ modal_state: 'intro' }, () => {
        this.openModal()
        this.props.introShown()
      })
    } else {
      if (
        !this.state.playing &&
        prevState.your_strategy !== this.state.your_strategy
      ) {
        let fi = 0
        let factory_strategy = last(this.factories_strategies[fi])[0]
        for (let ei = 0; ei < engine_number; ei++) {
          let engine_flat_i = fi * factory_number + ei
          let engine_delays = this.engine_delays[engine_flat_i]
          if (!(engine_delays[0] > 0 || engine_delays[1] > 0)) {
            this.engine_strategies[engine_flat_i] = factory_strategy
          }
        }
        this.setState({ engine_rerender: this.state.engine_rerender + 1 })
      }
      if (prevState.counter !== this.state.counter) {
        let max_last_profit = max(this.factory_profits.map(p => last(p)))
        if (
          max_last_profit >= money_finish &&
          !this.keep_playing &&
          this.state.modal === false
        ) {
          this.setModalState('finish')
          this.openModal()
        }
        if (
          max_last_profit >= 50 * 1000 * 1000 &&
          !this.hypnodrones_released &&
          this.state.modal === false
        ) {
          this.setModalState('hypnodrones')
          this.openModal()
        }

        for (let fi = 0; fi < factory_number; fi++) {
          let factory_state = this.factories_state[fi]
          let factory_strategy = last(this.factories_strategies[fi])[0]
          let simulation_limit = this.simulation_limits[fi]
          let upgrades = this.factory_upgrades[fi]
          let last_switch = last(this.factories_strategies[fi])[1]

          let factory_events = [false, false]

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

            let engine_state_ribbon = 0

            if (engine_delays[0] > 0) {
              // maintaining
              engine_state[0] += 1
              engine_delays[0] -= 1
              if (engine_delays[0] === 0) {
                engine_state[0] = this.state.counter
                this.engines[engine_flat_i] = this.getNewEngine()
              }
              engine_state_ribbon = 1
            } else if (engine_delays[1] > 0) {
              // repairing
              engine_state[0] += 1
              engine_delays[1] -= 1
              if (engine_delays[1] === 0) {
                engine_state[0] = this.state.counter
                this.engines[engine_flat_i] = this.getNewEngine()
              }
              engine_state_ribbon = 2
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
                engine_state_ribbon = 1
                this.your_factory_flash[ei] = [true, false]
                factory_events[0] = true
              } else if (rev === undefined) {
                engine_delays[1] = exploded_delay
                engine_state[0] += 1
                // add failed
                engine_state[2] += 1
                factory_state[2] += 1
                engine_state_ribbon = 2
                this.your_factory_flash[ei] = [false, true]
                factory_events[1] = true
              } else {
                factory_state[0] += 1
                engine_state_ribbon = 0
                this.your_factory_flash[ei] = [false, false]
              }
            }

            if (fi === 0) {
              let max_array = Math.floor(
                stack ? this.props.ww - 12 : this.props.ww / 2 - 12
              )
              if (this.your_factory_ribbon[ei].length > max_array)
                this.your_factory_ribbon[ei].shift()
              this.your_factory_ribbon[ei].push(engine_state_ribbon)
            }
          }

          if (factory_events[0]) {
            this.factory_events[fi][0] = event_limit
          } else {
            // this is how we fade
            if (this.factory_events[fi][0] > 0) {
              this.factory_events[fi][0] = this.factory_events[fi][0] - 1
            } else {
              this.factory_events[fi][0] = 0
            }
          }
          if (factory_events[1]) {
            this.factory_events[fi][1] = event_limit
          } else {
            // this is how we fade
            if (this.factory_events[fi][1] > 0) {
              this.factory_events[fi][1] = this.factory_events[fi][1] - 1
            } else {
              this.factory_events[fi][1] = 0
            }
          }

          let factory_profit = calculateProfit(factory_state)
          let new_profit_array_length = stack
            ? this.props.ww - graph_offset
            : this.props.ww / 2 - graph_offset
          if (this.factory_profits[fi].length > new_profit_array_length) {
            this.factory_profits[fi].shift()
          }
          this.factory_profits[fi].push(factory_profit)

          let your_factory = fi === 0
          let auto_upgrade =
            !your_factory || (your_factory && this.props.auto_upgrade === true)
          let tutorial_mode = your_factory && this.tutorial_mode

          let requirements = this.requirements[fi]
          let round_delay = this.round_delays[fi]

          if (requirements[0] === null) {
            if (factory_state[2] >= 4) {
              if (round_delay === null) {
                this.round_delays[fi] = this.state.counter + 1
              }
              if (round_delay === this.state.counter) {
                this.requirements[fi][0] = this.state.counter
                if (tutorial_mode && !auto_upgrade) {
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
                if (tutorial_mode && !auto_upgrade) {
                  this.openUpgrade(strategy_names[2])
                }
              }
            } else {
              if (this.requirements[fi][2] === null) {
                if (
                  this.state.counter >
                  this.requirements[fi][1] + federation_offer_pause
                ) {
                  this.requirements[fi][2] = this.state.counter
                  if (tutorial_mode && !auto_upgrade) {
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
              if (your_factory) {
                this.upgradeYourStrat(strategy_names[1])
              } else {
                this.factories_strategies[fi].push([
                  strategy_names[1],
                  this.state.counter,
                ])
              }
            }
          } else if (
            factory_strategy === strategy_names[1] &&
            simulation_limit > 1 &&
            this.requirements[fi][1] !== null
          ) {
            if (auto_upgrade) {
              if (your_factory) {
                this.upgradeYourStrat(strategy_names[2])
              } else {
                this.factories_strategies[fi].push([
                  strategy_names[2],
                  this.state.counter,
                ])
              }
            }
          } else if (
            factory_strategy === strategy_names[2] &&
            simulation_limit > 2 &&
            this.requirements[fi][2] !== null
          ) {
            if (auto_upgrade) {
              if (your_factory) {
                this.upgradeYourStrat(strategy_names[3])
              } else {
                this.factories_strategies[fi].push([
                  strategy_names[3],
                  this.state.counter,
                ])
              }
            }
          }
        }
      }
    }
  }

  render() {
    let grid_thresh = 940
    let stack = false
    if (this.props.ww < 940) stack = true

    let render_counter = this.state.counter

    let profits = this.factory_profits.map((p, i) => [last(p), i])
    profits.sort(compare)

    let upgrade_index = 0
    for (let i = 0; i < this.requirements[0].length; i++) {
      if (this.requirements[0][i] !== null) upgrade_index = i + 1
    }

    let your_profit = profits.slice(0, 1)
    let prof_map = profits
    if (this.props.solo_mode) prof_map = your_profit
    let ranks = ['1st', '2nd', '3rd', '4th']
    let leaderboard = prof_map.map((n, sorted_i) => {
      let fi = profits[sorted_i][1]
      if (this.props.solo_mode) fi = 0
      let factory_state = this.factories_state[fi]
      let factory_events = this.factory_events[fi]
      let fact_strat = this.factories_strategies[fi]
      let current = fact_strat[fact_strat.length - 1]
      let history = fact_strat
        .slice(0)
        .reverse()
        .slice(1)
      return (
        <div
          key={`factory_${fi}`}
          style={{
            background: 'white',
            position: 'relative',
          }}
        >
          <div
            style={{
              background: factory_colors[fi],
              color: 'white',
              fontSmoothing: 'antialiased',
              padding: '0',
              display: 'flex',
            }}
          >
            <div
              style={{
                padding: '0 0 0 4px',
                background: 'white',
                color: 'black',
              }}
            >
              {sorted_i + 1}.
            </div>
            <div style={{ padding: '0 4px' }}>{this.factory_names[fi]}</div>
          </div>
          <div style={{}}>
            <div
              style={{ padding: '0 4px', fontSize: 14 * 1.25, lineHeight: 1.5 }}
            >
              ${commas(calculateProfit(factory_state))}{' '}
              {calculateProfit(factory_state) >= 0 ? 'profit' : 'loss'}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              <div
                style={{
                  background: maintain_scale(factory_events[0]),
                  padding: '0 4px',
                }}
              >
                Maintained: {factory_state[1]}
              </div>
              <div
                style={{
                  background: repair_scale(factory_events[1]),
                  padding: '0 4px',
                }}
              >
                Failed: {factory_state[2]}
              </div>
            </div>
            <div style={{ padding: '0 4px' }}>
              <div>
                Strategy: <strong>{current[0]}</strong>
                {false ? (
                  <span>
                    for {commas(this.state.counter - current[1])} hours
                  </span>
                ) : null}
              </div>
              {history.length > 0 ? (
                <div>
                  <span>
                    {history.map((entry, i) => {
                      let next
                      if (i === 0) {
                        next = current
                      } else {
                        next = history[i - 1]
                      }
                      return (
                        <div
                          key={`${fi}_history_${i}`}
                          style={{ color: '#888' }}
                        >
                          <strong>{entry[0]}</strong> for{' '}
                          {commas(next[1] - entry[1])} hours
                        </div>
                      )
                    })}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="hb" style={{ top: -1 }} />
        </div>
      )
    })

    let to_render = (
      <div
        style={{
          display: stack ? 'block' : 'grid',
          overflow: stack ? 'initial' : 'hidden',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: `${line_height}px calc(100vh - ${line_height *
            2}px) ${line_height}px`,
        }}
      >
        <div style={{ gridColumn: '1/3', padding: '0 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>Turbofan Tycoon</div>
            <div
              style={{
                textAlign: 'right',
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                gridColumnGap: 14,
              }}
            >
              <div>{commas(this.state.counter + 1)} hours</div>
              <div>
                <button
                  onClick={() => {
                    this.setModalState('intro')
                    this.openModal()
                  }}
                  className="unbutton"
                >
                  info
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            gridColumn: '1/2',
          }}
        >
          {stack ? <div className="h-border" style={{ top: -0.5 }} /> : null}
          {this.factories.slice(0, 1).map((n, fi) => {
            let factory_state = this.factories_state[fi]
            let factory_events = this.factory_events[fi]
            return (
              <div
                key={`factory_${fi}`}
                style={{
                  display: stack ? 'block' : 'grid',
                  gridTemplateRows: `${line_height}px calc(100vh - ${line_height *
                    3}px)`,
                }}
              >
                <div
                  style={{
                    background: factory_colors[fi],
                    color: 'white',
                    fontSmoothing: 'antialiased',
                    padding: '0 6px 0 4px',
                    display: 'grid',
                    alignItems: 'center',
                    height: 21,
                  }}
                >
                  <div>{this.factory_names[fi]}</div>
                </div>
                <div
                  style={{
                    position: 'relative',
                    overflow: stack ? false : 'auto',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        padding: '0 4px',
                        fontSize: 14 * 1.25,
                        lineHeight: 1.5,
                      }}
                    >
                      ${commas(last(this.factory_profits[fi]))}{' '}
                      {last(this.factory_profits[fi]) >= 0 ? 'profit' : 'loss'}
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                      }}
                    >
                      <div
                        style={{
                          padding: '0 4px',
                          background: maintain_scale(factory_events[0]),
                        }}
                      >
                        Maintained: {factory_state[1]}
                      </div>
                      <div
                        style={{
                          padding: '0 4px',
                          background: repair_scale(factory_events[1]),
                        }}
                      >
                        Failed: {factory_state[2]}
                      </div>
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    {this.factory_engines_empty.map((n, ei) => {
                      let engine_flat_i = fi * factory_number + ei
                      let engine = this.props.engines[
                        this.engines[engine_flat_i]
                      ]
                      let engine_state = this.engine_state[engine_flat_i]
                      let this_time =
                        render_counter - this.engine_state[engine_flat_i][0]
                      let rev = engine[this_time]
                      let maintaining = this.engine_delays[engine_flat_i][0] > 0
                      let repairing = this.engine_delays[engine_flat_i][1] > 0
                      let background = '#222'
                      if (maintaining) background = maintain_color
                      if (repairing) background = repair_color
                      background = '#fff'
                      return (
                        <div
                          key={`engine_${engine_flat_i}`}
                          style={{
                            position: 'relative',
                          }}
                        >
                          <Turbodial
                            counter={render_counter}
                            this_time={this_time}
                            keys={this.props.keys}
                            ranges={this.props.ranges}
                            engine={engine}
                            ei={ei}
                            strategy={this.engine_strategies[engine_flat_i]}
                            width={stack ? this.props.ww : this.props.ww / 2}
                            maintaining={maintaining}
                            repairing={repairing}
                            engine_rerender={this.state.engine_rerender}
                            delays={this.engine_delays[engine_flat_i]}
                            ribbon={this.your_factory_ribbon[ei]}
                            max_array={Math.floor(this.props.ww / 2 - 12)}
                            your_factories_strategies={
                              this.factories_strategies[0]
                            }
                            openTurbofanInfo={this.openTurbofanInfo}
                          />
                          <div className="hb" style={{ top: -0.5 }} />
                        </div>
                      )
                    })}
                    <div className="hb" style={{ bottom: -0.5 }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div
          style={{
            gridColumn: '2/3',
            position: 'relative',
          }}
        >
          <YourStrategy
            factories_strategies={this.factories_strategies}
            factories_state={this.factories_state}
            setYourStrategy={this.setYourStrategy.bind(this)}
            requirements={this.requirements}
            toggleAuto={this.props.toggleAuto}
            auto_upgrade={this.props.auto_upgrade}
            openInfo={this.openInfo}
          />
          <div
            style={{
              position: 'relative',
              display: stack ? 'block' : 'grid',
              gridTemplateRows: `${line_height}px calc(100vh - ${line_height *
                11}px)`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 4px',
                background: '#777',
                color: '#fff',
              }}
            >
              <div className="h-border" style={{ top: -1 }} />
              <div>Factory Leaderboard</div>
              <div
                style={{
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: 'auto auto',
                  gridColumnGap: 5,
                  alignItems: 'center',
                }}
                onClick={this.props.toggleSolo}
              >
                <input type="checkbox" checked={this.props.solo_mode} />
                <div>solo view</div>
              </div>
            </div>
            <div
              style={{
                position: 'relative',
                display: stack ? 'block' : 'grid',
                gridTemplateRows: `${line_height *
                  10}px calc(100vh - ${line_height * (10 + 11)}px - 1px)`,
              }}
            >
              <div style={{ position: 'relative' }}>
                <TurboGraph
                  width={stack ? this.props.ww : this.props.ww / 2}
                  new_profit_array_length={
                    stack
                      ? this.props.ww - graph_offset
                      : this.props.ww / 2 - graph_offset
                  }
                  height={line_height * 10}
                  counter={render_counter}
                  factory_profits={this.factory_profits}
                  factories_strategies={this.factories_strategies}
                  solo_mode={this.props.solo_mode}
                />
              </div>
              <div
                style={{
                  position: 'relative',
                  overflow: stack ? false : 'auto',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <LatestEvent
                    factories_strategies={this.factories_strategies}
                    factory_names={this.factory_names}
                    counter={render_counter}
                    solo_mode={this.props.solo_mode}
                  />
                  <FlipMove
                    duration={250}
                    enterAnimation={false}
                    leaveAnimation={false}
                  >
                    {leaderboard}
                  </FlipMove>
                  <div className="hb" style={{ bottom: -0.5 }} />
                </div>
              </div>
              <div className="hb" style={{ top: line_height * 10 + 'px' }} />
            </div>
          </div>
          {stack ? <div className="h-border" style={{ top: -0.5 }} /> : null}
        </div>
        <div
          style={{
            gridColumn: '1/3',
            padding: '0 4px',
            display: stack ? 'block' : 'flex',
            position: stack ? 'fixed' : 'relative',
            bottom: stack ? 0 : 'auto',
            width: '100%',
            justifyContent: 'space-between',
            background: '#777',
            color: '#fff',
          }}
        >
          <div style={{ display: stack ? 'block' : 'flex' }}>
            <div style={{ display: stack ? 'none' : 'block' }}>
              Simulation controls:
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                alignItems: 'center',
                gridColumnGap: 5,
                justifyContent: 'left',
                paddingRight: stack ? 0 : 5,
                paddingLeft: stack ? 0 : 8,
                paddingTop: stack ? 4 : 0,
                paddingBottom: stack ? 4 : 0,
              }}
            >
              <div style={{}}>Speed:</div>
              <input
                type="range"
                min={0}
                max={this.props.speeds.length - 1}
                onChange={this.adjustSpeed.bind(this)}
                step={1}
                value={this.props.speed}
                style={{
                  width: '100px',
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              textAlign: 'right',
              alignContent: 'center',
              paddingBottom: stack ? 5 : 0,
            }}
          >
            <div style={{ marginLeft: stack ? 0 : 5 }}>
              <button
                className="newbutton"
                onClick={this.togglePlay}
                style={{ width: '60px' }}
              >
                {this.state.playing ? 'pause' : 'play'}
              </button>
            </div>
            <div style={{ marginLeft: 5 }}>
              <button
                className="newbutton"
                onClick={this.reset}
                style={{ width: '60px' }}
              >
                reset
              </button>
            </div>
            {this.keep_playing ? (
              <div style={{ marginLeft: 5 }}>
                <button
                  className="newbutton"
                  onClick={() => {
                    this.ff(false)
                  }}
                >
                  skip 1,000
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {stack ? (
          <div style={{ height: 55, width: '100%' }} />
        ) : (
          [
            <div
              style={{
                position: 'fixed',
                top: line_height - 1,
                height: '2px',
                background: 'black',
                left: 0,
                right: 0,
              }}
            />,
            <div
              style={{
                position: 'fixed',
                bottom: line_height * 1 - 1,
                height: '2px',
                background: 'black',
                left: 0,
                right: 0,
              }}
            />,
            <div
              style={{
                position: 'fixed',
                top: line_height - 1,
                bottom: line_height * 1 - 1,
                width: '3px',
                background: 'black',
                left: 'calc(50% - 1.5px)',
              }}
            />,
          ]
        )}

        {this.state.modal_display ? (
          <Modal
            factory_names={this.factory_names}
            keepPlaying={this.keepPlaying}
            closeModal={this.closeModal}
            upgradeYourStrat={this.upgradeYourStrat}
            modal_state={this.state.modal_state}
            info_index={this.info_index}
            requirements={this.requirements}
            counter={this.state.counter}
            prof_map={prof_map}
            factories_strategies={this.factories_strategies}
            factories_state={this.factories_state}
            factory_names={this.factory_names}
            stack={stack}
            releaseTheHypnodrones={this.releaseTheHypnodrones}
          />
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
