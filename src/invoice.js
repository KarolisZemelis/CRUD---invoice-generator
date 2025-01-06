const url = "http://localhost:3000/api/invoice";

// async function getData() {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`HTTP error! status : ${response.status}`);
//     }

//     const invoiceData = await response.json();
//     const invoiceObject = {};

//     render(createInvoiceObject(invoiceData, invoiceObject));
//   } catch (error) {
//     console.error("There was a problem with the fetch operation:", error);
//     throw error;
//   }
// }

// function createInvoiceObject(invoiceData, invoiceObject) {
//   for (const [key, value] of Object.entries(invoiceData)) {
//     invoiceObject[key] = value;
//   }
//   let items = invoiceObject.items;
//   let discountAmount = 0;
//   let allProductTotal = 0;

//   for (let i = 0; i < items.length; i++) {
//     let productTotal = 0;
//     for (const key in items[i]) {
//       if (key === "discount") {
//         if (items[i][key].type === "fixed") {
//           discountAmount = -Math.abs(
//             parseFloat(items[i][key].value).toFixed(2)
//           );
//           items[i][key].discountAmount = discountAmount;
//         } else if (items[i][key].type === "percentage") {
//           discountAmount = -Math.abs(
//             parseFloat(items[i].price * (items[i][key].value / 100)).toFixed(2)
//           );
//           items[i][key].discountAmount = discountAmount;
//         } else {
//           discountAmount = 0;
//         }
//       }
//       const itemPrice = parseFloat(items[i].price).toFixed(2);
//       const itemQty = parseFloat(items[i].quantity).toFixed(2);
//       const priceAfterDiscount = parseFloat(
//         (itemPrice - parseFloat(discountAmount) * -1).toFixed(2)
//       );
//       invoiceObject.items[i].priceAfterDiscount = priceAfterDiscount;
//       productTotal = parseFloat((priceAfterDiscount * itemQty).toFixed(2));
//       invoiceObject.items[i].productTotal = productTotal;
//     }
//     allProductTotal += productTotal;
//   }
//   invoiceObject.allProductTotal = parseFloat(allProductTotal.toFixed(2));
//   return invoiceObject;
// }

// FORM THE INVOICE WITH FUNCTIONS BELOW
let invoiceObject; // Declare it globally
// GET INVOICE OBJECT FROM SERVER
async function fetchInvoiceObject() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    invoiceObject = await response.json(); // Store the object
    console.log("Invoice Object fetched:", invoiceObject); // Use it here
    return invoiceObject;
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    throw error;
  }
}
// WAIT FOR INVOICE OBJECT TO LOAD
document.addEventListener("DOMContentLoaded", async () => {
  try {
    invoiceObject = await fetchInvoiceObject(); // Fetch invoiceObject
    console.log("Global Invoice Object:", invoiceObject);

    // Render after invoiceObject is fetched
    console.log("laukiu kol uzsikraus", invoiceObject);
    render(invoiceObject);
  } catch (error) {
    console.error("Error handling invoice:", error);
  }
});

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

  document.querySelector("[data-item-total]").innerHTML = `${totalsNumb} €`;
  document.querySelector(
    "[data-transport-cost]"
  ).innerHTML = `${shippingPrice} €`;
  document.querySelector("[data-total-vat]").innerHTML = `${vat} €`;
  document.querySelector(
    "[data-invoice-total]"
  ).innerHTML = `${invoiceTotal} €`;
  document.querySelector(
    "[data-words-total]"
  ).innerHTML = `${invoiceObj.allProductTotalString} €`;
  document.querySelector("[data-due-date]").innerHTML = invoiceObj.due_date;
}

function populateProductData(invoiceObj) {
  const items = invoiceObj.items;
  const tableHtml = document.querySelector("tbody");
  let nrCounter = 1;

  items.forEach((item) => {
    const tableRow = document.createElement("tr");
    tableHtml.append(tableRow);
    const tableData = document.createElement("td");
    tableData.innerHTML += nrCounter;
    tableRow.append(tableData);
    nrCounter++;

    const tableDataDescription = document.createElement("td");
    tableDataDescription.innerHTML = item.description;
    const tableDataQty = document.createElement("td");
    tableDataQty.innerHTML = item.quantity;
    const tableDataPrice = document.createElement("td");
    tableDataPrice.innerHTML = item.price;
    const tableDataDiscount = document.createElement("td");

    if (item.discount.type === "fixed") {
      tableDataDiscount.innerHTML = item.discount.value;
    } else if (item.discount.type === undefined) {
      tableDataDiscount.innerHTML = "";
    } else {
      tableDataDiscount.innerHTML = `-${item.discount.value}% <br> ${item.discount.discountAmount}`;
    }
    const tableDataPriceAfterDiscount = document.createElement("td");
    tableDataPriceAfterDiscount.innerHTML = item.priceAfterDiscount;
    const tableDataTotalPrice = document.createElement("td");
    tableDataTotalPrice.innerHTML = item.productTotal;
    tableRow.append(tableData);
    tableRow.append(tableDataDescription);
    tableRow.append(tableDataQty);
    tableRow.append(tableDataPrice);
    tableRow.append(tableDataDiscount);
    tableRow.append(tableDataPriceAfterDiscount);
    tableRow.append(tableDataTotalPrice);
    tableHtml.append(tableRow);
  });
}
// RENDER THE INVOICE WITH FUNCTIONS ABOVE
function render(invoiceObj) {
  console.log("esu render funkcijoje", invoiceObj);
  getInvoiceDetails(invoiceObj);
  getBuyerDetails(invoiceObj);
  getSellerDetails(invoiceObj);
  populateProductData(invoiceObj);
  populateTotalSection(invoiceObj);
}
console.log("xxx", invoiceObject);
// render(invoiceObject);
// getData();

// SAVE THE RENDERED INVOICE
document
  .querySelector("form button")
  .addEventListener("click", async function (e) {
    e.preventDefault(); // Prevent default form submission

    const response = await fetch("/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceObject), // Send invoiceObject to the server
    });

    if (response.ok) {
      window.location.href = "/invoice"; // Redirect on success
    } else {
      console.error("Failed to save invoice");
    }
  });
