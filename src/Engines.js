import React, { Component } from 'react'

class Engines extends Component {
  render() {
    let { engines, engine_keys, engine_names } = this.props
    return (
      <div>
        <div>
          {engine_names.map(name => {
            let engine = engines[name][this.props.counter]
            return (
              <div>
                {engine ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${
                        engine_keys.length
                      }, 60px)`,
                      textAlign: 'right',
                    }}
                  >
                    {engine_keys.map(key => (
                      <div>{engine[key]}</div>
                    ))}
                  </div>
                ) : (
                  <div>exploded</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default Engines
