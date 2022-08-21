let db

window.addEventListener('load', () => {
  let mOH = localStorage.getItem('moneyOnHand')
  if (mOH) {
    document.getElementById('moneyOnHand').value = withSep(mOH)
  } else {
    localStorage.setItem('moneyOnHand', '0')
  }
  document.getElementById('adjustMoney').onkeyup = handleKeyup
  document.getElementById('category').onkeyup = handleKeyup
  if (!localStorage.getItem('hist')) {
    localStorage.setItem('hist', '')
  }
  initHistoryList()
  populateCategories(localStorage.getItem('categories'))

  const systemMessages = document.getElementById('systemMessages')

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

})

function displayHist() {
  const hist = document.getElementById('hist')
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
    const histText = `Spent $${withSep(adjustAmount)} on ${category} at ${createdAt}; $${withSep(moneyOnHand)} left.`
    const listItem = createListItem(histText)

    hist.appendChild(listItem)

    cursor.continue()
  }
}

function createListItem(text) {
  const li = document.createElement('li')
  li.textContent = text
  return li
}

function initHistoryList() {
  let histList = document.getElementById('historyList')
  for (let hist of localStorage.getItem('hist').split(',').reverse()) {
    let histItem = document.createElement('li')
    let histElements = hist.split(';')
    let spentAmount = withSep(histElements[2])
    let spentCategory = histElements[3]
    histItem.innerText = `Spent $${spentAmount} on ${spentCategory || '(uncategorized)'}`
    histList.appendChild(histItem)
  }
}

function updateHistoryList(spent, category) {
  let histList = document.getElementById('historyList')
  let newHistItem = document.createElement('li')
  newHistItem.innerText = `Spent $${spent} on ${category || '(uncategorized)'}`
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

function withSep(without) {
  without = without.toString()
  if (without.length === 1) {
    without = `0${without}`
  }
  let res = without.slice(0, -2) + "." + without.slice(-2)
  console.log(res)
  return res
}

function saveHist() {
  let hist = localStorage.getItem('hist')
  let moneyOnHand = localStorage.getItem('moneyOnHand')
  let adjustAmount = document.getElementById('adjustMoney').value * 100
  let category = document.getElementById('category').value
  let now = Date.now()
  localStorage.setItem('hist', `${hist ? hist + ',' : ''}${now};${moneyOnHand};${adjustAmount};${category}`)
  updateHistoryList(withSep(adjustAmount.toString()), category)

  let newItem = {
    createdAt: now,
    moneyOnHand,
    adjustAmount,
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
  let mOH = document.getElementById('moneyOnHand')
  if (mOH.checkValidity()) {
    localStorage.setItem('moneyOnHand', (mOH.value * 100))
  } else {
    mOH.value = withSep(localStorage.getItem('moneyOnHand'))
  }
}

function adjustMoney() {
  let amount = document.getElementById('adjustMoney')
  if (amount.checkValidity()) {
    let mOH = document.getElementById('moneyOnHand')
    mOH.value = withSep(((Math.round(mOH.value * 100) - Math.round(amount.value * 100))).toString())
    saveHist()
    localStorage.setItem('moneyOnHand', mOH.value.replace('.', ''))
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
    lastValidAmount = amount.value
  } else {
    amount.value = lastValidAmount
  }
}

function handleKeyup(e) {
  if (e.key === "Enter") {
    adjustMoney()
  }
}