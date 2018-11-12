import React, { Component } from 'react'
import {
  maintained_delay,
  exploded_delay,
  cycle_profit,
  exploded_penalty,
  maitained_penalty,
  repair_color,
  maintain_color,
  factory_colors,
  profit_color,
  strategy_names,
  money_finish,
} from './Constants'
import corrective_png from './images/corrective.png'
import preventative_png from './images/preventative.png'
import local_predictive_png from './images/local_predictive.png'
import federated_predictive_png from './images/federated_predictive.png'
import turbofan_png from './images/turbofan.png'
import { commas, compare, span_color } from './Utilties'
import { max } from 'lodash'

let line_height = 21
let data_scientist_pause = 500 - 1

export class Welcome extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.primary_button = React.createRef()
  }
  componentDidMount() {
    this.primary_button.current.focus()
  }
  render() {
    let { factory_names, closeModal, counter } = this.props
    let title = `Welcome to Turbofan Tycoon`
    let content = (
      <React.Fragment>
        <p
          style={{
            fontStyle: 'italic',
            margin: '0 -4px 10.5px',
            padding: '0 4px',
          }}
        >
          Turbofan Tycoon is a research prototype by{' '}
          <a href="#">Cloudera Fast Forward Labs</a> built to accompany our
          report on Federated Learning. It uses realistic turbofan data to show
          the benefites of using a federated predictive model. For more
          background, <a href="#">read our blog post</a>.
        </p>
        <p>
          In Turbofan Tycoon, you play as the proud operator of a factory
          containing four turbofans. Every hour a turbofan runs you make $
          {cycle_profit}. With four running turbofans, that means{' '}
          <span style={{ ...span_color(factory_colors[0]) }}>Your Factory</span>{' '}
          is banking ${commas(cycle_profit * 4)} an hour. Not bad, right?
        </p>
        <p>
          The problem is, turbofans don't run forever.{' '}
          <span style={{ ...span_color(repair_color), color: 'black' }}>
            A broken turbofan costs ${commas(exploded_penalty)} to repair, and
            it takes {exploded_delay} hours to get it running again.
          </span>{' '}
          If you catch it before it breaks,{' '}
          <span style={{ ...span_color(maintain_color), color: 'black' }}>
            turbofan maintenance costs ${commas(maitained_penalty)} and takes{' '}
            {maintained_delay} hours to perform.
          </span>{' '}
        </p>
        <p>
          You need to pick a good maintenance strategy, but for that you need
          data and expertise. You unlock new maintenance strategies as you
          progress: ranging from an initial repair-it-when-it-breaks{' '}
          <strong>corrective</strong> approach all the way up to a{' '}
          <strong>federated predictive</strong> model. Use the controls under{' '}
          <span style={{ ...span_color(factory_colors[0]) }}>
            Your Strategy
          </span>{' '}
          to upgrade your strategy as new strategies become available. We'll
          guide you through the first round of upgrades.
        </p>
        <p>
          Under{' '}
          <span style={{ ...span_color(factory_colors[0]) }}>Your Factory</span>{' '}
          you can see the state of each of your turbofans: including the sensor
          data and current maintenance strategy. You'll be competing against
          three other aspiring tycoons:{' '}
          <span style={{ ...span_color(factory_colors[1]) }}>
            {factory_names[1]}
          </span>
          ,{' '}
          <span style={{ ...span_color(factory_colors[2]) }}>
            {factory_names[2]}
          </span>{' '}
          and{' '}
          <span style={{ ...span_color(factory_colors[3]) }}>
            {factory_names[3]}
          </span>
          , to reach $3,000,000 profit. You can see your relative progress on
          the <span style={{ ...span_color('#777') }}>Factory Leaderboard</span>
          . Your competitors will be upgrading their strategies as well, so
          you'll have to move fast. You can control the speed of the simulation
          using the{' '}
          <span style={{ ...span_color('#777') }}>Simulation controls</span> at
          the bottom.
        </p>
        <div style={{ textAlign: 'right' }}>
          <button
            ref={this.primary_button}
            class="newbutton"
            onClick={closeModal}
          >
            {counter === 0 ? 'start' : 'keep'} playing
          </button>
        </div>
      </React.Fragment>
    )
    return <Modalify title={title} content={content} />
  }
}

