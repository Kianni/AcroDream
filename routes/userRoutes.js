const router = require("express").Router(),
  usersController = require("../controllers/usersController");

router.get("/", usersController.index, usersController.indexView);
router.get("/participants", usersController.participants, usersController.participantsView);

router.get("/new", usersController.new);
router.post("/create", usersController.validate, usersController.create, usersController.redirectView);
// /login paths must be above .show
router.get("/login", usersController.login);
router.post("/login", usersController.authenticate);
router.get("/logout", usersController.logout, usersController.redirectView);


router.get("/:id/edit", usersController.edit);
router.get("/:id/showTrainings", usersController.showTrainings, usersController.showTrainingsView);
router.put("/:id/update", usersController.update, usersController.redirectView);
router.get("/:id", usersController.show, usersController.showView);
router.delete("/:id/delete", usersController.delete, usersController.redirectView);

module.exports = router;
