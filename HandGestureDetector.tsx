import React, { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

interface Landmark {
  x: number;
  y: number;
  z: number;
}

const HandGestureDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectedLetter, setDetectedLetter] = useState<string>('-');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Finger tip landmark indices (same as Python code)
  const tipIds = [4, 8, 12, 16, 20];

  const getFingerStates = (landmarks: Landmark[]): number[] => {
    const fingers: number[] = [];

    // Thumb (different logic for web camera - assuming right hand)
    if (landmarks[tipIds[0]].x < landmarks[tipIds[0] - 1].x) {
      fingers.push(1);
    } else {
      fingers.push(0);
    }

    // Other four fingers
    for (let id = 1; id < 5; id++) {
      if (landmarks[tipIds[id]].y < landmarks[tipIds[id] - 2].y) {
        fingers.push(1);
      } else {
        fingers.push(0);
      }
    }

    return fingers;
  };

  const classifyGesture = (fingers: number[]): string => {
    const fingerString = fingers.join('');
    
    switch (fingerString) {
      case '00000':
        return 'A';
      case '01111':
        return 'B';
      case '01000':
        return 'D';
      case '01100':
        return 'L';
      case '01110':
        return 'W';
      case '11111':
        return '5';
      default:
        return '-';
    }
  };

  const onResults = (results: Results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Draw hand landmarks and connections
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2
      });
      
      drawLandmarks(ctx, landmarks, {
        color: '#FF0000',
        lineWidth: 1,
        radius: 3
      });

      // Convert landmarks to our format
      const landmarkArray: Landmark[] = landmarks.map(landmark => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z
      }));

      // Get finger states and classify gesture
      const fingers = getFingerStates(landmarkArray);
      const letter = classifyGesture(fingers);
      setDetectedLetter(letter);
    } else {
      setDetectedLetter('-');
    }
  };

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        if (!videoRef.current) return;

        // Initialize MediaPipe Hands
        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });

        hands.onResults(onResults);

        // Initialize camera
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        await camera.start();
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing camera:', err);
        setError('Failed to initialize camera. Please ensure you have granted camera permissions.');
        setIsLoading(false);
      }
    };

    initializeCamera();
  }, []);

  if (error) {
    return (
      <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-8 text-center border border-red-500/20">
        <div className="text-red-400 text-lg font-semibold mb-2">Camera Error</div>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
      <div className="relative">
        {/* Video and Canvas Container */}
        <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            className="w-full h-auto max-w-full"
            autoPlay
            muted
            playsInline
            style={{ transform: 'scaleX(-1)' }} // Mirror the video
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: 'scaleX(-1)' }} // Mirror the canvas
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-lg">Loading camera...</div>
            </div>
          )}
        </div>

        {/* Detected Letter Display */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 shadow-lg">
            <div className="text-sm font-medium text-emerald-100 mb-2">Detected Letter</div>
            <div className="text-6xl font-bold text-white mb-2 transition-all duration-300">
              {detectedLetter}
            </div>
            {detectedLetter === '-' ? (
              <div className="text-emerald-200 text-sm">Show your hand to the camera</div>
            ) : (
              <div className="text-emerald-200 text-sm">Letter recognized!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandGestureDetector;