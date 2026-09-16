import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            return null;
        }
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });
        console.log("File uploaded on cloudinary successfully", response.url);
        
        // Upload hone ke baad local temp file ko delete karna best practice hai
        fs.unlinkSync(filePath);
        return response;
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return null;
    }
};

export { uploadToCloudinary };