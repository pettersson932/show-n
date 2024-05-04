const express = require("express");
const db = require("../database");
const { auth } = require("../middlewares/auth");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/", auth, async (req, res) => {
  const { title, text } = req.body;

  if (!title || !text) {
    return res.status(400).send({
      success: false,
      message: "Data missing. Both title and text are required.",
    });
  }

  if (title.length > 50) {
    return res.status(400).send({
      success: false,
      message: "Title must be maximum 50 characters.",
    });
  }

  if (text.length > 300) {
    return res.status(400).send({
      success: false,
      message: "Text must be maximum 300 characters long.",
    });
  }

  try {
    const currentDate = new Date();
    const savedNote = await db.notes.insert({
      title: title,
      text: text,
      userId: req.user.userId,
      createdAt: currentDate,
      modifiedAt: currentDate,
    });

    res.status(201).send({
      success: true,
      message: "Note saved successfully",
      noteId: savedNote._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const userNotes = await db.notes.find({ userId: req.user.userId });

    const formattedNotes = userNotes.map((note) => ({
      createdAt: note.createdAt,
      modifiedAt: note.modifiedAt,
      title: note.title,
      text: note.text,
    }));

    res.status(200).send({ success: true, notes: formattedNotes });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});
router.put("/:noteId", auth, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, text } = req.body;

  try {
    const note = await db.notes.findOne({ _id: noteId });

    if (!note) {
      return res
        .status(404)
        .send({ success: false, message: "Note not found" });
    }

    if (note.userId !== req.user.userId) {
      return res
        .status(403)
        .send({ success: false, message: "Unauthorized to update this note" });
    }

    const currentDate = new Date();
    const updatedNote = await db.notes.update(
      { _id: noteId },
      { $set: { title: title, text: text, modifiedAt: currentDate } }
    );

    if (!updatedNote) {
      return res
        .status(500)
        .send({ success: false, message: "Failed to update note" });
    }

    res.status(200).send({
      success: true,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});
router.delete("/:noteId", auth, async (req, res) => {
  const userId = req.user.userId;
  const noteId = req.params.noteId;

  try {
    const note = await db.notes.findOne({ _id: noteId });

    if (!note) {
      return res
        .status(404)
        .send({ success: false, message: "Note not found" });
    }

    if (note.userId !== userId) {
      return res
        .status(403)
        .send({ success: false, message: "Unauthorized to delete this note" });
    }

    const deletedNote = await db.notes.remove({ _id: noteId });

    if (!deletedNote) {
      return res
        .status(500)
        .send({ success: false, message: "Failed to delete note" });
    }

    res.status(200).send({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});

router.get("/search/:searchTitle", auth, async (req, res) => {
  const searchTitle = req.params.searchTitle;

  try {
    const titleRegex = new RegExp(searchTitle, "i");

    const searchResults = await db.notes.find({
      title: titleRegex,
      userId: req.user.userId,
    });

    searchResults.sort((a, b) => b.createdAt - a.createdAt);

    const formattedResults = searchResults.map((note) => ({
      createdAt: note.createdAt,
      modifiedAt: note.modifiedAt,
      title: note.title,
      text: note.text,
    }));

    res.status(200).send({ success: true, notes: formattedResults });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
