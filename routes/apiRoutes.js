const router = require("express").Router(),
  coursesController = require("../controllers/coursesController"),
  usersController = require("../controllers/usersController"),
  messagesController = require("../controllers/messagesController");


router.use(usersController.verifyToken);
// filterUserCourses no needed when api/courses called from XHR.html
// then getting json-data is enough
router.get("/courses", coursesController.index, coursesController.filterUserCourses, coursesController.respondJSON);
router.get("/users", usersController.allUsers, usersController.respondJSON);
router.get("/messages", messagesController.index, messagesController.respondJSON);

router.get("/courses/:id/join", coursesController.join, coursesController.respondJSON);

router.use(coursesController.errorJSON);

module.exports = router;
