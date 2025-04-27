import React, { createContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';  // Ensure firebase is properly set up
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

interface Trainer {
  id: string;
  name: string;
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
        const trainersList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          coachingStyle: doc.data().coachingStyle,
          personality: doc.data().personality,
          trainervoice: doc.data().trainervoice,
        }));
        console.log("Fetched trainers:", trainersList);
        setTrainers(trainersList);
      });

      // Cleanup the listener on unmount
      return () => unsubscribe();
    } else {
      setTrainers([]); // Reset trainers when no user is logged in
    }
  }, [auth.currentUser]); // Re-run when user changes

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