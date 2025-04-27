import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Navigation from './Navigation';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

interface CustomVoice {
  name: string;
  id: string;
}

export default function Trainer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("setup");
  const [trainerName, setTrainerName] = useState('');
  const [personality, setPersonality] = useState('');
  const [trainerCoachingStyle, setTrainerCoachingStyle] = useState('');
  const [trainerVoice, setTrainerVoice] = useState<string>(""); 
  const [knowledgeBases, setKnowledgeBases] = useState<string[]>([]); 
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]); 
  const [trainers, setTrainers] = useState<{ id: string; name: string }[]>([]); // For list of trainers
  const [currentTrainer, setCurrentTrainer] = useState<string | null>(null); // For selected trainer
  const [voices, setVoices] = useState<CustomVoice[]>([]); 

  // Define voice-related state
  const [voiceSample, setVoiceSample] = useState<File | null>(null); // For voice sample upload
  const [voiceName, setVoiceName] = useState<string>(""); // For naming the cloned voice

  const user = auth.currentUser;

  // Fetch existing trainers from Firestore on component mount
  useEffect(() => {
    const fetchTrainers = async () => {
      if (user) {
        const querySnapshot = await getDocs(collection(db, 'Users', user.uid, 'trainers'));
        const trainersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,  // Ensure the 'name' field is extracted
        }));
        setTrainers(trainersList);
        if (trainersList.length > 0) {
          setCurrentTrainer(trainersList[0].name); // Set the first trainer as the current trainer
        }
      }
    };

    fetchTrainers();
  }, [user]);

    // Fetch all voices from Firestore Voices collection on component mount
    useEffect(() => {
        const fetchVoices = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, 'Voices')); // Fetch from global 'Voices' collection
            const voicesList = querySnapshot.docs.map(doc => ({
              id: doc.id,
              name: doc.data().name,  // Ensure the 'name' field is extracted
            }));
            setVoices(voicesList); // Set voices to state
          } catch (error) {
            console.error("Error fetching voices: ", error);
          }
        };
    
        fetchVoices();
      }, []);

  // Handle knowledge base upload
  const handleKnowledgeBaseUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (files && files.length > 0) {
      const file = files[0]; 
      const newKnowledgeBase = file.name;
      setKnowledgeBases([...knowledgeBases, newKnowledgeBase]);
    }
  };

  // Handle voice sample upload
  const handleVoiceSampleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (files && files.length > 0) {
      setVoiceSample(files[0]); // Set the voice sample file
    }
  };

  // Clone voice functionality
  const cloneVoice = () => {
    if (voiceSample && voiceName) {
      const voiceId = `${voiceName}-id`;
      const newVoice: CustomVoice = { name: voiceName, id: voiceId };
      setCustomVoices([...customVoices, newVoice]);
      setTrainerVoice(voiceId);
    }
  };

  // Save Trainer Data to Firestore
  const handleSaveTrainer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (user) {
      try {
        const newTrainer = {
          name: trainerName,
          personality: personality,
          coachingStyle: trainerCoachingStyle,
          trainervoice: trainerVoice,
          knowledgeBases
        };
        
        const docRef = await addDoc(collection(db, 'Users', user.uid, 'trainers'), newTrainer);
        console.log("Added trainer with ID:", docRef.id);
        
        // Update the trainers list with the new trainer
        const newTrainerWithId = {
          id: docRef.id,
          ...newTrainer
        };
        setTrainers(prevTrainers => [...prevTrainers, newTrainerWithId]);
        setCurrentTrainer(trainerName); // Set the current trainer to the newly added trainer

        console.log('Trainer added successfully!');
        navigate('/'); 
      } catch (error) {
        console.error('Error adding trainer:', error);
      }
    } else {
      console.error("No authenticated user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <Navigation />
      <Card className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-sm shadow-2xl rounded-xl overflow-hidden border border-white/20 md:ml-20">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => navigate('/')}>Back</Button>
            <h1 className="text-3xl font-bold text-center text-blue-800">Trainer</h1>
            <div className="w-[64px]"></div> 
          </div>

          {/* Current Trainer Selection */}
          <div className="mb-6">
            <Label htmlFor="currentTrainer">Current Trainer</Label>
            <Select value={currentTrainer || 'default'} onValueChange={(value) => setCurrentTrainer(value)}>
              <SelectTrigger id="currentTrainer">
                <SelectValue placeholder="Select a trainer" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((trainer) => (
                  trainer.name ? 
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem> : null
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setup">Setup Tab</TabsTrigger>
              <TabsTrigger value="customVoice">Custom Voice</TabsTrigger>
            </TabsList>

            {/* Setup Tab */}
            <TabsContent value="setup">
              <form className="space-y-4 mt-4" onSubmit={handleSaveTrainer}>
                {/* Trainer Voice */}
                <div className="space-y-2">
                  <Label htmlFor="trainerVoice">Trainer Voice</Label>
                  <Select value={trainerVoice || "default"} onValueChange={setTrainerVoice}>
                    <SelectTrigger id="trainerVoice">
                      <SelectValue placeholder="Select trainer voice" />
                    </SelectTrigger>
                    <SelectContent className="max-h-52 overflow-y-auto">
                        {voices.map((voice) => (
                            voice.id ? 
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name}
                            </SelectItem> : null
                        ))}
                        </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="trainerName">Name</Label>
                  <Input id="trainerName" placeholder="Enter name" value={trainerName} onChange={(e) => setTrainerName(e.target.value)} />
                </div>

                {/* Personality */}
                <div className="space-y-2">
                  <Label htmlFor="personality">Personality</Label>
                  <Input id="personality" placeholder="Enter personality" value={personality} onChange={(e) => setPersonality(e.target.value)} />
                </div>

                {/* Coaching Style */}
                <div className="space-y-2">
                  <Label htmlFor="coachingStyle">Coaching Style</Label>
                  <Select value={trainerCoachingStyle} onValueChange={setTrainerCoachingStyle}>
                    <SelectTrigger id="coachingStyle">
                      <SelectValue placeholder="Select coaching style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supportive_style">Supportive</SelectItem>
                      <SelectItem value="informative_style">Informative</SelectItem>
                      <SelectItem value="hard_nosed_style">Hard-Nosed</SelectItem>
                      <SelectItem value="military_style">Military Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Knowledge */}
                <div className="space-y-2">
                  <Label htmlFor="knowledge">Add Knowledge</Label>
                  <Input id="knowledge" type="file" onChange={handleKnowledgeBaseUpload} />
                </div>

                {/* Select Knowledge Base */}
                <div className="space-y-2">
                  <Label htmlFor="knowledgeBase">Select Knowledge Base</Label>
                  <Select value="default">
                    <SelectTrigger id="knowledgeBase">
                      <SelectValue placeholder="Select knowledge base" />
                    </SelectTrigger>
                    <SelectContent>
                      {knowledgeBases.map((base, index) => (
                        base ? <SelectItem key={index} value={base || `kb_${index}`}>{base}</SelectItem> : null
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">Save Trainer</Button>
              </form>
            </TabsContent>

            {/* Custom Voice Tab */}
            <TabsContent value="customVoice">
              <form className="space-y-4 mt-4">
                {/* Upload Voice Sample */}
                <div className="space-y-2">
                  <Label htmlFor="voiceSample">Upload Voice Sample</Label>
                  <Input id="voiceSample" type="file" onChange={handleVoiceSampleUpload} />
                </div>

                {/* Voice Name */}
                <div className="space-y-2">
                  <Label htmlFor="voiceName">Voice Name</Label>
                  <Input id="voiceName" value={voiceName} onChange={(e) => setVoiceName(e.target.value)} placeholder="Enter voice name" />
                </div>

                <Button type="button" className="w-full" onClick={cloneVoice}>Clone Voice</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
