import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import * as queryString from 'qs'
import { default_state, default_state_string, filterState } from './State'
import StateNumberInput from './StateNumberInput'
import HistoryItem from './HistoryItem'
import * as df from 'date-fns'

let shape_size = 40
let shape_style = {
  float: 'left',
  marginRight: 5,
  marginBottom: 5,
  width: shape_size,
  height: shape_size,
  background: 'black',
}
let $circle = (
  <div
    style={{
      ...shape_style,
      borderRadius: shape_size,
    }}
  />
)
let $square = <div style={shape_style} />

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storage_buster: 0,
      time_travelling: false,
      time: new window.Date(),
      ww: window.innerWidth,
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

    // clock ticks every 15 seconds
    this.intervalID = setInterval(() => this.tick(), 15 * 1000)
  }

  componentDidUpdate() {
    if (this.props.history.action === 'POP' && this.state.time_travelling) {
      this.clearTravel()
    }
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
    let saved = []
    let last_saved = null
    if (localStorage.getItem('saved')) {
      saved = JSON.parse(localStorage.getItem('saved'))
      last_saved = saved[saved.length - 1].string
    }
    if (last_saved !== url_string) {
      let updated_saved = saved.slice()
      updated_saved.push({
        string: url_string,
        time: new window.Date(),
      })
      localStorage.setItem('saved', JSON.stringify(updated_saved))
    }
    this.setState({
      storage_buster: this.state.storage_buster + 1,
      time_travelling: false,
      active_time: null,
    })
  }

  timeTravel(time) {
    if (!this.state.time_travelling) {
      this.handleSave()
      this.setState({ time_travelling: true })
    }
    this.setState({
      active_time: time,
    })
  }

  clearTravel() {
    this.setState({ time_travelling: false, active_time: null })
  }

  render() {
    let dirty_url_state = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    })
    let filtered_url_state = filterState(dirty_url_state)
    let url_string = queryString.stringify(filtered_url_state, {
      encode: false,
    })
    let { circles, squares } = filterState(
      queryString.parse(this.props.location.search, { ignoreQueryPrefix: true })
    )
    let saved = []
    let storage_check = localStorage.getItem('saved')
    if (storage_check !== null) {
      saved = JSON.parse(storage_check).reverse()
    }
    let circles_array = []
    let squares_array = []
    for (let i = 0; i < circles; i++) {
      circles_array.push('')
    }
    for (let i = 0; i < squares; i++) {
      squares_array.push('')
    }
    let today = new window.Date()
    return (
      <div
        className="App"
        style={{
          display: 'grid',
          height: '100vh',
          gridTemplateRows: '19px 1fr',
        }}
      >
        <div style={{ borderBottom: 'solid 1px black' }}>
          UNIFORM STATE LOCATOR
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${
              this.state.ww > 600 ? '250px' : '150px'
            } 1fr`,
            height: 'calc(100vh - 19px)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateRows: '50% 50%',
              borderRight: 'solid 1px black',
              height: 'calc(100vh - 19px)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr' }}>
              <div style={{ borderBottom: 'solid 1px black' }}>PARAMETERS</div>
              <div style={{ overflow: 'auto' }}>
                <div>
                  Circles:{' '}
                  <StateNumberInput
                    update_key="circles"
                    update_callback={this.clearTravel.bind(this)}
                    value={circles}
                  />
                </div>
                <div>
                  Squares:{' '}
                  <StateNumberInput
                    update_key="squares"
                    update_callback={this.clearTravel.bind(this)}
                    value={squares}
                  />
                </div>
                <div>
                  <button onClick={this.handleSave.bind(this)}>
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr' }}>
              <div style={{ borderBottom: 'solid 1px black' }}>
                LOCAL HISTORY
              </div>
              <div style={{ overflow: 'auto' }}>
                {this.state.time_travelling ? (
                  <div
                    style={{ borderBottom: 'dotted 1px black' }}
                    onClick={() => {
                      this.clearTravel()
                      let saved = JSON.parse(localStorage.getItem('saved'))
                      let last_saved = saved[saved.length - 1].string
                      this.props.history.push({
                        pathname: process.env.PUBLIC_URL,
                        search: last_saved,
                      })
                    }}
                  >
                    <div style={{ fontSize: '80%' }}>current</div>
                    <div>inactive</div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#bbb',
                      borderBottom: 'dotted 1px black',
                    }}
                  >
                    <div style={{ fontSize: '80%' }}>current</div>
                    <div>{url_string}</div>
                  </div>
                )}
                {saved.map((config, i) => {
                  return (
                    <HistoryItem
                      key={config.time}
                      timeTravel={this.timeTravel.bind(this, config.time)}
                      active_time={this.state.active_time}
                      config={config}
                      style={{ borderBottom: 'dotted 1px black' }}
                    >
                      <div
                        style={{
                          fontSize: '80%',
                        }}
                      >
                        <div>{df.distanceInWordsToNow(config.time)} ago</div>
                      </div>

                      <div
                        style={{
                          fontSize: '80%',
                        }}
                      />
                      <div>{config.string}</div>
                    </HistoryItem>
                  )
                })}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: '1fr 200px',
              height: 'calc(100vh - 19px)',
            }}
          >
            <div style={{ overflow: 'auto' }}>
              <div style={{ overflow: 'hidden' }}>
                {circles_array.map(c => $circle)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                {squares_array.map(s => $square)}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr' }}>
              <div style={{ borderBottom: 'solid 1px black' }}>INFO</div>
              <div style={{ overflow: 'auto' }}>
                <p style={{ margin: 0 }}>
                  by{' '}
                  <a href="http://feed.grantcuster.com/about">Grant Custer</a>{' '}
                  &middot; <a href="">code viewable on Github</a>
                </p>
                <p style={{ margin: 0 }}>
                  This is a minimal example of a pattern I've been using to
                  create react.js-based prototypes and generators.{' '}
                  <strong>
                    The state of the app is contained entirely in the URL
                  </strong>
                  . This makes it simple to share the specific state of the app
                  with others (just share the URL).
                </p>
                <p style={{ margin: 0 }}>
                  This approached is enhanced by{' '}
                  <strong>
                    using the browser's local storage to save different
                    configurations (which are just URLs)
                  </strong>{' '}
                  to a history. This frees you up to do lots of exploration
                  knowing you can return to your favorites.
                </p>
                <p style={{ margin: 0 }}>
                  It is tricky to set the right user expectations about how the
                  URL state and the local history interact. The history is
                  specific to the device, not the URL, so it will not be
                  accessible to other people or devices you share it with. Back
                  and forward browser navigation also gets dicey because they
                  have access to the URL history but not the local history
                  selections.
                </p>
                <p style={{ margin: 0 }}>
                  I'd love to hear any thoughts you have on this pattern and how
                  to make it better{' '}
                  <a href="https://twitter.com/grantcuster">on Twitter</a> or{' '}
                  <a href="http://feed.grantcuster.com/info">elsewhere</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(App)
