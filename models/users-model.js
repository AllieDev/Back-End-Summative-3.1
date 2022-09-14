const mongoose = require("mongoose");
const arrayOfColors = [
  "rgb(52, 170, 233)",
  "rgb(113, 191, 113)",
  "rgb(241, 221, 0)",
  "orange",
  "lightblue",
  "rgb(100, 240, 240)",
  "rgb(255, 107, 146)",
  "lightseagreen",
  "rgb(255, 183, 0)",
  "rgb(244, 60, 60)",
  "rgb(255, 228, 121)",
];
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    match:
      /^(([A-Za-z0-9]+_+)|([A-Za-z0-9]+\-+)|([A-Za-z0-9]+\.+))*[A-Za-z0-9]+@((\w+\-+)|(\w+\.))*\w{1,63}\.[a-zA-Z]{2,6}$/,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: () => {
      return arrayOfColors[Math.round(Math.random() * 10)];
    },
  },
  memberSince: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  about: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("users", userSchema);
