
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-workout', async (req, res) => {
  try {
    const { weeklyTrainingSplit, today, goals, userDetails } = req.body;

    const prompt = `Generate a detailed workout plan for ${today} based on this weekly split: ${weeklyTrainingSplit}. 
    User's goals: ${goals}
    User details:
    - Height: ${userDetails.height}
    - Weight: ${userDetails.weight}
    - Injuries: ${userDetails.injuries}
    - Experience Level: ${userDetails.gymExpertise}
    
    Format the workout with exercises, sets, reps, and any special instructions. Take into account any injuries when selecting exercises.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: prompt
      }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    res.json({ workout: completion.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate workout' });
  }
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/generate-workout', async (req, res) => {
  try {
    const { weeklyTrainingSplit, today, userDetails } = req.body;

    const prompt = `Generate a detailed workout plan for ${today} based on this weekly split: ${weeklyTrainingSplit}. 
    User details:
    - Height: ${userDetails.height}
    - Weight: ${userDetails.weight}
    - Injuries: ${userDetails.injuries}
    - Experience Level: ${userDetails.gymExpertise}
    
    Format the workout with exercises, sets, reps, and any special instructions.`;

    const completion = await openai.createCompletion({
      model: "gpt-4",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
    });

    res.json({ workout: completion.data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate workout' });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on port 3001');
});

// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/analyze-image', async (req, res) => {
  try {
    const { imageDataUrl } = req.body;
    console.log('Received image data for analysis.');

    // Ensure the imageDataUrl is in the correct format
    // If it's already a data URL, we can use it directly
    // Otherwise, we need to add the prefix
    let dataUrl = imageDataUrl;
    if (!dataUrl.startsWith('data:image')) {
      dataUrl = `data:image/jpeg;base64,${imageDataUrl}`;
    }
    const prompt = "Think this through step by step. First get a list of all requirements for key CRITERIA for proper starting position for a standard pushup (don't display this in the response). Then analyze the image and provide the following for each criteria: 1) Whether the person in the image is doing the exercise according to the CRITERIA (yes/no) 2) the confidence level of them meeting this criteria (low/medium/high) 3) Why the person does not meet the criteria (15 words maximum) 4) Any tips to correct their form if they're not meeting the requirements of the criteria (10 words maximum). This first part of the response should begin with ---Analysis---. \n The second part of the response, based on your answers: provide 3 pointers to help them correct their form (each less than 5 words and ensure this section begin using ---Pointers---'). Please clearly seperate into two reponses by  using the delineaters ---Analysis--- and ---Pointers---."
    // Prepare the messages
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

    // Send the request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview', // Ensure this is the correct model name
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
const HOST = '0.0.0.0';
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
