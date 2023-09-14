import { Router } from 'express';
import userController from '../controllers/user.controller';
import upload from '../services/uploadFiles';
import { authUser } from '../middlewares/auth';


const routes = Router();



// Routes USER

routes.post('/create', userController.create);

routes.use(authUser);

routes.put('/update/identity/:id', userController.updateIdentity);

routes.patch('/update/password/:id', userController.updatePassword);

routes.patch('/update/email/:id', userController.updateEmail);

routes.put('/update/avatar/:id', upload.single('avatar'), userController.updateAvatar);

routes.delete('/delete/:id');

// Routes REACT

routes.post('/react/create');
routes.delete('/react/delete');


// Routes FOLLOW

routes.post('/follow', userController.followUser);
routes.delete('/unfollow', userController.unfollowUser);


export default routes;