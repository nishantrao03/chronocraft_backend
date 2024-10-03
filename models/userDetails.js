const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: true // Ensures uniqueness of userID
  },
  tasks: [String]
});

const UserDetails = mongoose.model('UserDetails', userDetailsSchema);

module.exports = UserDetails;
