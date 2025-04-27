import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Navigation from './Navigation';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';

const Workout: React.FC = () => {
  const [weeklyTrainingSplit, setWeeklyTrainingSplit] = useState<string>('');
  const [todaysWorkout, setTodaysWorkout] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  const [error, setError] = useState<string>('');
  const userContext = useContext(UserContext);
  const { userSettings } = userContext || {};

  useEffect(() => {
    const fetchTrainingPlan = async () => {
      if (!auth.currentUser) return;

      try {
        console.log("Fetching training plan for user:", auth.currentUser.uid);
        const trainingPlanRef = collection(db, 'Users', auth.currentUser.uid, 'training_plan');
        const querySnapshot = await getDocs(trainingPlanRef);

        console.log("Query snapshot:", querySnapshot.size, "documents");

        if (!querySnapshot.empty) {
          const docs = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          }));
          console.log("All training plans:", docs);

          const latestPlan = docs[0];
          console.log("Using plan:", latestPlan);

          setWeeklyTrainingSplit(latestPlan.weekly_training_split || '');
          setGoals(latestPlan.goals || '');
        } else {
          console.log("No training plans found");
        }
      } catch (error) {
        console.error("Error fetching training plan:", error);
      }
    };

    fetchTrainingPlan();
  }, []);

  const generateWorkout = async () => {
    if (!weeklyTrainingSplit || !userSettings) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    try {
      if (!userSettings) {
        setError("Please complete your user settings first");
        return;
      }
      
      console.log("Generating workout with data:", {weeklyTrainingSplit, today, userSettings});
      const response = await fetch('http://0.0.0.0:5000/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weeklyTrainingSplit,
          today,
          goals,
          userDetails: {
            height: userSettings.height || '',
            weight: userSettings.weight || '',
            injuries: userSettings.injuries || '',
            gymExpertise: userSettings.gymExpertise || '',
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (!data.workout) {
        throw new Error('No workout data received');
      }
      
      setTodaysWorkout(data.workout);
      setError('');
    } catch (error) {
      console.error("Error generating workout:", error);
      setError("Error generating workout. Please ensure the server is running and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-6">
      <Navigation />
      <div className="md:ml-20">
        <h1 className="text-3xl font-bold mb-6 text-center">Workout Plan</h1>
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Weekly Training Split</h2>
              <p className="mb-4 whitespace-pre-line text-white">{weeklyTrainingSplit}</p>
              <Button 
                onClick={generateWorkout}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Generate Today's Workout
              </Button>
              {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </CardContent>
          </Card>

          {todaysWorkout && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Today's Workout</h2>
                <p className="whitespace-pre-line text-white">{todaysWorkout}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workout;