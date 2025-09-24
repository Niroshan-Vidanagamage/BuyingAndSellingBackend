// middleware/upload.ts
//multer memory storage with constraints: 2mb/file, max 8 filesl
//>Accepts only image/jpeg,imag/png,image/webp
import multer from 'multer';
const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_MB || 2);
const MAX_FILES = Number(process.env.MAX_IMAGES_PER_LISTING || 8);


const storage = multer.memoryStorage();
export const uploadPhotos = multer({
    storage,
    limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024, files: MAX_FILES },
    fileFilter: (_req, file, cb) => {
        const ok = /^(image\/jpeg|image\/png|image\/webp)$/i.test(file.mimetype);
        cb(ok ? null : new Error('Only JPEG/PNG/WebP allowed'), ok);
    }
}).array('photos', MAX_FILES);