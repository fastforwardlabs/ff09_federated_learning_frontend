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
  exploded_penalty,
  maitained_penalty,
} from './Constants'
import { commas, compare } from './Utilties'
import FlipMove from 'react-flip-move'
import Dials from './Dial2'
import LeaderGraph from './LeaderGraph'
import LatestEvent from './LatestEvent'
import Turbofan from './Turbofan'
import corr_img from './images/corr.png'
import prev_img from './images/prev.png'
import loc_img from './images/loc.png'
import fed_img from './images/fed.png'

let small_font = '13px'
let smaller_font = '13px'
let larger_font = '18px'

let factory_number = 4
let engine_number = 4
let data_scientist_pause = 500 - 1
let federation_offer_pause = 500 - 1

let speed_bound = 10

let finish_line = finish

let modal_title_styling = {
  background: 'black',
  color: 'white',
  fontSmoothing: 'antialiased',
  padding: '5px 20px',
  fontSize: '17px',
  display: 'flex',
  justifyContent: 'space-between',
}

let modal_body_styling = {
  padding: '20px',
  lineHeight: '1.5',
}

function color_span(bg) {
  return {
    color: 'white',
    margin: '0 3px',
    background: bg,
    boxShadow: `3px 1px 0 ${bg}, -3px 1px 0 ${bg}, 3px -1px 0 ${bg}, -3px -1px 0 ${bg}`,
  }
}

