import React, { Component } from 'react'
import { commas, compare } from './Utilties'
import {
  Welcome,
  Upgrade,
  StrategyInfo,
  TurbofanModal,
  Finish,
} from './ModalContent'

let line_height = 21

class Modal extends Component {
  render() {
    let content = null
    switch (this.props.modal_state) {
      case 'intro':
        content = (
          <Welcome
            factory_names={this.props.factory_names}
            closeModal={this.props.closeModal}
            counter={this.props.counter}
          />
        )
        break
      case 'preventative':
        content = (
          <Upgrade
            closeModal={this.props.closeModal}
            upgradeYourStrat={this.props.upgradeYourStrat}
            upgrade="preventative"
          />
        )
        break
      case 'local predictive':
        content = (
          <Upgrade
            closeModal={this.props.closeModal}
            upgradeYourStrat={this.props.upgradeYourStrat}
            upgrade="local predictive"
          />
        )
        break
      case 'federated predictive':
        content = (
          <Upgrade
            closeModal={this.props.closeModal}
            upgradeYourStrat={this.props.upgradeYourStrat}
            upgrade="federated predictive"
          />
        )
        break
      case 'strategy_info':
        content = (
          <StrategyInfo
            closeModal={this.props.closeModal}
            info_index={this.props.info_index}
            requirements={this.props.requirements}
          />
        )
        break
      case 'turbofan':
        content = <TurbofanModal closeModal={this.props.closeModal} />
        break
      case 'finish':
        content = (
          <Finish
            closeModal={this.props.closeModal}
            keepPlaying={this.props.keepPlaying}
            factories_strategies={this.props.factories_strategies}
            factories_state={this.props.factories_state}
            prof_map={this.props.prof_map}
            factory_names={this.props.factory_names}
            counter={this.props.counter}
          />
        )
        break
    }

    return (
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: '100vh',
          display: 'grid',
          gridTemplateRows: '10.5px auto 10.5px',
          background: 'rgba(0, 0, 0, 0.1)',
          zIndex: 9,
          overflow: 'auto',
        }}
      >
        <div />
        {content ? (
          <div
            style={{
              display: 'grid',
              justifyContent: 'center',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                border: 'solid 2px black',
                background: 'white',
                width: '100%',
                maxWidth: 600,
                padding: 2,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: -2,
                  top: -2,
                  color: 'white',
                  paddingTop: 1,
                }}
              >
                <button
                  onClick={() => {
                    if (this.props.modal_state === 'finish') {
                      this.props.keepPlaying()
                    } else {
                      this.props.closeModal()
                    }
                  }}
                  className="unbutton closebutton"
                >
                  X
                </button>
              </div>
              {content}
            </div>
          </div>
        ) : null}
      </div>
    )
  }
}

export default Modal
