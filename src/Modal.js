import React, { Component } from 'react'
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
import { commas, compare } from './Utilties'

let line_height = 21

class Modal extends Component {
  render() {
    return (
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: '100vh',
          display: 'grid',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <div
          style={{
            border: 'solid 2px black',
            background: 'white',
            width: 600,
            padding: 2,
          }}
        >
          <div
            style={{
              border: 'solid 4px black',
            }}
          >
            <div
              style={{ background: '#000', color: 'white', padding: '0 4px' }}
            >
              Modal
            </div>
            <div style={{ padding: '0 4px' }}>
              {' '}
              <p style={{ fontStyle: 'italic' }}>
                Turbofan Tycoon is a research prototype by{' '}
                <a href="#">Cloudera Fast Forward Labs</a> built to accompany
                our report on Federated Learning. It uses realistic turbofan
                data to show the benefites of using a federative predictive
                model. For more background, <a href="#">read our blog post</a>.
              </p>
              <p>
                In Turbofan Tycoon, you play as the proud operator of a factory
                containing four turbofans. Every hour a turbofan runs you make $
                {cycle_profit}. With four running turbofans, that means Your
                Factory is bringing in ${cycle_profit * 4} an hour. Not bad,
                right?{' '}
              </p>
              <p>
                The problem is, turbofans don't run forever. A broken turbofan
                costs ${commas(exploded_penalty)} to repair, and it takes{' '}
                {exploded_delay} hours to get it running again. If you catch it
                before it breaks, turbofan maintenance costs $
                {commas(maitained_penalty)} and takes {maintained_delay} hours
                to perform.
              </p>
              <p>
                You need to pick a good maintenance strategy, but for that you
                need data and expertise. You can unlock new maintenance
                strategies as you gain experience: moving from an initial
                repair-it-when-it-breaks <strong>corrective</strong> approach
                all the way up to a <strong>federated predictive</strong> model.
                Use the Your Strategy controls to upgrade your strategy as new
                methods become available. We'll guide you through the first
                round of upgrades.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
