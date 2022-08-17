addEventListener('load', () => {
  moneyOnHand = localStorage.getItem('moneyOnHand')
  if (moneyOnHand) {
    document.getElementById('moneyOnHand').innerText = moneyOnHand
  }
})

function updateMoneyOnHand() {
  localStorage.setItem('moneyOnHand', document.getElementById('moneyOnHand').innerText)
}