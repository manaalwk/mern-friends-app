const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Add Friend
router.post('/add', authenticateToken, async (req, res) => {
  const { friendId } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ message: 'Friend not found' });
    if (user.friends.includes(friendId)) return res.status(400).json({ message: 'Already friends' });

    user.friends.push(friendId);
    friend.friends.push(req.user.userId);
    await user.save();
    await friend.save();

    res.json({ message: 'Friend added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error adding friend' });
  }
});

module.exports = router;
