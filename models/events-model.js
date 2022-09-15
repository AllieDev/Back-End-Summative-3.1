const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});

const eventsSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  imageFile: {
    data: Buffer,
    contentType: String,
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  publishedOn: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  date: {
    type: String,
    required: true,
  },
  comments: {
    type: [
      {
        id: {
          type: mongoose.SchemaTypes.ObjectId,
          required: true,
          immutable: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    required: false,
  },
  attendeesId: {
    type: [mongoose.SchemaTypes.ObjectId],
    required: false,
  },
});

module.exports = mongoose.model("events", eventsSchema);
