require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const admin = require("firebase-admin");

// Initialize Firebase Admin using the same config as the client
admin.initializeApp({
  apiKey: "AIzaSyDtxrx-KGT5jWNVLDagdcaMEY_Pp04qWiM",
  authDomain: "trubro-pt.firebaseapp.com",
  projectId: "trubro-pt",
  storageBucket: "trubro-pt.appspot.com",
  messagingSenderId: "323952412810",
  appId: "1:323952412810:web:1e055542363951bc26c573",
  measurementId: "G-V0RR0L8PQZ"
});

const db = admin.firestore();
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Initialize OpenAI once
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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


const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});