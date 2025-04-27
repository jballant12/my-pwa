import React, { useState, useEffect, useContext } from 'react';
import { Button } from "./ui/button";
import Navigation from './Navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { auth, db } from '../firebase';  // Import Firestore database
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Vapi from '@vapi-ai/web';
import { query, where } from 'firebase/firestore';
import { TrainerContext } from '../context/TrainerContext';
import { UserContext } from '../context/UserContext';


// Define types
interface Trainer {
  id: string;
  firstName?: string;
  name?: string;
  coachingStyle?: string;
  personality?: string;
  trainervoice?: string;
}

interface ChatMessage {
  role: string;
  content: string;
}

export default function Consult() {
  const context = useContext(TrainerContext);
  if (!context) {
      throw new Error("TrainerContext must be used within a TrainerProvider");
  }
  const { trainers } = context;
  console.log("Trainers in Consult:", trainers);
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { userSettings } = userContext;
  const [selectedTrainer, setSelectedTrainer] = useState<string>(""); 
  const [trainerData, setTrainerData] = useState<Trainer | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); // Chat history
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null); // Vapi instance
  const [voiceID, setVoiceID] = useState<string | null>(null); 

   // Initialize Vapi
   useEffect(() => {
    const vapi = new Vapi("ee125a2c-2039-4a9e-8384-806f6abc1824");
    setVapiInstance(vapi);
    console.log("Vapi instance initialized:", vapi); // Log Vapi instance

    vapi.on("message", (message) => {
      if (message.type === "conversation-update") {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          ...message.conversation.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        ]);
      }
    });
  }, []);

// Fetch trainer data when a trainer is selected
useEffect(() => {
  const fetchTrainerData = async () => {
    console.log("Fetching trainer data for:", selectedTrainer); // Log selected trainer
    if (selectedTrainer) {
      try {
        const trainerDoc = await getDoc(doc(db, "Users", auth.currentUser?.uid || "", "trainers", selectedTrainer));
        if (trainerDoc.exists()) {
          const trainer = trainerDoc.data() as Trainer;
          setTrainerData(trainer);
          console.log("Trainer data fetched:", trainer); // Log fetched trainer data

           // Fetch corresponding voice ID using trainer's voice name
           if (trainer.trainervoice) {
            try {
              const voicesQuery = query(collection(db, "Voices"), where("name", "==", trainer.trainervoice));
              const voicesSnapshot = await getDocs(voicesQuery);

              if (!voicesSnapshot.empty) { // Corrected: removed parentheses
                const voiceDoc = voicesSnapshot.docs[0];
                const voiceData = voiceDoc.data();
                setVoiceID(voiceData.id);
                console.log("Voice ID set:", voiceData.id);
              } else {
                console.warn("No voice found for the given name.");
              }
            } catch (error) {
              console.error("Error fetching voice ID: ", error);
            }
          }
        } else {
          console.warn("No trainer found with the selected ID.");
        }
      } catch (error) {
        console.error("Error fetching trainer data: ", error);
      }
    }
  };
  fetchTrainerData();
}, [selectedTrainer]);

  // Debug logging
  useEffect(() => {
    console.log("Available trainers:", trainers);
  }, [trainers]);


  // Handle Vapi start call
  const handleStartConsult = () => {
    console.log("Vapi Instance:", vapiInstance);
    console.log("User Settings:", userSettings);
    console.log("Trainer Data:", trainerData);

    if (!vapiInstance || !userSettings || !trainerData) {
      console.error("Vapi instance or trainer data is missing.");
      return;
    }
    const assistantOverrides = {
      variableValues: {
        ...userSettings,
        ...trainerData,
        voiceID: voiceID,
      },
    };

    vapiInstance.start("9c3fc777-e009-4916-80db-6bb8f5fec2e2", assistantOverrides);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <Navigation />
      <div className="md:ml-20">
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500 mb-6">Consult</h1>

      <div className="mb-4 w-full max-w-md mx-auto">
        <Select 
          value={selectedTrainer}
          onValueChange={(value) => {
            console.log("Trainer selected:", value);
            setSelectedTrainer(value);
          }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Trainer" />
          </SelectTrigger>
          <SelectContent>
            {trainers && trainers.length > 0 ? (
              trainers.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id || 'default'}>
                  {trainer.name || 'Unnamed Trainer'}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-trainers">No trainers available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleStartConsult} className="w-full bg-green-500 hover:bg-green-600">
        Start Consult
      </Button>

      </div>
      <div id="chat" className="mt-6 p-4 bg-white/10 backdrop-blur-sm shadow-lg rounded-lg overflow-auto max-h-[60vh] md:max-h-80 w-full max-w-2xl mx-auto">
        {chatHistory.map((msg, index) => (
          <div key={index} className={msg.role === "assistant" ? "text-blue-600" : "text-black"}>
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}