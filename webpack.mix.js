const mix = require("laravel-mix");

mix
  // .js("src/invoice.js", "public")
  .js("src/editInvoice.js", "public")
  .sass("src/style.scss", "public")
  .sass("src/styleList.scss", "public")
  .sass("src/styleEdit.scss", "public");
//   .js("src/back.app.js", "public")

//   .sass("src/front.style.scss", "public");
