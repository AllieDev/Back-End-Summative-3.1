const mongoose = require("mongoose");
const arrayOfColors = [
  "blue",
  "green",
  "yellow",
  "orange",
  "lightblue",
  "lightcyan",
  "red",
  "lightgreen",
  "lightorange",
  "lightred",
  "lightyellow",
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

// console.log(arrayOfColors[0]);
