/******/ (() => { // webpackBootstrap
/*!****************************!*\
  !*** ./src/invoiceList.js ***!
  \****************************/
tableRow = document.querySelectorAll("[data-table-items]");
itemTotal = 0;
function calculateRowTotals(rows) {
  itemTotal = 0;
  rows.forEach(function (row) {
    itemTotal += parseFloat(row.querySelector("[data-table-rowTotal]").innerText);
  });
  console.log(itemTotal);
  return itemTotal;
}
document.addEventListener("DOMContentLoaded", function () {
  var rowSum = 0;
  tableRow.forEach(function (row) {
    rowSum = row.querySelector("[data-table-rowTotal]").innerText;
    row.addEventListener("input", function () {
      var qtyInput = parseFloat(row.querySelector("[data-input-qty] input").value);
      var price = parseFloat(row.querySelector("[data-table-item-price]").innerText);
      var discountPercentage = row.querySelector("[data-input-percentage-value]");
      var discountFixed = row.querySelector("[data-input-fixed-value]");
      var priceAfterDiscountDOM = row.querySelector("[data-table-priceAfterDiscount]");
      var priceAfterDiscount = 0;
      if (discountPercentage) {
        discountPercentage = parseFloat(discountPercentage.value) / 100;
        priceAfterDiscount = parseFloat(price - price * discountPercentage);
        priceAfterDiscountDOM.innerText = priceAfterDiscount;
      } else if (discountFixed) {
        discountFixed = parseFloat(Math.abs(discountFixed.value));
        priceAfterDiscount = parseFloat((price - discountFixed).toFixed(2));
        priceAfterDiscountDOM.innerText = priceAfterDiscount;
      }
      priceAfterDiscount > 0 ? rowSum = parseFloat(qtyInput * priceAfterDiscount).toFixed(2) : rowSum = parseFloat(qtyInput * price).toFixed(2);
      row.querySelector("[data-table-rowTotal]").innerText = rowSum;
      calculateRowTotals(tableRow, rowSum);
    });
    // itemTotal += parseFloat(rowSum);
  });

  // console.log(itemTotal);
});
/******/ })()
;