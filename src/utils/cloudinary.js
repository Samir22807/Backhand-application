import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadToCloudinary = async (filePath) => {
    try {
        // Fix: config ko function ke andar move kiya
        // Ab jab function call hoga, tab tak dotenv load ho chuka hoga
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        if (!filePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });

        console.log("File uploaded on cloudinary successfully", response.url);
        
        fs.unlinkSync(filePath);
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error Details:", error);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return null;
    }
};

export { uploadToCloudinary };