import React, { useState, useEffect, useContext } from 'react';
import { Button } from "./ui/button";
import Navigation from './Navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { auth, db } from '../firebase';
import { doc, collection, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { query, where } from 'firebase/firestore';
import { TrainerContext } from '../context/TrainerContext';
import { UserContext } from '../context/UserContext';
import Vapi from '@vapi-ai/web';

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
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { userSettings } = userContext;
  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  const [trainerData, setTrainerData] = useState<Trainer | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState<string>("");
  const [finalTranscripts, setFinalTranscripts] = useState<string[]>([]);
  const [trainingPlan, setTrainingPlan] = useState<any>(null);

  useEffect(() => {
    const vapi = new Vapi("ee125a2c-2039-4a9e-8384-806f6abc1824");
    setVapiInstance(vapi);

    vapi.on("transcript", (message) => {
      if (message.type === "partial") {
        setPartialTranscript(message.transcript);
      } else if (message.type === "final") {
        setFinalTranscripts(prev => [...prev, message.transcript]);
        setPartialTranscript("");
      }
    });

    vapi.on("message", (message) => {
      console.log("Received message:", message);
      
      if (message.type === "function-call" && message.functionCall?.name === "SaveTrainingType") {
        const trainingData = {
          goals: message.functionCall.parameters.goals,
          vision: message.functionCall.parameters.vision,
          split_length: message.functionCall.parameters.split_length,
          weekly_training_split: message.functionCall.parameters.weekly_training_split,
          timestamp: new Date()
        };
        console.log("Training data received:", trainingData);
        setTrainingPlan(trainingData);
        saveTrainingPlanToFirebase(trainingData);
      }
      
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

    const saveTrainingPlanToFirebase = async (trainingData: any) => {
      if (!auth.currentUser) {
        console.error("No authenticated user found");
        return;
      }

      try {
        const trainingPlanRef = doc(collection(db, 'Users', auth.currentUser.uid, 'training_plan'));
        const dataToSave = {
          ...trainingData,
          trainerId: selectedTrainer,
          createdAt: new Date()
        };
        
        await setDoc(trainingPlanRef, dataToSave);
        console.log("Training plan saved successfully to Firebase");
      } catch (error) {
        console.error("Error saving training plan to Firebase:", error);
      }
    };

    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, []);

  useEffect(() => {
    const fetchTrainerData = async () => {
      if (selectedTrainer) {
        try {
          const trainerDoc = await getDoc(doc(db, "Users", auth.currentUser?.uid || "", "trainers", selectedTrainer));
          if (trainerDoc.exists()) {
            const trainer = trainerDoc.data() as Trainer;
            setTrainerData(trainer);

            if (trainer.trainervoice) {
              try {
                const voicesQuery = query(collection(db, "Voices"), where("name", "==", trainer.trainervoice));
                const voicesSnapshot = await getDocs(voicesQuery);
                if (!voicesSnapshot.empty) {
                  const voiceDoc = voicesSnapshot.docs[0];
                  const voiceData = voiceDoc.data();
                  console.log("Voice ID set:", voiceData.id);
                }
              } catch (error) {
                console.error("Error fetching voice ID: ", error);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching trainer data: ", error);
        }
      }
    };
    fetchTrainerData();
  }, [selectedTrainer]);

  const handleToggleCall = () => {
    if (!isCallActive) {
      if (!vapiInstance || !userSettings || !trainerData) {
        console.error("Vapi instance or trainer data is missing.");
        return;
      }

      const assistantOverrides = {
        variableValues: {
          user_name: userSettings.username,
          user_height: userSettings.height,
          user_weight: userSettings.weight,
          user_training_level: userSettings.gymExpertise,
          trainer_name: trainerData.name,
          trainer_personality: trainerData.personality,
          trainer_coaching_style: trainerData.coachingStyle,
          voiceId: trainerData.trainervoice
        },
      };

      vapiInstance.start("9c3fc777-e009-4916-80db-6bb8f5fec2e2", assistantOverrides);
    } else {
      vapiInstance?.stop();
    }
    setIsCallActive(!isCallActive);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <Navigation />
      <div className="md:ml-20">
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500 mb-6">Consult</h1>

        <div className="mb-4 w-full max-w-md mx-auto">
          <Select
            value={selectedTrainer}
            onValueChange={(value) => setSelectedTrainer(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Trainer" />
            </SelectTrigger>
            <SelectContent>
              {trainers && trainers.length > 0 ? (
                trainers.filter(trainer => trainer.name && trainer.id).map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-trainers">No trainers available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleToggleCall} 
          className={`w-full ${isCallActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isCallActive ? 'End Call' : 'Start Call'}
        </Button>

        <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Live Transcript</h2>
          <div className="text-white/90">
            {finalTranscripts.map((text, i) => (
              <p key={i} className="mb-2">{text}</p>
            ))}
            {partialTranscript && (
              <p className="text-gray-400">{partialTranscript}</p>
            )}
          </div>
        </div>

        <div id="chat" className="mt-6 p-4 bg-white/10 backdrop-blur-sm shadow-lg rounded-lg overflow-auto max-h-[60vh] md:max-h-80 w-full max-w-2xl mx-auto">
          {chatHistory
            .filter(msg => msg.role !== 'system')
            .map((msg, index) => (
              <div key={index} className={`mb-2 p-2 rounded ${msg.role === "assistant" ? "bg-blue-500/20" : "bg-green-500/20"}`}>
                <strong>{msg.role === "assistant" ? "Trainer" : "You"}: </strong>
                {msg.content}
              </div>
            ))}
        </div>
        {/* Add training plan display here */}
        {trainingPlan && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Training Plan</h2>
            <pre className="text-sm text-white/90">
              {JSON.stringify(trainingPlan, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}