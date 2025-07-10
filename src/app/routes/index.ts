import { Router } from "express"
import { UserRoutes } from "../modules/user/user.route";


export const router = Router();


const moduleRoute= [
    {
        path:"/user",
        route :UserRoutes
    }
]

moduleRoute.forEach((route)=>{
    router.use(route.path, route.route)
})