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