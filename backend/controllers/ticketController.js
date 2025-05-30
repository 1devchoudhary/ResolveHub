import Ticket from '../models/Ticket.js';

// Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { subject, category, description, attachmentName } = req.body;

    const newTicket = new Ticket({
      subject,
      category,
      description,
      attachmentName,
      user: req.user._id, // 👈 associate ticket with logged-in user
    });

    const savedTicket = await newTicket.save();
    res.status(201).json(savedTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: 'Error creating ticket' });
  }
};

// Get all tickets
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};


// Delete a ticket
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ticket' });
  }
};

// Get ticket by controller
export const getTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ['open', 'pending', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Filter tickets by status and user
    const tickets = await Ticket.find({ user: userId, status });
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets by status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
