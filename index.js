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
  populateCategories(localStorage.getItem('categories'))
})

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
  // does the value get automatically broken up on commas? what?
  localStorage.setItem('hist', `${localStorage.getItem('hist') ? localStorage.getItem('hist') + ',' : ''}${Date.now()};${localStorage.getItem('moneyOnHand')};${document.getElementById('adjustMoney').value * 100};${document.getElementById('category').value}`)
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