export default class Money {
  #amount
  #formatter
  constructor(amount, asIs = false, locale = 'en-US', currency = 'USD') {
    this.#amount = asIs ? amount : amount * 100
    this.#formatter = new Intl.NumberFormat(locale, { style: 'currency', currency })
  }

  static fromFormatted(amount) {
    return new Money(
      // this is a nightmare
      amount.length == 1 && parseInt(amount) ? amount :
        amount.padEnd(
          amount.lastIndexOf('.') + 3,
          '0')
          .replace(/[,\._]/g, ''),
      [...amount.matchAll(/\./g)].length !== 0)
  }

  static Zero = new Money(0)

  #isEqual(that) {
    return Math.abs(this.#amount - that.#amount) < Number.EPSILON
  }

  toString(showCurrency = false, numOnly = false, dec = true) {
    // force showCurrency false if numOnly true to make switch a little easier
    if (numOnly) {
      showCurrency = false
    }
    return this.#formatter.formatToParts(Math.round(this.#amount) / 100).map(({ type, value }) => {
      switch (type) {
        case 'currency': return showCurrency ? value : ''
        case 'decimal': return dec ? value : ''
        case 'group':
        case 'infinity':
        case 'literal':
        case 'nan':
          return numOnly ? '' : value
        default: return value
      }
    }).reduce((string, part) => string + part)
  }

  add(that) {
    this.#amount += that.#amount
    return this
  }

  sub(that) {
    this.#amount -= that.#amount
    return this
  }
}