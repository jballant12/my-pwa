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
      const unsubscribe = onSnapshot(collection(db, 'Users', user.uid, 'trainers'), (snapshot) => {
        const trainersList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setTrainers(trainersList);
      });

      // Cleanup the listener on unmount
      return () => unsubscribe();
    }
  }, []);

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