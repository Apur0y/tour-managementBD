// import { Router } from "express";
// import { UserControllers } from "./user.controler";

import { Router } from "express";
import { TourControllers } from "./tour.controler";
import validateRequest from "../../middlewares/validateRequest";
import { tourValidation } from "./tour.validation";

// const router = Router();


// router.post("/register",UserControllers.createUser);

// export const UserRoutes = router;



const router=Router();


router.post("/create",validateRequest(tourValidation.createTourZodSchema), TourControllers.createTour)
router.get("/alltours",TourControllers.getTour)
router.patch("/update/:id",TourControllers.updateTour)
router.delete("/delete/:id",TourControllers.deleteTour)
router.get("/:id",TourControllers.getSingleTour)

export const TourRoutes =router;