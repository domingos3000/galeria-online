import { Router } from 'express';
import postController from './../controllers/post.controller';
import upload from '../services/uploadFiles';
import { authUser } from '../middlewares/auth';

const routes = Router();

routes.use(authUser);

// Routes POST

routes.post('/create', upload.single('cover'), postController.create);
routes.get('/find/one/:id', postController.findOne);
routes.get('/find', postController.findTag);
routes.get('/find/all/:id', postController.findAll);

routes.delete('/delete/', postController.delete);

routes.put('/update/:id', postController.updatePost);
routes.put('/update/cover/:id', upload.single('cover'), postController.updateCover);

// Routes REACT POST

routes.post('/react/create', postController.createReact)
routes.delete('/react/delete', postController.deleteReact)


// Routes FAVORITE OR SAVE POST

routes.post('/favorite/create', postController.createFavorite);
routes.delete('/favorite/delete', postController.deleteFavorite);


export default routes;