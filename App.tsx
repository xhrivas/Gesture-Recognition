import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import HandGestureDetector from './components/HandGestureDetector';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-emerald-500 p-3 rounded-full mr-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">ASL Gesture Recognition</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Show your hand gestures to the camera and see them translated to letters in real-time
          </p>
        </div>
        
        <HandGestureDetector />
        
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Supported Gestures:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { letter: 'A', fingers: '00000', desc: 'Closed fist' },
              { letter: 'B', fingers: '01111', desc: 'Four fingers up' },
              { letter: 'D', fingers: '01000', desc: 'Index finger up' },
              { letter: 'L', fingers: '01100', desc: 'L shape' },
              { letter: 'W', fingers: '01110', desc: 'Three fingers up' },
              { letter: '5', fingers: '11111', desc: 'All fingers up' }
            ].map(({ letter, desc }) => (
              <div key={letter} className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-2">{letter}</div>
                <div className="text-sm text-gray-300">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;