import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";

import { createTourService } from "./tour.service";

const createTour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tour = await createTourService.createTour(req.body);
    res.status(httpStatus.CREATED).json({
      message: "Tour Post Succesfully",
      tour,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getTour = async (req: Request, res: Response) => {
  try {
    const result =await createTourService.getTour();
    res.status(httpStatus.OK).json({
      success: true,
      message: "Tours retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get tours",
      error: (error as Error).message,
    });
  }
};


const updateTour=async(req: Request, res: Response)=>{
  try {
    const id=req.params.id;
    const payload=req.body;
    const result= await createTourService.updateTour(id,payload);
      res.status(httpStatus.OK).json({
      success: true,
      message: "Tours updated successfully",
      data: result,
    });
  } catch (error) {
      res.status(500).json({
      success: false,
      message: "Failed to get tours",
      error: (error as Error).message,
    });
  }
}

const deleteTour=async(req:Request,res:Response)=>{
  const id=req.params.id;
  const result = await createTourService.deleteTour(id);
  res.status(httpStatus.OK).json({
    success:true,
    message: "Tour Deleted successfully",
    data:result
  })
}

const getSingleTour=async(req:Request,res:Response)=>{
  try {
    const id=req.params.id;
    const result = await createTourService.getSingleTours(id);
    res.status(httpStatus.OK).json({
      success:true,
      message: "Tour Retrieved successfully",
      data:result
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get tour",
      error: (error as Error).message,
    });
  }
}


export const TourControllers = {
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getSingleTour
};
