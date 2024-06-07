import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessToken = async (userId) => {
     try {
          const user = await User.findById(userId);
          const accessToken = user.generateAccessToken();
          console.log(accessToken);

          return { accessToken };
     } catch (error) {
          throw new ApiError(
               500,
               "Something went wrong while generating access token"
          );
     }
};

const register = asyncHandler(async (req, res) => {
     const { username, email, password } = req.body;
     if (!username || !email || !password) {
          return res
               .status(401)
               .json(new ApiError(401, "Please fill in all fields"));
     }

     const userExists = await User.findOne({ email });
     if (userExists) {
          return res.status(401).json(new ApiError(401, "User already exists"));
     }

     const user = await User.create({
          username: username,
          email: email,
          password: password,
     });
     if (!user) {
          return res
               .status(400)
               .json(new ApiError(400, "Internal Server Error"));
     }

     return res
          .status(201)
          .json(
               new ApiResponse(
                    201,
                    { user: user, success: true },
                    "User registered successfully"
               )
          );
});

const login = asyncHandler(async (req, res) => {
     const { emailOrUsername, password } = req.body;
     if (!emailOrUsername || !password) {
          return res
               .status(401)
               .json(new ApiError(401, "Please Fill all fields!"));
     }

     const user = await User.findOne({
          $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
     });
     if (!user) {
          return res.status(401).json(new ApiError(401, "User Not Found!"));
     }

     const isPasswordValid = await user.isPasswordCorrect(password);
     if (!isPasswordValid) {
          return res
               .status(200)
               .json(new ApiError(401, "Invalid Credentials!"));
     }

     const { accessToken } = await generateAccessToken(user._id);

     const loginUser = await User.findById(user._id).select(
          "-password -verificationCode -verificationCodeExpiry -acceptMessages -createdAt -updatedAt"
     );

     const options = {
          httpOnly: true,
          secure: true,
     };

     return res
          .cookie("accessToken", accessToken, options)
          .status(200)
          .json(
               new ApiResponse(
                    200,
                    {
                         user: loginUser,
                         accessToken: accessToken,
                    },
                    "User Login SuccessFully."
               )
          );
});

const search = asyncHandler(async (req, res) => {
     const { value } = req.body;
     if (!value) {
          return res
               .status(401)
               .json(new ApiError(400, "Please provide a value"));
     }

     const users = await User.find({
          username: { $regex: value, $options: "i" },
     }).select(
          "-password -verificationCode -verificationCodeExpiry -verified -acceptMessages -createdAt -updatedAt"
     );
     return res
          .status(200)
          .json(new ApiResponse(200, users, "Users Fetch Successfully"));
});

const getRandomUsers = asyncHandler(async (req, res) => {
     const users = await User.find().select(
          "-password -verificationCode -verificationCodeExpiry -verified -acceptMessages -createdAt -updatedAt"
     );

     const shuffledUsers = users.sort(() => Math.random() - 0.5);
     const randomUsers = shuffledUsers.slice(0, 6);

     return res
          .status(200)
          .json(new ApiResponse(200, randomUsers, "Random Users"));
});

export {
     register,
     login,
     search,
     getRandomUsers,
};
