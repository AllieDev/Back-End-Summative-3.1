const env = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to " + process.env.DATABASE_URL));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = require("./routes/users.js");
app.use("/users", users);

const events = require("./routes/events.js");
app.use("/events", events);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
