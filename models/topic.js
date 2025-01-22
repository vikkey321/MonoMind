const mongoose = require('mongoose');

// Define the schema
const topicSchema = new mongoose.Schema({
  topics: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Unique ID for each topic
      name: String, // Topic name
      quotes: [String] // Array of quotes for the topic
    }
  ],
  settings: {
    refreshPeriod: String, // e.g., "5m"
    shuffle: Boolean, // Whether quotes are shuffled
    colorSwitch: Boolean // Whether to enable color switching
  },
  at: { type: mongoose.Schema.Types.ObjectId, ref: 'topics' } // Active topic's unique ID
});

// Export the model
module.exports = mongoose.model('Topic', topicSchema);
