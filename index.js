window.addEventListener('load', () => {
  let mOH = localStorage.getItem('moneyOnHand')
  if (mOH) {
    document.getElementById('moneyOnHand').value = mOH
  }
  document.getElementById('adjustMoney').onkeyup = handleKeyup
})

function updateMoneyOnHand() {
  let mOH = document.getElementById('moneyOnHand')
  if (mOH.checkValidity()) {
    localStorage.setItem('moneyOnHand', mOH.value)
  } else {
    mOH.value = localStorage.getItem('moneyOnHand')
  }
}

function adjustMoney() {
  let amount = document.getElementById('adjustMoney')
  if (amount.checkValidity()) {
    let mOH = document.getElementById('moneyOnHand')
    mOH.value = mOH.value - amount.value
    localStorage.setItem('moneyOnHand', mOH.value)
    amount.value = ""
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