import React, { Component } from 'react'
import { commas } from './Utilties'
import Factory from './Factory'
import Competitors from './Competitors'
import StrategyChooser from './StrategyChoooser'
import { strategy_names } from './Constants'
import Modal from './Modal'

let profits_length = 400
let speed_bound = 10

class Paperclips extends Component {
  constructor(props) {
    super(props)
    this.state = {
      counter: 0,
      speed: 1,
      autoUpgrade: false,
      offer_open: false,
    }

    // Your factory
    this.your_profits = []
    this.your_history = [[strategy_names[0], 0]]
    this.your_explosions = 0
    this.your_maintained = 0
    this.your_federation_offer = false
    this.your_data_scientist = false
    this.your_maintain_status = false
    this.your_explode_status = false

    // Your factory methods
    this.setYourProfit = this.setYourProfit.bind(this)
    this.setYourStrategy = this.setYourStrategy.bind(this)
    this.setYourExplosions = this.setYourExplosions.bind(this)
    this.setYourMaintained = this.setYourMaintained.bind(this)
    this.hireYourDataScientist = this.hireYourDataScientist.bind(this)
    this.makeYourFederationOffer = this.makeYourFederationOffer.bind(this)
    this.setYourMaintainStatus = this.setYourMaintainStatus.bind(this)
    this.setYourExplodeStatus = this.setYourExplodeStatus.bind(this)

    // Strategy chooser offers
    this.your_decisions = [...Array(4).map(n => false)]
    this.setDecision = this.setDecision.bind(this)
    this.offerUpgrade = this.offerUpgrade.bind(this)
    this.closeOffer = this.closeOffer.bind(this)

    // Simulation running
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
  }

  componentDidMount() {
    this.play()
  }

  offerUpgrade() {
    this.pause()
    this.setState({ offer_open: true })
  }

  setDecision(index) {
    this.your_decisions[index] = true
  }

  closeOffer() {
    let me = this
    this.setState({ offer_open: false }, () => {
      me.play()
    })
  }

  play() {
    let count = 0
    let start = () => {
      if (count === this.state.speed) {
        this.setState({ counter: this.state.counter + 1 })
        count = 0
      }
      count++
      if (!this.state.offer_open) {
        this.animating = window.requestAnimationFrame(start)
      }
    }
    this.animating = start()
  }

  setYourProfit(v) {
    if (this.your_profits.length > profits_length - 1) {
      this.your_profits.shift()
    }
    this.your_profits.push(v)
  }

  setYourHistory(entry) {
    this.your_history.push(entry)
  }

  setYourStrategy(strategy_name) {
    this.your_history.push(strategy_name, this.state.counter)
  }

  setYourExplosions() {
    this.your_explosions = this.your_explosions + 1
  }

  setYourMaintained() {
    this.your_maintained = this.your_maintained + 1
  }

  setYourMaintainStatus(status) {
    this.your_maintain_status = status
  }

  setYourExplodeStatus(status) {
    this.your_explode_status = status
  }

  hireYourDataScientist() {
    this.your_data_scientist = true
  }

  makeYourFederationOffer() {
    this.federation_offer = true
  }

  pause() {
    window.cancelAnimationFrame(this.animating)
  }

  adjustSpeed(e) {
    window.cancelAnimationFrame(this.animating)
    this.setState({ speed: speed_bound + 1 - parseInt(e.target.value) }, () => {
      this.play()
    })
  }

  toggleAutoUpgrade() {
    this.setState({ autoUpgrade: !this.state.autoUpgrade })
  }

  render() {
    return (
      <div
        style={{
          display: 'grid',
          gridColumnGap: 10,
          overflow: 'hidden',
          gridTeplateRows: '40px 1fr',
        }}
      >
        <div
          style={{
            borderBottom: 'solid 1px black',
            display: 'flex',
            justifyContent: 'space-between',
            padding: 10,
          }}
        >
          <div>Factory Simulator</div>
          <div style={{ display: 'flex' }}>
            <div style={{ fontSize: '12px' }}>SPEED:</div>
            <input
              type="range"
              min={1}
              max={speed_bound}
              step={1}
              onChange={this.adjustSpeed.bind(this)}
              value={speed_bound + 1 - this.state.speed}
            />
            <div>{speed_bound + 1 - this.state.speed}</div>
            <button onClick={this.play}>play</button>
            <button onClick={this.pause}>pause</button>
            <div style={{ width: 160, textAlign: 'right' }}>
              {commas(this.state.counter)} of 3,000 cycles
            </div>
          </div>
        </div>
        <div
          style={{
            padding: 10,
            height: 'calc(100vh - 40px)',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridColumnGap: 20,
              maxWidth: 1391,
              margin: '0 auto',
            }}
          >
            <div>
              <Factory
                engine_number={4}
                engines={this.props.engines}
                keys={this.props.keys}
                ranges={this.props.ranges}
                counter={this.state.counter}
                visible_engines={true}
                ww={this.props.ww}
                strategy={this.your_strategy}
                setYourProfit={this.setYourProfit}
                setYourHistory={this.setYourHistory}
                setYourExplosions={this.setYourExplosions}
                setYourMaintained={this.setYourMaintained}
                setYourStrategy={this.setYourStrategy}
                hireYourDataScientist={this.hireYourDataScientist}
                makeYourFederationOffer={this.makeYourFederationOffer}
                setYourMaintainStatus={this.setYourMaintainStatus}
                setYourExplodeStatus={this.setYourExplodeStatus}
                simulate={true}
                autoUpgrade={this.state.autoUpgrade}
                your_history={this.your_history}
                offerUpgrade={this.offerUpgrade}
                your_decisions={this.your_decisions}
              />
            </div>
            <div>
              <StrategyChooser
                setYourHistory={this.setYourHistory}
                your_data_scientist={this.your_data_scientist}
                hireDataScientist={this.hireDataScientist}
                strategy={this.your_strategy}
                exploded={this.your_explosions}
                maintained={this.your_maintained}
                failure_mean={this.failure_mean}
                setYourStrategy={this.setYourStrategy}
                federation_offer={this.federation_offer}
                autoUpgrade={this.state.autoUpgrade}
                toggleAutoUpgrade={this.toggleAutoUpgrade.bind(this)}
                counter={this.state.counter}
              />
              <Competitors
                engines={this.props.engines}
                keys={this.props.keys}
                ranges={this.props.ranges}
                counter={this.state.counter}
                competitor_number={3}
                ww={this.props.ww}
                your_strategy={this.your_strategy}
                your_profits={this.your_profits}
                your_history={this.your_history}
                your_explosions={this.your_explosions}
                your_maintained={this.your_maintained}
                your_maintain_status={this.your_maintain_status}
                your_explode_status={this.your_explode_status}
              />
            </div>
          </div>
        </div>
        {this.state.offer_open ? (
          <Modal
            strategy={this.your_strategy}
            setYourStrategy={this.setYourStrategy}
            closeOffer={this.closeOffer}
            setDecision={this.setDecision}
            setYourHistory={this.setYourHistory}
            counter={this.state.counter}
          />
        ) : null}
      </div>
    )
  }
}

export default Paperclips
