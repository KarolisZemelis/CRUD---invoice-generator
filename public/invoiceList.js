/******/ (() => { // webpackBootstrap
/*!****************************!*\
  !*** ./src/invoiceList.js ***!
  \****************************/
tableRow = document.querySelectorAll("[data-table-items]");
document.addEventListener("DOMContentLoaded", function () {
  tableRow.forEach(function (row) {
    row.addEventListener("input", function () {
      var qtyInput = parseFloat(row.querySelector("[data-input-qty] input").value);
      var price = parseFloat(row.querySelector("[data-table-item-price]").innerText);
      var discountPercentage = row.querySelector("[data-input-percentage-value]");
      var discountFixed = row.querySelector("[data-input-fixed-value]");
      var priceAfterDiscount = 0;
      if (discountPercentage) {
        discountPercentage = parseFloat(discountPercentage.value) / 100;
        priceAfterDiscount = parseFloat(price - price * discountPercentage);
      } else if (discountFixed) {
        discountFixed = parseFloat(Math.abs(discountFixed.value));
        priceAfterDiscount = parseFloat((price - discountFixed).toFixed(2));
      }
      var rowSum = 0;
      priceAfterDiscount > 0 ? rowSum = parseFloat(qtyInput * priceAfterDiscount).toFixed(2) : rowSum = parseFloat(qtyInput * price).toFixed(2);
      row.querySelector("[data-table-rowTotal]").innerText = rowSum;
    });
  });
});
/******/ })()
;