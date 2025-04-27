
import { useState, useEffect } from 'react';
import { useVapiClient } from '@vapi-ai/react';

export default function useVapi() {
  const { isSessionActive, toggleCall, volumeLevel } = useVapiClient();
  
  return {
    isSessionActive,
    toggleCall,
    volumeLevel
  };
}
