import React, { Component } from 'react'
import { scaleLinear, scaleDiverging } from 'd3-scale'
import { interpolateSpectral, interpolatePuOr } from 'd3-scale-chromatic'
import * as _ from 'lodash'
import * as chroma from 'chroma-js'

// let engine_names_selection = [...Array(5)].map(num => {
//   return _.sample(engine_names)
// })

class Engines extends Component {
  render() {
    let { engines, engine_keys, engine_names, ranges } = this.props
    let selection_num = 5
    // let scales = ranges.map((range, i) => {
    //   return scaleLinear()
    //     .domain([0, Math.abs((range[1] - range[0]) / 2)])
    //     .range(['white', 'black'])
    // })
    let hue_step = 360 / engine_keys.length
    let backgrounds = [...Array(engine_keys.length)].map((n, i) => {
      return chroma.hsl(hue_step * i, 0.4, 0.8)
    })
    let scales = ranges.map((range, i) => {
      return scaleLinear()
        .domain([range[0], range[1]])
        .range([0, 100])
    })
    let engine_names_selection = [1, 2, 3, 4, 5]
    // let scales = this.props.ranges.map((range, i) =>
    //   scaleDiverging(interpolatePuOr).domain([
    //     range[1],
    //     range[0] + (range[1] - range[0]) / 2,
    //     range[0],
    //   ])
    // )
    let counter_to_now = [...Array(this.props.counter)]
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <div>
          <div
            style={{
              border: 'solid 2px #000',
              margin: '20px',
              padding: '20px 20px 0',
            }}
          >
            {engine_names_selection.map((name, i) => {
              let engine = engines[name][this.props.counter]
              let exploded = false
              if (engine === undefined) {
                engine = engines[name][engines[name].length - 1]
                exploded = true
              }
              let counter_max = engines[name].length - 1
              {
                /* let counter_available_past = Math.min(5, this.props.counter) */
              }
              let counter_available_past = Math.min(
                counter_max,
                this.props.counter
              )
              let past = [...Array(counter_available_past)].map((n, i) => {
                return counter_available_past - i
              })
              return (
                <div
                  style={{
                    marginBottom: 20,
                  }}
                >
                  {engine ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          border: 'solid 1px #000',
                          display: 'grid',
                          gridTemplateColumns: `repeat(${
                            engine_keys.length
                          }, 1fr)`,
                          width: '100%',
                          gridColumnGap: 20,
                          padding: '10px',
                        }}
                      >
                        {engine_keys.map((key, j) => {
                          let feature = engine[key]
                          let mid = Math.abs(
                            (ranges[j][1] - ranges[j][0]) / 2 + ranges[j][0]
                          )
                          return (
                            <div
                              style={{
                                background: scales[j](feature),
                                background: scales[j](Math.abs(feature - mid)),
                                background: '#ddd',
                                position: 'relative',
                                background: backgrounds[j],
                                background: '#efefef',
                                height: 40,
                                border: 'solid 1px #000',
                              }}
                            >
                              {past.map((c, i) => {
                                let maxed = Math.min(c, counter_max)
                                return (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      height: 2,
                                      background: 'black',
                                      left:
                                        100 -
                                        (100 / counter_available_past) *
                                          (i + 1) +
                                        '%',
                                      width: 100 / counter_available_past + '%',
                                      top:
                                        scales[j](engines[name][maxed][key]) +
                                        '%',
                                    }}
                                  />
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                      <div style={{ width: 50, textAlign: 'right' }}>
                        <div>
                          {Math.round(
                            engines[name][
                              Math.min(this.props.counter, counter_max)
                            ]['RUL_predict_full']
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
        {false ? (
          <div>
            <div>ENGINE 1</div>
            {counter_to_now.map((n, i) => {
              let name = engine_names_selection[0]
              let engine = engines[name][i]
              let exploded = false
              if (engine === undefined) {
                engine = engines[name][engines[name].length - 1]
                exploded = true
              }
              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${engine_keys.length}, 20px)`,
                    height: 2,
                    width: '100%',
                    gridColumnGap: 20,
                  }}
                >
                  {engine_keys.map((key, j) => {
                    let feature = engine[key]
                    let mid = Math.abs(
                      (ranges[j][1] - ranges[j][0]) / 2 + ranges[j][0]
                    )
                    return (
                      <div
                        style={{
                          background: scales[j](feature),
                          background: scales[j](Math.abs(feature - mid)),
                          background: '#ddd',
                          position: 'relative',
                          background: backgrounds[j],
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            width: 2,
                            background: 'black',
                            left: scales[j](feature) + '%',
                            top: 0,
                            height: 2,
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }
}

export default Engines
