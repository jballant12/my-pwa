import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Ensure firebase is properly set up
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface UserSettings {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  height: string;
  weight: string;
  injuries: string;
  gymExpertise: string;
  daysTrained: string;
}

interface UserContextType {
  userSettings: UserSettings | null;
  setUserSettings: (settings: UserSettings) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [user, setUser] = useState<any>(null);

  // Handle auth state changes and get current user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);  // Set user when authenticated
        loadUserData(authUser.uid);  // Load user data
      } else {
        setUser(null);
        setUserSettings(null); // Reset user settings if not authenticated
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user data from Firestore
  const loadUserData = async (uid: string) => {
    const docRef = doc(db, 'Users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserSettings;
      setUserSettings(data);
    }
  };

  // Save user settings to Firestore
  const saveUserSettings = async (settings: UserSettings) => {
    if (user) {
      await setDoc(doc(db, 'Users', user.uid), settings);
      setUserSettings(settings); // Update local state
    }
  };

  return (
    <UserContext.Provider value={{ userSettings, setUserSettings: saveUserSettings }}>
      {children}
    </UserContext.Provider>
  );
};