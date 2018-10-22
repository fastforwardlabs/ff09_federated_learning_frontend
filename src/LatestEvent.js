import React, { Component } from 'react'
import { max } from 'lodash'
import { factory_colors } from './Constants'
import { commas } from './Utilties'

class LatestEvent extends Component {
  render() {
    let last_entries = this.props.factories_strategies.map(
      h => h[h.length - 1][1]
    )
    let last_max = max(last_entries)
    let last_index = last_entries.indexOf(last_max)
    if (this.props.solo_mode) last_index = 0
    let last_group = this.props.factories_strategies[last_index]
    let last = last_group[last_group.length - 1]
    let last_name = this.props.factory_names[last_index]
    let last_color = factory_colors[last_index]
    return (
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
          }}
        >
          latest event:{' '}
        </span>
        {last[1] === 0 ? (
          <span>Simulation started.</span>
        ) : (
          <span style={{}}>
            <span
              style={{
                background: last_color,
                color: 'white',
                padding: '0 3px',
              }}
            >
              {last_name}
            </span>{' '}
            changed strategy to <strong>{last[0]}</strong>.
          </span>
        )}
      </div>
    )
  }
}

export default LatestEvent
