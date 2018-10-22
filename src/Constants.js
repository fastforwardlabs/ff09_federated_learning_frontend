export let button_reset = {
  fontSize: '100%',
  fontFamily: 'inherit',
  border: 0,
  padding: 0,
  textDecoration: 'underline',
  cursor: 'pointer',
}

export let selected_features = [
  'setting_1',
  'setting_2',
  'T24',
  'T30',
  'T50',
  'P30',
  'Nf',
  'Nc',
  'Ps30',
  'phi',
  'NRf',
  'NRc',
  'BPR',
  'htBleed',
  'W31',
  'W32',
]

export let cycle_profit = 250
let engine_profit = cycle_profit * 4
export let maitained_penalty = 10000
export let exploded_penalty = 60000

export function calculateProfit([cycles, maintained, failed]) {
  return (
    cycles * cycle_profit -
    maintained * maitained_penalty -
    failed * exploded_penalty
  )
}

export let maintained_delay = 20
export let exploded_delay = 60

export let data_scientist_cost = engine_profit * 6

export let strategies = {
  corrective: 'time',
  preventative: 'time',
  'local predictive': 'RUL_local',
  'federated predictive': 'RUL_federated',
}

export let strategy_names = Object.keys(strategies)

export let predictive_threshold = 10
export let preventative_threshold = 193

export let factory_colors = ['#1b9e77', '#d95f02', '#7570b3', '#e7298a']

export let maintain_color = '#fffa71'
export let repair_color = '#ff8282'

export function maitenanceCheck(rev, strategy_name, failure_mean) {
  switch (strategy_name) {
    case strategy_names[0]:
      return false
    case strategy_names[1]:
      // return rev[strategies[strategy_name]] >= 180
      return rev[strategies[strategy_name]] >= preventative_threshold
    case strategy_names[2]:
      return rev[strategies[strategy_name]] <= predictive_threshold
    case strategy_names[3]:
      return rev[strategies[strategy_name]] <= predictive_threshold
  }
}

export function mCheck(rev, strategy_name, failure_mean) {
  switch (strategy_name) {
    case strategy_names[0]:
      return false
    case strategy_names[1]:
      return rev[strategies[strategy_name]] >= preventative_threshold
    case strategy_names[2]:
      return rev[strategies[strategy_name]] < predictive_threshold
    case strategy_names[3]:
      return rev[strategies[strategy_name]] < predictive_threshold
  }
}

let corpora_greek_flattened = [
  'Coeus',
  'Crius',
  'Cronus',
  'Hyperion',
  'Iapetus',
  'Mnemosyne',
  'Oceanus',
  'Phoebe',
  'Rhea',
  'Tethys',
  'Theia',
  'Themis',
  'Asteria',
  'Astraeus',
  'Atlas',
  'Aura',
  'Clymene',
  'Dione',
  'Helios',
  'Selene',
  'Eos',
  'Epimetheus',
  'Eurybia',
  'Eurynome',
  'Lelantos',
  'Leto',
  'Menoeltius',
  'Metis',
  'Ophion',
  'Pallas',
  'Perses',
  'Prometheus',
  'Styx',
  'Arachne',
  'Centaur',
  'Charybdis',
  'Chimera',
  'Empousai',
  'Gorgon',
  'Harpy',
  'Hippalectryon',
  'Hippocampus',
  'Icthyocentaur',
  'Ipotane',
  'Lamia',
  'Hydra',
  'Manticore',
  'Minotaur',
  'Mormo',
  'Ophitaurus',
  'Satyr',
  'Synthian Dracanus',
  'Siren',
  'Taraxippus',
  'Telekhines',
  'Typhon',
  'Aphrodite',
  'Apollo',
  'Ares',
  'Artemis',
  'Athena',
  'Demeter',
  'Dionysus',
  'Hades',
  'Hephaestus',
  'Hera',
  'Hermes',
  'Hestia',
  'Poseidon',
  'Zeus',
  'Aether',
  'Ananke',
  'Chaos',
  'Chronos',
  'Erebus',
  'Eros',
  'Hypnos',
  'Gaia',
  'Phanes',
  'Pontus',
  'Tartarus',
  'Thalassa',
  'Thanatos',
  'Hemera',
  'Nyx',
  'Nemesis',
]

let endings = [
  'Association',
  'Company',
  'Corporation',
  'Incorporated',
  'Society',
  'Syndicate',
  'Limited',
  'Enterprise',
  'Concern',
  'Outfit',
  'Partnership',
  'Syndicate',
  'Megacorp',
  'Tech',
  'Machines',
]

function sample(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function makeName() {
  return sample(corpora_greek_flattened) + ' ' + sample(endings)
}

export let requirement_strings = [
  null,
  'four turbofan failures for data',
  'hire data scientist',
  'federation offer',
]

export let profit_array_length = 300

export let finish = 3000

export let strategy_descriptions = [
  'turbofans are repaired when they fail',
  `maintenance is performed when engines reach ${preventative_threshold} cycles`,
  `maintenance is performed when the local model predicts remaining life is below 10`,
  `maintenance is performed when the federated model predicts remaining life is below 10`,
]
