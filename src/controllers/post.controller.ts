import {Request, Response, query} from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import AppError from '../middlewares/errors/AppError';
import deleteFile from '../services/deleteFiles';


const prisma = new PrismaClient();


class Post {

    

    async create(request: Request, response: Response) {
        
        const postSchema = z.object({
            userId: z.string(),
            title: z.string(),
            content: z.string(),
            tags: z.string().optional()
        });

        const postDate = postSchema.safeParse(request.body);

        if(!postDate.success) {
            deleteFile(request.file?.filename);
            throw new AppError("Preencha corretamente os dados")
        };


        const postCreated = await prisma.post.create({
            data: {
                userId: postDate.data.userId,
                title: postDate.data.title,
                content: postDate.data.content,
                coverUrl: request.file?.filename || '',
                tags: postDate.data.tags
            }
        }).catch(err => {
            deleteFile(request.file?.filename);
            throw new AppError("Envie corretamente os dados ou contate o programador!");
        });

        
        return response.status(201).json({
            status: 201,
            sucess: true,
            message: "sucess"
        }); 
    }

    async updatePost(request: Request, response: Response) {


        const { id } = request.params;

        const postSchema = z.object({
            title: z.string().optional(),
            content: z.string().optional(),
            tags: z.string().optional(),
            isPublic: z.boolean().optional()
        });

        const dataPostUpdate = postSchema.parse(request.body);

        await prisma.post.update({where: {postId: id}, data: {...dataPostUpdate}}).catch(err => {
            throw new AppError("Erro! Contacte o programador.")
        });


        return response.status(200).json({
            status: 200,
            sucess: true,
            message: "Sucess"
        });
    }

    async updateCover(request: Request, response: Response){

        const { id } = request.params;

        if(!request.file) throw new AppError("Erro! Nenhum arquivo enviado");

        const postFind = await prisma.post.findUnique({where: {postId: id}, select: {postId: true, coverUrl: true}});

        if(!postFind) {  

            deleteFile(request.file.filename);
            throw new AppError("Não encontado!")
        }

        await prisma.post.update({
            
            where: { postId: id }, data: {coverUrl: request.file.filename}
        
        }).then(() => {
            deleteFile(postFind.coverUrl);
        })

        return response.status(200).json({
            status: 200,
            sucess: true,
            message: "Sucess"
        });
    }

    async findOne(request: Request, response: Response){

        const { id } = request.params;

        const postFinded = await prisma.post.findUnique({where: {postId: id}});

        if(!postFinded) throw new AppError("Não encontrado!", 200);

        return response.status(200).json({
            status:200,
            sucess: true,
            data: postFinded,
            message: 'sucess'
        })
    }

    async findAll(request: Request, response: Response){
      
        const { id } = request.params;

        const allPost = await prisma.post.findMany({where: {userId: id}}).catch(err => {
            throw new AppError("Falha! Contacte o programador!")
        })

        return response.status(200).json({
            status: 200,
            sucess: true,
            data: allPost
        })
    }

    async findTag(request: Request, response: Response){
      
        const tag = request.query.tag?.toString();

        if(!tag) throw new AppError("Contacte o programador");

        const tagGroup = tag?.split(',') || [''];
        let acumulator: Array<object> = [];


        for(let i = 0; i < tagGroup?.length; i++){
            acumulator.push({
                tags: {
                    startsWith: `%${tagGroup[i]}%`
                }
            })            
        }

        console.log(acumulator)

        const allPost = await prisma.post.findMany({
            where: {
                OR: acumulator
            }
            
        }).catch(err => {
            throw new AppError("Falha! Contacte o programador!")
        })

        return response.status(200).json({
            status: 200,
            sucess: true,
            data: allPost
        })
    }

