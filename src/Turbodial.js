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
  maintained_delay,
  exploded_delay,
  factory_colors,
  profit_color,
  getKey,
} from './Constants'
import { scale } from './Utilties'

let x_offset = 4
let line_offset = -5
let line_height = 21
let height = line_height * 8
let predict_width = 260

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
    this.ctx = canvas.getContext('2d', { alpha: false })
    this.ctx.scale(2, 2)
  }

  componentDidUpdate(prevProps) {
    let ctx = this.ctx
    let ribbon = this.props.ribbon
    let width = this.props.width
    let this_time = this.props.this_time
    if (prevProps.width !== this.props.width) {
      ctx.scale(2, 2)
    } else if (
      (prevProps.counter !== this.props.counter ||
        prevProps.strategy !== this.props.strategy) &&
      ctx
    ) {
      ctx.clearRect(0, 0, this.props.width, height)
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, this.props.width, height)

      // if (this.props.maintaining) {
      //   ctx.fillStyle = maintain_color
      //   ctx.fillRect(0, 0, this.props.width, line_height / 2)
      // } else if (this.props.repairing) {
      //   ctx.fillStyle = repair_color
      //   ctx.fillRect(0, 0, this.props.width, line_height / 2)
      // }

      let last = 0
      for (let i = 0; i < ribbon.length; i++) {
        let ex = ribbon[i]
        if (ex !== 0) last = ex
        let fill = ['#ddd', maintain_color, repair_color][ex]
        ctx.fillStyle = fill
        ctx.fillRect(i, 0, 1, line_height)
      }

      for (let j = 0; j < this.props.your_factories_strategies.length; j++) {
        let occured = this.props.your_factories_strategies[j][1]
        if (occured >= this.props.counter - (ribbon.length - 1)) {
          // ctx.fillStyle = '#aaa'
          ctx.fillStyle = '#999'
          // ctx.fillStyle = factory_colors[0]
          ctx.strokeStyle = 'transparent'
          ctx.beginPath()
          let x = occured - (this.props.counter - (ribbon.length - 1))
          let y = 0 + line_height / 2
          // ctx.moveTo(x - 6, y)
          // ctx.lineTo(x, y - 6)
          // ctx.lineTo(x + 6, y)
          // ctx.lineTo(x, y + 6)
          ctx.arc(x, y, 5, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
        }
      }

      ctx.fillStyle = 'black'

      if (Math.floor(ribbon.length - 1) === Math.floor(this.props.width - 12)) {
        ctx.beginPath()
        ctx.moveTo(ribbon.length - 3, 0 + line_height / 2)
        ctx.lineTo(ribbon.length + 2, 0 + line_height / 2 - 3)
        ctx.lineTo(ribbon.length + 2, 0 + line_height / 2 + 3)
        ctx.fill()
      }

      let last_text = ''
      // if (last === 1 && last !== ribbon[ribbon.length - 1])
      //   last_text = ' since maintenance'
      // if (last === 2 && last !== ribbon[ribbon.length - 1])
      // last_text = ' since failure'

      ctx.font = '14px IBM Plex Mono'

      ctx.fillText(
        'Turbofan ' + (this.props.ei + 1),
        x_offset,
        line_height + line_offset
      )
      let timer_text =
        'Current run: ' + this.props.this_time + ' hours' + last_text
      if (this.props.maintaining) {
        timer_text += ' – maintenance: ' + this.props.delays[0] + ' hour delay'
      } else if (this.props.repairing) {
        timer_text += ' – failure: ' + this.props.delays[1] + ' hour delay'
      }
      ctx.fillText(timer_text, x_offset, line_height * 2 + line_offset)

      ctx.font = '12px IBM Plex Mono'

      ctx.fillText('Sensors:', x_offset, line_height * 3 + line_offset)

      let strategy_text_width = ctx.measureText('Strategy:').width
      ctx.fillText(
        'Strategy:',
        x_offset + (this.props.width - predict_width),
        line_height * 3 + line_offset
      )

      for (let i = 0; i < selected_features.length; i++) {
        let c_num = 4
        let row = Math.floor(i / c_num)
        let column = i % c_num
        let selector = selected_features[i]
        let range = this.ranges[i]
        let column_space = Math.floor(
          (this.props.width - predict_width - 8) / 4
        )
        let x = x_offset + column_space * column
        let y = line_height * 4 + line_height * 1.25 * row
        ctx.fillStyle = '#ddd'
        // ctx.fillRect(
        //   x + 1,
        //   y - line_height - line_offset + 1,
        //   column_space - 2,
        //   line_height - 2
        // )

        ctx.lineWidth = 1
        let sensor_color = '#aaa'
        ctx.strokeStyle = sensor_color
        ctx.beginPath()
        let timer = Math.min(this_time, column_space - 12)
        for (let j = 0; j < timer; j++) {
          let adjusted = this_time - timer + j + 1

          let yer =
            line_height * 1.25 -
            scale(getKey(this.props.engine[adjusted], selector), range) *
              (line_height * 1.25) +
            y -
            line_height
          if (j === 0) {
            ctx.moveTo(j + x, yer)
          } else {
            ctx.lineTo(j + x, yer)
          }
        }
        ctx.stroke()

        ctx.fillStyle = sensor_color
        let yer =
          line_height * 1.25 -
          scale(getKey(this.props.engine[this_time], selector), range) *
            (line_height * 1.25) +
          y -
          line_height
        ctx.fillRect(timer + x - 2, yer - 2, 4, 4)

        // let value_text = this.props.engine[this_time][selector]

        ctx.fillStyle = '#000'
        // TODO: split these loops up
        if (true) {
          ctx.fillText(selector, x, y + line_offset)
        }

        // ctx.fillStyle = '#aaa'
        // let value_text = this.props.engine[this_time][selector]
        // let mn = ctx.measureText(value_text).width
        // ctx.fillText(value_text, x + 4 + column_space - mn - 8, y)
      }

      // PREDICT GRAPH
      if (this.props.strategy) {
        ctx.font = 'bold 12px IBM Plex Mono'
        ctx.fillText(
          this.props.strategy,
          x_offset + this.props.width - predict_width + strategy_text_width + 8,
          line_height * 3 + line_offset
        )
        ctx.font = '12px IBM Plex Mono'

        let graph_start_x = x_offset + this.props.width - predict_width
        let graph_start_y = line_height * 3
        let graph_height = line_height * 1.25 * 3
        let adj_predict_width = predict_width - 16

        let label_text
        if (
          this.props.strategy === 'preventative' ||
          this.props.strategy === 'corrective'
        ) {
          label_text =
            'Hours: ' + getKey(this.props.engine[this.props.this_time], 'time')
        } else {
          let value = getKey(
            this.props.engine[this.props.this_time],
            strategies[this.props.strategy]
          )

          value = Math.round(value)
          label_text = 'Predicted remaining: ' + value + ' hours'
        }

        ctx.lineWidth = 1

        let predict_y_set = n => graph_height / 2

        let threshold_check = () => false

        if (this.props.strategy === strategy_names[1]) {
          threshold_check = (x, y) => {
            return x >= preventative_threshold
          }
        } else if (
          this.props.strategy === strategy_names[2] ||
          this.props.strategy === strategy_names[3]
        ) {
          threshold_check = (x, y) => {
            return y <= predictive_threshold
          }
          let range = [0, this.predict_max]
          predict_y_set = index => {
            return (
              graph_height -
              scale(
                getKey(
                  this.props.engine[index],
                  strategies[this.props.strategy]
                ),
                [range[0], range[1]]
              ) *
                graph_height
            )
          }
        }

        let predict_timer = Math.min(this_time, adj_predict_width)

        if (this.props.repairing) {
          let j = predict_timer - 1
          let adjusted = this_time - predict_timer + j + 1
          let x = graph_start_x + j
          let y = predict_y_set(adjusted) + graph_start_y

          ctx.fillStyle = repair_color
          ctx.fillRect(
            x - line_height / 2,
            y - line_height / 2,
            line_height,
            line_height
          )
        } else if (this.props.maintaining) {
          let j = predict_timer - 1
          let adjusted = this_time - predict_timer + j + 1
          let x = graph_start_x + j
          let y = predict_y_set(adjusted) + graph_start_y

          ctx.fillStyle = maintain_color
          ctx.fillRect(
            x - line_height / 2,
            y - line_height / 2,
            line_height,
            line_height
          )
        }

        // predict graph accessories
        ctx.strokeStyle = '#bbb'
        if (
          this.props.strategy === 'preventative' ||
          this.props.strategy === 'corrective'
        ) {
          ctx.beginPath()
          ctx.moveTo(graph_start_x, graph_start_y + graph_height / 2)
          ctx.lineTo(
            graph_start_x + adj_predict_width,
            graph_start_y + graph_height / 2
          )
          ctx.stroke()

          if (this.props.strategy === 'preventative') {
            ctx.setLineDash([2, 2])
            let adjusted = this_time - predict_timer + 1
            let x = graph_start_x + preventative_threshold - adjusted - 1
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(x, graph_start_y + predict_y_set() - graph_height / 4)
            ctx.lineTo(x, graph_start_y + predict_y_set() + graph_height / 4)
            ctx.stroke()
            ctx.setLineDash([])
          }

          ctx.lineWidth = 2
        } else {
          ctx.beginPath()
          ctx.moveTo(graph_start_x, graph_start_y)
          ctx.lineTo(graph_start_x, graph_start_y + graph_height)
          ctx.lineTo(
            graph_start_x + adj_predict_width,
            graph_start_y + graph_height
          )
          ctx.stroke()

          let range = [0, this.predict_max]
          ctx.lineWidth = 2
          ctx.setLineDash([2, 2])
          let y =
            graph_start_y +
            graph_height -
            scale(predictive_threshold, range) * graph_height
          ctx.beginPath()
          ctx.moveTo(graph_start_x, y)
          ctx.lineTo(graph_start_x + adj_predict_width, y)
          ctx.stroke()
          ctx.setLineDash([])

          ctx.lineWidth = 1
        }

        ctx.beginPath()
        for (let j = 0; j < predict_timer; j++) {
          let adjusted = this_time - predict_timer + j + 1
          let x = graph_start_x + j
          let y = predict_y_set(adjusted) + graph_start_y

          ctx.strokeStyle = '#444'
          ctx.fillStyle = 'transparent'
          if (j === 0) {
            ctx.moveTo(x, y)
          } else if (j === predict_timer - 1) {
            ctx.lineTo(x, y)
            ctx.stroke()
            ctx.fillStyle = '#444'
            ctx.fillRect(x - 3, y - 3, 6, 6)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.fillStyle = '#000'
        ctx.fillText(
          label_text,
          x_offset + this.props.width - predict_width,
          line_height * 4 + line_height * 1.25 * 3 + line_offset
        )
      }
    }
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', right: 6, top: line_height }}>
          <button onClick={this.props.openTurbofanInfo} className="unbutton">
            info
          </button>
        </div>
        <Canvas width={this.props.width} height={height} getCtx={this.getCtx} />
      </div>
    )
  }
}

export default Dial
