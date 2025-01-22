const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts'); // Import express-ejs-layouts

dotenv.config();

const app = express();

// Set up ejs view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts middleware for layouts
app.use(ejsLayouts);

// Serve static files (CSS, JS)
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Routes
const topicRoutes = require('./routes/topics');
const quoteRoutes = require('./routes/quotes');

app.use('/topics', topicRoutes);
app.use('/quotes', quoteRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
