const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/generate-workout', async (req, res) => {
  try {
    const { weeklyTrainingSplit, today, userSettings } = req.body;

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
    app.listen(PORT + 1, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});