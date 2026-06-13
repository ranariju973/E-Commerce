export const sanitizeWeightInput = (rawValue) => {
  if (rawValue === '') {
    return ''
  }

  let nextValue = `${rawValue}`.replace(/,/g, '.').replace(/[^\d.]/g, '')

  if (nextValue.startsWith('.')) {
    nextValue = `0${nextValue}`
  }

  const [wholePart = '', ...decimalParts] = nextValue.split('.')
  const normalizedWholePart = wholePart === '' ? '0' : String(Number(wholePart))
  const decimalPart = decimalParts.join('')

  return decimalParts.length > 0
    ? `${normalizedWholePart}.${decimalPart}`
    : normalizedWholePart
}

export const parseWeightInput = (rawValue) => {
  if (rawValue === '' || rawValue === '0' || rawValue === '0.') {
    return null
  }

  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

export const formatWeightDisplay = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return ''
  }

  return `${parsed}`
}
