import React, { useState, useEffect, useContext } from 'react';
import { Button } from "./ui/button";
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
  name: string;
  coachingStyle: string;
  personality: string;
  trainervoice: string;
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
  const { trainers, addTrainer } = context; // Now TypeScript knows context is defined
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
}
const { userSettings } = userContext; 
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null); // Selected trainer ID
  const [trainerData, setTrainerData] = useState<Trainer | null>(null); // Trainer data
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

 // Fetch trainer data and default select trainer
 useEffect(() => {
    const fetchTrainerData = async () => {
      console.log("Fetching trainer data for:", selectedTrainer);
      if (selectedTrainer) {
        const trainerDoc = await getDoc(doc(db, "Users", auth.currentUser?.uid || "", "trainers", selectedTrainer));
        const trainer = trainerDoc.data() as Trainer;
        setTrainerData(trainer);
        console.log("Trainer data fetched:", trainer);

        // Fetch corresponding voice ID using trainer's voice name
        if (trainer && trainer.trainervoice) {
          try {
            const voicesQuery = query(collection(db, "Voices"), where("name", "==", trainer.trainervoice));
            const voicesSnapshot = await getDocs(voicesQuery);
            
            if (!voicesSnapshot.empty) {
              const voiceDoc = voicesSnapshot.docs[0];
              const voiceData = voiceDoc.data();
              setVoiceID(voiceData.id); // Set voice ID to state
              console.log("Voice ID set:", voiceData.id); // Log voice ID
            }
          } catch (error) {
            console.error("Error fetching voice ID: ", error);
          }
        }
      }
    };
    fetchTrainerData();
  }, [selectedTrainer]);


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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">Consult</h1>
      
      <div className="mb-4">
        <Select onValueChange={(value) => {
          console.log("Trainer selected:", value);
        setSelectedTrainer(value)
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select Trainer" />
          </SelectTrigger>
          <SelectContent>
            {trainers.map((trainer) => (
              <SelectItem key={trainer.id} value={trainer.id}>
                {trainer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleStartConsult} className="w-full bg-green-500 hover:bg-green-600">
        Start Consult
      </Button>

      <div id="chat" className="mt-6 p-4 bg-white shadow-lg rounded-lg overflow-auto max-h-80">
        {chatHistory.map((msg, index) => (
          <div key={index} className={msg.role === "assistant" ? "text-blue-600" : "text-black"}>
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
