import React, { Component } from 'react'
import Canvas from './Canvas'
import {
  selected_features,
  strategies,
  predictive_threshold,
  preventative_threshold,
  strategy_names,
  maintain_color,
  repair_color,
} from './Constants'
import { scale } from './Utilties'

let steps = 50
let x_padding = 14
let y_padding = 6
let rows = 2
let columns = selected_features.length / rows
let text_height = 20
let predict_width = 200
let cycle_max = 525

class Dial extends Component {
  constructor(props) {
    super(props)
    this.ctx = null
    this.ranges = selected_features.map(
      name => props.ranges[props.keys.indexOf(name)]
    )
    this.predict_max = Math.max(
      props.ranges[props.keys.indexOf(strategies[strategy_names[2]])][1],
      props.ranges[props.keys.indexOf(strategies[strategy_names[3]])][1]
    )

    this.getCtx = this.getCtx.bind(this)
  }

  getCtx(canvas) {
    this.ctx = canvas.getContext('2d')
    this.ctx.scale(2, 2)
  }

  componentDidUpdate(prevProps) {
    if (this.ctx && this.props.counter !== prevProps.counter) {
      let { ranges, keys } = this.props
      let predict_x_step = predict_width / 225
      let this_time = this.props.this_time
      let cycles = this.props.engine[this_time].time
      let this_width =
        (this.props.width -
          x_padding * (columns - 1) -
          predict_width -
          x_padding -
          2) /
        columns
      let this_height =
        (this.props.height -
          y_padding * (rows - 1) -
          rows * text_height -
          text_height -
          2) /
        rows
      // let x_step = this_width / steps
      let x_step = predict_x_step
      let steps = Math.floor(this_width / x_step)
      let ctx = this.ctx
      ctx.font = '11px sans-serif'
      ctx.clearRect(0, 0, this.props.width, this.props.height)
      for (let i = 0; i < selected_features.length; i++) {
        let selector = selected_features[i]
        let range = this.ranges[i]
        let timer = Math.min(this_time, steps)
        let x_offset = (this_width + x_padding) * (i % columns) + 1
        let y_offset =
          text_height * (Math.floor(i / columns) + 1) +
          (this_height + y_padding) * Math.floor(i / columns) +
          1
        ctx.fillText(selector, x_offset, y_offset - 6)
        ctx.strokeRect(x_offset, y_offset, this_width, this_height)
        for (let j = 0; j < timer; j++) {
          let adjusted = this_time - timer + j + 1
          ctx.fillRect(
            x_step * j + x_offset,
            this_height -
              scale(this.props.engine[adjusted][selector], range) *
                this_height +
              y_offset,
            1,
            1
          )
        }
      }
      if (this.props.strategy) {
        ctx.font = 'bold 11px sans-serif'
        ctx.fillText(
          this.props.strategy,
          this.props.width - predict_width - 1,
          text_height + 1 - 6
        )
        ctx.font = '11px sans-serif'
      }
      let label_text
      if (
        this.props.strategy === 'preventative' ||
        this.props.strategy === 'corrective'
      ) {
        label_text = 'Cycles: ' + this.props.engine[this.props.this_time].time
      } else {
        let value = this.props.engine[this.props.this_time][
          strategies[this.props.strategy]
        ]
        value = Math.round(value)
        label_text = 'Predicted remaining: ' + value
      }
      ctx.fillText(
        label_text,
        this.props.width - predict_width - 1,
        this.props.height + 1 - 6
      )

      let timer = Math.min(cycles, 225)
      let adjusted_base = this_time - timer + 1
      let cycling = timer === 190
      let predict_height = this.props.height - text_height * 2 - 2
      let predict_x = this.props.width - predict_width - 1
      let predict_y = 1 + text_height
      if (this.props.maintaining) {
        ctx.fillStyle = maintain_color
        ctx.fillRect(predict_x, predict_y, predict_width, predict_height)
        ctx.fillStyle = 'black'
      } else if (this.props.repairing) {
        ctx.fillStyle = repair_color
        ctx.fillRect(predict_x, predict_y, predict_width, predict_height)
        ctx.fillStyle = 'black'
      }
      ctx.strokeRect(predict_x, predict_y, predict_width, predict_height)
      let predict_y_set = n => this.props.height / 2
      let threshold_check = () => false
      if (this.props.strategy === strategy_names[1]) {
        threshold_check = (x, y) => {
          return x >= preventative_threshold
        }
        ctx.setLineDash([2, 2])
        let x =
          -adjusted_base +
          predict_x +
          predict_x_step * preventative_threshold -
          1
        ctx.beginPath()
        ctx.moveTo(x, predict_y)
        ctx.lineTo(x, predict_y + predict_height)
        ctx.stroke()
      }
      if (
        this.props.strategy === strategy_names[2] ||
        this.props.strategy === strategy_names[3]
      ) {
        let range = [-20, this.predict_max - 50]
        predict_y_set = index => {
          return (
            predict_y +
            predict_height -
            scale(this.props.engine[index][strategies[this.props.strategy]], [
              range[0],
              range[1],
            ]) *
              predict_height
          )
        }
        threshold_check = (x, y) => {
          return y <= predictive_threshold
        }
        ctx.setLineDash([2, 2])
        let y =
          predict_y +
          predict_height -
          scale(predictive_threshold, range) * predict_height
        ctx.beginPath()
        ctx.moveTo(predict_x, y)
        ctx.lineTo(predict_x + predict_width, y)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.strokeStyle = '#aaa'
        let y0 = predict_y + predict_height - scale(0, range) * predict_height
        ctx.beginPath()
        ctx.moveTo(predict_x, y0)
        ctx.lineTo(predict_x + predict_width, y0)
        ctx.stroke()
        ctx.strokeStyle = 'black'
      }
      ctx.setLineDash([])
      for (let i = 0; i < timer; i++) {
        let adjusted = adjusted_base + i
        let this_cycles = this.props.engine[adjusted].time
        let x = predict_x + predict_x_step * i
        let y = predict_y_set(adjusted)
        let size = [1, 1]
        if (
          threshold_check(
            this_cycles,
            this.props.engine[adjusted][strategies[this.props.strategy]]
          )
        ) {
          x -= 2
          y -= 2
          size = [4, 4]
        }
        if (y >= predict_y && y <= predict_y + predict_height) {
          ctx.fillRect(x, y, size[0], size[1])
        }
      }
    }
  }

  render() {
    return (
      <div>
        <Canvas
          width={this.props.width}
          height={this.props.height}
          getCtx={this.getCtx}
        />
      </div>
    )
  }
}

export default Dial
