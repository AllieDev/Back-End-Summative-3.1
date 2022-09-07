const express = require("express");
const router = express.Router();
const eventModel = require("../models/events-model.js");
const jwt = require("express-jwt");
const userModel = require("../models/users-model.js");

const secretKey = "809fad9sffa0dsfj0das";
// --------------------------------------------------------------------

// SeoJeonge GET ALL EVENT LIST ---------------------------------------
// --------------------------------------------------------------------

// GET All of User's to attend Events ------------------------------------
router.get("/attend", authorise(), async (req, res) => {
  try {
    let arrayOfAttendingEvents = [];
    const eventsData = await eventModel.find();
    for (let event of eventsData) {
      for (let attendeeId of event.attendeesId) {
        if (attendeeId.toString() === req.auth.userId.toString()) {
          arrayOfAttendingEvents.push(event.toObject());
        }
      }
    }
    res.status(200).json(arrayOfAttendingEvents);
  } catch (error) {
    // 500 = error in server
    res.status(500).json({ message: error.message });
  }
});
// --------------------------------------------------------------------

// GET All of User's Hosted Events ------------------------------------
router.get("/hosted", authorise(), async (req, res) => {
  try {
    const eventsData = await eventModel.find({ hostId: req.auth.userId });
    res.status(200).json(eventsData);
  } catch (error) {
    // 500 = error in server
    res.status(500).json({ message: error.message });
  }
});
// --------------------------------------------------------------------

// Laurindo - GET ENDPOINT WITH ID ------------------------------------
router.get("/:id", getSpecificEventData, async (req, res) => {
  try {
    res.status(200).json(res.eventData.toObject());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// --------------------------------------------------------------------

// POST EVENT ENDPOINT --------------------------------------------------------
router.post("/", authorise(), async (req, res) => {
  try {
    const isValidUser = await userModel.exists({ _id: req.auth.userId });
    if (isValidUser) {
      const eventData = new eventModel({
        hostId: req.auth.userId,
        title: req.body.title,
        imageFile: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
        detail: req.body.detail,
        time: req.body.time,
        date: req.body.date,
      });
      // 201 = successfully created something
      const createdEvent = await eventData
        .save()
        .then((data) => data.toObject());
      res.status(201).json(createdEvent);
    } else {
      res.status(403).json({ message: "You do not have access to post" });
    }

    // -------------------------------------------------------------------
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//   -----------------------------------------------------------------------

// ATTEND Event ENDPOINT ---------------------------------------------------
router.patch(
  "/attend/:id",
  authorise(),
  getSpecificEventData,
  async (req, res) => {
    try {
      let isAlreadyAttending;
      for (let attendeeId of res.eventData.attendeesId) {
        if (req.auth.userId === attendeeId.toString()) {
          // if the attendee is already being attended then don't save id in attendeesId list
          isAlreadyAttending = true;
        } else if (req.auth.userId === res.eventData.hostId.toString()) {
          // if the attendee is the host of the event then don't save id in attendeesId list
          isAlreadyAttending = true;
        } else {
          isAlreadyAttending = false;
        }
      }
      if (isAlreadyAttending) {
        res.status(403).json({ message: "you are already attending" });
      } else {
        res.eventData.attendeesId.push(req.auth.userId);
        const newEventDetail = await res.eventData
          .save()
          .then((data) => data.toObject());
        res.json(newEventDetail.attendeesId);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);
// --------------------------------------------------------------------

// EDIT Event Endpoint -------------------------------------------------
router.patch(
  "/hosted/:id",
  authorise(),
  getSpecificEventData,
  async (req, res) => {
    try {
      if (req.auth.userId === res.eventData.hostId.toString()) {
        if (req.body.imageUrl != null) {
          res.eventData.imageUrl = req.body.imageUrl;
        }
        if (req.body.title != null) {
          res.eventData.title = req.body.title;
        }
        if (req.body.detail != null) {
          res.eventData.detail = req.body.detail;
        }
        if (req.body.time != null) {
          res.eventData.time = req.body.time;
        }
        if (req.body.date != null) {
          res.eventData.date = req.body.date;
        }

        const newEventDetail = await res.eventData
          .save()
          .then((data) => data.toObject());
        res.status(200).json(newEventDetail);
      } else {
        res
          .status(403)
          .json({ message: "You do not have access to change this event" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);
// --------------------------------------------------------------------

// POST COMMENT -------------------------------------------------------------
router.patch("/:id", authorise(), getSpecificEventData, async (req, res) => {
  try {
    res.eventData.comments.push({
      id: req.auth.userId,
      comment: req.body.comment,
    });
    const newEventDetail = await res.eventData
      .save()
      .then((data) => data.toObject());
    res.json(newEventDetail.comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// --------------------------------------------------------------------

// DELETE Event Endpoint------------------------------------------------------------
router.delete("/:id", authorise(), getSpecificEventData, async (req, res) => {
  try {
    if (req.auth.userId === res.eventData.hostId.toString()) {
      await res.eventData.remove();
      res.status(200).json({ message: "your event was successfully deleted!" });
    } else {
      res
        .status(403)
        .json({ message: "your not allowed to delete this event!" });
    }
  } catch (error) {
    // 500 = error in server
    res.status(500).json({ message: error.message });
  }
});
// --------------------------------------------------------------------

module.exports = router;

// ----------------------------------------------------------------
async function getSpecificEventData(req, res, next) {
  let event;
  try {
    event = await eventModel.findById(req.params.id);
    if (event == null) {
      // 404 = could not find something
      return res.status(404).json({ message: "Cannot Find Event" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  res.eventData = event;
  next();
}

function authorise() {
  return jwt.expressjwt({ secret: secretKey, algorithms: ["HS256"] });
}
