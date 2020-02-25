const chai = require("chai"),
  { expect } = chai,
  usersController = require("../controllers/usersController");

describe("usersController", () => {
  describe("getUserParams", () => {
    it("should convert request body to contain the name attributes of the user object",
     () => {
      var body = {
        first: "Robert",
        last: "Moonlight",
        master: true,
        email: "moon@light.still",
        from: "Seatle"
      };
      expect(usersController.getUserParams(body))
        .to.deep.include({
          name: {
            first: "Robert",
            last: "Moonlight"
          }
        });
      });
    it("should return an empty object with empty request body input", () => {
      var emptyBody = {};
      expect(usersController.getUserParams(emptyBody))
      .to.deep.include({});
    });
    it("should return a value from an email field form the body", () => {
      var body = {
        first: "Robert",
        last: "Moonlight",
        master: true,
        email: "moon@light.still",
        from: "Seatle"
      };
      expect(usersController.getUserParams(body))
        .to.deep.include({
          email: "moon@light.still"
        });
    });
  });
});
