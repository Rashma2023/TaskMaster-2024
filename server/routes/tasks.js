const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Middleware to authenticate JWT
const auth = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  if (!token) return res.status(403).send('Access denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Get all tasks for a user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Add new task
router.post('/', auth, async (req, res) => {
  const { title, description } = req.body;
  try {
    const newTask = new Task({ title, description, user: req.user.userId });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, { title, description, status }, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json('Task deleted');
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
