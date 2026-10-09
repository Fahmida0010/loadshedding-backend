import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Cloudinary config (apnar .env theke values nibe)
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage setup
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "loadshedding_uploads", // Cloudinary-te je folder-e image save hobe
		allowed_formats: ["jpg", "png", "jpeg", "webp"],
	} as any,
});

const cloudinaryUpload = multer({ storage: storage });

export default cloudinaryUpload;
