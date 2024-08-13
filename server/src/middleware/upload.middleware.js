const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/flac',
            'audio/aac',
            'audio/webm',
            'audio/x-m4a',
            'audio/mp4'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 }
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 10 }
]);
const handleFilesProcessing = async (req, res, next) => {
    if (!req.files || !req.files.image || !req.files.audio) {
        return res.status(400).send('Image and audio files are required.');
    }

    try {
        if (req.files.image) {
            const imageFile = req.files.image[0];
            const imageBuffer = imageFile.buffer;
            const maxWidth = 800;
            const maxHeight = 600;

            const filePathImage = path.join('uploads/temp', `${Date.now()}${path.extname(imageFile.originalname)}`);

            await sharp(imageBuffer)
                .resize({ width: maxWidth, height: maxHeight, fit: 'inside' })
                .jpeg({ quality: 70 })
                .toFile(filePathImage);

            req.files.image[0].path = filePathImage;
        }

        if (req.files.audio) {
            for (const audioFile of req.files.audio) {
                const filePathAudio = path.join('uploads/temp', Date.now() + path.extname(audioFile.originalname));
                await writeFile(filePathAudio, audioFile.buffer);
                audioFile.path = filePathAudio;
            }
        }

    } catch (error) {
        console.error('Error processing files:', error);
        return next(new Error('Error processing files'));
    }
    next();
};

module.exports = { upload, handleFilesProcessing };

