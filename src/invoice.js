const url = "https://in3.dev/inv/";

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
    //transform data from API to local object
    for (const [key, value] of Object.entries(invoiceData)) {
      invoiceObject[key] = value;
    }
    let items = invoiceObject.items;
    let discountAmount = 0;
    let allProductTotal = 0;

    for (let i = 0; i < items.length; i++) {
      for (const key in items[i]) {
        if (key === "discount") {
          if (items[i][key].type === "fixed") {
            discountAmount = -Math.abs(
              parseFloat(items[i][key].value).toFixed(2)
            );
            items[i][key].discountAmount = discountAmount;
          } else if (items[i][key].type === "percentage") {
            discountAmount = -Math.abs(
              parseFloat(items[i].price * (items[i][key].value / 100)).toFixed(
                2
              )
            );

            items[i][key].discountAmount = discountAmount;
          }
        }
        const itemPrice = parseFloat(items[i].price).toFixed(2);
        const itemQty = parseFloat(items[i].quantity).toFixed(2);
        const priceAfterDiscount =
          itemPrice - (parseFloat(discountAmount) * -1).toFixed(2);
        invoiceObject.items[i].priceAfterDiscount = priceAfterDiscount;
        const productTotal = parseFloat(
          (priceAfterDiscount * itemQty).toFixed(2)
        );
        invoiceObject.items[i].productTotal = productTotal;
        allProductTotal += productTotal;
      }
    }
    console.log(invoiceObject);
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
})();
