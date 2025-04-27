
import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Navigation from './Navigation';
import { auth, db } from '../firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';

const Workout: React.FC = () => {
  const [weeklyTrainingSplit, setWeeklyTrainingSplit] = useState<string>('');
  const [todaysWorkout, setTodaysWorkout] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  const userContext = useContext(UserContext);
  const { userSettings } = userContext || {};

  useEffect(() => {
    const fetchTrainingPlan = async () => {
      if (!auth.currentUser) return;

      try {
        const trainingPlanRef = doc(collection(db, 'Users', auth.currentUser.uid, 'training_plan'));
        const trainingPlanDoc = await getDoc(trainingPlanRef);
        
        if (trainingPlanDoc.exists()) {
          const data = trainingPlanDoc.data();
          setWeeklyTrainingSplit(data.weekly_training_split);
          setGoals(data.goals);
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
      const response = await fetch('http://0.0.0.0:3001/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weeklyTrainingSplit,
          today,
          goals,
          userDetails: {
            height: userSettings.height,
            weight: userSettings.weight,
            injuries: userSettings.injuries,
            gymExpertise: userSettings.gymExpertise,
          }
        }),
      });

      const data = await response.json();
      setTodaysWorkout(data.workout);
    } catch (error) {
      console.error("Error generating workout:", error);
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
              <h2 className="text-xl font-semibold mb-4">Weekly Training Split</h2>
              <p className="mb-4 whitespace-pre-line">{weeklyTrainingSplit}</p>
              <Button 
                onClick={generateWorkout}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Generate Today's Workout
              </Button>
            </CardContent>
          </Card>

          {todaysWorkout && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Today's Workout</h2>
                <p className="whitespace-pre-line">{todaysWorkout}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workout;
