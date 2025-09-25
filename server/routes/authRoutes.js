const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/register', requireAuth, async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;
    
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = new User({ clerkId, email, firstName, lastName });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;