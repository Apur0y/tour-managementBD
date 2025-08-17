import { NextFunction, Request, Response } from "express";
import { AppError } from "../errorHelpers/AppError";
import { ZodError } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources = [
    {
      path: "",
      message: "Something went wrong!",
    },
  ];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => ({
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    }));
  } else if (err?.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errorSources = Object.values(err.errors).map((val: any) => ({
      path: val?.path,
      message: val?.message,
    }));
  } else if (err?.code === 11000) {
    statusCode = 400;
    message = "Duplicate Entry";
    const match = err.message.match(/"([^"]*)"/);  
    const extractedMessage = match && match[1];
    errorSources = [
      {
        path: "",
        message: `${extractedMessage} already exists`,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack: process.env.NODE_ENV === "development" ? err?.stack : null,
  });
};
