import express from 'express';
import { getUser, listUsers, toggleProStatus, mockPayment } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/list', listUsers);
userRouter.get('/:clerkId', getUser);
userRouter.post('/toggle-pro', toggleProStatus);
userRouter.post('/checkout', mockPayment);

export default userRouter;
