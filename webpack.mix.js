const mix = require("laravel-mix");

mix.js("src/app.js", "public").sass("src/style.scss", "public");
//   .js("src/back.app.js", "public")

//   .sass("src/front.style.scss", "public");
