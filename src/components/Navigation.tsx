
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, User, Brain, Activity, Dumbbell, ChartLine, Trophy } from 'lucide-react';
import { Button } from './ui/button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/user', label: 'Profile', icon: User },
    { path: '/trainer', label: 'AI Trainer', icon: Brain },
    { path: '/consult', label: 'Consultation', icon: Activity },
    { path: '/exercise', label: 'Exercise', icon: Dumbbell },
    { path: '/workout', label: 'Workout', icon: ChartLine },
    { path: '/progress', label: 'Progress', icon: Trophy },
  ];

  return (
    <>
      <Button
        variant="ghost"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      <nav className={`fixed top-0 right-0 h-full bg-black/90 backdrop-blur-lg w-64 transform transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:w-16 md:bg-transparent`}>
        <div className="flex flex-col items-start p-4 space-y-4 mt-16 md:items-center">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Button
              key={path}
              variant="ghost"
              className="w-full flex items-center space-x-3 text-white hover:bg-white/20 md:w-auto md:justify-center"
              onClick={() => {
                navigate(path);
                setIsOpen(false);
              }}
            >
              <Icon className="h-5 w-5" />
              <span className="md:hidden">{label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
