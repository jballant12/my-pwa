const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const admin = require("firebase-admin"); 

// Initialize Firebase Admin without service account for now
admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({
  origin: 'https://874d92e7-9de4-4a68-89f5-96241fb23c6a-00-15dr11hfdb7pd.riker.replit.dev',
  credentials: true,
  methods: ['GET', 'POST']
}));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/generate-workout', async (req, res) => {
  try {
    const { weeklyTrainingSplit, today, userSettings } = req.body;
    console.log('Received request:', { weeklyTrainingSplit, today, userSettings });

    const prompt = `Generate a detailed workout plan for ${today} based on this weekly split: ${weeklyTrainingSplit}.
    User details:
    - Height: ${userSettings.height}
    - Weight: ${userSettings.weight}
    - Injuries: ${userSettings.injuries}
    - Experience Level: ${userSettings.gymExpertise}

    Format the workout with exercises, sets, reps, and any special instructions. Take into account any injuries when selecting exercises.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    res.json({ workout: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate workout' });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on port 3001');
});

require('dotenv').config();
const OpenAI2 = require('openai');

const openaiImage = new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/analyze-image', async (req, res) => {
  try {
    const { imageDataUrl } = req.body;
    console.log('Received image data for analysis.');

    let dataUrl = imageDataUrl;
    if (!dataUrl.startsWith('data:image')) {
      dataUrl = `data:image/jpeg;base64,${imageDataUrl}`;
    }
    const prompt = "Think this through step by step. First get a list of all requirements for key CRITERIA for proper starting position for a standard pushup (don't display this in the response). Then analyze the image and provide the following for each criteria: 1) Whether the person in the image is doing the exercise according to the CRITERIA (yes/no) 2) the confidence level of them meeting this criteria (low/medium/high) 3) Why the person does not meet the criteria (15 words maximum) 4) Any tips to correct their form if they're not meeting the requirements of the criteria (10 words maximum). This first part of the response should begin with ---Analysis---. \n The second part of the response, based on your answers: provide 3 pointers to help them correct their form (each less than 5 words and ensure this section begin using ---Pointers---'). Please clearly seperate into two reponses by  using the delineaters ---Analysis--- and ---Pointers---."
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl,
            },
          },
        ],
      },
    ];

    const response = await openaiImage.chat.completions.create({
      model: 'gpt-4-vision-preview', 
      messages: messages,
    });

    const aiResponse = response.choices[0]?.message?.content;
    console.log('AI analysis complete.');
    res.json({ aiResponse });
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error analyzing image' });
  }
});


const PORT = process.env.PORT || 3001;
if (!module.parent) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}