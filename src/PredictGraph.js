import React, { Component } from 'react'
import Canvas from './Canvas'
import {
  strategies,
  preventative_threshold,
  strategy_names,
  predictive_threshold,
  maintain_color,
  factory_colors,
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
    let { ranges, keys, engine, this_time, strategy } = this.props
    let value = engine[this_time][strategies[strategy]]
    let ctx = this.state.ctx
    ctx.clearRect(0, 0, this.props.width, this.props.height)
    let x_max = ranges[keys.indexOf('time')][1]
    // Graph drawing
    let x_step = this.props.width / x_max
    let y_set = index => this.props.height / 2
    if (this.props.strategy === strategy_names[1]) {
      ctx.setLineDash([2, 2])
      let x = x_step * this.props.failure_mean - 10
      let height = this.props.height
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
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
      ctx.setLineDash([2, 2])
      let y =
        this.props.height -
        scale(predictive_threshold, range) * this.props.height
      let width = this.props.width
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    for (let i = 0; i < this.props.this_time; i++) {
      ctx.fillRect(x_step * i, y_set(i), 1, 1)
    }
  }

  render() {
    let { engine, this_time, strategy } = this.props
    let value = engine[this_time][strategies[strategy]]
    value = Math.round(value)
    let label = 'CYCLES: ' + value
    if (
      this.props.strategy === strategy_names[2] ||
      this.props.strategy === strategy_names[3]
    ) {
      label = 'PREDICTED REMAINING LIFE: ' + value
    }
    let graph_background = this.props.background || 'white'
    let graph = (
      <Canvas
        width={this.props.width}
        height={this.props.height}
        getCtx={this.getCtx}
        background={graph_background}
      />
    )
    graph = (
      <div style={{ position: 'relative' }}>
        <Canvas
          width={this.props.width}
          height={this.props.height}
          getCtx={this.getCtx}
          background={graph_background}
        />
        <div
          style={{
            position: 'absolute',
            background: 'transparent',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            color: 'black',
            border: 'solid 1px black',
            display: 'grid',
            padding: '4px',
            fontSize: '11px',
            display: 'none',
          }}
        >
          {this.props.strategy === strategy_names[0]
            ? 'repair engine when it fails'
            : null}
          {this.props.strategy === strategy_names[1]
            ? `perform maintenance after ${this.props.failure_mean} cycles`
            : null}
          {this.props.strategy === strategy_names[2]
            ? `perform maintenance when local model's predicted remaining life is less than 10`
            : null}
          {this.props.strategy === strategy_names[3]
            ? `perform maintenance when federated model's predicted remaining life is less than 10`
            : null}
        </div>
      </div>
    )

    return (
      <div>
        <div
          style={{
            fontSize: '12px',
            padding: '0 0 2px',
            fontWeight: 'bold',
          }}
        >
          {this.props.strategy}
        </div>
        <div>{graph}</div>
        <div
          style={{
            fontSize: '10px',
            padding: '4px 0 0',
            height: 17,
          }}
        >
          {label}
        </div>
      </div>
    )
  }
}

export default PredictGraph
