import React, { Component } from 'react'

class Canvas extends Component {
  componentDidMount() {
    this.props.getCtx(this.refs.canvas)
    console.log(this.props)
    console.log('mount what the hell')
  }

  render() {
    return (
      <div style={{ lineHeight: 0 }}>
        <canvas
          ref="canvas"
          width={this.props.width * 2}
          height={this.props.height * 2}
          style={{
            background: this.props.background || 'white',
            width: this.props.width,
            height: this.props.height,
          }}
        />
      </div>
    )
  }
}

export default Canvas
