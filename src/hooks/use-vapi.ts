
import { useState } from 'react';

const useVapi = () => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const toggleCall = () => {
    setIsSessionActive(!isSessionActive);
  };

  return { volumeLevel, isSessionActive, toggleCall };
};

export default useVapi;
