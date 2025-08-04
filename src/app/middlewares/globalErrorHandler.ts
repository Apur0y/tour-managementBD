import { NextFunction, Request, Response } from "express"

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const globalErrorHandler = (err:any, req:Request, res:Response, next:NextFunction)=>{

     res.status(500).json({
          success : false,
          message : "Something Went Wrong from global",
          err,
          stack:err.stack
     })
}