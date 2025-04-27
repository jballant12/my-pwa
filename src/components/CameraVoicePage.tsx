// CameraVoicePage.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

interface CameraVoicePageProps {
  stream?: MediaStream | null;
}

export default function CameraVoicePage({ stream }: CameraVoicePageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionRunning = useRef(false);

  const vapiRef = useRef<Vapi | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Initialize Vapi on mount
  useEffect(() => {
    console.log('Initializing Vapi...');
    vapiRef.current = new Vapi('ee125a2c-2039-4a9e-8384-806f6abc1824');

    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  // Analyze image after capture
  const analyzeCapturedImage = useCallback(async (imageDataUrl: string) => {
    console.log('Sending image to server for analysis...');
    try {
      const response = await fetch('http://localhost:3001/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl }),
      });

      const data = await response.json();
      const aiResponse = data.aiResponse;

      if (!aiResponse) {
        console.error('AI response is null');
        return;
      }

      console.log('AI Response:', aiResponse);

      // Split the response using the markers
      const analysisMarker = '---Analysis---';
      const pointersMarker = '---Pointers---';

      const analysisStartIndex = aiResponse.indexOf(analysisMarker);
      const pointersStartIndex = aiResponse.indexOf(pointersMarker);

      let analysis = '';
      let pointers = '';

      if (analysisStartIndex !== -1 && pointersStartIndex !== -1) {
        analysis = aiResponse.substring(
          analysisStartIndex + analysisMarker.length,
          pointersStartIndex
        ).trim();
        pointers = aiResponse.substring(
          pointersStartIndex + pointersMarker.length
        ).trim();
      } else {
        console.error('Could not find the analysis or pointers markers in the AI response.');
        analysis = aiResponse.trim(); // Use the entire response as analysis if markers are missing
      }

      // Start Vapi with analysis and pointers
      if (vapiRef.current) {
        console.log('Starting Vapi with analysis and pointers:', analysis, pointers);
        vapiRef.current.start('4e8ee1a0-9ce1-4884-b058-7aa695cf948b', {
          variableValues: {
            analysis: analysis,
            pointers: pointers,
          },
        });
      } else {
        console.error('Vapi is not initialized.');
      }
    } catch (error) {
      console.error('Error analyzing image with server:', error);
    }
  }, []);

  // Capture image and send it to the server
  const captureImage = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const imageDataUrl = canvas.toDataURL('image/jpeg');
      console.log('Image captured successfully. Sending to server...');
      setCapturedImage(imageDataUrl);
      analyzeCapturedImage(imageDataUrl);
    }
  }, [analyzeCapturedImage]);

  // Set up the video stream when the component mounts
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      setPermissionsGranted(true);
    }
  }, [stream]);

  // Function to safely start speech recognition
  const startSpeechRecognition = () => {
    if (!isRecognitionRunning.current && recognitionRef.current && permissionsGranted) {
      try {
        recognitionRef.current.start();
        isRecognitionRunning.current = true;
        console.log('Speech recognition started');
      } catch (e) {
        console.error('Error starting speech recognition:', e);
      }
    }
  };

  // Speech recognition setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const transcript = event.results[i][0].transcript.trim().toLowerCase();
              console.log('Recognized:', transcript);

              if (transcript === 'snap') {
                captureImage(); // Call captureImage when "snap" is detected
              }
            }
          }
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended.');
          if (isRecognitionRunning.current && permissionsGranted) {
            startSpeechRecognition();
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error || event.message);
        };
      }

      if (permissionsGranted) {
        startSpeechRecognition();
      }
    }

    return () => {
      if (recognitionRef.current && isRecognitionRunning.current) {
        recognitionRef.current.stop();
        isRecognitionRunning.current = false;
        console.log('Speech recognition stopped');
      }
    };
  }, [captureImage, permissionsGranted]);

  return (
    <div>
      <h1>Camera and Voice Interface</h1>
      {capturedImage ? (
        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
      ) : stream ? (
        <div className="w-full h-full">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
        </div>
      ) : (
        <p>Camera not available</p>
      )}
      {/* Remove or comment out any code that displays aiResponse */}
      {/* {aiResponse ? (
        <p>AI Response: {aiResponse}</p>
      ) : (
        <p>Awaiting image analysis...</p>
      )} */}
    </div>
  );
}
