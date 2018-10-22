import React, { Component } from 'react'
import Canvas from './Canvas'

let spoke_number = 8
let end_space = 14
let max_flame = 30

class Turbofan extends Component {
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
    if (this.ctx && this.props.counter !== prevProps.counter) {
      let { width, height, counter } = this.props

      let cx = width / 2
      let cy = height / 2
      let bigr = (width - 1) / 2
      let curve_dist = this.props.width * 0.2
      let text = 'TURBOFAN'
      let text2 = 'Tycoon'
      ctx.font = '13px sans-serif'
      let text_width = ctx.measureText(text).width
      let end = cx + text_width + end_space
      let randomer = 2 * Math.random()

      ctx.clearRect(0, 0, width + 200, height)

      // ctx.beginPath()
      // ctx.moveTo(end, cy - bigr * 0.75)
      // ctx.quadraticCurveTo(
      //   end + (max_flame / 2) * speed,
      //   cy - bigr * 0.75,
      //   end + max_flame * speed,
      //   cy - 1 + randomer
      // )
      // ctx.quadraticCurveTo(
      //   end + (max_flame / 2) * speed,
      //   cy + bigr * 0.75,
      //   end,
      //   cy + bigr * 0.75
      // )
      // ctx.moveTo(end, cy - bigr * 0.5)
      // ctx.quadraticCurveTo(
      //   end + (max_flame / 4) * speed,
      //   cy - bigr * 0.5,
      //   end + max_flame * 0.6 * speed,
      //   cy - 1 + randomer
      // )
      // ctx.quadraticCurveTo(
      //   end + (max_flame / 4) * speed,
      //   cy + bigr * 0.5,
      //   end,
      //   cy + bigr * 0.5
      // )
      // ctx.stroke()

      // ctx.beginPath()
      // ctx.moveTo(cx, cy - bigr)
      // ctx.lineTo(cx + text_width + end_space, cy - bigr)
      // ctx.quadraticCurveTo(
      //   cx + text_width + end_space + 10,
      //   cy,
      //   cx + text_width + end_space,
      //   cy + bigr
      // )
      // ctx.lineTo(cx, cy + bigr)
      // ctx.fillStyle = 'white'
      // ctx.fill()
      // ctx.stroke()

      ctx.beginPath()
      ctx.ellipse(cx, cy, bigr * 1, bigr, 0, 0, 2 * Math.PI)
      ctx.stroke()
      // ctx.beginPath()
      // ctx.ellipse(cx, cy, bigr * 0.5 + 2.5, bigr + 2.5, 0, 0, 2 * Math.PI)
      // ctx.stroke()
      // ctx.beginPath()
      // // ctx.ellipse(cx, cy, this.props.width * 0.1, 0, 2 * Math.PI)
      // ctx.fill()
      ctx.beginPath()
      for (let i = 0; i < spoke_number; i++) {
        let angle =
          (i / (spoke_number / 2)) * Math.PI +
          (Math.PI / (spoke_number * 1.5)) * counter
        let x = bigr * 1 * Math.cos(angle) + cx
        let y = bigr * Math.sin(angle) + cy
        let further_x = cx + bigr * 1 * Math.cos(angle) * 0.6
        let further_y = cy + bigr * Math.sin(angle) * 0.6
        let perp_angle = Math.atan2(further_y - cy, further_x - cx)
        let offset_x = -Math.sin(perp_angle) * curve_dist * 1 + further_x
        let offset_y = Math.cos(perp_angle) * curve_dist + further_y
        ctx.moveTo(cx, cy)
        ctx.quadraticCurveTo(offset_x, offset_y, x, y)
      }
      ctx.stroke()

      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.ellipse(cx, cy, bigr * 1 * 0.25, bigr * 0.25, 0, 0, 2 * Math.PI)
      ctx.fill()

      // ctx.beginPath()
      // ctx.moveTo(cx + 14, cy + bigr)
      // ctx.lineTo(cx + 14, cy + bigr + 8)
      // ctx.moveTo(cx + 20, cy + bigr * 0.7)
      // ctx.lineTo(cx + 20, cy + bigr + 8)
      // ctx.moveTo(end - 18, cy + bigr)
      // ctx.lineTo(end - 18, cy + bigr + 8)
      // ctx.moveTo(end - 12, cy + bigr * 0.7)
      // ctx.lineTo(end - 12, cy + bigr + 8)
      // ctx.stroke()

      // ctx.fillStyle = 'black'
      // ctx.fillText(text, 25, 20)
      // ctx.font = '15px sans-serif'
      // ctx.fillText(text2, 26 + 84, 20)
    }
  }

  render() {
    return (
      <div style={{}}>
        <Canvas
          width={this.props.width + 130 - 130}
          height={this.props.height}
          getCtx={this.getCtx}
        />
      </div>
    )
  }
}

export default Turbofan
