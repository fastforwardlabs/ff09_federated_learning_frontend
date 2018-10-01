import React, { Component } from 'react'
import { formatTime } from './Utilties'
import Factory from './Factory'
import Competitors from './Competitors'
import StrategyChooser from './StrategyChoooser'
import { maitenanceCheck, strategies, strategy_names } from './Constants'

class Paperclips extends Component {
  constructor(props) {
    super(props)
    this.your_strategy = strategy_names[0]
    this.animating = null
    this.state = {
      counter: 0,
    }
    this.setYourStrategy = this.setYourStrategy.bind(this)
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
  }

  componentDidMount() {
    this.play()
  }

  setYourStrategy(strategy_name) {
    this.your_strategy = strategy_name
  }

  play() {
    let count = 0
    let start = () => {
      if (count === 4) {
        this.setState({ counter: this.state.counter + 1 })
        count = 0
      }
      count++
      this.animating = window.requestAnimationFrame(start)
    }
    this.animating = start()
  }

  pause() {
    window.cancelAnimationFrame(this.animating)
  }

  render() {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridColumnGap: 10,
        }}
      >
        <div>
          <div>{formatTime(this.state.counter)}</div>
          <button onClick={this.play}>play</button>
          <button onClick={this.pause}>pause</button>
          <Factory
            engine_number={4}
            engines={this.props.engines}
            keys={this.props.keys}
            ranges={this.props.ranges}
            counter={this.state.counter}
            visible_engines={true}
            ww={this.props.ww}
            strategy={this.your_strategy}
          />
        </div>
        <div>
          <Competitors
            engines={this.props.engines}
            keys={this.props.keys}
            ranges={this.props.ranges}
            counter={this.state.counter}
            competitor_number={6}
            ww={this.props.ww}
          />
        </div>
      </div>
    )
  }
}

export default Paperclips
