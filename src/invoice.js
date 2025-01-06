const url = "https://in3.dev/inv/";

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

async function getData() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status : ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

(async function getInvoiceData() {
  try {
    const invoiceData = await getData();
    const invoiceObject = {};

    render(createInvoiceObject(invoiceData, invoiceObject));
    console.log(invoiceObject);
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
})();

function createInvoiceObject(invoiceData, invoiceObject) {
  for (const [key, value] of Object.entries(invoiceData)) {
    invoiceObject[key] = value;
  }
  let items = invoiceObject.items;
  let discountAmount = 0;
  let allProductTotal = 0;

  for (let i = 0; i < items.length; i++) {
    let productTotal = 0;
    for (const key in items[i]) {
      if (key === "discount") {
        if (items[i][key].type === "fixed") {
          discountAmount = -Math.abs(
            parseFloat(items[i][key].value).toFixed(2)
          );
          items[i][key].discountAmount = discountAmount;
        } else if (items[i][key].type === "percentage") {
          discountAmount = -Math.abs(
            parseFloat(items[i].price * (items[i][key].value / 100)).toFixed(2)
          );
          items[i][key].discountAmount = discountAmount;
        } else {
          discountAmount = 0;
        }
      }
      const itemPrice = parseFloat(items[i].price).toFixed(2);
      const itemQty = parseFloat(items[i].quantity).toFixed(2);
      const priceAfterDiscount =
        itemPrice - (parseFloat(discountAmount) * -1).toFixed(2);
      invoiceObject.items[i].priceAfterDiscount = priceAfterDiscount;
      productTotal = parseFloat((priceAfterDiscount * itemQty).toFixed(2));
      invoiceObject.items[i].productTotal = productTotal;
    }
    allProductTotal += productTotal;
  }
  invoiceObject.allProductTotal = parseFloat(allProductTotal.toFixed(2));
  return invoiceObject;
}

function render(invoiceObj) {
  const invoiceContainer = document.querySelector("[data-invoice-container]");
  getInvoiceDetails(invoiceObj);
  getBuyerDetails(invoiceObj);
  getSellerDetails(invoiceObj);
  populateTotalSection(invoiceObj);
}

function getInvoiceDetails(invoiceObj) {
  document.querySelector("[data-invoice-number]").innerText = invoiceObj.number;
  document.querySelector("[data-invoice-date]").innerText = invoiceObj.date;
}

function getBuyerDetails(invoiceObj) {
  document.querySelector("[data-invoice-buyer-name]").innerText =
    invoiceObj.company.buyer.name;
  document.querySelector("[data-invoice-buyer-address]").innerText =
    invoiceObj.company.buyer.address;
  document.querySelector("[data-invoice-buyer-code]").innerText =
    invoiceObj.company.buyer.vat;
  document.querySelector("[data-invoice-buyer-vat]").innerText =
    invoiceObj.company.buyer.name;
  document.querySelector("[data-invoice-buyer-phone]").innerText =
    invoiceObj.company.buyer.phone;
  document.querySelector("[data-invoice-buyer-email]").innerText =
    invoiceObj.company.buyer.email;
}

function getSellerDetails(invoiceObj) {
  document.querySelector("[data-invoice-seller-name]").innerText =
    invoiceObj.company.seller.name;
  document.querySelector("[data-invoice-seller-address]").innerText =
    invoiceObj.company.seller.address;
  document.querySelector("[data-invoice-seller-code]").innerText =
    invoiceObj.company.seller.vat;
  document.querySelector("[data-invoice-seller-vat]").innerText =
    invoiceObj.company.seller.name;
  document.querySelector("[data-invoice-seller-phone]").innerText =
    invoiceObj.company.seller.phone;
  document.querySelector("[data-invoice-seller-email]").innerText =
    invoiceObj.company.seller.email;
}

function populateTotalSection(invoiceObj) {
  const totalsNumb = parseFloat(invoiceObj.allProductTotal);
  const shippingPrice = parseFloat(invoiceObj.shippingPrice.toFixed(2));
  const vat = parseFloat(((totalsNumb + shippingPrice) * 0.21).toFixed(2));
  const invoiceTotal = parseFloat(
    (totalsNumb + shippingPrice + vat).toFixed(2)
  );

  document.querySelector("[data-item-total]").innerHTML = totalsNumb;
  document.querySelector("[data-transport-cost]").innerHTML = shippingPrice;
  document.querySelector("[data-total-vat]").innerHTML = vat;
  document.querySelector("[data-invoice-total]").innerHTML = invoiceTotal;
  document.querySelector("[data-words-total]").innerHTML =
    numberToWordsLT(invoiceTotal);
  document.querySelector("[data-due-date]").innerHTML = invoiceObj.due_date;
}
