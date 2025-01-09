/******/ (() => { // webpackBootstrap
/*!****************************!*\
  !*** ./src/invoiceList.js ***!
  \****************************/
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var tableRows = document.querySelectorAll("[data-table-items]");
itemTotal = 0;
function numberToWordsLT(amount) {
  var ones = ["", "vienas", "du", "trys", "keturi", "penki", "šeši", "septyni", "aštuoni", "devyni"];
  var teens = ["", "vienuolika", "dvylika", "trylika", "keturiolika", "penkiolika", "šešiolika", "septyniolika", "aštuoniolika", "devyniolika"];
  var tens = ["", "dešimt", "dvidešimt", "trisdešimt", "keturiasdešimt", "penkiasdešimt", "šešiasdešimt", "septyniasdešimt", "aštuoniasdešimt", "devyniasdešimt"];
  var hundreds = ["", "šimtas", "du šimtai", "trys šimtai", "keturi šimtai", "penki šimtai", "šeši šimtai", "septyni šimtai", "aštuoni šimtai", "devyni šimtai"];
  var thousands = ["", "tūkstantis", "tūkstančiai", "tūkstančių"];
  function getOnesAndTens(n) {
    if (n < 10) return ones[n];
    if (n > 10 && n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
  }
  function convertPart(n) {
    if (n === 0) return "";
    var h = Math.floor(n / 100);
    var t = n % 100;
    return ((h ? hundreds[h] + " " : "") + (t ? getOnesAndTens(t) : "")).trim();
  }
  function getThousandsPart(n) {
    if (n === 0) return "";
    if (n === 1) return "vienas tūkstantis";
    var rem = n % 10;
    var thousandsForm = n % 100 >= 11 && n % 100 <= 19 ? thousands[3] // "tūkstančių" for teens
    : rem === 1 ? thousands[1] // "tūkstantis" for singular
    : rem >= 2 && rem <= 9 ? thousands[2] // "tūkstančiai" for plural nominative
    : thousands[3]; // "tūkstančių" for plural genitive
    return convertPart(n) + " " + thousandsForm;
  }
  function getEurosWord(euros) {
    if (euros % 10 === 1 && euros % 100 !== 11) return "euras";
    if (euros % 10 >= 2 && euros % 10 <= 9 && (euros % 100 < 10 || euros % 100 >= 20)) return "eurai";
    return "eurų";
  }

  // Parse amount into euros and cents
  var _amount$toFixed$split = amount.toFixed(2).split(".").map(Number),
    _amount$toFixed$split2 = _slicedToArray(_amount$toFixed$split, 2),
    euros = _amount$toFixed$split2[0],
    cents = _amount$toFixed$split2[1];
  if (euros === 0 && cents === 0) return "nulis eurų ir 00 ct";
  var eurText = euros < 1000 ? convertPart(euros) : getThousandsPart(Math.floor(euros / 1000)) + (euros % 1000 !== 0 ? " " + convertPart(euros % 1000) : "");
  var eurWord = getEurosWord(euros);
  var ctText = cents < 10 ? "0" + cents : cents;
  return ((eurText ? eurText + " " + eurWord : "") + " ir " + ctText + " ct").trim();
}
function recalculateTotalsSection(total) {
  var totalSumElement = document.querySelector("[data-item-total]");
  var totalSum = parseFloat(total.toFixed(2));
  totalSumElement.innerText = "".concat(totalSum, " \u20AC");
  var transportElement = document.querySelector("[data-transport-cost]").innerText;
  var transport = Number(transportElement.split(" ")[0]);
  var vatElement = document.querySelector("[data-total-vat]");
  var vat = parseFloat(((totalSum + transport) * 0.21).toFixed(2));
  vatElement.innerText = "".concat(vat, " \u20AC");
  var invoiceTotalElement = document.querySelector("[data-invoice-total]");
  var invoiceTotal = parseFloat(totalSum + transport + vat);
  invoiceTotalElement.innerText = "".concat(invoiceTotal.toFixed(2), " \u20AC");
  var invoiceTotalWordsElement = document.querySelector("[data-words-total]");
  invoiceTotalWordsElement.innerText = "".concat(numberToWordsLT(invoiceTotal), " \u20AC");
}
function calculateRowTotals(rows) {
  itemTotal = 0;
  rows.forEach(function (row) {
    itemTotal += parseFloat(row.querySelector("[data-table-rowTotal]").innerText);
  });
  recalculateTotalsSection(itemTotal);
}
function deleteRow(rows) {
  rows.forEach(function (row) {
    var deleteRowBtn = row.querySelector("[data-table-deleteRow]");
    deleteRowBtn.addEventListener("click", function () {
      row.remove();
      var tableRowsAfterDeletion = document.querySelectorAll("[data-table-items]");
      calculateRowTotals(tableRowsAfterDeletion);
    });
  });
}
document.addEventListener("DOMContentLoaded", function () {
  var rowSum = 0;
  tableRows.forEach(function (row) {
    rowSum = row.querySelector("[data-table-rowTotal]").innerText;
    row.addEventListener("input", function () {
      var qtyInputElement = row.querySelector("[data-input-qty] input");
      var qtyInput = parseFloat(qtyInputElement.value) || 0;
      // let qtyInput = parseFloat(
      //   row.querySelector("[data-input-qty] input").value || 0
      // );
      var price = parseFloat(row.querySelector("[data-table-item-price]").innerText);
      var discountPercentage = row.querySelector("[data-input-percentage-value]");
      var discountFixed = row.querySelector("[data-input-fixed-value]");
      var priceAfterDiscountDOM = row.querySelector("[data-table-priceAfterDiscount]");
      var priceAfterDiscount = 0;
      if (discountPercentage) {
        discountPercentage = parseFloat(discountPercentage.value) / 100;
        priceAfterDiscount = parseFloat(price - price * discountPercentage);
        priceAfterDiscountDOM.innerText = parseFloat(priceAfterDiscount.toFixed(2));
      } else if (discountFixed) {
        discountFixed = parseFloat(Math.abs(discountFixed.value));
        priceAfterDiscount = parseFloat((price - discountFixed).toFixed(2));
        priceAfterDiscountDOM.innerText = priceAfterDiscount;
      }
      priceAfterDiscount > 0 ? rowSum = parseFloat(qtyInput * priceAfterDiscount).toFixed(2) : rowSum = parseFloat(qtyInput * price).toFixed(2);
      row.querySelector("[data-table-rowTotal]").innerText = rowSum;
      calculateRowTotals(tableRows, rowSum);
      qtyInputElement.addEventListener("blur", function () {
        // If the input is empty, set its value to 0
        if (qtyInputElement.value === "") {
          qtyInputElement.value = 0;
        }
      });
    });
    deleteRow(tableRows);
  });
});
/******/ })()
;