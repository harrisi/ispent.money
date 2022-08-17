window.addEventListener('load', () => {
  moneyOnHand = localStorage.getItem('moneyOnHand')
  if (moneyOnHand) {
    document.getElementById('moneyOnHand').value = moneyOnHand
  }
})

function updateMoneyOnHand() {
  let mOH = document.getElementById('moneyOnHand')
  if (mOH.checkValidity()) {
    localStorage.setItem('moneyOnHand', mOH.value)
  } else {
    mOH.value = localStorage.getItem('moneyOnHand')
  }
}

let lastValidAmount

function adjustMoney() {
  let amount = document.getElementById('adjustMoney')
  if (amount.checkValidity()) {
    lastValidAmount = amount.value
    document.getElementById('moneyOnHand').value = Number(document.getElementById('moneyOnHand').value) - Number(amount.value)
    updateMoneyOnHand()
  } else {
    amount.value = lastValidAmount
  }
}