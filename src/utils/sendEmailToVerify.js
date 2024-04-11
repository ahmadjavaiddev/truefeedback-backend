import { Resend } from "resend";
import { ApiError } from "./ApiError.js";
import { User } from "../models/user.model.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailToVerify = async (email) => {
     if (!email) {
          throw new ApiError(400, "Please provide an email!");
     }

     let otp = "";
     for (let i = 0; i < 6; i++) {
          otp += Math.floor(Math.random() * 10);
     }

     const user = await User.findOne({ email });
     if (!user) {
          throw new ApiError(400, "User Not Found!");
     }

     user.verificationCode = otp;
     user.verificationCodeExpiry = Date.now() + 3600000;
     await user.save({ validateBeforeSave: false });

     const emailData = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: email,
          subject: "Hello World",
          html: `<div>
          <p>Your Code is :: ${otp} <br/> Please use this code to login</p>
          <a href="${process.env.WEBSITE_URL}/verify/${otp}/${email}">Click Here To Verify Your Email</a>
          <p>Or copy this link and paste it in your browser ${process.env.WEBSITE_URL}/verify/${otp}/${email}</p>
          </div>`,
     });

     return emailData;
};
