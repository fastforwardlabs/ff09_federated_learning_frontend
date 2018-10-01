import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import * as queryString from 'qs'
import { default_state, default_state_string, filterState } from './State'
import StateNumberInput from './StateNumberInput'
import * as df from 'date-fns'
import Engines from './Engines'
import Ranges from './Ranges'
import Analysis from './Analysis'
import Paperclips from './Paperclips'
import Simulator from './Simulator'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ww: window.innerWidth,
      time: new window.Date(),
      start: new window.Date(),
    }
    this.resetCounter = this.resetCounter.bind(this)
  }

  resetCounter() {
    this.setState({
      start: new window.Date(),
    })
  }

  componentDidMount() {
    let dirty_url_state = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    })
    let dirty_url_state_string = queryString.stringify(dirty_url_state, {
      encode: false,
    })
    let filtered_url_state = filterState(dirty_url_state)
    if (dirty_url_state_string !== default_state_string) {
      let updated_state = Object.assign({}, default_state, filtered_url_state)
      let updated_search = queryString.stringify(updated_state, {
        encode: false,
      })
      this.props.history.replace({
        pathname: process.env.PUBLIC_URL,
        search: updated_search,
      })
    }
    window.addEventListener('resize', this.updateWindowWidth.bind(this))
    this.intervalID = setInterval(() => this.tick(), 100)
  }

  updateWindowWidth() {
    this.setState({ ww: window.innerWidth })
  }

  tick() {
    this.setState({ time: new window.Date() })
  }

  componentWillUnmount() {
    clearInterval(this.intervalID)
    window.removeEventListener('resize', this.updateWindowWidth.bind(this))
  }

  handleSave() {
    let dirty_url_state = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    })
    let filtered_url_state = filterState(dirty_url_state)
    let url_string = queryString.stringify(filtered_url_state, {
      encode: false,
    })
  }

  render() {
    let dirty_url_state = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    })
    let filtered_url_state = filterState(dirty_url_state)
    let url_string = queryString.stringify(filtered_url_state, {
      encode: false,
    })
    let counter = Math.round((this.state.time - this.state.start) / 100)
    return (
      <div className="App">
        {/* <div
          style={{
            display: 'grid',
            padding: 20,
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}
        >
          <div>DIY</div>
          <div>LOCAL</div>
          <div>FEDERATED</div>
        </div> */}
        {/* <div style={{ padding: 20 }}>
          <div>ENGINES</div>
          <div>
            <button onClick={this.resetCounter}>Reset</button>
          </div>
        </div> */}
        <div>
          {false ? (
            false ? (
              this.props.engines_loaded ? (
                <div>
                  <Engines {...this.props} counter={counter} />
                </div>
              ) : (
                <div>loading...</div>
              )
            ) : (
              <div>
                {this.props.engines_loaded ? (
                  <Paperclips {...this.props} counter={counter} />
                ) : null}
              </div>
            )
          ) : this.props.engines_loaded ? (
            <Simulator {...this.props} counter={counter} />
          ) : null}
        </div>
      </div>
    )
  }
}

export default withRouter(App)
