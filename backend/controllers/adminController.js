import Ticket from '../models/Ticket.js';  // Ticket model
import User from '../models/User.js';      // User model

// 1. Get all tickets
export const getAllUsersTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(200,{tickets},"Tickets fatched successfully");
    console.log("ALL  TICKETS:", tickets)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

// 2. Assign ticket to an admin/agent
export const assignTicket = async (req, res) => {
  const { ticketId, assignedTo } = req.body; // Assume assignedTo is the user ID of the admin/agent
  
  try {
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    ticket.assignedTo = assignedTo;
    ticket.status = 'in-progress'; // Optionally set status to 'in-progress' when assigned
    
    await ticket.save();
    res.status(200).json({ message: 'Ticket assigned successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning ticket', error });
  }
};


// 3. Update ticket status
export const updateTicketStatus = async (req, res) => {
  const { ticketId, status } = req.body; // Assume status is one of 'open', 'in-progress', 'resolved', 'closed'
  
  try {
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    ticket.status = status;
    ticket.updatedAt = Date.now(); // Optionally update the last updated time

    await ticket.save();
    res.status(200).json({ message: 'Ticket status updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket status', error });
  }
};


// 4. Update ticket priority
export const updateTicketPriority = async (req, res) => {
  const { ticketId, priority } = req.body; // Assume priority is one of 'low', 'medium', 'high', 'urgent'

  try {
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    ticket.priority = priority;
    ticket.updatedAt = Date.now(); // Optionally update the last updated time

    await ticket.save();
    res.status(200).json({ message: 'Ticket priority updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket priority', error });
  }
};


// 5. Add comment to ticket
export const addTicketComment = async (req, res) => {
  const { ticketId, comment } = req.body; // Comment is a string

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.comments.push(comment);
    ticket.updatedAt = Date.now(); // Optionally update the last updated time

    await ticket.save();
    res.status(200).json({ message: 'Comment added to ticket', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment to ticket', error });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.json(users);  // Return the users as a JSON response
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
};


