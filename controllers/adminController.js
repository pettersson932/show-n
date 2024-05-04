const db = require("../database");
const express = require("express");
const { auth, validateToken } = require("../middlewares/auth");
const router = express.Router();

router.get("/stats", auth, async (req, res) => {
  try {
    if (!validateToken(req)) {
      return res.status(401).send({ success: false, message: "Unauthorized" });
    }

    if (req.user.username !== "admin") {
      return res.status(403).send({ success: false, message: "Forbidden" });
    }

    const numberOfUsers = await db.users.count({});

    const numberOfNotes = await db.notes.count({});

    res.status(200).send({ success: true, numberOfUsers, numberOfNotes });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
