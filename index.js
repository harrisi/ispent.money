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

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./src/sw.js')
  }
})

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
  if (without.length === 1) {
    without = `0${without}`
  }
  let res = without.slice(0, -2) + "." + without.slice(-2)
  console.log(res)
  return res
}

function saveHist() {
  let hist = localStorage.getItem('hist')
  let mOH = localStorage.getItem('moneyOnHand')
  let spent = document.getElementById('adjustMoney').value * 100
  let category = document.getElementById('category').value
  localStorage.setItem('hist', `${hist ? hist + ',' : ''}${Date.now()};${mOH};${spent};${category}`)
  updateHistoryList(withSep(spent.toString()), category)
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