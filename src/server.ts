import express, { NextFunction, Request, Response} from 'express';
import AppError from './middlewares/errors/AppError';
import cors from 'cors';
import { pathFolderUpload } from './services/uploadFiles';

import userRoutes from './routes/user.route';
import postRoutes from './routes/post.route';
import sessionRoutes from './routes/session.route';

class App {

    server;

    constructor(){
        this.server = express();

        this.middlaware();
        this.routes();
        this.error();
    }

    middlaware(){

        this.server.use(express.json());
        this.server.use(cors({origin: "*"}));
        this.server.use('/files', express.static(pathFolderUpload));

    }

    routes(){

        this.server.use('/', sessionRoutes);
        this.server.use('/user', userRoutes);
        this.server.use('/post', postRoutes);        
    }

    error(){
       
        this.server.use((error: Error, request: Request, response: Response, next: NextFunction) => {

            if(error instanceof AppError){
                
                return response.status(error.statusCode).json({
                    sucess: false,
                    status: error.statusCode,
                    message: error.message,
                    error: error.original_error
                });
            }

            console.error(error);

            return response.status(500).json({
                status: 500,
                sucess: false,
                message: "INTERNAL SERVER ERROR",
            });
        })
    }

}


export default new App().server;