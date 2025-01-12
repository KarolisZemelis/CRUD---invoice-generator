/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/editInvoice.js":
/*!****************************!*\
  !*** ./src/editInvoice.js ***!
  \****************************/
/***/ (() => {

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
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
  console.log("sauna funkcija");
  itemTotal = 0;
  rows.forEach(function (row) {
    var rowTotal = parseFloat(row.querySelector("[data-table-rowTotal]").innerText);
    itemTotal += rowTotal;
    console.log("rowTotalX", rowTotal);
  });
  recalculateTotalsSection(itemTotal);
}
function listenForDiscountSelect() {
  document.querySelectorAll(".discount-type-selector").forEach(function (selector) {
    selector.addEventListener("change", function () {
      var parent = this.closest("div"); // Get the parent <div>

      var fixedInputContainer = parent.querySelector("[data-fixed-discount-container]");
      var percentageInputContainer = parent.querySelector("[data-percentage-discount-container]");
      var fixedInput = parent.querySelector("[ data-input-fixed-value]");
      var percentageInput = parent.querySelector("[ data-input-percentage-value]");
      var fixedInputOldData = parent.querySelector("[data-input-fixed-value]").value;
      var percentageInputOldData = parent.querySelector("[data-input-percentage-value]").value;
      fixedInput.value = fixedInputOldData;
      percentageInput.value = percentageInputOldData;
      if (this.value === "fixed") {
        fixedInputContainer.style.display = "block";
        fixedInput.disabled = false;
        percentageInputContainer.style.display = "none";
        percentageInput.disabled = true;
      } else if (this.value === "percentage") {
        fixedInputContainer.style.display = "none";
        fixedInput.disabled = true;
        percentageInputContainer.style.display = "block";
        percentageInput.disabled = false;
      }
    });
  });
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
//renderinam sąskaitą kurią editinsim

var rowSum = 0;
var tableRows = document.querySelectorAll("[data-table-items]");
listenForDiscountSelect();
deleteRow(tableRows);
tableRows.forEach(function (row) {
  rowSum = row.querySelector("[data-table-rowTotal]").innerText;
  row.addEventListener("input", function () {
    var qtyInputElement = row.querySelector("[data-input-qty] input");
    var qtyInput = parseFloat(qtyInputElement.value) || 0;
    var price = parseFloat(row.querySelector("[data-table-item-price]").innerText);
    var discountPercentage = row.querySelector("[data-input-percentage-value]");
    var discountFixed = row.querySelector("[data-input-fixed-value]");
    var discountType = row.querySelector("[data-discount-type]").value;
    var priceAfterDiscountDOM = row.querySelector("[data-table-priceAfterDiscount]");
    var priceAfterDiscount = 0;
    if (discountType === "percentage") {
      var discountPercentageValue = parseFloat(discountPercentage.value) / 100;
      priceAfterDiscount = parseFloat((price - price * discountPercentageValue).toFixed(2));
      priceAfterDiscountDOM.innerText = parseFloat(priceAfterDiscount.toFixed(2));
    } else if (discountType === "fixed") {
      var discountFixedValue = parseFloat(Math.abs(discountFixed.value));
      priceAfterDiscount = parseFloat((price - discountFixedValue).toFixed(2));
      priceAfterDiscountDOM.innerText = priceAfterDiscount;
    }
    priceAfterDiscount > 0 ? rowSum = parseFloat(qtyInput * priceAfterDiscount).toFixed(2) : rowSum = parseFloat(qtyInput * price).toFixed(2);
    row.querySelector("[data-table-rowTotal]").innerText = rowSum;
    var tableRowsRefresh = document.querySelectorAll("[data-table-items]");
    calculateRowTotals(tableRowsRefresh, rowSum);
    qtyInputElement.addEventListener("blur", function () {
      if (qtyInputElement.value === "") {
        qtyInputElement.value = 0;
      }
    });
  });
});

/***/ }),

/***/ "./src/style.scss":
/*!************************!*\
  !*** ./src/style.scss ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/styleList.scss":
/*!****************************!*\
  !*** ./src/styleList.scss ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/styleEdit.scss":
/*!****************************!*\
  !*** ./src/styleEdit.scss ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"/public/editInvoice": 0,
/******/ 			"public/styleEdit": 0,
/******/ 			"public/styleList": 0,
/******/ 			"public/style": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkjs022"] = self["webpackChunkjs022"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, ["public/styleEdit","public/styleList","public/style"], () => (__webpack_require__("./src/editInvoice.js")))
/******/ 	__webpack_require__.O(undefined, ["public/styleEdit","public/styleList","public/style"], () => (__webpack_require__("./src/style.scss")))
/******/ 	__webpack_require__.O(undefined, ["public/styleEdit","public/styleList","public/style"], () => (__webpack_require__("./src/styleList.scss")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["public/styleEdit","public/styleList","public/style"], () => (__webpack_require__("./src/styleEdit.scss")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;