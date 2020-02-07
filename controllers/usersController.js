const User = require("../models/user"),
  httpStatus = require("http-status-codes"),
  Course = require("../models/course"),
  passport = require("passport"),
  getUserParams = (body) => {
    return {
      name: {
        first: body.first,
        last: body.last
      },
      master: body.master,
      email: body.email,
      from: body.from
    }
  };

module.exports = {
  index: (req, res, next) => {
    User.find({master: true})
    .then(users => {
      res.locals.instructors = users;
      next();
    })
    .catch(error => {
      console.log(`Error fetching instructors: ${error.message}`);
      next(error);
    });
  },

  allUsers: (req, res, next) => {
    User.find({})
    .then(users => {
      res.locals.users = users;
      next();
    })
    .catch(error => {
      console.log(`Error fetching users: ${error.message}`);
      next(error);
    });
  },

  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals
    });
  },

  indexView: (req, res) => {
    res.render("users/index");
  },
  participants: (req, res, next) => {
    User.find({master: false})
    .then(users => {
      res.locals.participants = users;
      next();
    })
    .catch(error => {
      console.log(`Error fetching participants: ${error.message}`);
      next(error);
    });
  },

  participantsView: (req, res) => {
    res.render("participants/index");
  },

  new: (req, res) => {
    res.render("users/new");
  },
  create: (req, res, next) => {
    if (req.skip) {
      next();
    };
    let newUser = new User( getUserParams(req.body) );

    User.register(newUser, req.body.password, (error, user) => {
      if (user) {
        req.flash("success", `${user.fullName}'s account created successfully!`);
        if (user.master === true) {
          res.locals.redirect = "/users";
        } else {
          res.locals.redirect = "/users/participants";
        };

        next();
      } else {
        req.flash(
          "error",
          `Failed to create user account because: ${error.message}.`);
          res.locals.redirect = "/users/new";
        next();
      }
    });

  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
//НЕ РАБОТАЛО, ПОТОМУ ЧТО RES И REQ МЕСТАМИ БЫЛИ ПОМЕНЯНЫ!!!!!
  show: (req, res, next) => {
    let userId = req.params.id;

      User.findById(userId)
        .then(user => {
          // WHY flash doesn't work
          req.flash("success", `${user.fullName}'s is found!`);
          res.locals.user = user;
            next();
        })
        .catch(error => {
          console.log(`Error fetching user by ID: ${error.message}`);
          next(error);
        });

    },

    showView: (req, res) => {
      res.render("users/show");
    },

    showTrainings: (req, res, next) => {
      let userId = req.params.id;

        User.findById(userId)
          .then( (user) => {
            return User.populate(user, "courses");
          })
          .then( user => {
            res.locals.events = user.courses;
            res.locals.usersName = user.fullName;
              next();
          })
          .catch(error => {
            console.log(`Error fetching user by ID: ${error.message}`);
            next(error);
          });

      },
  showTrainingsView: (req, res) => {
    res.render("users/showTrainings");
  },
  edit: (req, res, next) => {
    let userId = req.params.id;
    User.findById(userId)
      .then(user => {
        // And this one doesn't work
        req.flash("success", `${user.fullName}'s is found!`);
        res.render("users/edit", {
          user: user
        });
      })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
  },
  update: (req, res, next) => {
    let userId = req.params.id,
      userParams = {
        name: {
          first: req.body.first,
          last: req.body.last
        },
        email: req.body.email,
        from: req.body.from
      };
    User.findByIdAndUpdate(userId, {
      $set: userParams
    })
    .then(user => {
      req.flash("success", `${user.fullName}'s is updated!`);
      res.locals.redirect = `/users/${userId}`;
      res.locals.user = user;
      next();
    })
    .catch(error => {
      console.log(`Error updating user by ID: ${error.message}`);
      next(error);
    });
  },
  delete: (req, res, next) => {
    let userId = req.params.id;
    User.findByIdAndRemove(userId)
    .then((user) => {
      req.flash("success", `${user.fullName}'s is deleted!`);
      res.locals.redirect = "/users/admin";
      next();
    })
    .catch(error => {
      console.log(`Error deleting user by ID: ${error.message}`);
      next();
    });
  },
  login: (req, res) => {
    res.render("users/login");
  },

  authenticate: passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "Failed to login.",
    successRedirect: "/courses",
    successFlash: "Now you chat with participants and join trainings!"
  }),

  logout: (req, res, next) => {
    req.logout();
    req.flash("success", "You have been logged out!");
    res.locals.redirect = "/users";
    next();
  },

  validate: (req, res, next) => {
    req.sanitizeBody("email").normalizeEmail({
      all_lowercase: true
    }).trim();
    req.check("email", "Email is invalid").isEmail();
    req.check("from", "Where are you living?")
    .notEmpty().equals(req.body.from);
    req.check("password", "Password cannot be empty").notEmpty();

    req.getValidationResult().then((error) => {
      if(!error.isEmpty()) {
        let messages = error.array().map(e => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/users/new";
        next();
      } else {
        next();
      }
    }).catch(error => {
      console.log(`Error: ${error}!`);
    });
  },
  verifyToken: (req, res, next) => {
    let token = req.query.apiToken;
    if (token) {
      User.findOne({ apiToken: token })
        .then(user => {
          if (user) next();
          else next(new Error("Invalid API token."));
        })
        .catch(error => {
          next(new Error(error.message));
        });
    } else {
      next(new Error("Invalid API token."));
    }

  }

};
