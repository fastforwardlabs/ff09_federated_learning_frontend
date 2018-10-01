import React, { Component } from 'react'
import { rInterval } from './Utilties'

let engine_num = 5

let global = {
  factories: [...Array(1)].map(f => {
    return { turbines: [...Array(engine_num)].map(n => 0) }
  }),
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      counter: 0,
    }
    this.runFactories = this.runFactories.bind(this)
  }

  componentDidMount() {
    this.intervalID = setInterval(() => this.tick(), 250)
  }

  tick() {
    this.runFactories()
    this.setState((state, props) => {
      return { counter: state.counter + 1 }
    })
  }

  runFactories() {
    for (let i = 0; i < global.factories.length; i++) {
      let f = global.factories[i]
      for (let j = 0; j < f.turbines.length; j++) {
        let t = f.turbines[j]
        global.factories[i].turbines[j] = t + 1
      }
    }
  }

  render() {
    let { counter } = this.state

    let history_length = Math.min(counter, 30)
    let history = [...Array(history_length)].map((n, i) => counter - i)

    return (
      <div>
        <div>Hours: {counter}</div>
        {global.factories.map(f => (
          <div>
            <div>Factory</div>
            {f.turbines.map(t => (
              <div>{t}</div>
            ))}
          </div>
        ))}
      </div>
    )
  }
}

export default App
