import * as authService from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

// Controllers only translate HTTP <-> service calls. Input is already validated by the route.

export const register = async (req, res) => {
  const user = await authService.registerCustomer(req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Account created', data: { user } });
};
