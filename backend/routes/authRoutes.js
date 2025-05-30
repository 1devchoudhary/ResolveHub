import express from 'express';
import { registerUser, loginUser, updateUserProfile, getUserProfile } from '../controllers/authController.js';
import {protect, protectAdmin }from '../middleware/authMiddleware.js'; // if you're using ES modules


const router = express.Router();

// User registration and login routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.put('/userprofile/:id', protect, updateUserProfile);
router.get('/userprofile', protect, getUserProfile);  // Use the JWT token to get the profile of the logged-in user


export default router;
