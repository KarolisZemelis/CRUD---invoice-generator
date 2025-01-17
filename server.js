const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const hbs = require("handlebars");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const URL = "http://localhost:3000/";
//reload data after page reload
app.use((req, res, next) => {
  // Dynamically reload the partials on each request
  hbs.registerPartial("top", fs.readFileSync("./templates/top.hbr", "utf8"));
  hbs.registerPartial(
    "bottom",
    fs.readFileSync("./templates/bottom.hbr", "utf8")
  );
  next();
});

const updateSession = (req, prop, data) => {
  const sessionId = req.user.sessionId;
  let sessions = fs.readFileSync("./data/session.json", "utf8");
  sessions = JSON.parse(sessions);
  let session = sessions.find((s) => s.sessionId === sessionId);

  if (!session) {
    return;
  }

  // Set the property if data is provided, otherwise delete it
  if (data === null) {
    delete session[prop];
  } else {
    session[prop] = data;
  }

  sessions = JSON.stringify(sessions);
  fs.writeFileSync("./data/session.json", sessions);
};

// Midleware

// Cookie middleware
const cookieMiddleware = (req, res, next) => {
  let visitsCount = req.cookies.visits || 0;
  visitsCount++;
  // ONE YEAR
  res.cookie("visits", visitsCount, { maxAge: 1000 * 60 * 60 * 24 * 365 });
  next();
};

// Session middleware
const sessionMiddleware = (req, res, next) => {
  let sessionId = req.cookies.sessionId || null;
  if (!sessionId) {
    sessionId = md5(uuidv4()); // md5 kad būtų trumpesnis
  }
  let session = fs.readFileSync("./data/session.json", "utf8");
  session = JSON.parse(session);
  let user = session.find((u) => u.sessionId === sessionId);
  if (!user) {
    user = {
      sessionId,
    };
    session.push(user);
    session = JSON.stringify(session);
    fs.writeFileSync("./data/session.json", session);
  }
  req.user = user;
  res.cookie("sessionId", sessionId, { maxAge: 1000 * 60 * 60 * 24 * 365 });
  next();
};

// Messages middleware
const messagesMiddleware = (req, res, next) => {
  if (req.method === "GET") {
    updateSession(req, "message", null);
  }
  next();
};

