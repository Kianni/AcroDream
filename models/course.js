const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  organizer: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String
  },
  cost: {
    type: String
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true
});


module.exports = mongoose.model("Course", courseSchema);
