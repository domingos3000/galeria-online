import {Request, Response} from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import AppError from '../middlewares/errors/AppError';
import bcrypt from 'bcryptjs';
import deleteFile from '../services/deleteFiles';


const prisma = new PrismaClient();


class User {


    async create(request: Request, response: Response) {
        
        const zodUserCreate = z.object({
            name: z.string(),
            username:  z.string()
                        .trim()
                        .toLowerCase()
                        .transform((username)=>`@${username.split(" ").join("")}`),

            email: z.string().email(),
            password: z.string(),
        })

        const userData = zodUserCreate.safeParse(request.body);

        if(!userData.success) throw new AppError("Preencha corretamente os dados! Para mais informações contacte o desenvolvedor.");
        
        const passwordHashed = await bcrypt.hash(userData.data.password, 8);

        const userCreated = await prisma.user.create({
            data: {...userData.data, password: passwordHashed}
        }).catch(err => {
            // P2002: Erro do prisma. Registo existente.
            if(err.code = 'P2002') throw new AppError(`Este usuário (${err.meta.target.join(' ')}) já existe!`);
        })

        if(!userCreated) return false;

        return response.status(201).json([{
            status: 201,
            sucess: true,

            user: {
                userId: userCreated.userId,
                name: userCreated.name,
                username: userCreated.username,
                email: userCreated.email,
                createdAt: userCreated.createdAt,
            }
        }])
    }

    async updateIdentity(request: Request, response: Response) {

        
        const { id } = z.object({id: z.string()}).parse(request.params);

        const zodUserUpdate = z.object({
            name: z.string().optional(),
            address: z.string().optional(),
            birth:z.string().optional(),
        })

        const {name, address, birth} = zodUserUpdate.parse(request.body);

        const userUpdate = await prisma.user.update({
            where: {
                userId: id
            },

            data: {
                name,
                address, 
                birth
            }
        })

        return response.status(200).json({
            status: 200,
            sucess: true,
            message: "Sucess"
        }) 
    }

    async updatePassword(request: Request, response: Response){
        
        const { id } = request.params;
        
        const passwords = z.object({
            oldPassword: z.string(),
            newPassword: z.string()
        }).safeParse(request.body)

        if(!passwords.success) throw new AppError("Preencha corretamente os dados!");

        const findUser = await prisma.user.findUnique({
            where: { userId: id },
            select: { password: true},
        });

        if(!findUser) throw new AppError("Usuário não encontrado!");

        const passwordCompare = await bcrypt.compare(passwords.data.oldPassword, findUser.password);

        if(!passwordCompare) throw new AppError("Senha antiga incorreta. Tente novamente mais tarde!");

        const newPasswordHashed = await bcrypt.hash(passwords.data.newPassword, 8);

        await prisma.user.update({
            where: {userId: id},
            data: {password: newPasswordHashed}
        });

        return response.status(201).json({
            status: 201,
            sucess: true,
            message: "Sucess"
        });
    }

    async updateEmail(request: Request, response: Response){
        
        const { id } = request.params;
        
        const emailSchema = z.object({
            email: z.string().email()
        }).safeParse(request.body)

        if(!emailSchema.success) throw new AppError("Email incorreto!");

        const email = emailSchema.data.email;

        const findUser = await prisma.user.findUnique({
            where: { userId: id },
            select: { username: true, email: true},
        });

        if(!findUser) throw new AppError("Usuário não encontrado!");

        await prisma.user.update({
            where: {userId: id},
            data: {email}
        });

        return response.status(201).json({
            status: 201,
            sucess: true,
            message: "Sucess"
        });
    }

    async updateAvatar(request: Request, response: Response){

        const { id } = request.params;

        if(!request.file) throw new AppError("Erro! Nenhum arquivo enviado");

        const userFind = await prisma.user.findUnique({where: {userId: id}, select: {username: true, avatarUrl: true}});

        if(!userFind) {  

            await deleteFile(request.file.filename);

            throw new AppError("Não encontado!")
        }

        const userUpdate = await prisma.user.update({
            
            where: { userId: id }, data: {avatarUrl: request.file.filename}
        
        }).then(async (e) => {
            await deleteFile(userFind.avatarUrl);

            return response.status(200).json({
                status: 200,
                sucess: true,
                message: "Sucess"
            });
        }) 
    }

    async followUser(request: Request, response: Response){

        const SchemaFollowUser = z.object({
            userFollowId: z.string(),
            userFollowedId: z.string()
        }).safeParse(request.body)

        if(!SchemaFollowUser.success) throw new AppError("Preencha corretamente");

        const dataFollowing = SchemaFollowUser.data;

        const findFollowUser = await prisma.follow.findMany({
           
            where: {
                userFollowId:dataFollowing.userFollowId,
                userFollowedId:dataFollowing.userFollowedId
            }

        }).then(async (e) => {

            if(e.length > 0) throw new AppError("Já segues este usuário", 400);
            
            const followCreated = await prisma.follow.create({
                data: {
                    userFollowId: dataFollowing.userFollowId,
                    userFollowedId: dataFollowing.userFollowedId
                }
            });

            return followCreated;

        })

        if(findFollowUser){

            return response.status(201).json({
                success: true,
                status: 201
            })
        }

    }
    
    async unfollowUser(request: Request, response: Response){

        const SchemaFollowUser = z.object({
            userFollowId: z.string(),
            userFollowedId: z.string()
        }).safeParse(request.body)

        if(!SchemaFollowUser.success) throw new AppError("Preencha corretamente");

        const dataFollowing = SchemaFollowUser.data;

        const findFollowUser = await prisma.follow.deleteMany({
           
            where: {
                AND: [
                    {userFollowId:dataFollowing.userFollowId},
                    {userFollowedId:dataFollowing.userFollowedId}
                ]
            }

        }).then(async (e) => {

            if(e.count <= 0) throw new AppError("Contacte o programador.", 400);

            return response.status(200).json({
                success: true,
                status: 200
            })

        })

    }
    
}

export default new User();