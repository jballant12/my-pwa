import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <h1 className="text-4xl font-extrabold text-center mb-6 text-blue-900">TruBro PT</h1>
          <div className="flex flex-col space-y-5">
            <Button 
              onClick={() => navigate('/user')}
              className="h-16 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-700 hover:bg-blue-800 shadow-lg rounded-xl"
            >
              User
            </Button>
            <Button 
              onClick={() => navigate('/trainer')}
              className="h-16 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-700 hover:bg-green-800 shadow-lg rounded-xl"
            >
              Trainer
            </Button>
            <Button 
              onClick={() => navigate('/consult')}
              className="h-16 text-lg font-semibold bg-gradient-to-r from-teal-500 to-teal-700 hover:bg-teal-800 shadow-lg rounded-xl"
            >
              Consult
            </Button>
            <Button 
              onClick={() => navigate('/exercise')}
              className="h-16 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-700 hover:bg-orange-800 shadow-lg rounded-xl"
            >
              Exercise
            </Button>
            <Button 
              onClick={() => navigate('/workout')}
              className="h-16 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-yellow-700 hover:bg-yellow-800 shadow-lg rounded-xl"
            >
              Workout
            </Button>
            <Button 
              onClick={() => navigate('/progress')}
              className="h-16 text-lg font-semibold bg-gradient-to-r from-red-300 to-red-500 hover:bg-red-600 shadow-lg rounded-xl"
            >
              Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
