const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Topic = require('../models/topic');

// Get quotes for a topic
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const data = await Topic.findOne(); // Find the main document
  const topic = data.topics.id(id); // Find the topic by ID
  if (topic) {
    res.render('quotes', { topic });
  } else {
    res.status(404).send('Topic not found');
  }
});

// Add a new quote to a topic
router.post('/:id/add', async (req, res) => {
  const { id } = req.params;
  const { b, r } = req.body; // Black and Red text from the form

  // Validate input
  if (!b || !r || typeof b !== 'string' || typeof r !== 'string') {
    return res.status(400).send('Invalid input. Both Black and Red text are required.');
  }

  const data = await Topic.findOne();
  const topic = data.topics.id(id);
  if (topic) {
    topic.quotes.push(`${b} | ${r}`); // Add the combined quote
    await data.save();
    res.redirect(`/quotes/${id}`);
  } else {
    res.status(404).send('Topic not found');
  }
});

// Update a quote in a topic
router.post('/:id/quotes/:qid/update', async (req, res) => {
  const { id, qid } = req.params;
  const { quote } = req.body;
  const data = await Topic.findOne();
  const topic = data.topics.id(id);
  if (topic) {
    const quoteIndex = topic.quotes.findIndex((q, index) => index === parseInt(qid)); // Find quote by index
    if (quoteIndex !== -1) {
      topic.quotes[quoteIndex] = quote; // Update the quote
      await data.save();
      res.redirect(`/quotes/${id}`);
    } else {
      res.status(404).send('Quote not found');
    }
  } else {
    res.status(404).send('Topic not found');
  }
});

// Delete a quote from a topic
router.post('/:id/quotes/:qid/delete', async (req, res) => {
  const { id, qid } = req.params;
  const data = await Topic.findOne();
  const topic = data.topics.id(id);
  if (topic) {
    topic.quotes = topic.quotes.filter((_, index) => index !== parseInt(qid)); // Remove the quote by index
    await data.save();
    res.redirect(`/quotes/${id}`);
  } else {
    res.status(404).send('Topic not found');
  }
});

// Get active quotes for the active topic
// Get active topic and its quotes


module.exports = router;
