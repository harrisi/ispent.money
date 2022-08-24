window.addEventListener('load', () => {
  // const params = new Proxy(new URLSearchParams(window.location.search), {
  //   get: (searchParams, prop) => searchParams.get(prop),
  // })

  // if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
  //   if (!params.launcher) {
  //     // suggest adding to homescreen
  //     let p = document.createElement('p')
  //     p.textContent = `it looks like you're on mobile. try adding to homescreen.`
  //     document.getElementById('container').appendChild(p)
  //   }
  // }

  let mOH = new Money(localStorage.getItem('moneyOnHand') || 0, true)
  document.getElementById('moneyOnHand').value = mOH.toString()
  document.getElementById('adjustMoney').onkeyup = handleKeyup
  document.getElementById('category').onkeyup = handleKeyup
  initHistoryList()
  populateCategories(localStorage.getItem('categories'))

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./src/sw.js')
  }
})

class Money {
  #amount
  #formatter
  constructor(amount, asIs = false, locale = 'en-US', currency = 'USD') {
    this.#amount = asIs ? amount : amount * 100
    this.#formatter = new Intl.NumberFormat(locale, { style: 'currency', currency })
  }

  static fromFormatted(amount) {
    return new Money(
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

function initHistoryList() {
  let histList = document.getElementById('historyList')
  if (!localStorage.getItem('hist'))
    return
  for (let hist of localStorage.getItem('hist').split(',').reverse()) {
    let histItem = document.createElement('li')
    let histElements = hist.split(';')
    let spentAmount = new Money(histElements[2], true).toString(true)
    let spentCategory = histElements[3]
    histItem.innerText = `Spent ${spentAmount} on ${spentCategory || '(uncategorized)'}`
    histList.appendChild(histItem)
  }
}

function updateHistoryList(spent, category) {
  let histList = document.getElementById('historyList')
  let newHistItem = document.createElement('li')
  newHistItem.innerText = `Spent ${spent} on ${category || '(uncategorized)'}`
  histList.prepend(newHistItem)
}

function populateCategories(cats) {
  if (!cats) {
    return
  }

  let catElement = document.getElementById('categories')
  for (let cat of cats.split(',')) {
    if (!cat) {
      continue
    }
    let newCat = document.createElement('option')
    newCat.value = cat
    catElement.appendChild(newCat)
  }
}

function saveHist() {
  let hist = localStorage.getItem('hist')
  let mOH = new Money(localStorage.getItem('moneyOnHand'), true).toString(null, true, false)
  let spent = Money.fromFormatted(document.getElementById('adjustMoney').value)
  let category = document.getElementById('category').value
  localStorage.setItem('hist', `${hist ? hist + ',' : ''}${Date.now()};${mOH};${spent.toString(false, true, false)};${category}`)
  updateHistoryList(spent.toString(true), category)
}

function updateMoneyOnHand() {
  let mOH = document.getElementById('moneyOnHand')
  if (mOH.checkValidity()) {
    let mOHMoney = Money.fromFormatted(mOH.value)
    localStorage.setItem('moneyOnHand', mOHMoney.toString(null, true, false))
    mOH.value = mOHMoney.toString()
  } else {
    mOH.value = new Money(localStorage.getItem('moneyOnHand'), true)
  }
}

function adjustMoney() {
  let amount = document.getElementById('adjustMoney')
  if (amount.checkValidity()) {
    let mOH = document.getElementById('moneyOnHand')
    let newMOH = Money.fromFormatted(mOH.value).sub(Money.fromFormatted(amount.value))
    mOH.value = newMOH
    saveHist()
    localStorage.setItem('moneyOnHand', newMOH.toString(null, true, false))
    amount.value = ""
    lastValidAmount = ""

    let catElement = document.getElementById('categories')
    let category = document.getElementById('category')
    let exists = false
    if (!category.value == '') {
      for (let opt of catElement.children) {
        if (opt.value == category.value) {
          exists = true
          break
        }
      }
      if (!exists) {
        let newCat = document.createElement('option')
        newCat.value = category.value
        catElement.appendChild(newCat)
        localStorage.setItem('categories', `${localStorage.getItem('categories') ? localStorage.getItem('categories') + ',' : ''}${category.value}`)
      }
    }
    category.value = ""
  }
  amount.focus()
}

let lastValidAmount = ""

function checkAmount() {
  let amount = document.getElementById('adjustMoney')
  if (amount.checkValidity()) {
    if (!amount.value.includes('.') ||
      ([...amount.value.matchAll(/\./g)].length < 2 && // zero or one
        // location of decimal must be in last three positions
        [-1, -2, -3].includes(amount.value.lastIndexOf('.') - amount.value.length))) {
      lastValidAmount = amount.value
    } else {
      amount.value = lastValidAmount
    }
  } else {
    amount.value = lastValidAmount
  }
}

function handleKeyup(e) {
  if (e.key === "Enter") {
    adjustMoney()
  }
}