function correctiveInfo() {
  return (
    <React.Fragment>
      <p>
        A <strong>corrective</strong> maintenance strategy isn't really much of
        a strategy. It simply waits for an turbofan to fail to repair it.
      </p>
      <div
        style={{
          float: 'right',
          border: 'solid 1px black',
          marginLeft: 8,
        }}
      >
        <div style={{}}>Turbofan</div>
        <img className="strat_image" src={corrective_png} alt="" />
      </div>
      <p>
        You can see this approach applied to each of your turbofans in the
        strategy section. For the <strong>corrective</strong> strategy, it is
        just a line plotting the number of hours the turbofan has run.{' '}
        <span style={{ ...span_color(repair_color), color: 'black' }}>
          The red marker indicates a turbofan failure.
        </span>{' '}
        This section gets more intersting once you get into the other
        strategies.
      </p>
    </React.Fragment>
  )
}

function preventativeInfo() {
  return (
    <React.Fragment>
      <p>
        A <strong>preventative</strong> maintenance strategy uses data about
        when engines failed in the past to choose a fixed time to perform
        maintenance. In this case maintenance is performed after 193 hours.
      </p>
      <div
        style={{
          float: 'right',
          border: 'solid 1px black',
          marginLeft: 8,
        }}
      >
        <div style={{ padding: '0 4px' }}>Turbofan</div>
        <img className="strat_image" src={preventative_png} alt="" />
      </div>
      <p>
        You can see how this strategy is applied in each turbofan's strategy
        section.{' '}
        <span style={{ ...span_color(maintain_color), color: 'black' }}>
          When the number of hours run reaches the scheduled maintenance time
          (shown as a dotted line) maintenance is performed.
        </span>{' '}
        If an turbofan fails before it reaches the maintenance point it is
        counted as a failure.
      </p>
    </React.Fragment>
  )
}

function localPredictiveInfo() {
  return (
    <React.Fragment>
      <p>
        Like the preventative strategy, the <strong>local predictive</strong>{' '}
        model uses the data from past turbofan failures. Rather than simply
        averaging their failure times, however, it uses the sensor data to make
        a more sophisticated guess about when the turbofan will fail.
        Maintenance is performed when the model's predicted remaining hours for
        the turbofan drops below ten.
      </p>
      <div
        style={{
          float: 'right',
          border: 'solid 1px black',
          marginLeft: 8,
        }}
      >
        <div style={{ padding: '0 4px' }}>Turbofan</div>
        <img className="strat_image" src={local_predictive_png} alt="" />
      </div>
      <p>
        You can see how this strategy is applied in each turbofan's strategy
        section. The graph plots the model's prediction of when the turbofan
        will fail (y-axis) by the hours run (x-axis).{' '}
        <span style={{ ...span_color(maintain_color), color: 'black' }}>
          The dotted line shows the ten-hour threshold – when the prediction
          drops below that maintenance is performed.
        </span>
      </p>
    </React.Fragment>
  )
}

function federatedPredictiveInfo() {
  return (
    <React.Fragment>
      <p>
        Like the local predictive model, the{' '}
        <strong>federated predictive</strong> model is trained using sensor data
        from past turbofan failures. Through{' '}
        <a href="#" target="_blank">
          federated learning
        </a>
        , the model has the advantage of being trained not just on local data,
        but on the data of all the factories participating in the federation.
        The additional training data makes for more accurate predictions.
      </p>
      <div
        style={{
          float: 'right',
          border: 'solid 1px black',
          marginLeft: 8,
        }}
      >
        <div style={{ padding: '0 4px' }}>Turbofan</div>
        <img className="strat_image" src={federated_predictive_png} alt="" />
      </div>
      <p>
        You can see how this strategy is applied in each turbofan's strategy
        section. The graph plots the model's prediction of when the turbofan
        will fail (y-axis) by the hours run (x-axis).{' '}
        <span style={{ ...span_color(maintain_color), color: 'black' }}>
          The dotted line shows the ten-hour threshold – when the prediction
          drops below that maintenance is performed.
        </span>
      </p>
    </React.Fragment>
  )
}

