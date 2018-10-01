import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
// import App from './App'
import Data from './Data'

let render = Component => {
  return ReactDOM.render(
    <BrowserRouter>
      <Data>
        <Component />
      </Data>
    </BrowserRouter>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    render(NextApp)
  })
}
