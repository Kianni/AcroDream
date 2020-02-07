const mongoose = require("mongoose"),
  httpStatus = require("http-status-codes"),
      Message = require("../models/message");

module.exports = {
  index: (req, res, next) => {
    Message.find({})
    .then(messages => {
      res.locals.messages = messages;
      next();
    })
    .catch(error => {
      console.log(`Error fetching messages: ${error.message}`);
      next(error);
    });
  },
  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals
    });
  }
};
