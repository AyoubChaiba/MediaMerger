const express = require('express');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const uploadRoutes = require('./routes/upload.route');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
ffmpeg.setFfmpegPath(ffmpegPath);


app.use('/video', express.static('src/cache/'));

app.use('/', uploadRoutes);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
