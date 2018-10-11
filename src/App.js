import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import * as queryString from 'qs'
import { default_state, default_state_string, filterState } from './State'
import Paperclips from './Paperclips'
import Paperclips2 from './Paperclips2'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ww: window.innerWidth,
      reset_key: 0,
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
    window.addEventListener('resize', this.updateWindowWidth.bind(this))
  }

  updateWindowWidth() {
    this.setState({ ww: window.innerWidth })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowWidth.bind(this))
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
          <Paperclips2
            key={this.state.reset_key}
            {...this.props}
            ww={this.state.ww}
            reset={this.reset.bind(this)}
          />
        ) : (
          'loading...'
        )}
      </div>
    )
  }
}

export default withRouter(App)
