const express = require("express");
const router = express.Router();
const eventModel = require("../models/events-model.js");
const jwt = require("express-jwt");
const userModel = require("../models/users-model.js");

const secretKey = "809fad9sffa0dsfj0das";
// --------------------------------------------------------------------
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5242880 },
});

// Seojeong GET ALL EVENT LIST ---------------------------------------
router.get("/", async (req, res) => {
  try {
    eventModel
      .find({}, (error, results) => {
        if (error) {
          console.log(error);
        } else {
          res.json(results.reverse());
        }
      })
      .lean();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// --------------------------------------------------------------------

// Laurindo - GET ENDPOINT WITH ID ------------------------------------

router.get("/:id", getSpecificEventData, async (req, res) => {
  try {
    const hostInfo = await userModel.findById(res.eventData.hostId);

    let commentatorsInfo = [];
    for (let commentInfo of res.eventData.comments) {
      const commentator = await userModel.findById(commentInfo.id);
      const commentsInfo = {
        id: commentInfo.id,
        comment: commentInfo.comment,
        commentator: commentator,
      };
      commentatorsInfo.push(commentsInfo);
    }

    let attendeesInfo = [];

    for (let attendee of res.eventData.attendeesId) {
      const attendeeInfo = await userModel.findById(attendee);
      attendeesInfo.push(attendeeInfo);
    }

    const eventsData = {
      hostInfo: hostInfo,
      attendeesInfo: attendeesInfo,
      commentsInfo: commentatorsInfo.reverse(),
    };

    res.status(200).json(eventsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --------------------------------------------------------------------

// POST EVENT ENDPOINT --------------------------------------------------------
router.post("/", authorise(), upload.single("image"), async (req, res) => {
  try {
    // console.log(req.body);
    const isValidUser = await userModel.exists({ _id: req.auth.userId });
    if (isValidUser) {
      if (req.file) {
        const eventData = new eventModel({
          hostId: req.auth.userId,
          imageFile: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.file.filename)
            ),
            contentType: "image/png, image/jpeg, image/svg",
          },
          location: req.body.location,
          title: req.body.title,
          detail: req.body.detail,
          time: req.body.time,
          date: req.body.date,
        });
        deleteImageFromUploadesFolder(req);
        const createdEvent = await eventData
          .save()
          .then((data) => data.toObject());
        res.status(201).json(createdEvent);
      } else {
        const eventData = new eventModel({
          hostId: req.auth.userId,
          location: req.body.location,
          title: req.body.title,
          detail: req.body.detail,
          time: req.body.time,
          date: req.body.date,
        });
        const createdEvent = await eventData
          .save()
          .then((data) => data.toObject());
        res.status(201).json(createdEvent);
      }

      // delete images from the uploads folder
      // deleteImageFromUploadesFolder(req);
      // 201 = successfully created something
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
        // console.log(attendeeId.toString(),req.auth.userId)
        if (req.auth.userId == attendeeId.toString()) {
          // if the attendee is already being attended then don't save id in attendeesId list
          isAlreadyAttending = true;
        } else {
          isAlreadyAttending = false;
        }
        console.log(isAlreadyAttending);
      }
      if (isAlreadyAttending) {
        // console.log(req.auth.userId);
        await eventModel.findByIdAndUpdate(req.params.id, {
          $pull: { attendeesId: req.auth.userId },
        });
        // console.log(data)
        res.status(200).json({ message: "You have unattended this event" });
      } else {
        res.eventData.attendeesId.push(req.auth.userId);
        await res.eventData.save();
        res.json({ message: "Thanks for attending!" });
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
        if (req.body.location != null) {
          res.eventData.location = req.body.location;
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
        res.status(200).json(newEventDetail._id);
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
    res.json(req.params.id);
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

function deleteImageFromUploadesFolder(req) {
  fs.unlinkSync(path.join(__dirname + "/uploads/" + req.file.filename));
}
