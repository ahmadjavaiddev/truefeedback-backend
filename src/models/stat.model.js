import mongoose, { Schema } from "mongoose";

const ApistatSchema = new Schema(
     {
          requested: {
               type: Number,
               default: 0,
          },
     },
     {
          timestamps: true,
     }
);

export const Apistat = mongoose.model("Apistat", ApistatSchema);
