
import express, { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
// import { UserRoutes } from "./app/modules/user/user.route";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";



export const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true, // Allow all origins for development, restrict in production
  credentials: true // Allow cookies to be sent
}))

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

app.use("/api/v1",router)


app.get("/", (req: Request, res: Response) => {
        res.status(200).json({
             message: "Welcome to tour"
        })
    }) 


  app.use(globalErrorHandler)