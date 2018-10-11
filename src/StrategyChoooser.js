import React, { Component } from 'react'
import {
  maitenanceCheck,
  strategies,
  strategy_names,
  factory_colors,
} from './Constants'

let info_style = { fontSize: '0.9em' }

class StrategyChooser extends Component {
  constructor(props) {
    super(props)
    this.descriptions = [
      'repair engines when they fail',
      'perform maintenance based on average of previous engine failures',
      'perform maintenance based on predicted failure from model trained on previous local engine failures',
      'perform maintenance based on predicted failure from model trained on previous local and federated engine failures',
    ]
    this.requirements = [
      false,
      '4 engine failures for data',
      'hire data scientist',
      'federation offer',
    ]
  }
  setStrategy(n) {
    this.props.setYourHistory([n, this.props.counter - 1])
    this.props.setYourStrategy(n)
  }
  render() {
    let strat_availability = [
      true,
      this.props.exploded >= 4,
      this.props.your_data_scientist,
      this.props.federation_offer,
    ]
    return (
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>Your Strategy</div>
          <div style={{ display: 'none' }}>
            <input type="checkbox" checked={this.props.autoUpgrade} />{' '}
            auto-upgrade
          </div>
        </div>
        <div
          style={{
            border: 'solid 1px black',
            borderTop: 'none',
          }}
        >
          {strategy_names.map((name, i) => {
            let requirement = strat_availability[i] ? '✓' : '☐'
            requirement = requirement + ' ' + this.requirements[i]
            if (!strat_availability[i]) {
              if (name === strategy_names[1]) {
                requirement = requirement + `: ${this.props.exploded}/4`
              } else if (name === strategy_names[2]) {
                requirement = requirement + `: no data scientists available yet`
              } else if (name === strategy_names[3]) {
                requirement = requirement + `: no federation offers yet`
              }
            }
            return (
              <div
                style={{
                  background: strat_availability[i] ? '#fff' : '#ddd',
                  borderTop: 'solid 1px black',
                  padding: '0 4px',
                }}
              >
                {this.requirements[i] ? (
                  <div
                    style={{
                      fontSize: '14px',
                      padding: '5px 6px 0',
                    }}
                  >
                    <span style={{ fontSize: '12px' }}>REQUIREMENT:</span>{' '}
                    {requirement}
                  </div>
                ) : null}
                <div
                  style={{
                    padding: '2px 5px 5px',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignContent: 'center',
                    gridColumnGap: 7,
                  }}
                >
                  <div>
                    <input
                      type="radio"
                      checked={this.props.strategy === name}
                      disabled={!strat_availability[i]}
                      onClick={this.setStrategy.bind(this, name)}
                      style={{ padding: 0, margin: 0 }}
                    />
                  </div>
                  <div>
                    <div>
                      <strong>{name}</strong>
                    </div>
                    <div
                      style={{
                        display: 'none',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    >
                      {this.descriptions[i]}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default StrategyChooser
