
import React from 'react';
import { Card, CardContent } from "./ui/card";
import Navigation from './Navigation';

const Workout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-6">
      <Navigation />
      <div className="md:ml-20">
        <h1 className="text-3xl font-bold mb-6 text-center">Workout Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Workout</h2>
              {/* Add your workout content here */}
              <p>Workout plan features coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Workout;