export function StrategyInfo({ info_index, requirements, closeModal }) {
  let name = strategy_names[info_index]
  let strategy_info
  let requirement = null
  switch (info_index) {
    case 0:
      strategy_info = correctiveInfo()
      break
    case 1:
      if (requirements[0][0] === null) {
        requirement = (
          <p
            style={{
              fontStyle: 'italic',
              margin: '0 -4px 10.5px',
              padding: '0 4px',
            }}
          >
            This strategy option will be unlocked when you have data from four
            engine failures.
          </p>
        )
      }
      strategy_info = preventativeInfo()
      break
    case 2:
      if (requirements[0][1] === null) {
        requirement = (
          <p
            style={{
              fontStyle: 'italic',
              margin: '0 -4px 10.5px',
              padding: '0 4px',
            }}
          >
            This strategy will be unlocked when you have hired a data scientist.
            Data scientists become available about {data_scientist_pause} hours
            after you've satisfied the preventative strategy requirement.
          </p>
        )
      }
      strategy_info = localPredictiveInfo()
      break
    case 3:
      if (requirements[0][2] === null) {
        requirement = (
          <p
            style={{
              fontStyle: 'italic',
              margin: '0 -4px 10.5px',
              padding: '0 4px',
            }}
          >
            This strategy will be unlocked when you have received a federation
            offer. A federation offer generally comes about{' '}
            {data_scientist_pause} hours after you've satisfied the local
            predictive requirement.
          </p>
        )
      }
      strategy_info = federatedPredictiveInfo()
      break
  }

  let title = <span>About the {name} strategy</span>
  let content = (
    <React.Fragment>
      {requirement}
      {strategy_info}
    </React.Fragment>
  )
  return <Modalify title={title} content={content} />
}

export class Upgrade extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.primary_button = React.createRef()
  }
  componentDidMount() {
    this.primary_button.current.focus()
  }

  render() {
    let { upgrade, upgradeYourStrat, closeModal } = this.props
    let trigger
    let advice
    let strategy_info
    switch (upgrade) {
      case 'preventative':
        trigger = (
          <span>
            The bad news is your factory{' '}
            <span style={{ ...span_color(repair_color), color: 'black' }}>
              has experienced four turbofan failures
            </span>
            . The good news is, using the data from those failures, you now have
            the option to upgrade to a <strong>preventative</strong> maintenance
            strategy.
          </span>
        )
        advice = `Our advice: though not particularly sophisticated, a preventative
            strategy is definitely a step up from just waiting for your engines
            to fail. We highly recommend this upgrade.`
        strategy_info = preventativeInfo()
        break
      case 'local predictive':
        trigger = (
          <span>
            After a long search, your factory has been able to hire a data
            scientist, unlocking the possibility of using a{' '}
            <strong>local predictive</strong> model for your maintenance
            strategy.
          </span>
        )
        advice = `Our advice: Now we're cooking with data science! Upgrade strongly
      recommended.`
        strategy_info = localPredictiveInfo()
        break
      case 'federated predictive':
        trigger = (
          <span>
            A group of factory owners have approached you with the opportunity
            to participate in their <strong>federated predictive</strong> model.
          </span>
        )
        advice = `Our advice: with access to more data the predictive model strategy
      becomes even more powerful. Upgrade for the ultimate in efficient
      maintenance.`
        strategy_info = federatedPredictiveInfo()
        break
    }

    let title = `Strategy upgrade available`
    let content = (
      <React.Fragment>
        <div
          style={{
            background: maintain_color,
            height: line_height * 5,
            display: 'grid',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10.5,
            padding: '0 4px',
            marginTop: '4px',
            textAlign: 'center',
          }}
        >
          <div>
            <strong>{upgrade}</strong>
            <br />
            strategy now available
          </div>
        </div>
        <p
          style={{
            fontStyle: 'italic',
            padding: '0 4px',
            margin: '0 -4px 10.5px',
          }}
        >
          {trigger}
        </p>
        {strategy_info}
        <p
          style={{
            background: '#ddd',
            color: 'black',
            padding: '0 4px',
            margin: '0 -4px 10.5px',
            fontStyle: 'italic',
          }}
        >
          {advice}
        </p>
        <p>
          Upgrade to <strong>{upgrade}</strong>?
        </p>
        <p style={{ textAlign: 'right' }}>
          <button className="newbutton" onClick={closeModal}>
            No
          </button>{' '}
          <button
            ref={this.primary_button}
            className="newbutton"
            onClick={() => {
              upgradeYourStrat(upgrade)
              closeModal()
            }}
          >
            Upgrade to {upgrade}
          </button>
        </p>
      </React.Fragment>
    )
    return <Modalify title={title} content={content} />
  }
}

