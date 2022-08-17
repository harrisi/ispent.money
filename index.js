window.addEventListener('load', () => {
  let mOH = localStorage.getItem('moneyOnHand')
  if (mOH) {
    document.getElementById('moneyOnHand').value = Number(mOH) / 100.0
  }
  document.getElementById('adjustMoney').onkeyup = handleKeyup
})

function updateMoneyOnHand() {
  let mOH = document.getElementById('moneyOnHand')
  if (mOH.checkValidity()) {
    localStorage.setItem('moneyOnHand', Number(mOH.value) * 100)
  } else {
    mOH.value = localStorage.getItem('moneyOnHand')
  }
}

function adjustMoney() {
  let amount = document.getElementById('adjustMoney')
  if (amount.checkValidity()) {
    let mOH = document.getElementById('moneyOnHand')
    mOH.value = (Number(mOH.value) * 100 - Number(amount.value) * 100) / 100.0
    localStorage.setItem('moneyOnHand', mOH.value * 100)
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