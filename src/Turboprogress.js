import React, { Component } from 'react'
import Canvas from './Canvas'
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

class Dial extends Component {
  constructor(props) {
    super(props)
    this.ctx = null
    this.getCtx = this.getCtx.bind(this)
  }

  getCtx(canvas) {
    this.ctx = canvas.getContext('2d')
    this.ctx.scale(2, 2)
  }

  componentDidUpdate(prevProps) {
    let ctx = this.ctx
    let this_time = this.props.this_time
    if (prevProps.width !== this.props.width) {
      ctx.scale(2, 2)
    } else if (prevProps.counter !== this.props.counter) {
      let percent = this_time / this.props.width
      ctx.clearRect(0, 0, this.props.width, 20)
      if (this.props.maintaining) {
        ctx.fillStyle = maintain_color
      } else if (this.props.repairing) {
        ctx.fillStyle = repair_color
      } else {
        ctx.fillStyle = '#ddd'
      }
      ctx.fillRect(0, 0, percent * this.props.width, 20)
      ctx.fillStyle = 'black'
      ctx.font = '14px IBM Plex Mono'
      ctx.textBaseline = 'hanging'
      ctx.fillText('Turbofan ', 0, 3.5)
    }
  }

  render() {
    return <Canvas width={this.props.width} height={20} getCtx={this.getCtx} />
  }
}

export default Dial