let right_side_width = 700

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
    this.engine_lookup = this.factories.map((n, i) =>
      [...Array(engine_number)].map((n, j) => i * factory_number + j)
    )
    this.getNewEngine = () => Math.floor(Math.random() * engine_length)
    this.engines = [...Array(factory_number * engine_number)].map(n =>
      this.getNewEngine()
    )
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
    this.yesUpgrade = this.yesUpgrade.bind(this)
    this.updateYourStrat = this.upgradeYourStrat.bind(this)
    this.requirements = [...Array(factory_number)].map(n => [null, null, null])
    this.round_delays = [...Array(factory_number)].map(n => null)
    this.keep_playing = false
    this.modal_state = null
    this.info_index = null
    this.setModalState = this.setModalState.bind(this)
  }

  upgradeYourStrat(strat) {
    this.setState({ your_strategy: strat })
  }

  openModal() {
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

  setModalState(new_state) {
    this.setState({ modal_state: new_state })
  }

  closeModal() {
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

  openUpgrade() {
    this.setModalState('upgrade')
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
        if (this.props.auto_upgrade) {
          this.props.toggleAuto()
        }
        this.factories_strategies[0].push([strat, this.state.counter])
        this.updateYourStrat(strat)
      }
    }
  }

  adjustSpeed(e) {
    this.props.adjustSpeed(e)
    this.play()
  }

  ff(finish) {
    // this.setModalState('ffing')
    // this.openModal()
    this.ffing = true
    // setTimeout(() => {
    let restart = false
    if (this.state.playing === true) {
      restart = true
      this.pause()
    }
    let jump = 1000
    if (finish) {
      jump = finish_line - 1 - this.state.counter
    }
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
    // }, 100)
  }

  reset() {
    this.props.reset()
  }

  componentDidMount() {
    this.setState(
      {
        counter: 0,
      },
      () => {
        this.play()
      }
    )
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
            if (your_factory) this.upgradeYourStrat(strategy_names[1])
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
            if (your_factory) this.upgradeYourStrat(strategy_names[2])
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
            if (your_factory) this.upgradeYourStrat(strategy_names[3])
            this.factories_strategies[fi].push([
              strategy_names[3],
              this.state.counter,
            ])
          }
        }
      }
    }

    if (
      this.state.counter === finish_line &&
      !this.keep_playing &&
      this.state.modal === false
    ) {
      this.setModalState('finish')
      this.openModal()
    }

    if (this.props.show_intro && this.state.counter === 0) {
      this.setModalState('intro')
      this.openModal()
      this.props.introShown()
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

    let your_profit = profits.slice(0, 1)
    let prof_map = profits
    if (this.props.solo_mode) prof_map = your_profit
    let leaderboard = prof_map.map((n, sorted_i) => {
      let fi = profits[sorted_i][1]
      if (this.props.solo_mode) fi = 0
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
              ${commas(calculateProfit(factory_state))}{' '}
              {calculateProfit(factory_state) >= 0 ? 'profit' : 'loss'}
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
                      ? this.state.modal || !this.state.playing
                        ? ` for ${commas(
                            this.state.counter -
                              this.factories_strategies[fi][ri][1]
                          )} cycles`
                        : ''
                      : ` for ${commas(
                          this.factories_strategies[fi][ri + 1][1] -
                            this.factories_strategies[fi][ri][1]
                        )} cycles`}
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
              <div>maintained: {factory_state[1]}</div>
              <div>failed: {factory_state[2]}</div>
            </div>
          </div>
        </div>
      )
    })

    let close_button = (
      <div>
        <button
          onClick={() => {
            if (this.state.modal_state === 'finish') {
              this.keepPlaying()
            } else {
              this.closeModal()
            }
          }}
          className="unbutton closebutton"
        >
          &times;
        </button>
      </div>
    )

    let strategy_info = null
    if (this.info_index === 0) {
      strategy_info = (
        <div>
          <p>
            A <strong>corrective</strong> maintenance strategy isn't really much
            of a strategy. It simply waits for an engine to fail to repair it.
          </p>
          <p style={{ overflow: 'hidden' }}>
            <div
              style={{
                border: 'solid 1px black',
                padding: '0 5px 5px',
                float: 'left',
              }}
            >
              <div style={{ fontSize: smaller_font, padding: '10px 10px 0' }}>
                STRATEGY:
              </div>
              <div className="img_holder">
                <img className="strat_image" src={corr_img} alt="" />
              </div>
            </div>
          </p>
          <p>
            You can see this approach applied to each of your turbofans in the
            strategy section. For the <strong>corrective</strong> strategy, it's
            just a line counting the number of cycles the engine has ran. This
            section gets more intersting once you get into the other strategies.
          </p>
        </div>
      )
    } else if (upgrade_index === 1 || this.info_index === 1) {
      strategy_info = (
        <div>
          {this.requirements[0][0] === null &&
          this.state.modal_state === 'strategy_info' ? (
            <div
              style={{
                background: '#efefef',
                fontStyle: 'italic',
                padding: '5px 10px',
                marginBottom: 15,
                fontSize: '15px',
              }}
            >
              This strategy option will be unlocked when you have data from four
              engine failures.
            </div>
          ) : null}
          <p>
            A <strong>preventative</strong> maintenance strategy averages data
            about when engines failed in the past to choose a fixed time to
            perform maintenance. In this case engine maintenance is performed
            when an engine reaches 193 cycles.
          </p>
          <p style={{ overflow: 'hidden' }}>
            <div
              style={{
                border: 'solid 1px black',
                padding: '0 5px 5px',
                float: 'left',
              }}
            >
              <div style={{ fontSize: smaller_font, padding: '10px 10px 0' }}>
                STRATEGY:
              </div>
              <img className="strat_image" src={prev_img} alt="" />
            </div>
          </p>
          <p>
            You can see this approach applied to each of your turbofans in the
            strategy section. When the number of cycles reaches the scheduled
            time (shown as a dotted line) maintenance is performed. Some engines
            will fail before reaching the scheduled maintenance point.
          </p>
        </div>
      )
    } else if (upgrade_index === 2 || this.info_index === 2) {
      strategy_info = (
        <div>
          {this.requirements[0][1] === null &&
          this.state.modal_state === 'strategy_info' ? (
            <div
              style={{
                background: '#efefef',
                fontStyle: 'italic',
                padding: '5px 10px',
                marginBottom: 15,
                fontSize: '15px',
              }}
            >
              This strategy will be unlocked when you have hired a data
              scientist. Data scientists become available about{' '}
              {data_scientist_pause} cycles after you've satisfied the
              preventative strategy requirement.
            </div>
          ) : null}

          <p>
            Like the preventative strategy, the{' '}
            <strong>local predictive</strong> model uses the data from past
            engine failures. Rather than simply averaging their failure times,
            however, it uses the sensor data to make a more sophisticated guess
            about when the engine will fail. Maintenance is performed when the
            model's predicted remaining life for the engine drops below ten
            cycles.
          </p>
          <p style={{ overflow: 'hidden' }}>
            <div
              style={{
                border: 'solid 1px black',
                padding: '0 5px 5px',
                float: 'left',
              }}
            >
              <div style={{ fontSize: smaller_font, padding: '10px 10px 0' }}>
                STRATEGY:
              </div>
              <img className="strat_image" src={loc_img} alt="" />
            </div>
          </p>
          <p>
            You can see this approach applied to each of your turbofans in the
            strategy section. The graph plots the cycle number on the x-axis and
            the predicted remaining life on the y-axis. The threshold for when
            maintenance is performed by the dotted line.
          </p>
        </div>
      )
    } else if (upgrade_index === 3 || this.info_index === 3) {
      strategy_info = (
        <div>
          {this.requirements[0][1] === null &&
          this.state.modal_state === 'strategy_info' ? (
            <div
              style={{
                background: '#efefef',
                fontStyle: 'italic',
                padding: '5px 10px',
                marginBottom: 15,
                fontSize: '15px',
              }}
            >
              This strategy will be unlocked when you have received a federation
              offer. A federation offer generally comes about{' '}
              {data_scientist_pause} cycles after you've satisfied the local
              predictive requirement.
            </div>
          ) : null}
          <p>
            Like the local predictive model, the{' '}
            <strong>federated predictive</strong> model is trained on data from
            engine failures. Through federated learning, it's been trained on
            data from all the factories in the federation. Maintenance is
            performed when the model's predicted remaining life for the engine
            drops below ten cycles.
          </p>
          <p style={{ overflow: 'hidden' }}>
            <div
              style={{
                border: 'solid 1px black',
                padding: '0 5px 5px',
                float: 'left',
              }}
            >
              <div style={{ fontSize: smaller_font, padding: '10px 10px 0' }}>
                STRATEGY:
              </div>
              <img className="strat_image" src={fed_img} alt="" />
            </div>
          </p>
          <p>
            You can see this approach applied to each of your turbofans in the
            strategy section. The graph plots the cycle number on the x-axis and
            the predicted remaining life on the y-axis. The threshold for when
            maintenance is performed by the dotted line.
          </p>
        </div>
      )
    }

    let upgrade_content = null
    if (upgrade_index === 1) {
      upgrade_content = (
        <div>
          <p>
            The bad news is your factory has experienced four engine failures.
            The good news is, using the data from those failures, you now have
            the option to upgrade to a <strong>preventative</strong> maintenance
            strategy.
          </p>
          {strategy_info}
          <div
            style={{
              background: '#efefef',
              fontStyle: 'italic',
              padding: '5px 10px',
              marginBottom: 15,
              fontSize: '15px',
            }}
          >
            Our advice: though not particularly sophisticated, a preventative
            strategy is definitely a step up from just waiting for your engines
            to fail. We heartily recommend this upgrade.
          </div>
          <p>
            Do you want to upgrade to{' '}
            <strong>{strategy_names[upgrade_index]}</strong>?
          </p>
        </div>
      )
    } else if (upgrade_index === 2) {
      upgrade_content = (
        <div>
          <p>
            After a long search, your factory has been able to hire a data
            scientist, unlocking the possibility of using a{' '}
            <strong>local predictive</strong> model for your maintenance
            strategy.
          </p>
          {strategy_info}{' '}
          <div
            style={{
              background: '#efefef',
              fontStyle: 'italic',
              padding: '5px 10px',
              marginBottom: 15,
              fontSize: '15px',
            }}
          >
            Our advice: Now we're cooking with data science! Upgrade strongly
            recommended.
          </div>
          <p>
            Do you want to upgrade to{' '}
            <strong>{strategy_names[upgrade_index]}</strong>?
          </p>
        </div>
      )
    } else if (upgrade_index === 3) {
      upgrade_content = (
        <div>
          <p>
            A group of factory owners have approached you with the opportunity
            to participate in their <strong>federated predictive</strong> model.
          </p>
          {strategy_info}
          <div
            style={{
              background: '#efefef',
              fontStyle: 'italic',
              padding: '5px 10px',
              marginBottom: 15,
              fontSize: '15px',
            }}
          >
            Our advice: with access to more data the predictive model strategy
            becomes even more powerful. Upgrade for the ultimate in efficient
            maintenance.
          </div>
          <p>
            Do you want to upgrade to{' '}
            <strong>{strategy_names[upgrade_index]}</strong>?
          </p>
        </div>
      )
    }

    let modal_content = null
    switch (this.state.modal_state) {
      case 'ffing':
        modal_content = (
          <div>
            <div style={modal_title_styling}>Fast forwarding</div>
            <div style={modal_body_styling}>
              Fast forwarding the simulation.
            </div>
          </div>
        )
        break
      case 'intro':
        modal_content = (
          <div>
            <div style={modal_title_styling}>
              <div>Welcome to Turbofan Tycoon</div>
              {close_button}
            </div>
            <div style={modal_body_styling}>
              <div
                style={{
                  background: '#efefef',
                  fontStyle: 'italic',
                  padding: '5px 10px',
                  marginBottom: 15,
                }}
              >
                Turbofan Tycoon is a research prototype by{' '}
                <a href="#">Cloudera Fast Forward Labs</a> built to accompany
                our report on Federated Learning. It uses real turbofan data to
                show the benefites of using a federative predictive model. You
                can learn more about the thinking behind the prototype in{' '}
                <a href="#">our blog post</a>.
              </div>
              <p>
                In Turbofan Tycoon, you play as the proud operator of a factory
                containing four turbofans. Every time one of your turbofans
                completes a cycle you make ${cycle_profit}. Sounds like a pretty
                sweet deal, right?
              </p>
              <p>
                The problem is, turbofans don't run forever. A broken turbofan
                costs ${commas(exploded_penalty)} to repair, and it takes{' '}
                {exploded_delay} cycles to get it running again. If you catch it
                before it breaks, turbofan maintenance costs $
                {commas(maitained_penalty)} and takes {maintained_delay} cycles
                to perform.
              </p>
              <p>
                You need to pick a good maintenance strategy, but for that you
                need data and expertise. You can unlock new maintenance
                strategies as you gain experience: moving from an initial
                repair-it-when-it-breaks <strong>corrective</strong> approach
                all the way up to a <strong>federated predictive</strong> model.
                Use the Your Strategy controls to upgrade your strategy as new
                methods become available. We'll guide you through the first
                round of upgrades.
              </p>
              <p>
                Under{' '}
                <span style={{ ...color_span(factory_colors[0]) }}>
                  Your Factory
                </span>{' '}
                you can see the state of each of your engines: including the
                sensor data and current maintenance strategy. As you upgrade
                you'll be competing against three other aspiring tycoons:{' '}
                <span style={{ ...color_span(factory_colors[1]) }}>
                  {this.factory_names[1]}
                </span>
                ,{' '}
                <span style={{ ...color_span(factory_colors[2]) }}>
                  {this.factory_names[2]}
                </span>{' '}
                and{' '}
                <span style={{ ...color_span(factory_colors[3]) }}>
                  {this.factory_names[3]}
                </span>
                , to score the largest profit on the scoreboard. They'll be
                upgrading their strategies as well, so you'll need to move fast.
              </p>
              <p>
                The finish line is at 3,000 cycles, though you'll have the
                option to continue playing after that. You can control the speed
                of the cycles and pause at anytime using the controls in the top
                right. Happy turbofanning!
              </p>
              <div style={{ padding: '5px 0' }}>
                <button className="button2 highlight" onClick={this.closeModal}>
                  {this.state.counter === 0
                    ? 'Start playing'
                    : 'Continue playing'}
                </button>
              </div>
            </div>
          </div>
        )
        break
      case 'upgrade':
        modal_content = (
          <div>
            <div style={modal_title_styling}>
              <div>Strategy upgrade available</div>
              {close_button}
            </div>
            <div style={modal_body_styling}>
              <div>
                {upgrade_content}
                <div style={{ padding: '5px 0' }}>
                  <button
                    onClick={this.yesUpgrade}
                    className="button2 highlight"
                  >
                    Yes
                  </button>
                  <span>&nbsp;&nbsp;</span>
                  <button className="button2" onClick={this.closeModal}>
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
        break
      case 'strategy_info':
        modal_content = (
          <div style={{}}>
            <div
              style={{
                ...modal_title_styling,
                textTransform: 'capitalize',
              }}
            >
              <div>{strategy_names[this.info_index]} Strategy Info</div>
              {close_button}
            </div>
            <div style={modal_body_styling}>
              <div>{strategy_info}</div>
            </div>
          </div>
        )
        break

      case 'finish':
        modal_content = (
          <div>
            <div style={modal_title_styling}>
              <div>Finish Line</div>
              {close_button}
            </div>
            <div style={modal_body_styling}>
              <div>
                <p>
                  You've reached the 3,000 cycle finish line. See how your
                  factory did in the final standings. You can continue the
                  simulation by choosing to keep playing below.{' '}
                </p>
                <div
                  style={{
                    border: 'solid 1px black',
                    padding: '10px 10px 5px',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: smaller_font, marginBottom: 5 }}>
                    FINAL STANDINGS:
                  </div>
                  <div>{leaderboard}</div>
                </div>
                <div>
                  <button className="button2" onClick={this.keepPlaying}>
                    Keep playing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
        break
    }

    let to_render = (
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '40px calc(100vh - 40px)',
        }}
      >
        <div
          style={{
            borderBottom: 'solid 1px black',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            overflow: 'hidden',
            lineHeight: 1,
            padding: '0 10px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto auto',
              alignItems: 'center',
              gridColumnGap: 6,
            }}
          >
            <div
              style={{
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                gridColumnGap: 5,
                alignContent: 'center',
              }}
            >
              {false ? (
                <Turbofan
                  width={22}
                  height={22}
                  counter={this.state.counter}
                  speed={this.props.speed}
                  speed_bound={speed_bound}
                />
              ) : null}
              <div style={{ height: 24, lineHeight: '24px', paddingLeft: 3 }}>
                Turbofan Tycoon
              </div>
            </div>
          </div>
          <div />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto auto auto 110px auto',
              gridColumnGap: 5,
              textAlign: 'right',
              alignContent: 'center',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                alignItems: 'center',
                gridColumnGap: 5,
                paddingRight: 5,
              }}
            >
              <div style={{ fontSize: smaller_font }}>SPEED:</div>
              <input
                type="range"
                min={0}
                max={this.props.speeds.length - 1}
                onChange={this.adjustSpeed.bind(this)}
                step={1}
                value={this.props.speed}
                style={{
                  width: '60px',
                }}
              />
            </div>
            <div>
              <button
                className="button2"
                onClick={this.togglePlay}
                style={{ width: '60px' }}
              >
                {this.state.playing ? 'pause' : 'play'}
              </button>
            </div>
            <div>
              <button
                className="button2"
                onClick={this.reset}
                style={{ width: '60px' }}
              >
                reset
              </button>
            </div>
            {this.state.counter > finish_line ? (
              <div>
                <button
                  className="button2"
                  onClick={() => {
                    this.ff(false)
                  }}
                >
                  skip 1,000
                </button>
              </div>
            ) : (
              <div>
                <button
                  className={
                    'button2' +
                    (this.requirements[0][2] === null ? ' disabled' : '')
                  }
                  disabled={this.requirements[0][2] === null}
                  title={
                    this.requirements[0][2]
                      ? null
                      : 'All strategy requirements must be met before you can skip.'
                  }
                  onClick={() =>
                    this.requirements[0][2] === null ? null : this.ff(true)
                  }
                >
                  skip to finish
                </button>
              </div>
            )}
            <div
              style={{
                fontSize: smaller_font,
                textAlign: 'right',
                lineHeight: '24px',
                height: '22px',
              }}
            >
              {commas(render_counter + 1)} CYCLES
            </div>
            <button
              style={{
                position: 'relative',
                background: '#fff',
                padding: '2px 6px',
                border: 'solid 1px #999',
                marginLeft: '5px',
                marginRight: '5px',
              }}
              onClick={() => {
                this.setModalState('intro')
                this.openModal()
              }}
              className="unbutton button-hover"
            >
              info
            </button>
          </div>
        </div>
        {this.ffing ? (
          'fast-forwarding'
        ) : (
          <div style={{ overflow: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `1fr 1fr`,
                padding: 10,
                gridColumnGap: 10,
                background: '#fff',
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
                      <div style={{ padding: '5px 10px 0' }}>
                        <div style={{ marginBottom: 5, fontSize: larger_font }}>
                          ${commas(last(this.factory_profits[fi]))}{' '}
                          {last(this.factory_profits[fi]) >= 0
                            ? 'profit'
                            : 'loss'}
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            fontSize: smaller_font,
                            textTransform: 'uppercase',
                            marginBottom: 10,
                          }}
                        >
                          <div>maintained: {factory_state[1]}</div>
                          <div>failed: {factory_state[2]}</div>
                        </div>
                        <div
                          style={{
                            marginBottom: 5,
                          }}
                        >
                          Your Turbofans:
                        </div>
                        {!this.ffing
                          ? this.factory_engines_empty.map((n, ei) => {
                              let engine_flat_i = fi * factory_number + ei
                              let engine = this.props.engines[
                                this.engines[engine_flat_i]
                              ]
                              let engine_state = this.engine_state[
                                engine_flat_i
                              ]
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
                                    borderRadius: '10px',
                                    borderTopRightRadius: '30px',
                                    borderBottomRightRadius: '30px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: smaller_font,
                                      textTransform: 'uppercase',
                                      padding: '5px 10px 5px',
                                      display: 'grid',
                                      background: background,
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
                                        ? `failed – repairing: ${
                                            this.engine_delays[engine_flat_i][1]
                                          }`
                                        : null}
                                    </div>
                                  </div>
                                  <div style={{ padding: '0 10px 15px' }}>
                                    <div style={{ padding: '5px 0 0' }}>
                                      <Dials
                                        your_strateg={this.state.your_strategy}
                                        counter={render_counter}
                                        this_time={this_time}
                                        keys={this.props.keys}
                                        ranges={this.props.ranges}
                                        engine={engine}
                                        strategy={
                                          this.engine_strategies[engine_flat_i]
                                        }
                                        width={this.props.ww / 2 - 60 - 1}
                                        height={130}
                                        maintaining={maintaining}
                                        repairing={repairing}
                                        engine_rerender={
                                          this.state.engine_rerender
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          : null}
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
                    padding: 1,
                  }}
                >
                  <div
                    style={{
                      padding: '10px 10px 10px',
                      background: 'white',
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
                        padding: '0 0 10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        position: 'relative',
                        alignItems: 'baseline',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: -12,
                          top: 15,
                          height: '1px',
                          background: 'black',
                          width: 12,
                          display: 'none',
                        }}
                      />
                      <div>Your Strategy</div>
                      <div
                        style={{
                          fontSize: smaller_font,
                          cursor: 'pointer',
                          paddingRight: 2,
                        }}
                        onClick={this.props.toggleAuto}
                        title="Autmatically upgrade to best available strategy"
                      >
                        <input
                          type="checkbox"
                          checked={this.props.auto_upgrade}
                        />{' '}
                        auto upgrade
                      </div>
                    </div>
                    <div style={{}}>
                      <div
                        style={{
                          border: 'solid 1px black',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          borderBottom: 'none',
                        }}
                      >
                        {strategy_names.map((n, i) => {
                          let checked =
                            n === last(this.factories_strategies[0])[0]
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
                              className={additional_classes}
                              title={
                                available
                                  ? null
                                  : 'This strategy is not unlocked yet.'
                              }
                              style={{
                                background: available ? 'white' : '#ddd',
                                color: available ? 'black' : '#777',
                                padding: '7px 10px',
                                borderBottom: 'solid 1px black',
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
                              <div style={{ position: 'relative' }}>
                                <div
                                  style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    fontSize: smaller_font,
                                    color: '#000',
                                  }}
                                >
                                  <button
                                    style={{
                                      background: '#fff',
                                      padding: '2px 6px',
                                      border: 'solid 1px #999',
                                    }}
                                    onClick={() => {
                                      this.openInfo(i)
                                    }}
                                    className="unbutton button-hover"
                                  >
                                    info
                                  </button>
                                </div>
                                <span
                                  className="hoverinner"
                                  style={{
                                    cursor: available ? 'pointer' : 'default',
                                  }}
                                  onClick={this.setYourStrategy.bind(
                                    this,
                                    n,
                                    available
                                  )}
                                >
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
                                    style={{
                                      fontWeight: checked || true ? 700 : 400,
                                    }}
                                  >
                                    {n}
                                  </span>
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    border: 'solid 1px black',
                    background: 'white',
                    padding: '10px 10px 0',
                  }}
                >
                  <div
                    style={{
                      marginBottom: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <div>Factory Scoreboard</div>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={this.props.toggleSolo}
                    >
                      <input type="checkbox" checked={this.props.solo_mode} />{' '}
                      solo mode
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <LeaderGraph
                      width={this.props.ww / 2 - 40}
                      height={200}
                      counter={render_counter}
                      factory_profits={this.factory_profits}
                      factories_strategies={this.factories_strategies}
                      solo_mode={this.props.solo_mode}
                    />
                  </div>
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
                </div>
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                textAlign: 'center',
                borderTop: 'solid 1px black',
              }}
            >
              Turbofan Tycoon is a federated learning research prototype by{' '}
              <a href="#">Cloudera Fast Forward Labs</a>
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
              alignItems: 'center',
              overflow: 'auto',
              justifyContent: 'center',
            }}
            onClick={() => {
              {
                /* if (this.state.modal_state === 'finish') {
                this.keepPlaying()
              } else {
                this.closeModal()
              } */
              }
            }}
          >
            <div style={{ padding: '10px 0' }}>
              {this.state.modal_display ? (
                <div
                  style={{
                    background: 'white',
                    width: '600px',
                    border: 'solid 1px black',
                  }}
                  onClick={e => {
                    e.stopPropagation()
                  }}
                >
                  {modal_content}
                </div>
              ) : null}
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
