// import 'dotenv/config';
import { Request, Response } from "express";
import { z } from "zod";
import AppError from "../middlewares/errors/AppError";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

class Session {


    async login(request: Request, response: Response){

        const credentialsSchema = z.object({
            email: z.string().email(),
            password: z.string()
        }).safeParse(request.body)

        
        if(!credentialsSchema.success) throw new AppError("Email ou senha incorreta. Tente novamente.", 422);
        
        const credentials = credentialsSchema.data;

        const findUser = await prisma.user.findUnique({
            where: {email: credentials.email}
        }).then(async (e) => {

            if(!e) throw new AppError("Email ou senha incorreta. Tente novamente.", 422);

            const hashPassword = e.password;

            const comparePassword = await bcrypt.compare(credentials.password, hashPassword);

            if(!comparePassword) throw new AppError("Email ou senha incorreta. Tente novamente.", 422);

            return {
                id: e.userId,
                name: e.name,
                avatarUrl: e.avatarUrl
            }
        })

        const jwtKey: string = process.env.SECRET_KEY || "";

        const generateToken = jwt.sign(
            
            {
                name: findUser.name,
                avatarUrl: findUser.avatarUrl
            }, 
            
            jwtKey, 
            
            {    
                expiresIn: '1h',
                subject: findUser.id
                
            });

        return response.status(200).json({
            id: findUser.id,
            token: generateToken
        });

    }


    async logout(request: Request, response: Response){

        const [, token] = request.headers["authorization"]?.split(" ") || [];

        try {

            const decoded = jwt.verify(token, process.env.SECRET_KEY?.toString() || "");

            const data = decoded || null;

            if(data != null && typeof data  != "string"){

                request.user = {
                    name: data.name,
                    id: data.sub || "",
                    avatarUrl: data.avatarUrl
                }

                await prisma.logout.create({data: {invalidToken: token}}).then(() => {

                    return response.status(201).json({
                        status: 200,
                        success: true,
                        message: "OK"
                    })

                })
            }

        } catch (error) {
            
            return response.status(200).json({
                status: 200,
                success: true,
                message: "OK"
            })
        } 
    }
}

export default new Session();