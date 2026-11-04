import * as ticketService from './ticket.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const list = async (req, res) => {
  const result = await ticketService.listTickets(req.user, req.query);
  return sendSuccess(res, { data: result });
};

export const stats = async (req, res) => {
  const result = await ticketService.getStats(req.user);
  return sendSuccess(res, { data: result });
};

export const activity = async (req, res) => {
  const items = await ticketService.getRecentActivity(req.user, req.query);
  return sendSuccess(res, { data: { items } });
};

export const get = async (req, res) => {
  const ticket = await ticketService.getTicket(req.user, req.params.number);
  return sendSuccess(res, { data: { ticket } });
};

export const create = async (req, res) => {
  const ticket = await ticketService.createTicket(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Ticket created', data: { ticket } });
};

export const reply = async (req, res) => {
  const ticket = await ticketService.addReply(req.user, req.params.number, req.body);
  const message = req.body.isInternal ? 'Internal note added' : 'Reply sent';
  return sendSuccess(res, { statusCode: 201, message, data: { ticket } });
};

export const update = async (req, res) => {
  const ticket = await ticketService.updateTicket(req.user, req.params.number, req.body);
  return sendSuccess(res, { message: 'Ticket updated', data: { ticket } });
};
