const db = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const { auth, validateToken } = require("../middlewares/auth");

async function postNewUser(username, password) {
  try {
    const userExists = await db.users.findOne({ username: username });

    if (userExists) {
      return {
        statusCode: 400,
        success: false,
        message: "Användarnamnet finns redan",
      };
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = { username: username, password: hashedPassword };
      const userRegistered = await db.users.insert(newUser);

      if (!userRegistered) {
        return {
          statusCode: 500,
          success: false,
          message: "Internt serverfel",
        };
      } else {
        return {
          statusCode: 201,
          success: true,
          message: "Användare skapad",
        };
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: "Ett fel uppstod med databasen när användaren skulle skapas",
    };
  }
}

const loginUser = async (username, password) => {
  let status = 400,
    success = false,
    token,
    userId;

  try {
    const user = await db.users.findOne({ username: username });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        status = 200;
        success = true;

        token = jwt.sign(
          { userId: user._id, username: user.username },
          process.env.JWT_KEY,
          { expiresIn: "8h" }
        );

        userId = user._id;
      }
    }

    await addLoginEntry(username, success);

    if (!success) {
      status = 404;
    }

    return { status, success, token, username, userId };
  } catch (err) {
    return { status: 500, success };
  }
};
const addLoginEntry = async (username, success) => {
  try {
    const currentDate = new Date();
    const newLoginEntry = await db.logins.insert({
      username: username,
      loginTime: currentDate,
      success: success ? "Y" : "N",
    });
    if (!newLoginEntry) {
      console.error("Failed to add login entry");
    }
  } catch (error) {
    console.error("Error adding login entry:", error);
  }
};

module.exports = { postNewUser, loginUser };
