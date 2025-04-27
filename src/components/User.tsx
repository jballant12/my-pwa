import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';  // Import auth state

export default function UserSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);  // State for the authenticated user
  
  // State variables for form inputs
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [injuries, setInjuries] = useState('');
  const [gymExpertise, setGymExpertise] = useState('');
  const [daysTrained, setDaysTrained] = useState('');

  // Handle auth state changes and get current user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);  // Set user when authenticated
        setEmail(authUser.email || '');  // Set email from the authenticated user
      } else {
        navigate('/login');  // If no user, redirect to login
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const docRef = doc(db, 'Users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || '');
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setHeight(data.height || '');
          setWeight(data.weight || '');
          setInjuries(data.injuries || '');
          setGymExpertise(data.gymExpertise || '');
          setDaysTrained(data.daysTrained || '');
        }
      }
    };

    loadUserData();
  }, [user]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // Prevent form from reloading the page
    if (user) {
      try {
        await setDoc(doc(db, 'Users', user.uid), {
          username,
          firstName,
          lastName,
          email,
          height,
          weight,
          injuries,
          gymExpertise,
          daysTrained,
        });
        console.log("User settings updated successfully!");
      } catch (error) {
        console.error("Error updating settings: ", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-6">
      <Card className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden border border-white/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => navigate('/')}>Back</Button>
            <h1 className="text-3xl font-bold text-center text-blue-800">User Settings</h1>
            <div className="w-[64px]"></div> {/* Spacer for alignment */}
          </div>
          <form className="space-y-4" onSubmit={handleSave}>  {/* Attach the handler */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter email" value={email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" placeholder="Enter height" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" placeholder="Enter weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="injuries">Ongoing Injuries</Label>
              <Input id="injuries" placeholder="Enter ongoing injuries" value={injuries} onChange={(e) => setInjuries(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gymExpertise">Gym Expertise</Label>
              <Select value={gymExpertise} onValueChange={setGymExpertise}>
                <SelectTrigger id="gymExpertise">
                  <SelectValue placeholder="Select gym expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysTrained">Days Trained Per Week</Label>
              <Input id="daysTrained" type="number" placeholder="Enter days trained per week" value={daysTrained} onChange={(e) => setDaysTrained(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Save Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
