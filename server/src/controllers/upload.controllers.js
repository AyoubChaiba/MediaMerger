const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const wav = require('wav');

const merge = async (req, res) => {
    try {
        if (!req.files['image'] || !req.files['audio']) {
            return res.status(400).send('Image and audio files are required.');
        }

        const repeatCount = parseInt(req.body.repeatCount, 10) || 1;
        const pauseDuration = parseFloat(req.body.timeInterval) || 0;

        const imagePath = path.resolve(req.files['image'][0].path);
        const audioPaths = req.files['audio'].map(file => path.resolve(file.path));

        const silentAudioWavPath = path.join(process.cwd(), `src/media/silent_audio_${pauseDuration}s.wav`);
        const silentAudioMp3Path = path.join(process.cwd(), `src/media/silent_audio_${pauseDuration}s.mp3`);
        const repeatedAudioPath = path.join(process.cwd(), `src/cache/repeated_audio_${Date.now()}.mp3`);
        const videoPath = path.join(process.cwd(), `src/cache/output_${Date.now()}.mp4`);
        const concatFilePath = path.join(process.cwd(), `src/cache/concat_list_${Date.now()}.txt`);

        const cleanupFiles = (files) => {
            files.forEach(file => {
                fs.unlink(file, err => {
                    if (err) console.error(`Error deleting file ${file}:`, err);
                });
            });
        };

        if (pauseDuration > 0) {
            const sampleRate = 44100;
            const numChannels = 2;
            const numFrames = sampleRate * pauseDuration;

            const buffer = Buffer.alloc(numFrames * numChannels * 2);
            const writer = new wav.Writer({
                sampleRate: sampleRate,
                channels: numChannels
            });

            writer.write(buffer);
            writer.end();

            const silentAudioStream = fs.createWriteStream(silentAudioWavPath);
            writer.pipe(silentAudioStream);

            await new Promise((resolve, reject) => {
                silentAudioStream.on('finish', resolve);
                silentAudioStream.on('error', reject);
            });

            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(silentAudioWavPath)
                    .outputOptions(['-q:a', '9', '-acodec', 'libmp3lame'])
                    .save(silentAudioMp3Path)
                    .on('end', resolve)
                    .on('error', (err) => {
                        console.error('Error creating silent audio:', err);
                        reject(err);
                    })
                    .run();
            });
        }

        const concatFileContent = [];
        audioPaths.forEach((audioPath, index) => {
            concatFileContent.push(`file '${audioPath}'`);
            if (pauseDuration > 0) {
                concatFileContent.push(`file '${silentAudioMp3Path}'`);
            }

            if (repeatCount > 1) {
                for (let i = 1; i < repeatCount; i++) {
                    concatFileContent.push(`file '${audioPath}'`);
                    if (pauseDuration > 0) {
                        concatFileContent.push(`file '${silentAudioMp3Path}'`);
                    }
                }
            }

            if (index > 0) {
                for (let i = 0; i < repeatCount; i++) {
                    for (let j = 0; j <= index; j++) {
                        concatFileContent.push(`file '${audioPaths[j]}'`);
                        if (pauseDuration > 0) {
                            concatFileContent.push(`file '${silentAudioMp3Path}'`);
                        }
                    }
                }
            }
        });

        fs.writeFileSync(concatFilePath, concatFileContent.join('\n'));

        try {
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(concatFilePath)
                    .inputOptions(['-f concat', '-safe 0', '-fflags +genpts'])
                    .output(repeatedAudioPath)
                    .on('end', resolve)
                    .on('error', (err) => {
                        console.error('Error in audio concatenation:', err);
                        reject(err);
                    })
                    .run();
            });
        } catch (err) {
            return res.status(500).send('Error during audio concatenation.');
        }

        try {
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(imagePath)
                    .inputOptions('-loop 1')
                    .input(repeatedAudioPath)
                    .outputOptions([
                        '-c:v libx264',
                        '-tune stillimage',
                        '-shortest',
                        '-crf 12',
                        '-pix_fmt yuv420p',
                        '-vf scale=800:600'
                    ])
                    .output(videoPath)
                    .on('end', resolve)
                    .on('error', (err) => {
                        console.error('Error in video creation:', err);
                        reject(err);
                    })
                    .run();
            });
        } catch (err) {
            return res.status(500).send('Error during video creation.');
        }

        res.sendFile(videoPath, (err) => {
            if (err) {
                console.error('Error during sending video file:', err);
                res.status(500).send('Error sending the video.');
            } else {
                cleanupFiles([...audioPaths, imagePath]);
                if (pauseDuration > 0) {
                    cleanupFiles([...audioPaths, imagePath, repeatedAudioPath, concatFilePath, videoPath]);
                }
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('An error occurred.');
    }
};

module.exports = { merge };
