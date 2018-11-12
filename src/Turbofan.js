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
    this.state = {
      counter: null,
    }
  }

  play() {
    window.cancelAnimationFrame(this.animating)
    let start = () => {
      this.setState({ counter: this.state.counter + 0.08 })
      this.animating = window.requestAnimationFrame(start)
    }
    this.animating = window.requestAnimationFrame(start)
  }

  componentDidMount() {
    this.play()
  }

  getCtx(canvas) {
    this.ctx = canvas.getContext('2d')
    this.ctx.scale(2, 2)
  }

  componentDidUpdate() {
    if (this.ctx) {
      let ctx = this.ctx
      let { width, height } = this.props
      let counter = this.state.counter

      let cx = width / 2
      let cy = height / 2
      let bigr = (width - 2) / 2
      let curve_dist = 10

      ctx.save()
      ctx.clearRect(0, 0, width, height)

      // turbine
      ctx.beginPath()
      ctx.ellipse(cx, cy, bigr, bigr, 0, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(cx, cy, 6, 6, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      for (let i = 0; i < spoke_number; i++) {
        let angle = (i / (spoke_number / 2)) * Math.PI + counter
        let x = bigr * 1 * Math.cos(angle) + cx
        let y = bigr * 1 * Math.sin(angle) + cy
        let further_x = cx + bigr * 1 * Math.cos(angle) * 0.75
        let further_y = cy + bigr * Math.sin(angle) * 0.75
        let perp_angle = Math.atan2(further_y - cy, further_x - cx)
        let offset_x = -Math.sin(perp_angle) * curve_dist + further_x
        let offset_y = Math.cos(perp_angle) * curve_dist + further_y
        // ctx.beginPath();
        // ctx.arc(offset_x, offset_y, 5, 0, 2 * Math.PI);
        // ctx.fill();
        ctx.moveTo(cx, cy)
        ctx.quadraticCurveTo(offset_x, offset_y, x, y)
      }
      ctx.stroke()

      ctx.stroke()
      ctx.restore()
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
