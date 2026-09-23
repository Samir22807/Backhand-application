import { asyncHandler } from "../utils/asynchandaler.js";
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apirespons.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// Helper function: Tokens generate karne ke liye
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Apierror(500, "Something went wrong while generating tokens");
    }
};

// 1. Register User Controller
const registeruser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Validation
    if ([fullName, email, username, password].some((field) => !field || field.trim() === "")) {
        throw new Apierror(400, "All fields are required");
    }

    // Check existing user
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new Apierror(409, "User with email or username already exists");
    }

    // Extract file paths safely
    const avatarPath = req.files?.avatar?.[0]?.path;
    const coverImagePath = req.files?.coverImage?.[0]?.path;

    if (!avatarPath) {
        throw new Apierror(400, "Avatar is mandatory");
    }

    // Upload to Cloudinary
    const avatar = await uploadToCloudinary(avatarPath);
    let coverImage = null;

    if (coverImagePath) {
        coverImage = await uploadToCloudinary(coverImagePath);
    }

    if (!avatar) {
        throw new Apierror(500, "Failed to upload avatar to cloud storage");
    }

    // Create user record
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new Apierror(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new Apiresponse(201, createdUser, "User created successfully")
    );
});

// 2. Login User Controller
const loginuser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!password || (!username && !email)) {
        throw new Apierror(400, "Username/email and password are required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new Apierror(404, "User does not exist");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new Apierror(401, "Invalid user credentials");
    }

    // Generating and destructuring tokens (consistent naming)
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new Apiresponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

// 3. Logout User Controller
const logoutuser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new Apiresponse(200, {}, "User logged out successfully"));
});

const refreshaccesstoken = asyncHandler(async (req, res) => {
    const incomingrefreahtoken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingrefreahtoken) {
        throw new Apierror(401, "unauthorized request")
    }
    try {

        const decodedtoken = jwt.verify(incomingrefreahtoken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedtoken?._id)

        if (!user) {
            throw new Apierror(401, "invalid refresh token")
        }

        if (incomingrefreahtoken !== user?.refreshToken) {
            throw new Apierror(401, "refreshtoken is expire or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
            .clearCookie("accessToken", accessToken, options)
            .clearCookie("refreshToken", newrefreshToken, options)
            .json(new Apiresponse(
                200,
                { accessToken, refreshToken: newrefreshToken },
                "Access token refreshed"
            ))

    } catch (error) {
        throw new Apierror(401, error?.message || "invalid refresh token")
    }




})



export { registeruser, loginuser, logoutuser, refreshaccesstoken };