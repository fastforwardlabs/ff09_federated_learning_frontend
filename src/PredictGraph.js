import React, { Component } from 'react'
import Canvas from './Canvas'
import {
  strategies,
  preventative_threshold,
  strategy_names,
  predictive_threshold,
} from './Constants'
import { scale } from './Utilties'

class PredictGraph extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ctx: null,
    }
    this.getCtx = this.getCtx.bind(this)
  }

  getCtx(canvas) {
    this.setState({
      ctx: canvas.getContext('2d'),
    })
  }

  componentDidUpdate(prevProps, prevState) {
    let { ranges, keys, engine } = this.props
    let ctx = this.state.ctx
    ctx.clearRect(0, 0, this.props.width, this.props.height)
    let x_max = ranges[keys.indexOf('time')][1]
    // Graph drawing
    let x_step = this.props.width / x_max
    let y_set = index => this.props.height / 2
    if (this.props.strategy === strategy_names[1]) {
      ctx.fillStyle = 'orange'
      ctx.fillRect(
        x_step * this.props.failure_mean - 10,
        0,
        1,
        this.props.height
      )
    }
    if (
      this.props.strategy === strategy_names[2] ||
      this.props.strategy === strategy_names[3]
    ) {
      let max = Math.max(
        ranges[keys.indexOf(strategies[strategy_names[2]])][1],
        ranges[keys.indexOf(strategies[strategy_names[3]])][1]
      )
      let range = [0, max]
      y_set = index => {
        return (
          this.props.height -
          scale(engine[index][strategies[this.props.strategy]], range) *
            this.props.height
        )
      }
      ctx.fillStyle = 'orange'
      ctx.fillRect(
        0,
        this.props.height -
          scale(predictive_threshold, range) * this.props.height,
        this.props.width,
        1
      )
    }
    for (let i = 0; i < this.props.this_time; i++) {
      ctx.fillStyle = 'black'
      ctx.fillRect(x_step * i, y_set(i), x_step, 1)
    }
  }

  render() {
    let { engine, this_time, strategy } = this.props
    let value
    value = engine[this_time][strategies[strategy]]
    return (
      <div>
        <div style={{ fontSize: '10px', color: '#999' }}>
          {this.props.strategy}
        </div>
        <Canvas
          width={this.props.width}
          height={this.props.height}
          getCtx={this.getCtx}
        />
        <div style={{ fontSize: '10px', color: '#999' }}>{value}</div>
      </div>
    )
  }
}

export default PredictGraph
