import { NextFunction, Request, Response } from "express";
import { User } from "./user.model";
import httpStatus from "http-status-codes"
import { createUserServices } from "./user.service";

const createUser = async(req:Request,res:Response, next:NextFunction)=>{
      try {
           
        const user = await createUserServices.createUser(req.body)
        res.status(httpStatus.CREATED).json({
            message :"User created Successfully!",
            user
        })
        
      } catch (error:any) {
        console.log(error);
        next(error)
       
      }

}


export const UserControllers = {
    createUser
}