const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Topic = require('../models/topic');

// Get all topics
router.get('/', async (req, res) => {
  const data = await Topic.findOne();
  res.render('index', { 
    topics: data ? data.topics : [], 
    activeTopic: data && data.at ? data.at.toString() : null // Convert ObjectId to string
  });
});

// Render the form to add a new topic
router.get('/add', (req, res) => {
  res.render('addTopic'); // Render a form to add a new topic
});

// POST route to add a new topic
router.post('/add', async (req, res) => {
  const { name, description } = req.body; // Extract name and description
  const newTopic = {
    _id: new mongoose.Types.ObjectId(), // Generate a unique ID for the topic
    name,
    quotes: description ? [description] : [] // Add description as the first quote if provided
  };

  // Find the document and add the new topic
  const data = await Topic.findOne();
  if (data) {
    data.topics.push(newTopic); // Add the new topic to the existing topics array
    await data.save();
  } else {
    // If no document exists, create one
    const newData = new Topic({
      topics: [newTopic],
      settings: {
        refreshPeriod: "5m",
        shuffle: false,
        colorSwitch: false
      },
      at: newTopic._id // Set the newly created topic as the active one
    });
    await newData.save();
  }

  res.redirect('/topics'); // Redirect back to the topics page
});

// Update an existing topic
router.post('/:id/update', async (req, res) => {
  const { id } = req.params; // Topic ID
  const { name, quotes } = req.body;

  const data = await Topic.findOne();
  if (data) {
    const topic = data.topics.id(id); // Find the topic by ID in the array
    if (topic) {
      topic.name = name;
      topic.quotes = quotes;
      await data.save();
    }
  }
  res.redirect('/topics');
});

// Delete a topic
router.post('/:id/delete', async (req, res) => {
  const { id } = req.params;

  const data = await Topic.findOne();
  if (data) {
    data.topics = data.topics.filter((topic) => topic._id.toString() !== id); // Remove the topic by ID
    if (data.at && data.at.toString() === id) {
      data.at = data.topics.length > 0 ? data.topics[0]._id : null; // Update the active topic if it was deleted
    }
    await data.save();
  }

  res.redirect('/topics');
});

// Set the active topic
router.post('/:id/activate', async (req, res) => {
  const { id } = req.params;

  const data = await Topic.findOne();
  if (data) {
    data.at = id; // Set the active topic by ID
    await data.save();
  }

  res.redirect('/topics');
});

// New API to get active topic and quotes
router.get('/active', async (req, res) => {
  try {
    const data = await Topic.findOne(); // Find the main document
    
    if (!data || !data.at) {
      return res.status(404).send('No active topic found');
    }

    // Get the active topic ID stored in the 'at' field
    const activeTopicId = data.at;

    // Find the active topic from the topics array using the active topic ID
    const activeTopic = data.topics.find(topic => topic._id.toString() === activeTopicId.toString());

    if (!activeTopic) {
      return res.status(404).send('Active topic not found');
    }

    // Return the active topic's name, quotes, and settings
    res.json({
      activeTopic: activeTopic.name,
      quotes: activeTopic.quotes,
      settings: data.settings // Add settings to the response
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});


// Test route to display topics (static data)
router.get('/test', (req, res) => {
  const topics = [
    { _id: '64f5a8aab1234567890abcde', name: 'Topic 1', quotes: ['Quote 1', 'Quote 2'] },
    { _id: '64f5a8bbb1234567890abcdef', name: 'Topic 2', quotes: ['Quote 3', 'Quote 4'] }
  ];

  res.render('index', {
    title: 'Topics Page', // Dynamic title for the page
    topics: topics, // Data passed to the view
    activeTopic: '64f5a8aab1234567890abcde' // Example active topic
  });
});

// Update global settings (refreshPeriod, shuffle, colorSwitch)
router.post('/settings', async (req, res) => {
  const { refreshPeriod, shuffle, colorSwitch } = req.body;

  const data = await Topic.findOne();
  if (data) {
    // Update the global settings
    data.settings.refreshPeriod = refreshPeriod || data.settings.refreshPeriod;
    data.settings.shuffle = shuffle !== undefined ? shuffle : data.settings.shuffle;
    data.settings.colorSwitch = colorSwitch !== undefined ? colorSwitch : data.settings.colorSwitch;

    await data.save(); // Save the updated settings
    res.redirect('/topics'); // Redirect to topics page after updating
  } else {
    res.status(404).send('Settings not found');
  }
});


module.exports = router;
