import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import * as queryString from 'qs'
import { default_state, default_state_string, filterState } from './State'
import Paperclips from './Paperclips'
import Paperclips2 from './Paperclips2'
import Paperclips3 from './Paperclips3'
import Paperclips4 from './Paperclips4'
import { debounce } from 'lodash'

let speed_bound = 10
let speeds = [80, 40, 20, 10, 4, 3, 2, 1]

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ww: window.innerWidth,
      reset_key: 0,
      solo_mode: false,
      show_intro: false,
      auto_upgrade: true,
      speed: 7,
      // show_intro: true,
      // auto_upgrade: false,
      // speed: 5,
    }
    this.adjustSpeed = this.adjustSpeed.bind(this)
    this.introShown = this.introShown.bind(this)
    this.toggleAuto = this.toggleAuto.bind(this)
    this.toggleSolo = this.toggleSolo.bind(this)
    this.updateDimensions = this.updateDimensions.bind(this)
    this.updateDimensions = debounce(this.updateDimensions, 200)
  }

  adjustSpeed(e) {
    this.setState({ speed: parseInt(e.target.value) })
  }

  introShown() {
    this.setState({ show_intro: false })
  }

  toggleAuto() {
    this.setState({ auto_upgrade: !this.state.auto_upgrade })
  }

  toggleSolo() {
    if (this.state.solo_mode) {
      this.setState({ solo_mode: false })
    } else {
      this.setState({ solo_mode: true })
    }
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
    window.addEventListener('resize', this.updateDimensions)
  }

  componentWillMount() {
    this.updateDimensions()
  }

  updateDimensions() {
    this.setState({ ww: window.innerWidth })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
  }

  reset() {
    this.setState({ reset_key: this.state.reset_key + 1 })
  }

  render() {
    let dirty_url_state = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    })
    let filtered_url_state = filterState(dirty_url_state)
    let url_string = queryString.stringify(filtered_url_state, {
      encode: false,
    })
    return (
      <div>
        {this.props.engines_loaded ? (
          <Paperclips4
            key={this.state.reset_key}
            {...this.props}
            ww={this.state.ww}
            reset={this.reset.bind(this)}
            speed={this.state.speed}
            show_intro={this.state.show_intro}
            adjustSpeed={this.adjustSpeed}
            introShown={this.introShown}
            speeds={speeds}
            auto_upgrade={this.state.auto_upgrade}
            toggleAuto={this.toggleAuto}
            solo_mode={this.state.solo_mode}
            toggleSolo={this.toggleSolo}
          />
        ) : (
          <div>
            loading
            <span style={{ fontStyle: 'italic' }}>...</span>
          </div>
        )}
      </div>
    )
  }
}

export default withRouter(App)
