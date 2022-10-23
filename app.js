const express = require("express");
const expressHandlebars = require("express-handlebars");
const sqlite3 = require("sqlite3");
const expressSession = require("express-session");
const app = express();
const db = new sqlite3.Database("hannah-portfolio-database.db");

//Hash password
const bcryptjs = require("bcryptjs");

const projectTitleMaxLength = 10;
const projectDescriptionMaxLength = 10;
const faqQuestionMaxLength = 30;
const guestbookNameMaxLength = 10;
const guestbookPostMaxLength = 100;
const guestbookPostAnswerMaxLength = 10;
const faqAnswerMaxLength = 10;
const adminUsername = "Hannah";
const adminPassword =
  "$2a$08$cOC3v5zkCLmjzvq04EKSouBtIPGAK6BiQxbR1dk2Sl8RAuo01/QGS";

//Create column in table

// db.run(`
// ALTER TABLE guestbook add COLUMN
//   date text`);

//Create databases

//projects database
db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

//faqs database
db.run(`
  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY,
    question TEXT
  )
`);

//allFaqs database
db.run(`
  CREATE TABLE IF NOT EXISTS answeredFaqs (
    id INTEGER PRIMARY KEY,
    question TEXT,
    answer TEXT
  )
`);

//guestbook database
db.run(`
  CREATE TABLE IF NOT EXISTS guestbook (
    id INTEGER PRIMARY KEY,
    name TEXT,
    post TEXT,
    dateCreated INT,
    answer TEXT
  )
`);

//Express - Handlebars
app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

//Express - Static
app.use(express.static("public"));

app.use(
  express.urlencoded({
    extended: false,
  })
);

//Express - Session - remember that a user has logged in???
app.use(
  expressSession({
    saveUninitialized: false,
    resave: false,
    secret: "isbshdbhsdb",
  })
);

//Access to request session in...
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

  if (projectTitleMaxLength < title.length) {
    errorMessages.push(
      "Title can not contain more than " + projectTitleMaxLength + " characters"
    );
  }

  if (description == "") {
    errorMessages.push("Description can't be empty");
  }

  if (projectDescriptionMaxLength < description.length) {
    errorMessages.push(
      "Description can not contain more than " +
        projectDescriptionMaxLength +
        " characters."
    );
  }

  if (request.session.isLoggedIn != true) {
    errorMessages.push("Not logged in");
  }

  //Creating project or displaying errormessages
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
    const model = {
      errorMessages,
      title,
      description,
    };
    response.render("create-project.hbs", model);
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
app.post("/projects/delete/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM projects WHERE id =?`;

  if (request.session.isLoggedIn) {
    db.run(query, id, function (error) {
      response.redirect("/projects");
    });
  } else {
    response.redirect("/login");
  }
});

//Update project & errormessages
app.get("/projects/update/:id", function (request, response) {
  response.render("update-project.hbs");
});

app.post("/projects/update/:id", function (request, response) {
  const id = request.params.id;
  const title = request.body.title;
  const description = request.body.description;

  const errorMessages = [];

  if (title == "") {
    errorMessages.push("Title can't be empty");
  } else if (projectTitleMaxLength < title.length) {
    errorMessages.push(
      "Title can not contain more than " + projectTitleMaxLength + " characters"
    );
  }

  if (description == "") {
    errorMessages.push("Description can't be empty");
  } else if (projectDescriptionMaxLength < description.length) {
    errorMessages.push(
      "Description can not contain more than " +
        projectDescriptionMaxLength +
        " characters."
    );
  }

  if (request.session.isLoggedIn != true) {
    errorMessages.push("Not logged in");
  }

  //Updating project or displaying errormessages
  if (errorMessages.length == 0) {
    const query = `UPDATE projects SET title= ?, description= ? WHERE id= ?`;
    const values = [title, description, id];

    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          title,
          description,
        };
        response.render("update-project.hbs", model);
      } else {
        response.redirect("/projects");
      }
    });
  } else {
    const model = {
      errorMessages,
      title,
      description,
    };
    response.render("update-project.hbs", model);
  }
});

