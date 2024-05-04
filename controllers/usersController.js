const bcrypt = require("bcryptjs");
const db = require("../database");
const jwt = require("jsonwebtoken");
const express = require("express");
const { auth, validateToken } = require("../middlewares/auth");
const { postNewUser, loginUser } = require("../services/usersServices");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ success: false, message: "Invalid data." });
  }

  try {
    const userCreated = await postNewUser(username, password);
    if (userCreated.success) {
      res.status(userCreated.statusCode).send({ success: true });
    } else {
      res
        .status(userCreated.statusCode)
        .send({ success: false, message: userCreated.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ success: false, message: "Invalid data." });
  }

  try {
    const login = await loginUser(username, password);
    if (login.success) {
      res.status(login.status).send({
        success: true,
        token: login.token,
        userId: login.userId,
      });
    } else {
      res
        .status(login.status)
        .send({ success: false, message: "Login failed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});

router.get("/logins", auth, async (req, res) => {
  try {
    if (!validateToken(req)) {
      return res.status(401).send({ success: false, message: "Unauthorized" });
    }

    const userLogins = await db.logins.find({ username: req.user.username });

    if (!userLogins || userLogins.length === 0) {
      return res.status(404).send({ success: true, logins: [] });
    }

    const formattedLogins = userLogins.map(({ loginTime, success }) => ({
      date: loginTime,
      success: success === "Y" ? "YES" : "NO",
    }));

    res.status(200).send({ success: true, logins: formattedLogins });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
