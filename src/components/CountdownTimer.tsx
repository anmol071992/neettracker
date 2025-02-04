import React, { useState, useEffect } from 'react';
import { Timer, Brain, Trophy, Star } from 'lucide-react';

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-05-04T00:00:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">NEET 2025 Countdown</h2>
        </div>
        <Trophy className="w-6 h-6 text-yellow-300" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Days', value: timeLeft.days, icon: Star },
          { label: 'Hours', value: timeLeft.hours, icon: Brain },
          { label: 'Minutes', value: timeLeft.minutes, icon: Timer },
          { label: 'Seconds', value: timeLeft.seconds, icon: Star }
        ].map((item, index) => (
          <div
            key={item.label}
            className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm transform hover:scale-105 transition-transform duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white opacity-80">{item.label}</span>
              <item.icon className="w-4 h-4 text-white opacity-60" />
            </div>
            <div className="text-2xl font-bold text-white">
              {String(item.value).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 rounded-full px-4 py-2">
          <Brain className="w-4 h-4 text-white" />
          <p className="text-sm text-white font-medium">
            Every second counts! Keep pushing forward.
          </p>
        </div>
      </div>
    </div>
  );
}