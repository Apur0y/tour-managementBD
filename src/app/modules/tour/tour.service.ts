import { ITour } from "./tour.interface";
import { TourModel } from "./tour.model";


const createTour = async(payload:Partial<ITour>)=>{
  const tour = await TourModel.create(payload);
  return tour;
}

const getTour=async()=>{
  const tour=await TourModel.find();
  return tour;
}

export const createTourService= {
    createTour,getTour
}