export class Finish extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.primary_button = React.createRef()
  }
  componentDidMount() {
    this.primary_button.current.focus()
  }
  render() {
    let {
      keepPlaying,
      closeModal,
      factories_strategies,
      factories_state,
      factory_names,
      prof_map,
      counter,
    } = this.props
    let strategy_time = factories_strategies.map(fact => {
      return fact.map((double, i) => {
        let time
        if (i === fact.length - 1) {
          time = counter - double[1]
        } else {
          time = fact[i + 1][1] - double[1]
        }
        return [double[0], time]
      })
    })
    let longest_strats = strategy_time.map(fact => {
      let just_time = fact.map(d => d[1])
      let max_time = max(just_time)
      let maxi = just_time.indexOf(max_time)
      return maxi
    })

    let winner_prof = prof_map[0]
    let losers_prof = prof_map.slice(1)
    let prepo = winner_prof[1] === 0 ? 'Your' : 'Their'
    let prepo2 = winner_prof[1] === 0 ? 'you' : 'they'
    let prepo3 = winner_prof[1] === 0 ? 'You' : 'They'

    let winner_long_strat =
      strategy_time[winner_prof[1]][longest_strats[winner_prof[1]]]

    let loser_strings = ['came in second', 'got third', 'came in last']

    let you_won = winner_prof[1] === 0 ? true : false
    let winning_message
    if (you_won) {
      winning_message = (
        <p>
          Congratulations!{' '}
          <span style={{ ...span_color(factory_colors[0]) }}>Your Factory</span>{' '}
          was the first to reach ${commas(money_finish)} profit. You are a real
          turbofan tycoon in the making.
        </p>
      )
    } else {
      winning_message = (
        <p>
          Bummer!{' '}
          <span style={{ ...span_color(factory_colors[winner_prof[1]]) }}>
            {factory_names[winner_prof[1]]}
          </span>{' '}
          reached ${commas(money_finish)} profit before you. There's always next
          time!
        </p>
      )
    }

    let title = `Finish line`
    let content = (
      <React.Fragment>
        <div
          style={{
            background: factory_colors[winner_prof[1]],
            color: 'white',
            height: line_height * 5,
            display: 'grid',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10.5,
            padding: '0 4px',
            marginTop: '4px',
            textAlign: 'center',
          }}
        >
          {factory_names[winner_prof[1]]} wins!
        </div>
        {winning_message}
        <div style={{ marginBottom: '10.5px' }}>
          <div>Final Standings</div>
          <div>
            1.{' '}
            <span style={{ ...span_color(factory_colors[winner_prof[1]]) }}>
              {factory_names[winner_prof[1]]}
            </span>{' '}
            is the winner with a profit of ${commas(winner_prof[0])}. {prepo}{' '}
            primary strategy was <strong>{winner_long_strat[0]}</strong>, which{' '}
            {prepo2} used {Math.round((winner_long_strat[1] / counter) * 100)}%
            of the time. {prepo3}{' '}
            <span style={{}}>
              performed maintenance {factories_state[winner_prof[1]][1]} times
            </span>{' '}
            and{' '}
            <span style={{}}>
              had {factories_state[winner_prof[1]][2]} failures
            </span>
            .
          </div>
          {losers_prof.map((loser_prof, i) => {
            let loser_long_strat =
              strategy_time[loser_prof[1]][longest_strats[loser_prof[1]]]
            let prepo = loser_prof[1] === 0 ? 'Your' : 'Their'
            let prepo2 = loser_prof[1] === 0 ? 'you' : 'they'
            let prepo3 = loser_prof[1] === 0 ? 'You' : 'They'
            return (
              <div>
                {i + 2}.{' '}
                <span style={{ ...span_color(factory_colors[loser_prof[1]]) }}>
                  {factory_names[loser_prof[1]]}
                </span>{' '}
                {loser_strings[i]} with a profit of ${commas(loser_prof[0])}.{' '}
                {prepo} primary strategy was{' '}
                <strong>{loser_long_strat[0]}</strong>, which {prepo2} used{' '}
                {Math.round((loser_long_strat[1] / counter) * 100)}% of the
                time. {prepo3}{' '}
                <span style={{}}>
                  performed maintenance {factories_state[loser_prof[1]][1]}{' '}
                  times
                </span>{' '}
                and{' '}
                <span style={{}}>
                  had {factories_state[loser_prof[1]][2]} failures
                </span>
                .
              </div>
            )
          })}
        </div>
        <p
          style={{
            background: '#ddd',
            color: 'black',
            padding: '0 4px',
            margin: '0 -4px 10.5px',
            fontStyle: 'italic',
          }}
        >
          For more information on the making of this prototype and Cloudera Fast
          Forward Lab's work on federated learning. Check out our{' '}
          <a href="#">blog post</a>.
        </p>

        <p>
          You are welcome to continue the simulation. Remember, you can control
          the speed of the simulation using the controls at the bottom. There
          will now be a "skip 1,000" button that lets you fast forward 1,000
          hours at a time. By switching strategies and fast forwarding a few
          times you can see the strategy's effect over time.
        </p>
        <p style={{ textAlign: 'right' }}>
          <button
            ref={this.primary_button}
            className="newbutton"
            onClick={() => {
              keepPlaying()
              closeModal()
            }}
          >
            Keep playing
          </button>
        </p>
      </React.Fragment>
    )
    return <Modalify title={title} content={content} />
  }
}

