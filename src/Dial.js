import React, { Component } from 'react'
import Canvas from './Canvas'
import {
  strategies,
  preventative_threshold,
  strategy_names,
  predictive_threshold,
  selected_features,
} from './Constants'
import { scale } from './Utilties'
import { registerPartial } from 'handlebars'

let x_steps = 50

class Dial extends Component {
  constructor(props) {
    super(props)
    this.ctxes = []
    let selectors = selected_features.map(name => name)
    this.selectors = selectors
    this.ranges = selectors.map(name => props.ranges[props.keys.indexOf(name)])
    this.getCtx = this.getCtx.bind(this)
  }

  getCtx(canvas) {
    this.ctxes.push(canvas.getContext('2d'))
  }

  componentDidUpdate(prevProps, prevState) {
    let { ranges, keys, engine, this_time } = this.props

    // Graph drawing
    for (let j = 0; j < selected_features.length; j++) {
      let ctx = this.ctxes[j]
      ctx.clearRect(0, 0, this.props.width, this.props.height)
    }
    let x_step = this.props.width / x_steps
    let last_100 = Math.min(this_time, x_steps)
    for (let i = 0; i < last_100; i++) {
      let adjusted = this_time - last_100 + i
      for (let j = 0; j < selected_features.length; j++) {
        let selector = this.selectors[j]
        let range = this.ranges[j]
        let ctx = this.ctxes[j]
        ctx.fillRect(
          x_step * i,
          this.props.height -
            scale(engine[adjusted][selector], range) * this.props.height,
          x_step,
          1
        )
      }
    }
  }

  render() {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 40px)',
          gridColumnGap: 10,
          gridRowGap: 10,
        }}
      >
        {selected_features.map(c => (
          <div>
            <div style={{ fontSize: '10px', paddingBottom: 3 }}>{c}</div>
            <Canvas
              width={this.props.width}
              height={this.props.height}
              getCtx={this.getCtx}
            />
            <div style={{ fontSize: '10px', paddingTop: 3, display: 'none' }}>
              {this.props.engine[this.props.this_time][c]}
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default Dial
