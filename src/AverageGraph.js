import React, { Component } from 'react'
import Canvas from './Canvas'
import { scale } from './Utilties'
import { min, max } from 'lodash'

class AverageGraph extends Component {
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
    let averages = this.props.averages
    let ctx = this.state.ctx
    let x_step = this.props.width / 200
    if (averages[0][0] !== undefined) {
      let mins = []
      let maxes = []
      for (let i = 0; i < averages.length; i++) {
        mins.push(min(averages[i]))
        maxes.push(max(averages[i]))
      }
      let minned = Math.min(min(mins), 0)
      let maxed = Math.max(max(maxes), 1)
      let range = [minned - maxed * 0.2, maxed * 1.2]
      ctx.clearRect(0, 0, this.props.width, this.props.height)
      ctx.fillStyle = '#ccc'
      ctx.fillRect(
        0,
        this.props.height - scale(0, range) * this.props.height,
        this.props.width,
        1
      )
      for (let i = 0; i < averages.length; i++) {
        ctx.strokeStyle = this.props.colors[i]
        ctx.beginPath()
        for (let j = 0; j < averages[0].length; j++) {
          let x = x_step * j
          let y =
            this.props.height - scale(averages[i][j], range) * this.props.height
          if (j == 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
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

export default AverageGraph
