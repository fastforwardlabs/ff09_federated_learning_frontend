export function formatTime(ticks) {
  let years = Math.floor(ticks / (12 * 30 * 24))
  ticks -= years * 365 * 30 * 24
  let months = Math.floor(ticks / (30 * 24))
  ticks -= months * 30 * 24
  let days = Math.floor(ticks / 24)
  ticks -= days * 24
  let text = []
  if (years > 0) text.push(`${years} years`)
  if (months > 0) text.push(`${months} months`)
  if (days > 0) text.push(`${days} days`)
  if (ticks > 0) text.push(`${ticks} hours`)
  return text.join(', ')
}

export function roundTwo(number) {
  return Math.round(number * 100) / 100
}

// from https://stackoverflow.com/a/2901298
export let commas = x => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function scale(value, range) {
  return (value - range[0]) / (range[1] - range[0])
}
