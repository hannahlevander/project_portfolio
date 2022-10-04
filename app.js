const express = require("express");
const expressHandlebars = require("express-handlebars");
const sqlite3 = require("sqlite3");
const expressSession = require("express-session");

//CAPS = Convention that this const will not change
const PROJECT_TITLE_MAX_LENGTH = 10;
const PROJECT_DESCRIPTION_MAX_LENGTH = 10;
const FAQ_QUESTION_MAX_LENGTH = 100;
const GUESTBOOK_POST_MAX_LENGTH = 200;
const ADMIN_USERNAME = "Hannah";
const ADMIN_PASSWORD = "hej";

const db = new sqlite3.Database("hannah-portfolio-database.db");

//Create column in table

// db.run(`
// ALTER TABLE guestbook add COLUMN
//   date text`);

//Create databases

db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY,
    question TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS allFaqs (
    id INTEGER PRIMARY KEY,
    question TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS guestbook (
    id INTEGER PRIMARY KEY,
    name TEXT,
    post TEXT,
    date TEXT
  )
`);

const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("public"));

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(
  expressSession({
    saveUninitialized: false,
    resave: false,
    secret: "isbshdbhsdb",
  })
);

app.use(function (request, response, next) {
  response.locals.session = request.session;
  next();
});

app.use(function (request, response, next) {
  response.locals.session = request.session;
  next();
});

//Home page

app.get("/", function (request, response) {
  response.render("home.hbs");
});

//Projects page

app.get("/projects", function (request, response) {
  const query = `SELECT * FROM projects`;

  db.all(query, function (error, projects) {
    const errorMessages = [];

    if (error) {
      errorMessages.push("Internal server error");
    }

    const model = {
      errorMessages,
      // dbErrorOccured: true, //?
      projects,
    };

    response.render("projects.hbs", model);
  });
});

//Create projects page with error messages

app.get("/projects/create", function (request, response) {
  response.render("create-project.hbs");
});

app.post("/projects/create", function (request, response) {
  const title = request.body.title;
  const description = request.body.description;

  const errorMessages = [];

  if (title == "") {
    errorMessages.push("Title can't be empty");
  }

  if (PROJECT_TITLE_MAX_LENGTH < title.length) {
    errorMessages.push(
      "Title can not contain more than " +
        PROJECT_TITLE_MAX_LENGTH +
        " characters"
    );
  }

  if (description == "") {
    errorMessages.push("Description can't be empty");
  }

  if (PROJECT_DESCRIPTION_MAX_LENGTH < description.length) {
    errorMessages.push(
      "Description can not contain more than " +
        PROJECT_DESCRIPTION_MAX_LENGTH +
        " characters."
    );
  }

  if (request.session.isLoggedIn != true) {
    errorMessages.push("Not logged in");
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO projects (title, description) VALUES (?, ?)`;
    const values = [title, description];

    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          title,
          description,
        };

        response.render("create-project.hbs", model);
      } else {
        response.redirect("/projects");
      }
    });
  } else {
    response.render("create-project.hbs", { errorMessages });
  }
});

// GET /projects/1
// GET /projects/2 etc...

app.get("/projects/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM projects WHERE id = ?`;
  const values = [id];

  db.get(query, values, function (error, project) {
    const model = {
      project,
    };

    response.render("project.hbs", model);
  });
});

// Delete project
// The following post request was created with help from Caroline Frössling

app.post("/delete-project/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM projects WHERE id =?`;

  db.run(query, id, function (error) {
    response.redirect("/projects");
  });
});

//faq page with error messages (look at this code)
app.get("/faq", function (request, response) {
  const query = `SELECT * FROM faqs`;

  db.all(query, function (error, faqs) {
    const errorMessages = [];

    if (error) {
      errorMessages.push("Internal server error");
    }

    const model = {
      errorMessages,
      // dbErrorOccured: true, //?
      faqs,
    };

    response.render("faq.hbs", model);
  });
});

app.post("/faq", function (request, response) {
  const question = request.body.question;

  const errorMessages = [];

  if (question == "") {
    errorMessages.push("You need to write something");
  }

  if (FAQ_QUESTION_MAX_LENGTH < question.length) {
    errorMessages.push(
      "Question can not contain more than " +
        FAQ_QUESTION_MAX_LENGTH +
        " characters"
    );
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO faqs (question) VALUES (?)`;
    const values = [question];

    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          question,
        };

        response.render("faq.hbs", model);
      } else {
        response.redirect("/faq");
      }
    });
  } else {
    response.render("faq.hbs", { errorMessages });
  }
});

//Delete question

app.post("/delete-question/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM faqs WHERE id =?`;

  db.run(query, id, function (error) {
    response.redirect("/faq");
  });
});

//Guestbook

app.get("/guestbook", function (request, response) {
  const query = `SELECT * FROM guestbook`;

  db.all(query, function (error, guestbook) {
    const errorMessages = [];

    if (error) {
      errorMessages.push("Internal server error");
    }

    const model = {
      errorMessages,
      // dbErrorOccured: true, //?
      guestbook,
    };

    response.render("guestbook.hbs", model);
  });
});

app.post("/guestbook", function (request, response) {
  const post = request.body.post;
  const name = request.body.name;

  const errorMessages = [];

  if (post == "") {
    errorMessages.push("You need to write something");
  }

  if (name == "") {
    errorMessages.push("You need to write your name");
  }

  if (GUESTBOOK_POST_MAX_LENGTH < post.length) {
    errorMessages.push(
      "Post can not contain more than " +
        GUESTBOOK_POST_MAX_LENGTH +
        " characters"
    );
  }

  if (errorMessages.length == 0) {
    const query = `INSERT INTO guestbook (name, post, date) VALUES (?, ?, date('now'))`;
    const values = [name, post];

    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          post,
          name,
        };

        response.render("guestbook.hbs", model);
      } else {
        response.redirect("/guestbook");
      }
    });
  } else {
    response.render("guestbook.hbs", { errorMessages });
  }
});

//Delete question

app.post("/delete-post/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM guestbook WHERE id =?`;

  db.run(query, id, function (error) {
    response.redirect("/guestbook");
  });
});

//Get requests to different pages
app.get("/about", function (request, response) {
  response.render("about.hbs");
});

app.get("/contact", function (request, response) {
  response.render("contact.hbs");
});

app.get("/log-in", function (request, response) {
  const username = request.body.username;
  const password = request.body.password;
  response.render("log-in.hbs");
});

app.post("/log-in", function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  if (username == ADMIN_USERNAME && password == ADMIN_PASSWORD) {
    request.session.isLoggedIn = true;
    response.redirect("/");
  } else {
    const model = {
      failedToLogIn: true,
    };

    response.render("log-in.hbs", model);
  }
});

app.listen(8080);

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
