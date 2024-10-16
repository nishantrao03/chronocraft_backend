const mongoose = require('mongoose');

const tasksDetailsSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: Date,
  resources: String,
  updates: [{
    userID: { type: String, ref: 'UserDetails', required: true }, // User who added the update
    update: { type: String, required: true }, // Content of the update
    createdAt: { type: Date, default: Date.now }, // Timestamp for when the update was created
    updatedAt: { type: Date, default: Date.now }  // Timestamp for when the update was last edited
  }],
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TasksDetails',
    default: null
  },
  subTasks: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TasksDetails'
  }],
  // users: { type: [String], default: [] }, // Array, handled as a Set in logic
  users: { type: [String], unique: true },
  // admins: { type: [String], default: [] }, // Array, handled as a Set in logic
  admins: { type: [String], unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'finished'], 
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: ['normal', 'high'], 
    default: 'normal' 
  },
  category: String,
  repeatafter: Number,
  // requests: [{
  //   userID: {
  //     type: String,
  //     ref: 'UserDetails', 
  //     required: true
  //   }
  // }]
  requests: [{
    userID: {
      type: String,
      ref: 'UserDetails',
      required: true,
      unique: true
    }
  }],
  completedSubTasks: {
    type: Number,
    default: 0
  },
  ancestorTaskDescription: {
    type: String,
    default: ''
  }
});

const TasksDetails = mongoose.model('TasksDetails', tasksDetailsSchema);

module.exports = TasksDetails;
