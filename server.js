const express = require("express");
const app = express();
const fs = require("fs");
const hbs = require("handlebars");
hbs.registerPartial("top", fs.readFileSync("./templates/top.hbr", "utf8"));
hbs.registerPartial(
  "bottom",
  fs.readFileSync("./templates/bottom.hbr", "utf8")
);

app.use(express.static("public"));
app.use(express.json());

const url = "https://in3.dev/inv/";
let invoiceObject;

async function getData() {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status : ${response.status}`);
    }

    const invoiceData = await response.json();
    invoiceObject = {};

    createInvoiceObject(invoiceData, invoiceObject);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}
getData().then(() => {});
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
      const priceAfterDiscount = parseFloat(
        (itemPrice - parseFloat(discountAmount) * -1).toFixed(2)
      );
      invoiceObject.items[i].priceAfterDiscount = priceAfterDiscount;
      productTotal = parseFloat((priceAfterDiscount * itemQty).toFixed(2));
      invoiceObject.items[i].productTotal = productTotal;
    }
    allProductTotal += productTotal;
  }
  invoiceObject.allProductTotalString = numberToWordsLT(allProductTotal);
  invoiceObject.allProductTotal = parseFloat(allProductTotal.toFixed(2));

  return invoiceObject;
}

const renderPage = (data, page) => {
  const pageContent = fs.readFileSync(`./templates/${page}.hbr`, "utf8");
  const layout = fs.readFileSync("./templates/layout.hbs", "utf8");
  const compiled = hbs.compile(layout);
  return compiled({ ...data, body: pageContent });
};

app.get("/api/invoice", (req, res) => {
  res.json(invoiceObject); // Send the invoiceObject as JSON response
});

app.get("/invoice", (req, res) => {
  const data = {
    script: "invoice.js",
    style: "style.css",
    title: "PVM SF generavimas",
  };
  const html = renderPage(data, "invoice");
  res.send(html);
});

app.post("/invoice", async (req, res) => {
  try {
    console.log("Request body received:", req.body); // Log received data

    // Read the file, or initialize an empty list if the file doesn't exist
    let list;
    try {
      list = fs.readFileSync("./data/list.json", "utf8");
      list = JSON.parse(list); // Parse the file content
    } catch (readError) {
      console.warn("list.json not found or invalid. Initializing new list.");
      list = []; // Start with an empty array
    }

    const invoiceObjectToSave = req.body; // Extract the incoming invoice object
    list.push(invoiceObjectToSave); // Add the new invoice to the list

    // Write back the updated list to the file
    fs.writeFileSync("./data/list.json", JSON.stringify(list, null, 2));

    console.log("Updated list saved:", list); // Log the updated list
    res.status(200).send("Invoice saved successfully");
  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/invoiceList", (req, res) => {
  // res.send("Hello World!");
  const data = {
    script: "invoice.js",
    style: "style.css",
  };
  const html = renderPage(data, "invoiceList");
  res.send(html);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
