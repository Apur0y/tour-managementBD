import { Router } from "express"
import { UserRoutes } from "../modules/user/user.route";
import { TourRoutes } from "../modules/tour/tour.route";


export const router = Router();


const moduleRoute= [
    {
        path:"/user",
        route :UserRoutes
    },
    {
        path:"/tours",
        route:TourRoutes
    }
]

moduleRoute.forEach((route)=>{
    router.use(route.path, route.route)
})