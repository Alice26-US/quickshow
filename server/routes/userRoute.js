import express from 'express';
import { getUser, listUsers, toggleProStatus, mockPayment, updateProfile } from '../controllers/userController.js';
import { upload } from '../controllers/topicController.js';

const userRouter = express.Router();

userRouter.get('/list', listUsers);
userRouter.post('/toggle-pro', toggleProStatus);
userRouter.post('/checkout', mockPayment);
userRouter.put('/profile', upload.single('avatar'), updateProfile);
userRouter.get('/:userId', getUser);

export default userRouter;
