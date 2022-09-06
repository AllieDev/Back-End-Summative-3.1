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
  imageUrl: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fm=jpg&ixid=Mnw3MjAxN3wwfDF8c2VhcmNofDN8fGV2ZW50fGVufDB8MHx8fDE2NjI0Mjg0MTA&ixlib=rb-1.2.1&q=80&q=85&fmt=jpg&crop=entropy&cs=tinysrgb&w=450",
  },
  title: {
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
