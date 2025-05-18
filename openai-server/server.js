const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/generate-workout', async (req, res) => {
  try {
    const { weeklyTrainingSplit, today, userSettings } = req.body;

    if (!weeklyTrainingSplit || !today || !userSettings) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    const prompt = `Generate a workout for ${today} based on this split: ${weeklyTrainingSplit}. 
    User details: Height: ${userSettings.height}, Weight: ${userSettings.weight}, 
    Injuries: ${userSettings.injuries}, Experience: ${userSettings.gymExpertise}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    res.json({ workout: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate workout' });
  }
});

const startServer = (port) => {
  try {
    app.listen(port, '0.0.0.0', '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(`Failed to start server on port ${port}:`, error);
    process.exit(1);
  }
};

startServer(5000);