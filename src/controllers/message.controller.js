import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Apistat } from "../models/stat.model.js";
import OpenAI from "openai";

const createMessage = asyncHandler(async (req, res) => {
     const { content, username } = req.body;
     if ((!content, !username)) {
          throw new ApiError(400, "content and username is Required!");
     }

     const user = await User.findOne({ username: username });

     const message = await Message.create({
          content: content,
          messageTo: user?._id,
     });
     if (!message) {
          throw new ApiError(400, "Error while Added Message!");
     }

     return res
          .status(201)
          .json(new ApiResponse(201, message, "Message Added Successfully!"));
});

const getMessages = asyncHandler(async (req, res) => {
     const userId = req.user._id;

     const messages = await Message.find({ messageTo: userId });
     messages.reverse();

     if (!messages) {
          throw new ApiError(404, "No Messages Found!");
     }

     return res
          .status(200)
          .json(new ApiResponse(200, messages, "Messages Found Successfully!"));
});

const deleteMessage = asyncHandler(async (req, res) => {
     const { messageId } = req.params;

     const message = await Message.findByIdAndDelete(messageId);
     if (!message) {
          throw new ApiError(
               400,
               "Message Not Found OR Error while deleting Message!"
          );
     }

     return res
          .status(200)
          .json(new ApiResponse(200, message, "Message Deleted SuccessFully!"));
});

const getAcceptMessageStatus = asyncHandler(async (req, res) => {
     const userId = req.user._id;
     const user = await User.findById(userId);

     if (!user) {
          throw new ApiError(400, "User Not Found!");
     }

     const status = user.acceptMessages;
     return res
          .status(200)
          .json(
               new ApiResponse(
                    200,
                    status,
                    "Message Status fetched successfully!"
               )
          );
});

const acceptMessage = asyncHandler(async (req, res) => {
     const userId = req.user._id;
    
     const user = await User.findById(userId);
     user.acceptMessages = !user.acceptMessages;
     await user.save({ validateBeforeSave: false });

     if (!user) {
          throw new ApiError(
               400,
               "user Not Found OR Error while Updating accepting Message!"
          );
     }

     return res
          .status(200)
          .json(
               new ApiResponse(
                    200,
                    user.acceptMessages,
                    "Message Status Updated SuccessFully!"
               )
          );
});

const getMessageStatus = asyncHandler(async (req, res) => {
     const { username } = req.params;

     const user = await User.findOne({ username });
     if (!user) {
          throw new ApiError(400, "user Not Found!");
     }

     return res
          .status(200)
          .json(
               new ApiResponse(
                    200,
                    user.acceptMessages,
                    "Message Status fetched successfully!"
               )
          );
});

const generateMessages = asyncHandler(async (req, res) => {
     const ApiStatId = "6615852f16213bb97dedf12c";
     const apistat = await Apistat.findByIdAndUpdate(
          ApiStatId,
          { $inc: { requested: 1 } },
          { new: true }
     );

     const openai = new OpenAI();
     const completions = await openai.chat.completions.create({
          temperature: 0.7,
          n: 3,
          messages: [
               { role: "system", content: "Suggest a Question for the user" },
          ],
          model: "gpt-3.5-turbo",
     });
     const messages = completions.choices.map((choice) => choice.message);

     return res
          .status(200)
          .json(new ApiResponse(200, messages, "Suggested Messages"));
});

export {
     createMessage,
     getMessages,
     deleteMessage,
     acceptMessage,
     getAcceptMessageStatus,
     getMessageStatus,
     generateMessages,
};