    async delete(request: Request, response: Response){

        const SchemaPost = z.object({
            userId: z.string(),
            postId: z.string()
        }).safeParse(request.body)

        if(!SchemaPost.success) throw new AppError("Preencha corretamente");
        
        const deletingPost = await prisma.post.delete({
            where: {postId: SchemaPost.data.postId, userId: SchemaPost.data.userId}
        }).then(() => true).catch((e) => {
            throw new AppError("Contacte o programador");
        })


        return response.status(200).json({
            status: 200,
            sucess: deletingPost
        })
    }

    // CREATE AND DELETE REACT

    async createReact(request: Request, response: Response){

        const SchemaReactPost = z.object({
            userId: z.string(),
            postId: z.string()
        }).safeParse(request.body)

        if(!SchemaReactPost.success) throw new AppError("Preencha corretamente");

        const dataReact = SchemaReactPost.data;

        // Condição

        const findReactUser = await prisma.react.findMany({
            where: {
                userId:dataReact.userId,
                postId:dataReact.postId
            }
        }).then(async (e) => {
            
            if(e.length <= 0) {

                const reactCreated = await prisma.react.create({
                    data: {
                        userId:dataReact.userId,
                        postId:dataReact.postId
                    }
                })   

                return reactCreated;

            } else {
                throw new AppError("Exists", 200)
            }
        })

        if(findReactUser){

            return response.status(201).json({
                success: true
            })
        }
    }

    async deleteReact(request: Request, response: Response){
       
        const SchemaReactPost = z.object({
            userId: z.string(),
            postId: z.string()
        }).safeParse(request.body)

        if(!SchemaReactPost.success) throw new AppError("Preencha corretamente");

        const dataDelete = SchemaReactPost.data;

        const { count } = await prisma.react.deleteMany({
            where: {
                AND: [
                    {userId:dataDelete.userId},
                    {postId:dataDelete.postId}
                ]
            }
        })

        if(count <= 0) throw new AppError("Erro! Contacte o programador");
   
        return response.status(200).json({
            success: true,
            status: 200
        })
    }

    // CREATE AND DELETE FAVORITE OR SAVE POST

    async createFavorite(request: Request, response: Response){
       
        const SchemaReactPost = z.object({
            userId: z.string(),
            postId: z.string()
        }).safeParse(request.body)

        if(!SchemaReactPost.success) throw new AppError("Preencha corretamente");

        const dataCreateFavorite = SchemaReactPost.data;

        const ifFavoriteExist = await prisma.favorite.findMany({
            where: {
                AND: [
                    {userId:dataCreateFavorite.userId},
                    {postId:dataCreateFavorite.postId}
                ]
            }
        })

        if(ifFavoriteExist.length > 0) throw new AppError("Erro! Contacte o programador.");

        await prisma.favorite.create({
            data: {
                userId:dataCreateFavorite.userId,
                postId:dataCreateFavorite.postId
            }
        }).then(async (e) => {

            if(e) {
                return response.status(200).json({
                    success: true,
                    status: 200
                })
            }
            

        }).catch(err => {throw new AppError("Erro! Contacte o programador")});

    }

    async deleteFavorite(request: Request, response: Response){
       
        const SchemaReactPost = z.object({
            userId: z.string(),
            postId: z.string()
        }).safeParse(request.body)

        if(!SchemaReactPost.success) throw new AppError("Preencha corretamente");

        const dataDeleteFavorite = SchemaReactPost.data;

        const ifFavoriteExist = await prisma.favorite.findMany({
            where: {
                AND: [
                    {userId:dataDeleteFavorite.userId},
                    {postId:dataDeleteFavorite.postId}
                ]
            }
        })

        if(ifFavoriteExist.length < 0) throw new AppError("Erro! Contacte o programador.");

        await prisma.favorite.deleteMany({
            where: {
                AND: [
                    {userId:dataDeleteFavorite.userId},
                    {postId:dataDeleteFavorite.postId}
                ]
            }
        }).then(async (e) => {

            if(e.count > 0) {
                return response.status(200).json({
                    success: true,
                    status: 200
                })
            }

            throw new AppError("Erro! Contacte o programador");

        }).catch(err => {throw new AppError("Erro! Contacte o programador")});

    }
    
}


export default new Post();