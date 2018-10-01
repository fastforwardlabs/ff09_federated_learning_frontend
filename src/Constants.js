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

export let cycle_profit = 500
export let maitained_penalty = 500
export let exploded_penalty = 2000

export let maintained_delay = 5
export let exploded_delay = 20

export let strategies = {
  corrective: 'time',
  preventative: 'time',
  'local predictive': 'RUL_local',
  'federated predictive': 'RUL_federated',
}

export let strategy_names = Object.keys(strategies)

export let preventative_threshold = 100
export let predictive_threshold = 10

export let factory_colors = [
  'blue',
  'green',
  'purple',
  'cyan',
  'pink',
  'yellow',
]

export function maitenanceCheck(rev, strategy_name, failure_mean) {
  switch (strategy_name) {
    case strategy_names[0]:
      return false
    case strategy_names[1]:
      return rev[strategies[strategy_name]] >= failure_mean - 10
    case strategy_names[2]:
      return rev[strategies[strategy_name]] <= predictive_threshold
    case strategy_names[3]:
      return rev[strategies[strategy_name]] <= predictive_threshold
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
  'Uranus',
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
