const express = require("express");
const app = express();
const fs = require("fs");
const handlebars = require("handlebars");

app.use(express.static("public"));

const makeHtml = (data, page) => {
  data.url = "http://localhost:3000/";
  const topHtml = fs.readFileSync("./templates/top.hbr", "utf8");
  const bottomHtml = fs.readFileSync("./templates/bottom.hbr", "utf8");
  const pageHtml = fs.readFileSync(`./templates/${page}.hbr`, "utf8");
  const html = handlebars.compile(topHtml + pageHtml + bottomHtml)(data);
  return html;
};

app.get("/", (req, res) => {
  // res.send("Hello World!");
  const data = {
    pageTitle: "Pradžia",
  };
  const html = makeHtml(data, "main");
  res.send(html);
});

// app.get("/play/start", (req, res) => {
//   const data = {
//     pageTitle: "Pradžia",
//     manoKintamasis: "Labas bebrai",
//     yraArbaNera: "Yra",
//   };

//   const html = makeHtml(data, "play");
//   res.send(html);
// });

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
