import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
     try {
          const token =
               (await req.cookies?.accessToken) ||
               (await req.header("Authorization")?.replace("Bearer ", ""));
          // console.log("token ::", token);
          if (!token) {
               return res
                    .status(401)
                    .json(new ApiError(401, "Unauthorized request"));
          }

          const decodedToken = jwt.verify(
               token,
               process.env.ACCESS_TOKEN_SECRET
          );
          // console.log("decodedToken ::", decodedToken);

          const user = await User.findById(decodedToken?._id).select(
               "-password"
          );

          if (!user) {
               return res
                    .status(401)
                    .json(new ApiError(401, "Invalid Access Token"));
          }
          // console.log("user ::", user);

          req.user = user;
          next();
     } catch (error) {
          return res
               .status(401)
               .json(
                    new ApiError(401, error?.message || "Invalid access token")
               );
     }
});
