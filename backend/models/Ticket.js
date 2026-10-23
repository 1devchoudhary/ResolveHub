import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
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
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'in-progress', 'resolved', 'closed'],
    default: 'open',
  },
  comments: [{
    type: String,
    default: [],
  }], // For storing admin's notes or updates
},
{timestamps:true}
);

export default mongoose.model('Ticket', ticketSchema);
