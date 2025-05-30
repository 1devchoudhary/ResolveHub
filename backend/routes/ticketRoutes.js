import express from 'express';
import { createTicket, getAllTickets, deleteTicket, getTicketsByStatus } from '../controllers/ticketController.js';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTicket);
router.get('/', protect, getAllTickets);
router.get('/status/:status', protect, getTicketsByStatus);
router.delete('/:id', protect, deleteTicket);

export default router;
