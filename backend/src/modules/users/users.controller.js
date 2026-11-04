import * as usersService from './users.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const updateMe = async (req, res) => {
  const user = await usersService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, { message: 'Profile updated', data: { user } });
};
