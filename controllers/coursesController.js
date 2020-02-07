const mongoose = require("mongoose"),
  httpStatus = require("http-status-codes"),
      Course = require("../models/course"),
      User = require("../models/user");

module.exports = {
  index: (req, res, next) => {
    Course.find({})
    .then(courses => {
      res.locals.courses = courses;
      next();
    })
    .catch(error => {
      console.log(`Error fetching courses: ${error.message}`);
      next(error);
    });
  },
  indexView: (req, res) => {
    res.render("courses/index", {
      flashMessages: {
        success: "Explore acroyoga courses!"
      }
    });
  },
  new: (req, res) => {
    res.render("courses/new", {
      flashMessages: {
        success: "Bring your best ideas to life!"
      }
    });
  },
  create: (req, res, next) => {
    let courseParams = {
      title: req.body.title,
      organizer: req.body.organizer,
      description: req.body.description,
      time: req.body.time,
      venue: req.body.venue,
      eventType: req.body.eventType,
      cost: req.body.cost
      //HOW to add an Array from the form?
      //subscribers: req.body.subscribers
    };

    Course.create(courseParams)
      .then(course => {
        // cannot see this message, because of redirect
        // and another message coming fast
        req.flash("success", `${course.title} is created! Great!`);
        res.locals.redirect = "/courses";
        res.locals.course = course;
        next();
      })
      .catch(error => {
        console.log(`Error saving course: ${error.message}`);
        next(error);
      });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  show: (req, res, next) => {
    let courseId = req.params.id;

    Course.findById(courseId)
      .then((course) => {
        return Course.populate(course, "participants");
      })
      .then(course => {
        res.locals.course = course;
          next();
      })
      .catch(error => {
        console.log(`Error fetching course by ID: ${error.message}`);
        next(error);
      });
  },
  showView: (req, res) => {
    res.render("courses/show");
  },
  showParticipants: (req, res, next) => {
    let courseId = req.params.id;

      Course.findById(courseId)
        .then( (course) => {
          return Course.populate(course, "participants");
        })
        .then( course => {
          res.locals.participants = course.participants;
          res.locals.eventTitle = course.title;
            next();
        })
        .catch(error => {
          console.log(`Error fetching course by ID: ${error.message}`);
          next(error);
        });

    },
showParticipantsView: (req, res) => {
  res.render("courses/showParticipants");
},
  edit: (req, res, next) => {
    let courseId = req.params.id;
    Course.findById(courseId)
      .then(course => {
        res.render("courses/edit", {
          course: course
        });
      })
      .catch(error => {
        console.log(`Error fetching course by ID: ${error.message}`);
        next(error);
      });
  },
  update: (req, res, next) => {
    let courseId = req.params.id,
      courseParams = {
          title: req.body.title,
          description: req.body.description,
          eventType: req.body.eventType,
          time: req.body.time,
          venue: req.body.venue,
          cost: req.body.cost
        };
    Course.findByIdAndUpdate(courseId, {
      $set: courseParams
    })
    .then(course => {
      res.locals.redirect = `/courses/${courseId}`;
      res.locals.course = course;
      next();
    })
    .catch(error => {
      console.log(`Error updating course by ID: ${error.message}`);
      next(error);
    });
  },
  delete: (req, res, next) => {
    let courseId = req.params.id;
    Course.findByIdAndRemove(courseId)
    .then(() => {
      res.locals.redirect = "/courses";
      next();
    })
    .catch(error => {
      console.log(`Error deleting user by ID: ${error.message}`);
      next();
    });
  },

  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals
    });
  },

  errorJSON: (error, req, res, next) => {
    let errorObject;

    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Unknown Error."
      };
    }

    res.json(errorObject);
  },

  join: (req, res, next) => {
    let courseId = req.params.id;
    currentUser = req.user;

    if (currentUser) {
      User.findByIdAndUpdate(currentUser, {
        $addToSet: {
          courses: courseId
        }
      })
      .then(() => {
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });

      Course.findByIdAndUpdate(courseId, {
        $addToSet: {
          participants: currentUser
        }
      })
      .then(() => {
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });


    } else {
      // куда выводится это сообщение?
      next(new Error("User must log in."));
    }
  },

  filterUserCourses: (req, res, next) => {
    let currentUser = res.locals.currentUser;
    if (currentUser) {
      let mappedCourses = res.locals.courses.map((course) => {
        let userJoined = currentUser.courses.some((userCourse) => {
          return userCourse.equals(course._id);
        });
        return Object.assign(course.toObject(), { joined: userJoined });
      });
      res.locals.courses = mappedCourses;
      next();
    } else {
      next();
    }
  }
}
