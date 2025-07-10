
import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import { UserRoutes } from "./app/modules/user/user.route";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";



export const app=express();
app.use(express.json());
app.use(cors())

app.use("/api/v1",router)


app.get("/", (req: Request, res: Response) => {
        res.status(200).json({
             message: "Welcome to tour"
        })
    }) 


  app.use(globalErrorHandler)