import {  Types } from "mongoose";

export interface ITour {
slug: string;
title: string;
description: string;
images: string[];
location: string;
costFrom: number;
startDate: Date;
endDate: Date;
tourType: Types.ObjectId;
included: Included[];
excluded: Excluded[];
amenities: string[];
tourPlan: string[];
}

// enum TourType {
//     ADVENTURE = "Adventure",
//     CULTURAL = "Cultural",
//     RELAXATION = "Relaxation",
//     EDUCATIONAL = "Educational",
//     NATURE = "Nature",
//     CUSTOM = "Custom"
// }

export enum Included{
    MEALS = "Meals",
    TRANSPORT = "Transport",
    ACCOMMODATION = "Accommodation",
    GUIDED_TOURS = "Guided Tours",
    ACTIVITIES = "Activities",
    INSURANCE = "Insurance"
}

export enum Excluded {
    FLIGHTS = "Flights",
    PERSONAL_EXPENSES = "Personal Expenses",
    TIPS = "Tips",
    OPTIONAL_ACTIVITIES = "Optional Activities"
}