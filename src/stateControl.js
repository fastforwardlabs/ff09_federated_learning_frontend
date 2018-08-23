import React, { Component } from 'react'
import { withRouter } from 'react-router'
import queryString from 'query-string'

export function stateControl(WrappedComponent) {
  return withRouter(
    class extends Component {
      handleChange(update_object) {
        let qs = queryString.parse(this.props.location.search)
        let updated_qs = Object.assign({}, qs, update_object)
        let updated_search = queryString.stringify(updated_qs)
        if (updated_search !== queryString.stringify(qs)) {
          this.props.history.push({
            pathname: '/',
            search: updated_search,
          })
        }
        if (this.props.update_callback !== undefined) {
          this.props.update_callback()
        }
      }
      render() {
        return (
          <WrappedComponent
            handleChange={this.handleChange.bind(this)}
            {...this.props}
          />
        )
      }
    }
  )
}
