// middleware/upload.ts
//multer memory storage with constraints: 2mb/file, max 8 filesl
//>Accepts only image/jpeg,imag/png,image/webp
import multer from 'multer';
import { AppError } from './error';
const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_MB || 2);
const MAX_FILES = Number(process.env.MAX_IMAGES_PER_LISTING || 8);


const storage = multer.memoryStorage();
export const uploadPhotos = multer({
    storage,
    limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024, files: MAX_FILES },
    fileFilter: (_req, file, cb) => {
        const isAccepted = /^(image\/jpeg|image\/png|image\/webp)$/i.test(file.mimetype);
        if (isAccepted) {
            if (err) {
                return cb(err); // Error overload
            }
            return cb(null, true); // success overload
        }
        return cb(new AppError('Only JPEG, PNG, and WebP images are allowed.', 400));
    }
}).array('photos', MAX_FILES);