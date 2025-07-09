import { Router } from "express";
import { UserControllers } from "./user.controler";

const router = Router();


router.post("/register",UserControllers.createUser);

export const UserRoutes = router;