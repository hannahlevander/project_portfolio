const express = require("express");
const expressHandlebars = require("express-handlebars");
const data = require("./data.js");
const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("public"));

app.get("/", function (request, response) {
  response.render("home.hbs");
});

app.get("/projects", function (request, response) {
  const model = {
    projects: data.projects,
  };

  response.render("projects.hbs", model);
});

// GET /projects/1
// GET /projects/2 etc...

app.get("/projects/:id", function (request, response) {
  const id = request.params.id;

  const project = data.projects.find((p) => p.id == id);

  const model = {
    project: project,
  };

  response.render("project.hbs", model);
});

app.get("/about", function (request, response) {
  response.render("about.hbs");
});

app.get("/faq", function (request, response) {
  response.render("faq.hbs");
});

app.get("/guestbook", function (request, response) {
  response.render("guestbook.hbs");
});

app.get("/contact", function (request, response) {
  response.render("contact.hbs");
});

// app.get("/static", (req, res) => {
//   res.render("static");
// });

// // Route to display dynamic src images
// app.get("/dynamic", (req, res) => {
//   imageList = [];
//   imageList.push({ src: "icons/flask.png", name: "flask" });
//   imageList.push({ src: "icons/javascript.png", name: "javascript" });
//   imageList.push({ src: "icons/react.png", name: "react" });
//   res.render("dynamic", { imageList: imageList });
// });

app.listen(8080);
