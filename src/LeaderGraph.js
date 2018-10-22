import React, { Component } from 'react'
import Canvas from './Canvas'
import { scale, commas } from './Utilties'
import { min, max } from 'lodash'
import { profit_array_length, factory_colors, finish } from './Constants'

class LeaderGraph extends Component {
  constructor(props) {
    super(props)
    this.ctx = null
    this.getCtx = this.getCtx.bind(this)
  }

  getCtx(canvas) {
    this.ctx = canvas.getContext('2d')
    this.ctx.scale(2, 2)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.width !== this.props.width) {
      this.ctx.scale(2, 2)
    } else if (this.ctx) {
      let { factory_profits } = this.props
      let ctx = this.ctx
      let steps = profit_array_length
      let x_step = this.props.width / (steps + steps * 0.25)
      let mins = []
      let maxes = []
      for (let i = 0; i < factory_profits.length; i++) {
        mins.push(min(factory_profits[i]))
        maxes.push(max(factory_profits[i]))
      }
      let minned = min(mins)
      let maxed = max(maxes)
      if (this.props.solo_mode) {
        minned = mins[0]
        maxed = maxes[0]
      }
      let additional = Math.max(Math.abs(minned * 0.1), Math.abs(maxed * 0.1))
      let range = [minned - additional, maxed + additional]

      ctx.lineWidth = 1
      ctx.clearRect(0, 0, this.props.width, this.props.height)
      let y0 = this.props.height - scale(0, range) * this.props.height
      ctx.strokeStyle = '#aaa'
      ctx.beginPath()
      ctx.moveTo(0, y0)
      ctx.lineTo(this.props.width, y0)
      ctx.stroke()
      ctx.strokeStyle = 'black'

      let adjusted = Math.min(this.props.counter, steps)
      let offset = this.props.counter - adjusted
      let far_x = offset + Math.floor(this.props.width / x_step)

      if (finish < far_x) {
        ctx.setLineDash([2, 2])
        let x = (finish - offset) * x_step
        ctx.beginPath()
        ctx.moveTo(x, 1)
        ctx.lineTo(x, this.props.height - 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      ctx.lineWidth = 2
      let length_work = factory_profits.length
      if (this.props.solo_mode) length_work = 1
      for (let i = 0; i < length_work; i++) {
        let ri = length_work - 1 - i
        ctx.strokeStyle = factory_colors[ri]
        ctx.beginPath()
        for (let j = 0; j < factory_profits[0].length; j++) {
          let x = x_step * j
          let y =
            this.props.height -
            scale(factory_profits[ri][j], range) * this.props.height
          if (j == 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()

        ctx.fillStyle = factory_colors[ri]
        let last_profit = factory_profits[ri][factory_profits[ri].length - 1]
        let history = this.props.factories_strategies[ri]
        for (let j = 0; j < history.length; j++) {
          let entry = history[j]
          if (entry[1] >= offset) {
            let x = x_step * (entry[1] - offset)
            let y =
              this.props.height -
              scale(factory_profits[ri][entry[1] - offset], range) *
                this.props.height
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, 2 * Math.PI)
            ctx.fill()
          }
        }

        if (last_profit !== undefined) {
          let last_x = x_step * factory_profits[ri].length
          let last_y =
            this.props.height - scale(last_profit, range) * this.props.height
          let text = '$' + commas(last_profit)
          let width = ctx.measureText(text).width
          ctx.fillRect(last_x - 4, last_y - 9, width + 8, 17)
          ctx.fillStyle = 'white'
          ctx.fillText(text, last_x, last_y + 3)
        }
      }
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 1
      ctx.strokeRect(0.5, 0.5, this.props.width - 1, this.props.height - 1)
    }
  }

  render() {
    return (
      <Canvas
        width={this.props.width}
        height={this.props.height}
        getCtx={this.getCtx}
      />
    )
  }
}

export default LeaderGraph
