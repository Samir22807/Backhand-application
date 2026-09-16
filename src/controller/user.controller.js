import { asyncHandler } from "../utils/asynchandaler.js";
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/apirespons.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const registeruser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // 1. Comprehensive validation
    if ([fullName, email, username, password].some((field) => !field || field.trim() === "")) {
        throw new Apierror(400, "All fields are required");
    }

    // 2. Check existing user
    const existeduser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existeduser) {
        throw new Apierror(409, "User with email or username already exists");
    }

    // 3. Extract file paths safely
    const avtarpath = req.files?.avatar?.[0]?.path;
    const coverimagepath = req.files?.coverImage?.[0]?.path;

    if (!avtarpath) {
        throw new Apierror(400, "Avatar is mandatory");
    }

    // 4. Upload to Cloudinary
    const avatar = await uploadToCloudinary(avtarpath);
    let coverimage = null;

    if (coverimagepath) {
        coverimage = await uploadToCloudinary(coverimagepath);
    }

    if (!avatar) {
        throw new Apierror(500, "Failed to upload avatar to cloud storage");
    }

    // 5. Create user record
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // 6. Return sanitised user object
    const createduser = await User.findById(user._id).select("-password -refreshToken");

    if (!createduser) {
        throw new Apierror(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new Apiresponse(201, createduser, "User created successfully")
    );
});

export { registeruser };