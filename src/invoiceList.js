tableRow = document.querySelectorAll("[data-table-items]");

document.addEventListener("DOMContentLoaded", () => {
  tableRow.forEach((row) => {
    row.addEventListener("input", () => {
      let qtyInput = parseFloat(
        row.querySelector("[data-input-qty] input").value
      );
      const price = parseFloat(
        row.querySelector("[data-table-item-price]").innerText
      );
      let discountPercentage = row.querySelector(
        "[data-input-percentage-value]"
      );
      let discountFixed = row.querySelector("[data-input-fixed-value]");
      let priceAfterDiscount = 0;
      if (discountPercentage) {
        discountPercentage = parseFloat(discountPercentage.value) / 100;
        priceAfterDiscount = parseFloat(price - price * discountPercentage);
      } else if (discountFixed) {
        discountFixed = parseFloat(Math.abs(discountFixed.value));
        priceAfterDiscount = parseFloat((price - discountFixed).toFixed(2));
      }

      let rowSum = 0;

      priceAfterDiscount > 0
        ? (rowSum = parseFloat(qtyInput * priceAfterDiscount).toFixed(2))
        : (rowSum = parseFloat(qtyInput * price).toFixed(2));

      row.querySelector("[data-table-rowTotal]").innerText = rowSum;
    });
  });
});
