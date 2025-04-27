import React, { createContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';  // Ensure firebase is properly set up
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

interface Trainer {
  id: string;
  name: string;
  coachingStyle?: string;
  personality?: string;
  trainervoice?: string;
}

interface TrainerContextType {
  trainers: Trainer[];
  addTrainer: (trainer: Trainer) => Promise<void>;
}

export const TrainerContext = createContext<TrainerContextType | undefined>(undefined);

export const TrainerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  // Set up a real-time listener for trainers
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      console.log("Setting up trainer listener for user:", user.uid);
      const trainersRef = collection(db, 'Users', user.uid, 'trainers');
      
      const unsubscribe = onSnapshot(trainersRef, (snapshot) => {
        try {
          const trainersList = snapshot.docs.map(doc => {
            const data = doc.data();
            if (!data) {
              console.warn("No data found for trainer document:", doc.id);
              return null;
            }
            const trainerData = {
              id: doc.id,
              name: data.name,
              coachingStyle: data.coachingStyle || '',
              personality: data.personality || '',
              trainervoice: data.trainervoice || ''
            };
            console.log("Fetched trainer:", trainerData);
            return trainerData;
          }).filter(trainer => trainer !== null && trainer.name);
          
          console.log("Fetched trainers:", trainersList);
          setTrainers(trainersList);
        } catch (error) {
          console.error("Error processing trainers:", error);
          setTrainers([]);
        }
      }, (error) => {
        console.error("Error fetching trainers:", error);
        setTrainers([]);
      });

      return () => unsubscribe();
    } else {
      console.log("No user logged in");
      setTrainers([]);
    }
  }, [auth.currentUser?.uid]); // Only re-run when user ID changes

  // Add a new trainer
  const addTrainer = async (trainer: Trainer) => {
    const user = auth.currentUser;
    if (user) {
      await addDoc(collection(db, 'Users', user.uid, 'trainers'), trainer);
    }
  };

  return (
    <TrainerContext.Provider value={{ trainers, addTrainer }}>
      {children}
    </TrainerContext.Provider>
  );
};