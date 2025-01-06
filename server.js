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

const makeHtml = (data, page) => {
  data.url = "http://localhost:3000/";
  const topHtml = fs.readFileSync("./templates/top.hbr", "utf8");
  const bottomHtml = fs.readFileSync("./templates/bottom.hbr", "utf8");
  const pageHtml = fs.readFileSync(`./templates/${page}.hbr`, "utf8");
  const html = handlebars.compile(topHtml + pageHtml + bottomHtml)(data);
  return html;
};

const renderPage = (data, page) => {
  const pageContent = fs.readFileSync(`./templates/${page}.hbr`, "utf8");
  const layout = fs.readFileSync("./templates/layout.hbs", "utf8");
  const compiled = hbs.compile(layout);
  return compiled({ ...data, body: pageContent });
};

// app.get("/", (req, res) => {
//   // res.send("Hello World!");
//   const data = {
//     pageTitle: "Pradžia",
//   };
//   const html = makeHtml(data, "main");
//   res.send(html);
// });

app.get("/", (req, res) => {
  // res.send("Hello World!");
  const data = {
    script: "invoice.js",
    style: "style.css",
  };
  const html = renderPage(data, "invoice");
  res.send(html);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
