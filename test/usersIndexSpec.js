process.env.NODE_ENV = "test";

const User = require("../models/user"),
  chai = require("chai"),
  chaiHTTP = require("chai-http"),
  app = require("../main"),
  { expect } = require("chai");

chai.use(chaiHTTP);

describe("usersController", () => {

  describe("/users GET", () => {
    it("it should GET all the users", (done) => {
      chai.request(app)
        .get("/users")
        .end((errors, res) => {
          expect(res).to.have.status(200);
          expect(errors).to.be.equal(null);
          done();
        });
    });
  });
});
