import React, { Component } from 'react'
import { maitenanceCheck, strategies, strategy_names } from './Constants'

let info_style = { fontSize: '0.9em' }

class StrategyChooser extends Component {
  setStrategy(n) {
    this.props.setYourStrategy(n)
  }
  render() {
    console.log(this.props.exploded)
    return (
      <div style={{ padding: '0 0 20px 0' }}>
        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>STRATEGY</div>
          <div>auto-upgrading enabled</div>
        </div>
        <div>
          <div
            style={{
              border: 'solid 1px black',
              padding: 10,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
            }}
          >
            <div>
              <input
                type="radio"
                checked={this.props.strategy === strategy_names[0]}
                onClick={this.setStrategy.bind(this, strategy_names[0])}
              />
            </div>
            <div>
              <div>{strategy_names[0]}</div>
              <div style={{ ...info_style }}>
                Repair engines when they break down.
              </div>
            </div>
          </div>
          <div
            style={{
              border: 'solid 1px black',
              borderTop: 'none',
              padding: 10,
              background: this.props.exploded >= 4 ? 'transparent' : '#ddd',
              color: this.props.exploded >= 4 ? 'black' : '#666',
              ...info_style,
            }}
          >
            <div>
              Requirement: 4 explosions for data
              {this.props.exploded >= 4 ? (
                ''
              ) : (
                <span>
                  : {this.props.exploded}
                  /4
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              border: 'solid 1px black',
              borderTop: 'none',
              padding: 10,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              background: this.props.exploded >= 4 ? 'transparent' : '#ddd',
              color: this.props.exploded >= 4 ? 'black' : '#666',
            }}
          >
            <div>
              <input
                type="radio"
                checked={this.props.strategy === strategy_names[1]}
                onClick={this.setStrategy.bind(this, strategy_names[1])}
                disabled={!this.props.exploded >= 4}
              />
            </div>
            <div>
              <div>{strategy_names[1]}</div>
              <div style={{ ...info_style }}>
                Perform maintenance when engine cycles reach average of past
                engine failures - 10.
              </div>
            </div>
          </div>
          <div
            style={{
              border: 'solid 1px black',
              borderTop: 'none',
              padding: 10,
              background: this.props.exploded >= 4 ? 'transparent' : '#ddd',
              color: this.props.exploded >= 4 ? 'black' : '#666',
            }}
          >
            <div>unlock machine learning options</div>
            <div>
              {this.props.your_data_scientist ? (
                'data scientist hired'
              ) : (
                <button
                  style={{
                    background:
                      this.props.exploded >= 4 ? 'transparent' : '#ddd',
                    color: this.props.exploded >= 4 ? 'black' : '#666',
                  }}
                  onClick={this.setStrategy.bind(this, strategy_names[0])}
                  disabled={!this.props.exploded >= 4}
                >
                  hire data scientist
                </button>
              )}
            </div>
          </div>
          <div
            style={{
              border: 'solid 1px black',
              borderTop: 'none',
              padding: 10,
              background: this.props.your_data_scientist
                ? 'transparent'
                : '#ddd',
              color: this.props.your_data_scientist ? 'black' : '#666',
              ...info_style,
            }}
          >
            <div>Requirement: Hire data scientist</div>
          </div>
          <div
            style={{
              border: 'solid 1px black',
              borderTop: 'none',
              padding: 10,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              background: this.props.your_data_scientist
                ? 'transparent'
                : '#ddd',
              color: this.props.your_data_scientist ? 'black' : '#666',
            }}
          >
            <div>
              <input
                type="radio"
                checked={this.props.strategy === strategy_names[2]}
                onClick={this.setStrategy.bind(this, strategy_names[2])}
              />
            </div>
            <div>
              <div>{strategy_names[2]}</div>
              <div style={{ ...info_style }}>predictive</div>
            </div>
          </div>
          <div
            style={{
              border: 'solid 1px black',
              borderTop: 'none',
              padding: 10,
              background: this.props.your_data_scientist
                ? 'transparent'
                : '#ddd',
              color: this.props.your_data_scientist ? 'black' : '#666',
              ...info_style,
            }}
          >
            <div>Requirement: Federation offer</div>
          </div>
          <div
            style={{
              display: 'grid',
              border: 'solid 1px black',
              borderTop: 'none',
              gridTemplateColumns: 'auto 1fr',
              padding: 10,
              background: this.props.your_data_scientist
                ? 'transparent'
                : '#ddd',
              color: this.props.your_data_scientist ? 'black' : '#666',
            }}
          >
            <div>
              <input
                type="radio"
                checked={this.props.strategy === strategy_names[3]}
                onClick={this.setStrategy.bind(this, strategy_names[3])}
              />
            </div>
            <div>
              <div>{strategy_names[3]}</div>
              <div style={{ ...info_style }}>predictive</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default StrategyChooser
