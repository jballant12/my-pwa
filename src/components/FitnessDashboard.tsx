
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Activity, ClipboardList, Target, BarChart, BookOpen, TrendingUp, ChevronRight, Camera } from 'lucide-react';
import CameraVoicePage from './CameraVoicePage';

const FitnessDashboard: React.FC = () => {
  const [time, setTime] = useState(0);
  const [displayContent, setDisplayContent] = useState<string>('menu');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const openCamera = useCallback(async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(videoStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { name: 'Goals', icon: Target, color: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
    { name: 'Instructions', icon: ClipboardList, color: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
    { name: 'Check', icon: Camera, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { name: 'Spot', icon: BarChart, color: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { name: 'Learn', icon: BookOpen, color: 'bg-gradient-to-br from-pink-500 to-rose-600' },
    { name: 'Progress', icon: TrendingUp, color: 'bg-gradient-to-br from-yellow-500 to-amber-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <Card className="w-full max-w-7xl mx-auto bg-white/10 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-2xl font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
              {`${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`}
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
              AI Trainer
            </h1>
            <Button 
              variant="outline"
              className="bg-white/5 hover:bg-white/10 border-0 text-white"
              onClick={() => console.log('Next Exercise clicked')}
            >
              <span>Next</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-xl overflow-hidden bg-black/30 h-[600px] mb-6">
            {displayContent === 'camera' ? (
              <CameraVoicePage stream={stream} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {menuItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="outline"
                    className={`h-40 flex flex-col items-center justify-center space-y-4 ${item.color} 
                    border-0 hover:scale-105 transition-all duration-300 text-white shadow-lg`}
                    onClick={() => {
                      if (item.name === 'Check') {
                        setDisplayContent('camera');
                        openCamera();
                      } else {
                        setDisplayContent(item.name);
                      }
                    }}
                  >
                    <item.icon className="h-10 w-10" />
                    <span className="text-lg font-semibold">{item.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessDashboard;
