import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import AppError from "./errors/AppError";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function authUser(request: Request, response: Response, next: NextFunction){

    const [, token] = request.headers["authorization"]?.split(" ") || [];

    try {

        const decoded = jwt.verify(token, process.env.SECRET_KEY?.toString() || "");

        const data = decoded || null;

        const verifyIfThisTokenIsValid = await prisma.logout.findMany({where: {invalidToken: token}})

        if(verifyIfThisTokenIsValid.length > 0) throw new AppError("Acesso negado!", 401);

        if(data != null && typeof data  != "string"){

            request.user = {
                name: data.name,
                id: data.sub || "",
                avatarUrl: data.avatarUrl
            }

            next()
        }

    } catch (error) {
        throw new AppError("Não autorizado!", 401);
    }
}

export {
    authUser
}