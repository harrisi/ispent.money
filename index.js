import Money from './src/money.mjs'
let db

// const params = new Proxy(new URLSearchParams(window.location.search), {
//   get: (searchParams, prop) => searchParams.get(prop),
// })

// if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
//   if (!params.launcher) {
//     // suggest adding to homescreen
//     let p = document.createElement('p')
//     p.textContent = `it looks like you're on mobile. try adding to homescreen.`
//     document.querySelector('#container').appendChild(p)
//   }
// }

// now that I don't do this in window.onload, it should be abstracted.

let mOH = new Money(localStorage.getItem('moneyOnHand') || 0, true)
document.querySelector('#moneyOnHand').value = mOH.toString()
initHistoryList()
populateCategories(localStorage.getItem('categories'))

const systemMessages = document.querySelector('#systemMessages')

const DBOpenRequest = window.indexedDB.open('ispent.money')

DBOpenRequest.onerror = e => {
  systemMessages.appendChild(createListItem(`error loading database; ${e.eventPhase}; ${DBOpenRequest.errorCode}`))
}

DBOpenRequest.onsuccess = e => {
  systemMessages.appendChild(createListItem('database initialized'))

  db = DBOpenRequest.result

  displayHist()
}

DBOpenRequest.onupgradeneeded = e => {
  db = e.target.result

  db.onerror = e => {
    systemMessages.appendChild(createListItem('error loading database'))
  }

  const objStore = db.createObjectStore('histList', { keyPath: 'id', autoIncrement: true, })

  objStore.createIndex('createdAt', 'createdAt', { unique: false })
  objStore.createIndex('moneyOnHand', 'moneyOnHand', { unique: false })
  objStore.createIndex('adjustAmount', 'adjustAmount', { unique: false })
  objStore.createIndex('category', 'category', { unique: false })
  // account, locale?, updatedAt?

  systemMessages.appendChild(createListItem('object store created'))
}

document.querySelector('#adjustMoney').addEventListener('input', checkAmount)
document.querySelector('#moneyOnHand').addEventListener('blur', updateMoneyOnHand)

document.querySelector('#moneyForm').addEventListener('submit', e => {
  e.preventDefault()

  adjustMoney()
}, false)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./src/sw.js')
}

function displayHist() {
  const hist = document.querySelector('#hist')
  while (hist.firstChild) {
    hist.removeChild(hist.lastChild)
  }

  const objStore = db.transaction('histList').objectStore('histList')
  objStore.openCursor().onsuccess = e => {
    const cursor = e.target.result

    if (!cursor) {
      systemMessages.appendChild(createListItem('entries all displayed'))
      return
    }

    const { createdAt, moneyOnHand, adjustAmount, category } = cursor.value
    const histText = `Spent $${new Money(adjustAmount, true)} on ${category || '(uncategorized)'} on ${Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(createdAt))}; $${new Money(moneyOnHand, true)} left.`
      const listItem = createListItem(histText)

      hist.prepend(listItem)

      cursor.continue()
    }
  }

  function createListItem(text) {
    const li = document.createElement('li')
    li.textContent = text
    return li
  }

  function initHistoryList() {
    let histList = document.querySelector('#historyList')
    if (!localStorage.getItem('hist'))
      return
    for (let hist of localStorage.getItem('hist').split(',').reverse()) {
      let histItem = document.createElement('li')
      let histElements = hist.split(';')
      let spentAmount = new Money(histElements[2], true).toString(true)
      let spentCategory = histElements[3]
      histItem.textContent = `Spent ${spentAmount} on ${spentCategory || '(uncategorized)'}`
      histList.appendChild(histItem)
    }
  }

  function updateHistoryList(spent, category) {
    let histList = document.querySelector('#historyList')
    let newHistItem = document.createElement('li')
    newHistItem.textContent = `Spent ${spent} on ${category || '(uncategorized)'}`
    histList.prepend(newHistItem)
  }

  function populateCategories(cats) {
    if (!cats) {
      return
    }

    let catElement = document.querySelector('#categories')
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
    let moneyOnHand = new Money(localStorage.getItem('moneyOnHand'), true).toString(null, true, false)
    let spent = Money.fromFormatted(document.querySelector('#adjustMoney').value)
    let category = document.querySelector('#category').value
    let now = Date.now()
    localStorage.setItem('hist', `${hist ? hist + ',' : ''}${now};${moneyOnHand};${spent.toString(false, true, false)};${category}`)
    updateHistoryList(spent.toString(true), category)

    let newItem = {
      createdAt: now,
      moneyOnHand,
      adjustAmount: spent.toString(false, true, false),
      category,
    }

    const trans = db.transaction('histList', 'readwrite')

    trans.oncomplete = () => {
      systemMessages.appendChild(createListItem('trans complete: db mod finished'))

      displayHist()
    }

    trans.onerror = () => {
      systemMessages.appendChild(createListItem(`trans error: ${trans.error}`))
    }

    const objStore = trans.objectStore('histList')
    console.log(objStore.indexNames)
    console.log(objStore.keyPath)
    console.log(objStore.name)
    console.log(objStore.transaction)
    console.log(objStore.autoIncrement)

    const objStoreReq = objStore.add(newItem)
    objStoreReq.onsuccess = e => {
      systemMessages.appendChild(createListItem('req success'))
    }
  }

  function updateMoneyOnHand() {
    let mOH = document.querySelector('#moneyOnHand')
    if (mOH.checkValidity()) {
      let mOHMoney = Money.fromFormatted(mOH.value)
      localStorage.setItem('moneyOnHand', mOHMoney.toString(null, true, false))
      mOH.value = mOHMoney.toString()
    } else {
      mOH.value = new Money(localStorage.getItem('moneyOnHand'), true)
    }
  }

  function adjustMoney() {
    let amount = document.querySelector('#adjustMoney')
    if (amount.checkValidity()) {
      let mOH = document.querySelector('#moneyOnHand')
      let newMOH = Money.fromFormatted(mOH.value).sub(Money.fromFormatted(amount.value))
      mOH.value = newMOH
      saveHist()
      localStorage.setItem('moneyOnHand', newMOH.toString(null, true, false))
      amount.value = ""
      lastValidAmount = ""

      let catElement = document.querySelector('#categories')
      let category = document.querySelector('#category')
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
    let amount = document.querySelector('#adjustMoney')
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
