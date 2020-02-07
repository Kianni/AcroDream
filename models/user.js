const mongoose = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose"),
  {Schema} = mongoose,
  randToken = require("rand-token"),

  userSchema = new Schema({
    name: {
      first: {
        type: String,
        trim: true
      },
      last: {
        type: String,
        trim: true
      }
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true
    },
    from: {
      type: String,
      required: true,
    },
    apiToken: String,
    master: {
      type: Boolean,
      required: true
    },
    courses: [{type: Schema.Types.ObjectId, ref: "Course"}]
  },{
    timestamps: true
});

userSchema.virtual("fullName")
  .get(function() {
    return `${this.name.first} ${this.name.last}`;
  });

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});

userSchema.pre("save", function(next) {
  let user = this;
  if (!user.apiToken) user.apiToken = randToken.generate(16);
  next();
});

module.exports = mongoose.model("User", userSchema);