app.use(cookieParser());
app.use(cookieMiddleware);
app.use(sessionMiddleware);
app.use(messagesMiddleware);
app.use(
  session({
    secret: "your-secret-key", // Replace with a strong secret
    resave: false, // Prevent unnecessary session saving
    saveUninitialized: true, // Save uninitialized sessions
    cookie: { secure: false }, // Use `true` only if serving over HTTPS
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const urlApi = "https://in3.dev/inv/";

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

function invoiceTotalCalculations(invoiceObject) {
  let items = invoiceObject.items;
  let allProductTotal = 0;
  let itemNumber = 1;

  items.forEach((item) => {
    let productTotal = 0;
    let discountAmount = 0;
    const itemPrice = parseFloat(item.price).toFixed(2);
    const itemQty = parseFloat(item.quantity).toFixed(2);

    for (const key in item) {
      if (key === "discount") {
        if (item.discount.type === "fixed") {
          discountAmount = parseFloat(item[key].value).toFixed(2);

          item.discount.fixed = true;

          item.discount.discountAmount = discountAmount;
          item.discount.discountPercentage = parseFloat(
            ((discountAmount * 100) / itemPrice).toFixed(2)
          );
          //ok
        } else if (item.discount.type === "percentage") {
          discountAmount = parseFloat(
            item.price * (item[key].value / 100)
          ).toFixed(2);

          item.discount.percentage = true;
          item.discount.discountAmount = discountAmount;
        } else {
          item.discount = {};
          item.discount.type = "none";
          item.discount.none = true;
          discountAmount = 0;
        }
      }
      item.discount.minDiscount = parseFloat((-itemPrice + 0.01).toFixed(2));
    }

    const priceAfterDiscount = parseFloat(
      (itemPrice - parseFloat(discountAmount)).toFixed(2)
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

  invoiceObject.allProductTotal = totalsNumb;

  return invoiceObject;
}

function createInvoiceObject(invoiceData, invoiceObject) {
  for (const [key, value] of Object.entries(invoiceData)) {
    invoiceObject[key] = value;
  }
  return invoiceTotalCalculations(invoiceObject);
}

function formChangeObject(formData) {
  const reformObject = (formData) => {
    const output = {};

    for (const key in formData) {
      const [itemKey, dataKey] = key.split(" ");
      const [, itemNumber] = itemKey.split("_"); // Extract number after "itemNumber_"

      if (!output[itemNumber]) {
        output[itemNumber] = { itemNumber };
      }

      if (
        (key.includes("discount_fixed") &&
          formData[key] !== "0" &&
          Number(formData[key]) < 0) ||
        (key.includes("discount_percentage") &&
          formData[key] !== "0" &&
          Number(formData[key]) > 0)
      ) {
        output[itemNumber][dataKey] = formData[key];
      } else {
        output[itemNumber][dataKey] = formData[key];
      }
    }

    return output;
  };

  const result = reformObject(formData);

  return result;
}

function reformedItems(list, formData, reformedObjectData, invoiceToChange) {
  let newItems = [];
  let oldItems = [];
  for (const key in reformedObjectData) {
    newItems.push(Number(key));
  }
  for (const key in invoiceToChange.items) {
    let oldKey = invoiceToChange.items[key].itemNumber;
    oldItems.push(oldKey);
  }
  const finalItems = newItems.filter((number) => oldItems.includes(number));

  const itemsToAddToInvoice = { items: [] };
  finalItems.forEach((itemNr) => {
    const selectedItem = invoiceToChange.items.find(
      (item) => item.itemNumber === itemNr
    );
    selectedItem.quantity = Number(reformedObjectData[itemNr].quantity);

    if (reformedObjectData[itemNr].hasOwnProperty("discount_fixed")) {
      selectedItem.discount.value = Math.abs(
        Number(reformedObjectData[itemNr].discount_fixed)
      );
      selectedItem.discount.discountAmount = Number(
        reformedObjectData[itemNr].discount_fixed
      );
      selectedItem.discount.type = "fixed";
      //nufalsinam kitas reikšmes jei jos yra
      selectedItem.discount.percentage
        ? (selectedItem.discount.percentage = false)
        : null;
      selectedItem.discount.none ? (selectedItem.discount.none = false) : null;
    } else if (
      reformedObjectData[itemNr].hasOwnProperty("discount_percentage")
    ) {
      selectedItem.discount.value = Math.abs(
        Number(reformedObjectData[itemNr].discount_percentage)
      );
      selectedItem.discount.discountAmount = Number(
        reformedObjectData[itemNr].discount_percentage
      );
      selectedItem.discount.type = "percentage";
      //nufalsinam kitas reikšmes jei jos yra
      selectedItem.discount.fixed
        ? (selectedItem.discount.fixed = false)
        : null;
      selectedItem.discount.none ? (selectedItem.discount.none = false) : null;
    }

    itemsToAddToInvoice.items.push(selectedItem);
  });
  return itemsToAddToInvoice;
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

// OLD WAY
//WE TARGET EXTERNAL INVOICE API TO GET INVOICE WE THEN FORM IT TO AN OBJECT WITH createInvoiceObject FUNCTION AND RETURN IT WHEN THIS API IS TRIGGERED IN CLIENT SIDE JS CODE

// app.get("/api/invoice", (req, res) => {
//   fetch(urlApi) // Fetch invoice data from external API
//     .then((apiResponse) => apiResponse.json())
//     .then((invoiceData) => {
//       const invoiceObject = createInvoiceObject(invoiceData, {}); // Generate invoice object
//       res.json(invoiceObject); // Send invoice object as JSON
//     })
//     .catch((error) => {
//       console.error("Error fetching invoice from external API:", error);
//       res.status(500).send("Server Error");
//     });
// });
//CREATE
// app.get("/invoice", (req, res) => {
//   const data = {
//     script: "invoice.js",
//     style: "style.css",
//     title: "PVM SF generavimas",
//   };
//   const html = renderPage(data, "invoice");
//   res.send(html);
// });
//STORE
// app.post("/invoice", async (req, res) => {
//   try {
//     // Read the file, or initialize an empty list if the file doesn't exist
//     let list;

//     try {
//       list = fs.readFileSync("./data/list.json", "utf8"); //SYNCRONOUS because the file is small and it doesnt stop the loop for long
//       list = JSON.parse(list); // Parse the file content
//     } catch (readError) {
//       console.warn("list.json not found or invalid. Initializing new list.");
//       list = {}; // Start with an empty array
//     }

//     list[req.body.number] = req.body;
//     try {
//       fs.writeFileSync("./data/list.json", JSON.stringify(list, null, 2));
//     } catch (writeError) {
//       console.error("Failed to write to list.json:", writeError);
//       throw writeError; // Re-throw the error
//     }

//     res.status(200).redirect("/invoice");
//   } catch (error) {
//     console.error("Error saving invoice:", error);
//     res.status(500).send("Server Error");
//   }
// });
app.get("/", (req, res) => {
  res.redirect(URL + "invoiceList");
});
//CREATE
app.get("/invoice/create", (req, res) => {
  fetch(urlApi) // Fetch invoice data from external API
    .then((apiResponse) => apiResponse.json())
    .then((invoiceData) => {
      const invoice = createInvoiceObject(invoiceData, {}); // Generate invoice object
      req.session.invoice = invoice;
      // Render the page with the fetched invoice data
      const data = {
        invoice,
        style: "style.css",
        title: `PVM SF ${invoice.number}`,
      };
      const html = renderPage(data, "invoice");
      res.send(html);
    })
    .catch((error) => {
      console.error("Error fetching invoice from external API:", error);
      res.status(500).send("Server Error");
    });
});
//STORE
app.get("/invoice/store", (req, res) => {
  try {
    // Read and parse the existing JSON file
    let list = JSON.parse(fs.readFileSync("./data/list.json", "utf8"));

    // Retrieve the invoice from the session
    const invoice = req.session.invoice;

    if (!invoice) {
      return res.status(400).send("No invoice found in session to save.");
    }

    // Add or update the invoice in the list object
    list[invoice.number] = invoice;

    // Write the updated list back to the file
    fs.writeFileSync("./data/list.json", JSON.stringify(list, null, 2));

    updateSession(req, "message", { text: "Įrašas pridėtas", type: "success" });

    // Redirect to the invoice page
    res.redirect(URL + "invoiceList");
  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).send("Failed to save invoice.");
  }
});

//VIEW
app.get("/view/invoice/:id", (req, res) => {
  let list = fs.readFileSync("./data/list.json", "utf8");
  list = JSON.parse(list);
  let invoiceNumber = req.params.id;
  let invoice = list[invoiceNumber];
  const data = {
    style: "style.css",
    title: `PVM SF ${invoiceNumber}`,
    invoice,
  };
  const html = renderPage(data, "view");
  res.send(html);
});

//READ
app.get("/invoiceList", (req, res) => {
  let list = fs.readFileSync("./data/list.json", "utf8");
  list = JSON.parse(list);

  const data = {
    style1: "styleList.css",
    style: "style.css",
    title: "PVM SF sąrašas",
    list,
    message: req.user.message || null,
  };

  const html = renderPage(data, "invoiceList");

  res.send(html);
});
//EDIT
app.get("/invoiceList/edit/:id", (req, res) => {
  let list = fs.readFileSync("./data/list.json", "utf8");
  list = JSON.parse(list);
  const invoice = list[req.params.id];

  if (!invoice) {
    const data = {
      pageTitle: "Puslapis nerastas",
      noMenu: true,
      metaRedirect: true,
      URL,
      style: "style.css",
      url: URL,
    };
    const html = renderPage(data, "404");
    res.status(404).send(html);
    return;
  }

  const data = {
    title: `Redaguoti PVM SF ${invoice.number}`,
    style: "style.css",
    style1: "styleEdit.css",
    script: "editInvoice.js",
    invoice,
    message: req.user.message || null,
    URL,
  };

  const html = renderPage(data, "edit");
  res.send(html);
});
//UPDATE
app.post("/invoiceList/update/:id", (req, res) => {
  const invoiceId = req.params.id;
  const formData = req.body;

  let list = fs.readFileSync("./data/list.json", "utf8");
  list = JSON.parse(list);
  if (!list.invoiceId) {
    const data = {
      pageTitle: "Puslapis nerastas",
      noMenu: true,
      metaRedirect: true,
      url: URL,
      style: "style.css",
    };
    const html = renderPage(data, "404");
    res.status(404).send(html);
    return;
  }
  const invoiceToChange = list[invoiceId]; //ok
  const reformedObjectData = formChangeObject(formData);

  const itemsToUpload = reformedItems(
    list,
    formData,
    reformedObjectData,
    invoiceToChange
  );

  invoiceToChange.items = itemsToUpload.items;
  invoiceTotalCalculations(invoiceToChange);

  list[invoiceId] = invoiceTotalCalculations(invoiceToChange);
  updateSession(req, "message", { text: "Įrašas pakeistas", type: "success" });
  fs.writeFileSync("data/list.json", JSON.stringify(list, null, 2));
  res.redirect(URL + `invoiceList/edit/${invoiceId}`);
});
//DELETE
app.get("/invoiceList/delete/:id", (req, res) => {
  let list = fs.readFileSync("./data/list.json", "utf8");
  list = JSON.parse(list);
  const invoiceToDelete = list[req.params.id];
  if (!invoiceToDelete) {
    const data = {
      pageTitle: "Puslapis nerastas",
      noMenu: true,
      metaRedirect: true,
      url: URL,
      style: "style.css",
    };
    const html = renderPage(data, "404");
    res.status(404).send(html);
    return;
  }
  const data = {
    title: `Ištrinti ${invoiceToDelete.number}?`,
    invoiceToDelete,
    noMenu: true,
    URL,
    style: "style.css",
  };

  const html = renderPage(data, "delete");
  res.send(html);
});
//DESTROY
app.post("/invoiceList/destroy/:id", (req, res) => {
  let list = fs.readFileSync("./data/list.json", "utf8");
  list = JSON.parse(list);
  const invoiceToDelete = list[req.params.id];
  console.log(req.params.id);
  if (!invoiceToDelete) {
    const data = {
      pageTitle: "Puslapis nerastas",
      noMenu: true,
      metaRedirect: true,
      url: URL,
      style: "style.css",
    };
    const html = renderPage(data, "404");
    res.status(404).send(html);
    return;
  } else {
    delete list[req.params.id];

    list = JSON.stringify(list);
    fs.writeFileSync("./data/list.json", list);
    updateSession(req, "message", { text: "Įrašas ištrintas", type: "alert" });
    res.redirect(URL + "invoiceList");
  }
});
const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