export function TurbofanModal({}) {
  let title = `Turbofan view info`
  let content = (
    <React.Fragment>
      <p>
        The factory turbofan view shows you the status of each of your
        turbofans. The top strip shows the turbofan status over time.{' '}
        <span style={{ ...span_color('#ddd'), color: 'black' }}>
          Normal productive hours are shown in gray
        </span>
        ,{' '}
        <span style={{ ...span_color(maintain_color), color: 'black' }}>
          hours spent in maintenance in yellow
        </span>
        , and{' '}
        <span style={{ ...span_color(repair_color), color: 'black' }}>
          hours spent in failure repair in red
        </span>
        . A factory strategy change is marked with a{' '}
        <span style={{ color: '#777' }}>●</span> dot. Because it shows
        maintenance and failures, the status strip is a good way to get a quick
        overview of how your maintenance strategy has been doing lately.
      </p>
      <div
        style={{
          border: 'solid 1px black',
          marginBottom: 10.5,
        }}
      >
        <img src={turbofan_png} alt="" />
      </div>
      <p>
        On the left are graphs of data from the turbofan. This data include
        operational settings, temperatures, pressures, and fan rotation speeds
        for various components of the turbofan. All data is from the{' '}
        <a
          href="https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/"
          target="_blank"
        >
          Turbofan Engine Degradation Simulation Data Set
        </a>
        .
      </p>
      <p>
        On the right is a graph showing your strategy for maintenance applied to
        the turbofan. You can read about more about the different strategies
        using the info button under the{' '}
        <span style={{ ...span_color(factory_colors[0]) }}>Your Strategy</span>{' '}
        section.
      </p>
    </React.Fragment>
  )
  return <Modalify title={title} content={content} />
}

export function Boilerplate({}) {
  let title = `Welcome to Turbofan Tycoon`
  let content = <React.Fragment />
  return <Modalify title={title} content={content} />
}

export function Modalify({ title, content }) {
  return (
    <div
      style={{
        border: 'solid 2px black',
      }}
    >
      <div style={{ background: '#000', color: 'white', padding: '0 4px' }}>
        {title}
      </div>
      <div className="modal-content" style={{ padding: '0 4px 10.5px' }}>
        {content}
      </div>
    </div>
  )
}
