import { NextFunction, Request, Response } from "express"

export const globalErrorHandler = (err:any, req:Request, res:Response, next:NextFunction)=>{

     res.status(500).json({
          success : false,
          message : "Something Went Wrong from global",
          err,
          stack:err.stack
     })
}