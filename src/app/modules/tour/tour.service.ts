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

const updateTour=async(id:string,payload:Partial<ITour>)=>{
      const update=await TourModel.findByIdAndUpdate(id,payload,{new:true})
      return update;
}

const deleteTour=async(id:string)=>{
  const deleteTour=await TourModel.findByIdAndDelete(id);
  return deleteTour;
}

export const createTourService= {
    createTour,getTour,updateTour,deleteTour
}