//Faq page with answered questions
app.get("/faq", function (request, response) {
  const query = `SELECT * FROM answeredFaqs`;

  db.all(query, function (error, answeredFaqs) {
    const errorMessages = [];

    if (error) {
      errorMessages.push("Internal server error");
    }

    const model = {
      errorMessages,
      // dbErrorOccured: true, //?
      answeredFaqs,
    };

    response.render("faq.hbs", model);
  });
});

app.post("/faq", function (request, response) {
  const question = request.body.question;
  let query = ``;

  const errorMessages = [];

  if (question == "") {
    errorMessages.push("You need to write something in the question field");
  }

  if (faqQuestionMaxLength < question.length) {
    errorMessages.push(
      "Question can not contain more than " +
        faqQuestionMaxLength +
        " characters"
    );
  }

  if (errorMessages.length == 0) {
    query = `INSERT INTO faqs (question) VALUES (?)`;
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
    query = `SELECT * FROM answeredFaqs`;
    db.all(query, function (error, answeredFaqs) {
      const model = {
        errorMessages,
        answeredFaqs,
      };
      response.render("faq.hbs", model);
    });
  }
});

//Delete question

app.post("/faq/delete/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM faqs WHERE id =?`;

  if (request.session.isLoggedIn) {
    db.run(query, id, function (error) {
      response.redirect("/faq/allFaqs");
    });
  } else {
    response.redirect("/login");
  }
});

//Answer question
app.post("/faq/answer/:id", function (request, response) {
  // const id = request.params.id;
  const question = request.body.question;
  const answer = request.body.answer;
  let query = ``;

  const errorMessages = [];

  if (question == "") {
    errorMessages.push("You need to write something in the question field");
  }

  if (faqQuestionMaxLength < question.length) {
    errorMessages.push(
      "Question can not contain more than " +
        faqQuestionMaxLength +
        " characters"
    );
  }

  if (answer == "") {
    errorMessages.push("Answer can not be empty");
  }

  if (faqAnswerMaxLength < answer.length) {
    errorMessages.push(
      "Answer can not contain more than " + faqAnswerMaxLength + " characters"
    );
  }

  if (request.session.isLoggedIn != true) {
    errorMessages.push("Not logged in");
  }

  if (errorMessages.length == 0) {
    query = `INSERT INTO answeredFaqs (question, answer) VALUES (?, ?)`;
    const values = [question, answer];

    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          question,
          answer,
        };
        response.render("faq.hbs", model);
      } else {
        response.redirect("/faq");
      }
    });
  } else {
    query = `SELECT * FROM faqs`;
    db.all(query, function (error, faqs) {
      const model = {
        errorMessages,
        question,
        faqs,
        answer,
      };
      response.render("faq-all-questions.hbs", model);
    });
  }
});

//Delete answered question

app.post("/answeredFaq/delete/:id", function (request, response) {
  const id = request.params.id;
  const query = `DELETE FROM answeredFaqs WHERE id =?`;

  if (request.session.isLoggedIn) {
    db.run(query, id, function (error) {
      response.redirect("/faq");
    });
  } else {
    response.redirect("/login");
  }
});

//Update answered question & errormessages
app.get("/answeredFaq/update/:id", function (request, response) {
  response.render("update-answered-faq.hbs");
});

app.post("/answeredFaq/update/:id", function (request, response) {
  const id = request.params.id;
  const question = request.body.question;
  const answer = request.body.answer;

  const errorMessages = [];

  if (question == "") {
    errorMessages.push("Question can't be empty");
  } else if (faqQuestionMaxLength < question.length) {
    errorMessages.push(
      "Title can not contain more than " + faqQuestionMaxLength + " characters"
    );
  }

  if (answer == "") {
    errorMessages.push("Answer can't be empty");
  } else if (faqAnswerMaxLength < answer.length) {
    errorMessages.push(
      "Answer can not contain more than " + faqAnswerMaxLength + " characters."
    );
  }

  if (request.session.isLoggedIn != true) {
    errorMessages.push("Not logged in");
  }

  //Updating project or displaying errormessages
  if (errorMessages.length == 0) {
    const query = `UPDATE answeredFaqs SET question= ?, answer= ? WHERE id= ?`;
    const values = [question, answer, id];

    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          question,
          answer,
        };
        response.render("update-answered-faq.hbs", model);
      } else {
        response.redirect("/faq");
      }
    });
  } else {
    const model = {
      errorMessages,
      question,
      answer,
    };
    response.render("update-answered-faq.hbs", model);
  }
});

