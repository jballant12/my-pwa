import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Activity, ClipboardList, Target, BarChart, BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import CameraVoicePage from './CameraVoicePage';

interface MenuItem {
  name: string;
  icon: React.ElementType;
}

const FitnessDashboard: React.FC = () => {
  const [time, setTime] = useState(0);
  const [displayContent, setDisplayContent] = useState<string>('menu'); // Start with 'menu' to show the buttons
  const [stream, setStream] = useState<MediaStream | null>(null);

  const openCamera = useCallback(async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(videoStream); // Set the camera stream
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleButtonClick = (name: string) => {
    if (name === 'Check') {
      setDisplayContent('camera'); // Change displayContent to 'camera' when "Check" is clicked
      openCamera(); // Open the camera when the button is clicked
    } else {
      setDisplayContent(`${name} content will be displayed here`);
    }
  };

  const menuItems: MenuItem[] = [
    { name: 'Goals', icon: Target },
    { name: 'Instructions', icon: ClipboardList },
    { name: 'Check', icon: Activity }, // Check opens the camera
    { name: 'Spot', icon: BarChart },
    { name: 'Learn', icon: BookOpen },
    { name: 'Progress', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-semibold text-blue-600">
              {`${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`}
            </div>
            <h1 className="text-3xl font-bold text-center text-blue-800">Personal Trainer</h1>
            <Button variant="outline" className="flex items-center space-x-1 text-blue-600" onClick={() => console.log('Next Exercise clicked')}>
              <span>Next Exercise</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Conditional rendering of CameraVoicePage or menu buttons */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg h-96 flex items-center justify-center text-center">
            {displayContent === 'camera' ? (
              <CameraVoicePage stream={stream} />  // Render camera when "Check" is clicked
            ) : (
              displayContent === 'menu' ? ( // Show menu buttons by default
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="outline"
                      className="h-32 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 transition-colors"
                      onClick={() => handleButtonClick(item.name)}
                    >
                      <item.icon className="h-8 w-8 text-blue-600" />
                      <span className="text-lg font-medium text-blue-800">{item.name}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-lg text-gray-600">{displayContent}</p>  // Display selected content
              )
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessDashboard;
