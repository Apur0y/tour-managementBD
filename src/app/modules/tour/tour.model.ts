import { model, Schema } from "mongoose";
import { Excluded, Included, ITour } from "./tour.interface";

const tourSchema = new Schema<ITour>({
    slug:{type:String, required:true},
    title:{type:String, required:true},
    description:{type:String, required:true},
    images:{type:[String]},
    location:{type:String, required:true},
    costFrom:{type:Number,required:true},
    startDate:{type:Date,required:true},
    endDate:{type:Date,required:true},
    tourType:{type:Schema.Types.ObjectId, ref: 'TourType',required:true},
    included:{type:[String],enum:Object.values(Included)},
    excluded:{type:[String],enum:Object.values(Excluded)},
     amenities: { type: [String], default: [] },
  tourPlan: { type: [String], default: [] },

})

export const TourModel = model<ITour>('tours',tourSchema)