//Faq page with all questions
app.get("/faq/allFaqs", function (request, response) {
  const query = `SELECT * FROM faqs`;

  if (request.session.isLoggedIn) {
    db.all(query, function (error, faqs) {
      const errorMessages = [];

      if (error) {
        errorMessages.push("Internal server error");
      }

      const model = {
        errorMessages,
        faqs,
      };

      response.render("faq-all-questions.hbs", model);
    });
  } else {
    response.redirect("/login");
  }
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
      guestbook,
    };
    response.render("guestbook.hbs", model);
  });
});

app.post("/guestbook", function (request, response) {
  const post = request.body.post;
  const name = request.body.name;
  let query = ``;

  const errorMessages = [];

  if (post == "") {
    errorMessages.push("You need to write something in the text field");
  }

  if (name == "") {
    errorMessages.push("You need to write your name");
  }

  if (guestbookPostMaxLength < post.length) {
    errorMessages.push(
      "Post can not contain more than " + guestbookPostMaxLength + " characters"
    );
  }

  if (guestbookNameMaxLength < name.length) {
    errorMessages.push(
      "Name can not contain more than " + guestbookNameMaxLength + " characters"
    );
  }

  if (errorMessages.length == 0) {
    query = `INSERT INTO guestbook (name, post, dateCreated, answer) VALUES (?, ?, date('now'), "Waiting for Hannah to answer...")`;
    const values = [name, post];

    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
          name,
          post,
          answer,
        };
        response.render("guestbook.hbs", model);
      } else {
        response.redirect("/guestbook");
      }
    });
  } else {
    query = `SELECT * FROM guestbook`;
    db.all(query, function (error, guestbook) {
      const model = {
        errorMessages,
        guestbook,
        name,
        post,
      };
      response.render("guestbook.hbs", model);
    });
  }
});

//Delete guestbook post

app.post("/guestbook/delete/:id", function (request, response) {
  const id = request.params.id;
  query = `DELETE FROM guestbook WHERE id =?`;

  if (request.session.isLoggedIn) {
    db.run(query, id, function (error) {
      response.redirect("/guestbook");
    });
  } else {
    response.redirect("/login");
  }
});

app.post("/guestbook/answer/:id", function (request, response) {
  const id = request.params.id;
  const answer = request.body.answer;
  let query = ``;

  const errorMessages = [];

  if (guestbookPostAnswerMaxLength < answer.length) {
    errorMessages.push(
      "Answer can not contain more than " +
        guestbookPostAnswerMaxLength +
        " characters"
    );
  }

  if (request.session.isLoggedIn != true) {
    errorMessages.push("Not logged in");
  }

  if (errorMessages == 0) {
    query = `UPDATE guestbook SET answer=? WHERE id=?`;
    const values = [answer, id];

    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");

        const model = {
          errorMessages,
        };

        response.render("guestbook.hbs", model);
      } else {
        response.redirect("/guestbook");
      }
    });
  } else {
    query = `SELECT * from guestbook`;
    db.all(query, function (error, guestbook) {
      const model = {
        errorMessages,
        guestbook,
      };

      response.render("guestbook.hbs", model);
    });
  }
});

//Get requests to different pages
app.get("/about", function (request, response) {
  response.render("about.hbs");
});

app.get("/contact", function (request, response) {
  response.render("contact.hbs");
});

app.get("/login", function (request, response) {
  // const username = request.body.username;
  // const password = request.body.password;
  response.render("log-in.hbs");
});

app.post("/login", function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  if (username == adminUsername) {
    bcryptjs.compare(password, adminPassword, function (error, result) {
      if (result) {
        request.session.isLoggedIn = true;
        response.redirect("/");
      } else {
        const model = {
          failedToLogIn: true,
        };
        response.render("log-in.hbs", model);
      }
    });
  } else {
    const model = {
      failedToLogIn: true,
    };
    response.render("log-in.hbs", model);
  }
});

app.get("/logout", function (request, response) {
  request.session.isLoggedIn = true;
  response.render("log-out.hbs");
});

app.post("/logout", function (request, response) {
  request.session.isLoggedIn = false;
  response.redirect("/");
});

app.listen(8080);
