itemTotal = 0;

function numberToWordsLT(amount) {
  const ones = [
    "",
    "vienas",
    "du",
    "trys",
    "keturi",
    "penki",
    "šeši",
    "septyni",
    "aštuoni",
    "devyni",
  ];
  const teens = [
    "",
    "vienuolika",
    "dvylika",
    "trylika",
    "keturiolika",
    "penkiolika",
    "šešiolika",
    "septyniolika",
    "aštuoniolika",
    "devyniolika",
  ];
  const tens = [
    "",
    "dešimt",
    "dvidešimt",
    "trisdešimt",
    "keturiasdešimt",
    "penkiasdešimt",
    "šešiasdešimt",
    "septyniasdešimt",
    "aštuoniasdešimt",
    "devyniasdešimt",
  ];
  const hundreds = [
    "",
    "šimtas",
    "du šimtai",
    "trys šimtai",
    "keturi šimtai",
    "penki šimtai",
    "šeši šimtai",
    "septyni šimtai",
    "aštuoni šimtai",
    "devyni šimtai",
  ];
  const thousands = ["", "tūkstantis", "tūkstančiai", "tūkstančių"];

  function getOnesAndTens(n) {
    if (n < 10) return ones[n];
    if (n > 10 && n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
  }

  function convertPart(n) {
    if (n === 0) return "";
    const h = Math.floor(n / 100);
    const t = n % 100;
    return ((h ? hundreds[h] + " " : "") + (t ? getOnesAndTens(t) : "")).trim();
  }

  function getThousandsPart(n) {
    if (n === 0) return "";
    if (n === 1) return "vienas tūkstantis";
    const rem = n % 10;
    const thousandsForm =
      n % 100 >= 11 && n % 100 <= 19
        ? thousands[3] // "tūkstančių" for teens
        : rem === 1
        ? thousands[1] // "tūkstantis" for singular
        : rem >= 2 && rem <= 9
        ? thousands[2] // "tūkstančiai" for plural nominative
        : thousands[3]; // "tūkstančių" for plural genitive
    return convertPart(n) + " " + thousandsForm;
  }

  function getEurosWord(euros) {
    if (euros % 10 === 1 && euros % 100 !== 11) return "euras";
    if (
      euros % 10 >= 2 &&
      euros % 10 <= 9 &&
      (euros % 100 < 10 || euros % 100 >= 20)
    )
      return "eurai";
    return "eurų";
  }

  // Parse amount into euros and cents
  const [euros, cents] = amount.toFixed(2).split(".").map(Number);

  if (euros === 0 && cents === 0) return "nulis eurų ir 00 ct";

  const eurText =
    euros < 1000
      ? convertPart(euros)
      : getThousandsPart(Math.floor(euros / 1000)) +
        (euros % 1000 !== 0 ? " " + convertPart(euros % 1000) : "");

  const eurWord = getEurosWord(euros);
  const ctText = cents < 10 ? "0" + cents : cents;

  return (
    (eurText ? eurText + " " + eurWord : "") +
    " ir " +
    ctText +
    " ct"
  ).trim();
}

function recalculateTotalsSection(total) {
  const totalSumElement = document.querySelector("[data-item-total]");
  const totalSum = parseFloat(total.toFixed(2));
  totalSumElement.innerText = `${totalSum} €`;
  const transportElement = document.querySelector(
    "[data-transport-cost]"
  ).innerText;
  const transport = Number(transportElement.split(" ")[0]);
  const vatElement = document.querySelector("[data-total-vat]");
  const vat = parseFloat(((totalSum + transport) * 0.21).toFixed(2));
  vatElement.innerText = `${vat} €`;
  const invoiceTotalElement = document.querySelector("[data-invoice-total]");
  const invoiceTotal = parseFloat(totalSum + transport + vat);
  invoiceTotalElement.innerText = `${invoiceTotal.toFixed(2)} €`;
  const invoiceTotalWordsElement = document.querySelector("[data-words-total]");
  invoiceTotalWordsElement.innerText = `${numberToWordsLT(invoiceTotal)} €`;
}

function calculateRowTotals(rows) {
  itemTotal = 0;
  rows.forEach((row) => {
    let rowTotal = parseFloat(
      row.querySelector("[data-table-rowTotal]").innerText
    );
    itemTotal += rowTotal;
  });

  recalculateTotalsSection(itemTotal);
}

function listenForDiscountSelect() {
  document.querySelectorAll(".discount-type-selector").forEach((selector) => {
    selector.addEventListener("change", function () {
      const parent = this.closest("div"); // Get the parent <div>

      const fixedInputContainer = parent.querySelector(
        "[data-fixed-discount-container]"
      );

      const percentageInputContainer = parent.querySelector(
        "[data-percentage-discount-container]"
      );

      const fixedInput = parent.querySelector("[ data-input-fixed-value]");

      const percentageInput = parent.querySelector(
        "[ data-input-percentage-value]"
      );

      const fixedInputOldData = parent.querySelector(
        "[data-input-fixed-value]"
      ).value;
      const percentageInputOldData = parent.querySelector(
        "[data-input-percentage-value]"
      ).value;
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
  rows.forEach((row) => {
    const deleteRowBtn = row.querySelector("[data-table-deleteRow]");
    deleteRowBtn.addEventListener("click", () => {
      row.remove();
      const tableRowsAfterDeletion =
        document.querySelectorAll("[data-table-items]");
      calculateRowTotals(tableRowsAfterDeletion);
    });
  });
}
//renderinam sąskaitą kurią editinsim

let rowSum = 0;
const tableRows = document.querySelectorAll("[data-table-items]");
listenForDiscountSelect();
deleteRow(tableRows);
tableRows.forEach((row) => {
  rowSum = row.querySelector("[data-table-rowTotal]").innerText;

  row.addEventListener("input", () => {
    let qtyInputElement = row.querySelector("[data-input-qty] input");
    let qtyInput = parseFloat(qtyInputElement.value) || 0;

    const price = parseFloat(
      row.querySelector("[data-table-item-price]").innerText
    );
    let discountPercentage = row.querySelector("[data-input-percentage-value]");
    let discountFixed = row.querySelector("[data-input-fixed-value]");
    let discountType = row.querySelector("[data-discount-type]").value;
    let priceAfterDiscountDOM = row.querySelector(
      "[data-table-priceAfterDiscount]"
    );
    let priceAfterDiscount = 0;
    if (discountType === "percentage") {
      let discountPercentageValue = parseFloat(discountPercentage.value) / 100;

      priceAfterDiscount = parseFloat(
        (price - price * discountPercentageValue).toFixed(2)
      );
      priceAfterDiscountDOM.innerText = parseFloat(
        priceAfterDiscount.toFixed(2)
      );
    } else if (discountType === "fixed") {
      let discountFixedValue = parseFloat(Math.abs(discountFixed.value));

      priceAfterDiscount = parseFloat((price - discountFixedValue).toFixed(2));

      priceAfterDiscountDOM.innerText = priceAfterDiscount;
    }

    priceAfterDiscount > 0
      ? (rowSum = parseFloat(qtyInput * priceAfterDiscount).toFixed(2))
      : (rowSum = parseFloat(qtyInput * price).toFixed(2));

    row.querySelector("[data-table-rowTotal]").innerText = rowSum;
    const tableRowsRefresh = document.querySelectorAll("[data-table-items]");
    calculateRowTotals(tableRowsRefresh, rowSum);

    qtyInputElement.addEventListener("blur", function () {
      if (qtyInputElement.value === "") {
        qtyInputElement.value = 0;
      }
    });
  });
});
