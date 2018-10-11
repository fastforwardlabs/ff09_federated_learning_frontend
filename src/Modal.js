import React, { Component } from 'react'
import { strategy_names, factory_colors } from './Constants'

let width = 600

let descriptions = [
  'You now have data from four engine failures. Using that data you can upgrade your maintenance strategy to preventative. The preventative strategy performs automatic maintenance at ten cycles before the average engine fail time.',
]

let offers = [
  'Upgrade to preventative strategy?',
  'Upgrade to local predictive strategy?',
  'Upgrade to federated predictive strategy?',
  null,
]

class Modal extends Component {
  constructor(props) {
    super(props)
  }

  upgrade() {
    let index = strategy_names.indexOf(this.props.strategy)
    this.props.setDecision(index)
    this.props.setYourStrategy(strategy_names[index + 1])
    this.props.setYourHistory([
      strategy_names[index + 1],
      this.props.counter - 1,
    ])
    this.props.closeOffer()
  }

  stick() {
    let index = strategy_names.indexOf(this.props.strategy)
    this.props.setDecision(index)
    this.props.closeOffer()
  }

  render() {
    let index = strategy_names.indexOf(this.props.strategy)
    return (
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: '100vh',
          background: 'rgba(0,0,0,0.2)',
          padding: '2px',
          border: 'solid 1px black',
          display: 'grid',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <div
          style={{
            border: 'solid 1px black',
            background: 'white',
            maxWidth: 600,
            padding: '2px',
          }}
        >
          <div style={{ border: 'solid 1px black' }}>
            <div
              style={{
                padding: '5px 10px',
                borderBottom: 'solid 1px black',
              }}
            >
              Strategy upgrade available
            </div>
            <div
              style={{
                padding: '10px 10px 15px',
              }}
            >
              <div style={{ marginBottom: 10 }}>{descriptions[index]}</div>
              <div style={{ marginBottom: 10 }}>{offers[index]}</div>
              <div>
                <button
                  style={{ marginRight: 5 }}
                  onClick={this.upgrade.bind(this)}
                >
                  Yes
                </button>
                <button onClick={this.stick.bind(this)}>No</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
