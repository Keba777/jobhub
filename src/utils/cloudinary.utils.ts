import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".pdf" && ext !== ".docx") {
            return cb(new Error("Only pdf and docx allowed"));
        }
        cb(null, true);
    },
});

const uploadToCloudinary = async (file: Express.Multer.File) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "raw" },
            (error, result) => {
                if (error) reject(error);
                resolve(result?.secure_url);
            }
        );
        uploadStream.end(file.buffer);
    });
};

export { upload, uploadToCloudinary };