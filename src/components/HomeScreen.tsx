
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Activity, Brain, Users, Dumbbell, ChartLine, Trophy } from 'lucide-react';

export default function HomeScreen() {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/user', label: 'User Profile', icon: Users, color: 'from-violet-500 to-purple-600' },
    { path: '/trainer', label: 'AI Trainer', icon: Brain, color: 'from-blue-500 to-cyan-600' },
    { path: '/consult', label: 'Consultation', icon: Activity, color: 'from-emerald-500 to-teal-600' },
    { path: '/exercise', label: 'Exercise Analysis', icon: Dumbbell, color: 'from-orange-500 to-red-600' },
    { path: '/workout', label: 'Workout Plan', icon: ChartLine, color: 'from-pink-500 to-rose-600' },
    { path: '/progress', label: 'Progress Tracking', icon: Trophy, color: 'from-yellow-500 to-amber-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
          TruBro PT
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map(({ path, label, icon: Icon, color }) => (
            <Card 
              key={path}
              className="group hover:scale-105 transition-all duration-300 shadow-xl border-0"
            >
              <CardContent 
                className={`p-6 cursor-pointer bg-gradient-to-br ${color} transition-all duration-300`}
                onClick={() => navigate(path)}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Icon className="w-12 h-12 text-white" />
                  <h2 className="text-2xl font-semibold text-white">{label}</h2>
                </div>
              </CardContent>
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Icon className="w-12 h-12" />
                  <h2 className="text-2xl font-semibold">{label}</h2>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
