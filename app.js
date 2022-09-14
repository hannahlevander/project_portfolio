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
  response.render("start.hbs");
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

app.listen(8080);
