import React, { Component } from 'react'
import Canvas from './Canvas'
import { scale, commas } from './Utilties'
import { min, max } from 'lodash'

class ProfitGraph extends Component {
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
    let x_step = this.props.width / (400 + 400 * 0.25)
    if (averages[0][0] !== undefined) {
      let mins = []
      let maxes = []
      for (let i = 0; i < averages.length; i++) {
        mins.push(min(averages[i]))
        maxes.push(max(averages[i]))
      }
      let minned = min(mins)
      let maxed = max(maxes)
      let additional = Math.max(Math.abs(minned * 0.2), Math.abs(maxed * 0.2))
      let range = [minned - additional, maxed + additional]
      ctx.clearRect(0, 0, this.props.width, this.props.height)
      ctx.fillStyle = '#ccc'
      ctx.fillRect(
        0,
        this.props.height - scale(0, range) * this.props.height,
        this.props.width,
        1
      )
      for (let i = 0; i < averages.length; i++) {
        let ri = averages.length - 1 - i
        ctx.strokeStyle = this.props.colors[ri]
        if (ri === 0) {
          ctx.lineWidth = 2
        } else {
          ctx.lineWidth = 2
        }
        ctx.beginPath()
        for (let j = 0; j < averages[0].length; j++) {
          let x = x_step * j
          let y =
            this.props.height -
            scale(averages[ri][j], range) * this.props.height
          if (j == 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
        ctx.fillStyle = this.props.colors[ri]
        let last_average = averages[ri][averages[ri].length - 1]
        if (last_average !== undefined) {
          let last_x = x_step * averages[ri].length
          let last_y =
            this.props.height - scale(last_average, range) * this.props.height
          let text = '$' + commas(last_average)
          // text = this.props.strategies[ri]
          let width = ctx.measureText(text).width
          ctx.fillRect(last_x, last_y - 11, width + 8, 20)
          ctx.fillStyle = 'white'
          ctx.fillText(text, last_x + 4, last_y + 3)
        }
        ctx.fillStyle = this.props.colors[ri]
        let history = this.props.histories[ri]
        let adjusted = Math.min(this.props.counter, 400)
        let offset = this.props.counter - adjusted
        for (let j = 0; j < history.length; j++) {
          let entry = history[j]
          if (entry[1] >= offset) {
            let x = x_step * (entry[1] - offset)
            let y =
              this.props.height -
              scale(averages[ri][entry[1] - offset], range) * this.props.height
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, 2 * Math.PI)
            ctx.fill()
          }
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

export default ProfitGraph
