import { Router } from "express"
import { UserRoutes } from "../modules/user/user.route";
import { TourRoutes } from "../modules/tour/tour.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { WishlistRoutes } from "../modules/wishlist/wishlist.route";
import { PostedTourRoutes } from "../modules/tour/posted-tour.route";


export const router = Router();


const moduleRoute= [
    {
        path:"/user",
        route :UserRoutes
    },
    {
        path:"/tours",
        route:TourRoutes
    },
    {
        path:"/bookings",
        route:BookingRoutes
    },
    {
        path:"/wishlist",
        route:WishlistRoutes
    },
    {
        path:"/posted-tours",
        route:PostedTourRoutes
    }
]

moduleRoute.forEach((route)=>{
    router.use(route.path, route.route)
})