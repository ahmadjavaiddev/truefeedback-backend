import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cokkiesOptions } from "../constants.js";

const generateAccessAndRefereshTokens = async (userId) => {
     try {
          const user = await User.findById(userId);
          const accessToken = user.generateAccessToken();
          const refreshToken = user.generateRefreshToken();

          user.refreshToken = refreshToken;
          await user.save({ validateBeforeSave: false });

          return { accessToken, refreshToken };
     } catch (error) {
          throw new ApiError(
               500,
               "Something went wrong while generating referesh and access token"
          );
     }
};

const register = asyncHandler(async (req, res) => {
     const { username, email, password } = req.body;
     if (!username || !email || !password) {
          throw new ApiError(400, "Please fill in all fields");
     }

     const userExists = await User.findOne({ email });
     if (userExists) {
          throw new ApiError(401, "User already exists");
     }

     const user = await User.create({
          username: username,
          email: email,
          password: password,
     });
     if (!user) {
          throw new ApiError(400, "Invalid user data");
     }

     return res
          .status(201)
          .json(new ApiResponse(201, user, "User registered successfully"));
});

const login = asyncHandler(async (req, res) => {
     const { emailOrUsername, password } = req.body;
     if (!emailOrUsername || !password) {
          throw new ApiError(401, "Please Fill all fields!");
     }

     const user = await User.findOne({
          $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
     });
     if (!user) {
          throw new ApiError(401, "User Not Found!");
     }

     const isPasswordValid = await user.isPasswordCorrect(password);
     if (!isPasswordValid) {
          throw new ApiError(401, "Invalid Credentials!");
     }

     const { accessToken, refreshToken } =
          await generateAccessAndRefereshTokens(user._id);

     const loginUser = await User.findById(user._id).select(
          "-password -refreshToken"
     );

     return (
          res
               .status(200)
               // .cookie("accessToken", accessToken, cokkiesOptions)
               // .cookie("refreshToken", refreshToken, cokkiesOptions)
               .json(
                    new ApiResponse(
                         200,
                         {
                              user: loginUser,
                              accessToken: accessToken,
                              refreshToken: refreshToken,
                         },
                         "User Login SuccessFully."
                    )
               )
     );
});

const search = asyncHandler(async (req, res) => {
     const { value } = req.body;
     if (!value) {
          throw new ApiError(400, "Please provide a value");
     }

     const users = await User.find({
          username: { $regex: value, $options: "i" },
     });
     return res
          .status(200)
          .json(new ApiResponse(200, users, "User Search Successful"));
});

const getRandomUsers = asyncHandler(async (req, res) => {
     const users = await User.find({});

     const shuffledUsers = users.sort(() => Math.random() - 0.5);
     const randomUsers = shuffledUsers.slice(0, 6);

     return res
          .status(200)
          .json(new ApiResponse(200, randomUsers, "Random Users"));
});

export { register, login, search, getRandomUsers };
