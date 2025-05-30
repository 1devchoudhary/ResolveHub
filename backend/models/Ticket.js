// import mongoose from 'mongoose';

// const ticketSchema = new mongoose.Schema({
//   subject: String,
//   category: String,
//   description: String,
//   attachmentName: String,
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ['open', 'pending', 'resolved'],
//     default: 'open'
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// export default mongoose.model('Ticket', ticketSchema);

import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  attachmentName: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // Can be assigned to an admin or agent
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'resolved'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  comments: [{
    type: String,
    default: [],
  }], // For storing admin's notes or updates
});

export default mongoose.model('Ticket', ticketSchema);
