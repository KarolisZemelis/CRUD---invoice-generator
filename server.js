const express = require("express");
const app = express();
const fs = require("fs");
const hbs = require("handlebars");
app.use((req, res, next) => {
  // Dynamically reload the partials on each request
  hbs.registerPartial("top", fs.readFileSync("./templates/top.hbr", "utf8"));
  hbs.registerPartial(
    "bottom",
    fs.readFileSync("./templates/bottom.hbr", "utf8")
  );
  next();
});

app.use(express.static("public"));
app.use(express.json());

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

function createInvoiceObject(invoiceData, invoiceObject) {
  for (const [key, value] of Object.entries(invoiceData)) {
    invoiceObject[key] = value;
  }
  let items = invoiceObject.items;
  let discountAmount = 0;
  let allProductTotal = 0;
  let itemNumber = 1;

  items.forEach((item) => {
    let productTotal = 0;
    let discountAmount = 0;

    for (const key in item) {
      if (key === "discount") {
        if (item.discount.type === "fixed") {
          discountAmount = -Math.abs(parseFloat(item[key].value).toFixed(2));
          item.discount.fixed = true;
          item.discount.discountAmount = discountAmount;
        } else if (item.discount.type === "percentage") {
          discountAmount = -Math.abs(
            parseFloat(item.price * (item[key].value / 100)).toFixed(2)
          );
          item.discount.percentage = true;
          item.discount.discountAmount = discountAmount;
        } else {
          discountAmount = 0;
        }
      }
    }

    const itemPrice = parseFloat(item.price).toFixed(2);
    const itemQty = parseFloat(item.quantity).toFixed(2);
    const priceAfterDiscount = parseFloat(
      (itemPrice - parseFloat(discountAmount) * -1).toFixed(2)
    );
    item.priceAfterDiscount = priceAfterDiscount;

    productTotal = parseFloat((priceAfterDiscount * itemQty).toFixed(2));
    item.productTotal = productTotal;
    item.itemNumber = itemNumber;
    itemNumber++;
    allProductTotal += productTotal;
  });

  const totalsNumb = parseFloat(allProductTotal.toFixed(2));
  const shippingPrice = parseFloat(invoiceObject.shippingPrice.toFixed(2));
  const vat = parseFloat(((totalsNumb + shippingPrice) * 0.21).toFixed(2));
  const invoiceTotal = parseFloat(
    (totalsNumb + shippingPrice + vat).toFixed(2)
  );

  invoiceObject.invoiceTotal = invoiceTotal;
  invoiceObject.vat = vat;
  invoiceObject.allProductTotalString = numberToWordsLT(invoiceTotal);

  invoiceObject.allProductTotal = parseFloat(allProductTotal.toFixed(2));

  return invoiceObject;
}

const renderPage = (data, page) => {
  const pageContent = fs.readFileSync(`./templates/${page}.hbr`, "utf8");
  const layout = fs.readFileSync("./templates/layout.hbs", "utf8");

  const compiledLayout = hbs.compile(layout);
  const compiledPageContent = hbs.compile(pageContent);

  // Apply data to the page content
  const renderedPageContent = compiledPageContent(data);

  // Pass the rendered page content as the body to the layout
  return compiledLayout({ ...data, body: renderedPageContent });
};
//WE TARGET EXTERNAL INVOICE API TO GET INVOICE WE THEN FORM IT TO AN OBJECT WITH createInvoiceObject FUNCTION AND RETURN IT WHEN THIS API IS TRIGGERED IN CLIENT SIDE JS CODE
app.get("/api/invoice", (req, res) => {
  fetch(url) // Fetch invoice data from external API
    .then((apiResponse) => apiResponse.json())
    .then((invoiceData) => {
      const invoiceObject = createInvoiceObject(invoiceData, {}); // Generate invoice object
      res.json(invoiceObject); // Send invoice object as JSON
    })
    .catch((error) => {
      console.error("Error fetching invoice from external API:", error);
      res.status(500).send("Server Error");
    });
});

app.get("/invoice", (req, res) => {
  // res.setHeader("Cache-Control", "no-store");
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
      list = fs.readFileSync("./data/list.json", "utf8"); //SYNCRONOUS because the file is small and it doesnt stop the loop for long
      list = JSON.parse(list); // Parse the file content
    } catch (readError) {
      console.warn("list.json not found or invalid. Initializing new list.");
      list = {}; // Start with an empty array
    }

    list[req.body.number] = req.body;
    try {
      fs.writeFileSync("./data/list.json", JSON.stringify(list, null, 2));
    } catch (writeError) {
      console.error("Failed to write to list.json:", writeError);
      throw writeError; // Re-throw the error
    }
    console.log("Updated list saved:", list); // Log the updated list
    res.status(200).redirect("/invoice");
  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).send("Server Error");
  }
});
//READ
app.get("/invoiceList", (req, res) => {
  let list = fs.readFileSync("./data/list.json", "utf8");
  list = JSON.parse(list);

  const data = {
    style: "style.css",
    title: "PVM SF sąrašas",
    list,
  };

  const html = renderPage(data, "invoiceList");
  res.send(html);
});
//EDIT
app.get("/invoiceList/edit/:id", (req, res) => {
  let list = fs.readFileSync("./data/list.json", "utf8");
  list = JSON.parse(list);
  const item = list[req.params.id];

  if (!item) {
    const data = {
      pageTitle: "Puslapis nerastas",
      noMenu: true,
      metaRedirect: true,
    };
    const html = renderPage(data, "404");
    res.status(404).send(html);
    return;
  }

  const data = {
    pageTitle: "Redaguoti įrašą",
    style: "style.css",
    script: "invoiceList.js",
    item,
  };
  console.log(item);
  const html = renderPage(data, "edit");
  res.send(html);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
