import express from 'express';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';
import { 
  getAllUsersTickets, 
  assignTicket, 
  updateTicketStatus, 
  updateTicketPriority, 
  addTicketComment,
  getUsers 
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all routes below: only authenticated users and admins can access
router.use(protect);  // Protect all routes below to ensure the user is logged in

// 1. Get all tickets (admin only)
router.get('/tickets', protectAdmin, getAllUsersTickets);  // Admin-only route, protected by protectAdmin

// 2. Assign ticket to admin/agent
router.put('/ticket/assign', protectAdmin, assignTicket);  // Only admins can assign tickets

// 3. Update ticket status
router.put('/ticket/status', protectAdmin, updateTicketStatus);  // Only admins can update status

// 4. Update ticket priority
router.put('/ticket/priority', protectAdmin, updateTicketPriority);  // Only admins can update priority

// 5. Add comment to ticket (admin only)
router.put('/ticket/comment', protectAdmin, addTicketComment);  // Only admins can add comments

// 6. Get all users (admin only)
router.get('/users', protectAdmin, getUsers);  // Admin-only route, protected by protectAdmin

export default router;
