import React, { Component } from 'react'

class Canvas extends Component {
  componentDidMount() {
    this.props.getCtx(this.refs.canvas)
  }

  render() {
    return (
      <canvas
        ref="canvas"
        width={this.props.width}
        height={this.props.height}
        style={{ background: '#efefef' }}
      />
    )
  }
}

export default Canvas
