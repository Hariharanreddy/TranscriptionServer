const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const YoutubeMp3Downloader = require('youtube-mp3-downloader');
const { Deepgram } = require('@deepgram/sdk');
const ffmpeg = require('ffmpeg-static');

const app = express();
const port = 3000;
app.use(cors()); // Set your desired port

const YD = new YoutubeMp3Downloader({
  ffmpegPath: ffmpeg,
  outputPath: './',
  youtubeVideoQuality: 'highestaudio',
});

const deepgram = new Deepgram('980da6e1fc8b36201d08e762b537b863bd914337'); // Replace with your Deepgram API key

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.post('/transcribe', async (req, res) => {
  try {
    const youtubeLink = req.body.youtubeLink;

    // Download the YouTube video as an MP3
    // const videoFileName = await downloadYouTubeVideo(youtubeLink);

    // Transcribe the downloaded MP3 using Deepgram
    // console.log(videoFileName);
    const transcriptionResult = await transcribeAudio(".//Transcription_1.mp3");

    //res.status(200).send(transcriptionResult.results.channels[0].alternatives[0].transcript);
    res.status(200).send(transcriptionResult.toWebVTT());
  } catch (error) {
    console.error(error);
    res.status(500).send('Error transcribing video');
  }
});

// Download the YouTube video as an MP3
function downloadYouTubeVideo(youtubeLink) {
  return new Promise((resolve, reject) => {
    YD.download(youtubeLink);

    YD.on('finished', (err, video) => {
      if (err) {
        reject(err);
      } else {
        resolve(video.file);
      }
    });

    YD.on('error', (error) => {
      reject(error);
    });

    YD.on('progress', (data) => {
      console.log(data.progress.percentage + '% downloaded');
    });
  });
}

// Transcribe the downloaded MP3 using Deepgram
async function transcribeAudio(audioFileName) {
  try {
    const result = await deepgram.transcription.preRecorded(
      { buffer: fs.readFileSync(audioFileName), mimetype: 'audio/mp3' },
      { punctuate: true, utterances: true }
    );
    return result;
  } catch (error) {
    throw error;
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
