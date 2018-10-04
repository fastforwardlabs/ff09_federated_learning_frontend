import React, { Component } from 'react'
import { formatTime, commas } from './Utilties'
import Factory from './Factory'
import Competitors from './Competitors'
import StrategyChooser from './StrategyChoooser'
import { maitenanceCheck, strategies, strategy_names } from './Constants'
import { callbackify } from 'util'

let profits_length = 400

class Paperclips extends Component {
  constructor(props) {
    super(props)
    this.your_strategy = strategy_names[0]
    this.animating = null
    this.state = {
      counter: 0,
    }
    this.your_profits = []
    this.your_average_profits = []
    this.your_history = [[strategy_names[0], 0]]
    this.your_explosions = 0
    this.your_maintained = 0
    this.your_data_scientist = false
    this.setYourProfit = this.setYourProfit.bind(this)
    this.setYourAverageProfit = this.setYourAverageProfit.bind(this)
    this.setYourHistory = this.setYourHistory.bind(this)
    this.setYourStrategy = this.setYourStrategy.bind(this)
    this.setYourExplosions = this.setYourExplosions.bind(this)
    this.setYourMaintained = this.setYourMaintained.bind(this)
    this.hireYourDataScientist = this.hireYourDataScientist.bind(this)
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
  }

  componentDidMount() {
    this.play()
  }

  play() {
    let count = 0
    let start = () => {
      // if (count === 4) {
      this.setState({ counter: this.state.counter + 1 })
      // count = 0
      // }
      // count++
      this.animating = window.requestAnimationFrame(start)
    }
    this.animating = start()
  }

  setYourProfit(v) {
    if (this.your_profits.length > profits_length - 1) {
      this.your_profits.shift()
    }
    this.your_profits.push(v)
  }

  setYourAverageProfit(v) {
    if (this.your_average_profits.length > profits_length - 1) {
      this.your_average_profits.shift()
    }
    this.your_average_profits.push(v)
  }

  setYourHistory(entry) {
    this.your_history.push(entry)
  }

  setYourStrategy(strategy_name) {
    this.your_strategy = strategy_name
  }

  setYourExplosions() {
    this.your_explosions = this.your_explosions + 1
  }

  setYourMaintained() {
    this.your_maintained = this.your_maintained + 1
  }

  hireYourDataScientist() {
    this.your_data_scientist = true
  }

  pause() {
    window.cancelAnimationFrame(this.animating)
  }

  render() {
    return (
      <div
        style={{
          display: 'grid',
          gridColumnGap: 10,
          gridTeplateRows: '40px 1fr',
        }}
      >
        <div
          style={{
            borderBottom: 'solid 1px black',
            display: 'flex',
            justifyContent: 'space-between',
            padding: 10,
            background: 'black',
            color: 'white',
          }}
        >
          <div>Factory Simulator</div>
          <div style={{ display: 'flex' }}>
            <button onClick={this.play}>play</button>
            <button onClick={this.pause}>pause</button>
            <div style={{ width: 100, textAlign: 'right' }}>
              {commas(this.state.counter)} cycles
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridColumnGap: 20,
            padding: 10,
            height: 'calc(100vh - 40px)',
            overflow: 'auto',
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
              setYourAverageProfit={this.setYourAverageProfit}
              setYourHistory={this.setYourHistory}
              setYourExplosions={this.setYourExplosions}
              setYourMaintained={this.setYourMaintained}
              setYourStrategy={this.setYourStrategy}
              hireYourDataScientist={this.hireYourDataScientist}
              simulate={true}
            />
          </div>
          <div>
            <StrategyChooser
              setStrategy={this.setStrategy}
              your_data_scientist={this.your_data_scientist}
              hireDataScientist={this.hireDataScientist}
              strategy={this.your_strategy}
              exploded={this.your_explosions}
              maintained={this.your_maintained}
              failure_mean={this.failure_mean}
              setYourStrategy={this.setYourStrategy}
            />
            <Competitors
              engines={this.props.engines}
              keys={this.props.keys}
              ranges={this.props.ranges}
              counter={this.state.counter}
              competitor_number={3}
              ww={this.props.ww}
              your_profits={this.your_profits}
              your_average_profits={this.your_average_profits}
              your_history={this.your_history}
              your_explosions={this.your_explosions}
              your_maintained={this.your_maintained}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Paperclips
