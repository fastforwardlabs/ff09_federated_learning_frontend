import React, { Component } from 'react'
import Canvas from './Canvas'
import { scale, commas } from './Utilties'
import { min, max } from 'lodash'
import {
  profit_array_length,
  factory_colors,
  finish,
  money_finish,
} from './Constants'

class LeaderGraph extends Component {
  constructor(props) {
    super(props)
    this.ctx = null
    this.getCtx = this.getCtx.bind(this)
  }

  getCtx(canvas) {
    this.ctx = canvas.getContext('2d', { alpha: false })
    this.ctx.scale(2, 2)
  }

  componentDidUpdate(prevProps, prevState) {
    let new_profit_array_length = this.props.new_profit_array_length
    if (prevProps.width !== this.props.width) {
      this.ctx.scale(2, 2)
    } else if (this.ctx) {
      let { factory_profits } = this.props
      let ctx = this.ctx

      ctx.clearRect(0, 0, this.props.width, this.props.height)

      // ctx.fillStyle = '#eee'
      // ctx.fillRect(0, 0, this.props.width, this.props.height)

      let adj_width = this.props.width

      let x_step = 1
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
      maxed = Math.max(maxed, 500000)
      let additional = Math.max(Math.abs(minned * 0.3), Math.abs(maxed * 0.3))
      let range = [minned - additional, maxed + additional]

      let intervals = 250000
      let min_rounded =
        Math.round(range[0] / intervals) * intervals - intervals * 2
      let max_rounded =
        Math.round(range[1] / intervals) * intervals + intervals * 2

      ctx.lineWidth = 1
      ctx.strokeStyle = '#ddd'
      for (let i = min_rounded; i < max_rounded; i = i + intervals) {
        if (i !== money_finish) {
          ctx.beginPath()
          let y = this.props.height - scale(i, range) * this.props.height
          ctx.moveTo(0, y)
          ctx.lineTo(adj_width + 0, y)
          ctx.stroke()
        }
      }

      ctx.font = '11px IBM Plex Mono'

      if (range[1] > money_finish) {
        // Always try and draw money finish
        ctx.lineWidth = 1
        ctx.strokeStyle = '#999'
        let y =
          this.props.height - scale(money_finish, range) * this.props.height
        ctx.moveTo(0, y)
        ctx.lineTo(adj_width + 0, y)
        ctx.stroke()
        ctx.fillStyle = 'black'
        let text = 'Finish line: $' + commas(money_finish)
        let width = ctx.measureText(text).width
        ctx.fillText(text, this.props.width - (width + 4), y + 4 + 8)
      } else {
        ctx.fillStyle = '#bbb'
        let text = '↑ Finish line: $' + commas(money_finish)
        let width = ctx.measureText(text).width
        ctx.fillStyle = '#ddd'
        ctx.fillRect(this.props.width - (width + 8), 0 - 1, width + 8, 4 + 12)
        ctx.fill()
        ctx.fillStyle = '#777'
        ctx.fillText(text, this.props.width - (width + 4), 4 + 8 - 1)
      }

      ctx.lineWidth = 1
      let y0 = this.props.height - scale(0, range) * this.props.height
      ctx.strokeStyle = '#bbb'
      ctx.beginPath()
      ctx.moveTo(0 + 0, y0)
      ctx.lineTo(adj_width + 8, y0)
      ctx.stroke()
      ctx.strokeStyle = 'black'

      let timer = Math.min(this.props.counter, new_profit_array_length)
      ctx.lineWidth = 2
      let length_work = factory_profits.length
      if (this.props.solo_mode) length_work = 1
      for (let i = 0; i < length_work; i++) {
        let ri = length_work - 1 - i
        ctx.strokeStyle = factory_colors[ri]
        ctx.beginPath()
        for (let j = 0; j < timer; j++) {
          let x = j
          let y =
            this.props.height -
            scale(factory_profits[ri][j], range) * this.props.height
          if (j == 0) {
            ctx.moveTo(x + 0, y)
          } else {
            ctx.lineTo(x + 0, y)
          }
        }
        ctx.stroke()

        ctx.fillStyle = factory_colors[ri]
        let offset = this.props.counter - timer
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
          let last_x = timer - 2 + 0
          let last_y =
            this.props.height - scale(last_profit, range) * this.props.height
          let text = '$' + commas(last_profit)
          let width = ctx.measureText(text).width
          ctx.fillStyle = factory_colors[ri]
          ctx.fillRect(last_x, last_y - 16 / 2, width + 8, 17)
          ctx.fillStyle = 'white'
          ctx.fillText(text, last_x + 4, last_y + 4)
        }
      }
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
