window.addEventListener('load', () => {
  let mOH = localStorage.getItem('moneyOnHand')
  if (mOH) {
    document.getElementById('moneyOnHand').value = withSep(mOH)
  }
  document.getElementById('adjustMoney').onkeyup = handleKeyup
})

function withSep(without) {
  if (without.length === 1) {
    without = `0${without}`
  }
  let res = without.slice(0, -2) + "." + without.slice(-2)
  console.log(res)
  return res
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
    localStorage.setItem('moneyOnHand', mOH.value.replace('.', ''))
    amount.value = ""
    lastValidAmount = ""
  }
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