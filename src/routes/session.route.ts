import { Router } from 'express';
import sessionController from './../controllers/session.controller';

const routes = Router();

// Routes SESSION

routes.post('/login', sessionController.login)

routes.post('/logout', sessionController.logout)


export default routes;