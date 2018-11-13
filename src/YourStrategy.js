import React, { Component } from 'react'
import { sum, last } from 'lodash'
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

class YourStrategy extends Component {
  render() {
    let {
      factories_strategies,
      factories_state,
      setYourStrategy,
      requirements,
      openInfo,
    } = this.props
    return (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            alignItems: 'center',
            padding: '0 4px',
            background: factory_colors[0],
            color: '#fff',
            height: 21,
          }}
        >
          <div>Your Strategy</div>
          <div
            style={{
              cursor: 'pointer',
              cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: 'auto auto',
              gridColumnGap: 5,
              alignItems: 'center',
            }}
            onClick={this.props.toggleAuto}
            title="Automatically upgrade to best available strategy"
          >
            <input
              type="checkbox"
              readOnly={true}
              checked={this.props.auto_upgrade}
            />
            <div>auto upgrade</div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{}}>
            {strategy_names.map((n, i) => {
              let checked = n === last(factories_strategies[0])[0]
              let available = true
              let requirement_info
              if (i === 1) {
                available = requirements[0][0] !== null
                requirement_info = ': ' + factories_state[0][2] + '/4'
              } else if (i === 2) {
                available = requirements[0][1] !== null
                requirement_info = ': none available yet'
              } else if (i === 3) {
                available = requirements[0][2] !== null
                requirement_info = ': no offer yet'
              }
              let requirement_string = requirement_strings[i]
              let additional_classes = ''
              if (checked) additional_classes += ' selected'
              if (!available) additional_classes += ' disabled'
              return (
                <div
                  key={n}
                  className={additional_classes}
                  title={
                    available ? null : 'This strategy is not unlocked yet.'
                  }
                  style={{
                    background: available ? 'white' : '#ddd',
                    color: available ? 'black' : '#777',
                    position: 'relative',
                  }}
                >
                  {requirement_string !== null ? (
                    <div style={{ padding: '0 6px' }}>
                      <span
                        style={{
                          textTransform: 'uppercase',
                        }}
                      >
                        requirement
                      </span>{' '}
                      {available ? '✓' : '☐'} {requirement_string}
                      {available ? null : requirement_info}
                    </div>
                  ) : null}
                  <div style={{ position: 'relative', padding: '0 4px' }}>
                    <div
                      className="hoverinner"
                      style={{
                        cursor: available ? 'pointer' : 'default',
                        cursor: 'pointer',
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gridColumnGap: 5,
                        alignItems: 'center',
                        paddingLeft: '3px',
                      }}
                      onClick={() => {
                        setYourStrategy(n, available)
                      }}
                    >
                      <input
                        type="radio"
                        checked={checked}
                        disabled={!available}
                        style={{
                          position: 'relative',
                        }}
                      />
                      <div
                        className="hoverinner-target"
                        style={{
                          fontWeight: checked || true ? 700 : 400,
                        }}
                      >
                        {n}
                      </div>
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        right: 4,
                        top: 0,
                        color: '#000',
                      }}
                    >
                      <button
                        style={{}}
                        onClick={() => {
                          openInfo(i)
                        }}
                        className="unbutton button-hover"
                      >
                        info
                      </button>
                    </div>
                  </div>
                  {false ? <div className="hb" style={{ top: -0.5 }} /> : null}
                </div>
              )
            })}
          </div>

          {false ? <div className="hb" style={{ top: -0.5 }} /> : null}
        </div>
      </div>
    )
  }
}

export default YourStrategy
