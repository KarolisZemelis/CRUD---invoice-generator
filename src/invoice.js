const url = "http://localhost:3000/api/invoice";

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
  getInvoiceDetails(invoiceObj);
  getBuyerDetails(invoiceObj);
  getSellerDetails(invoiceObj);
  populateProductData(invoiceObj);
  populateTotalSection(invoiceObj);
}

// SAVE THE RENDERED INVOICE
console.log(document.querySelector("[data-form-submit]"));
const formSubmitBtn = document.querySelector("[data-form-submit]");

formSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("esu event listenery", invoiceObject);
  const response = fetch("/invoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoiceObject),
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "/invoice";
      } else {
        return response.text().then((errorText) => {
          console.error("Server Error:", errorText);
        });
      }
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
    });
});
