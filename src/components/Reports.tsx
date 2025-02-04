import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Subject } from '../types';
import { Brain, Target, Trophy } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReportsProps {
  subjects: Subject[];
}

export function Reports({ subjects }: ReportsProps) {
  const getSubjectProgress = (subject: Subject) => {
    const totalTasks = subject.chapters.length * 3;
    const completedTasks = subject.chapters.reduce((acc, chapter) => {
      return acc + (chapter.isNCERTRead ? 1 : 0) +
                  (chapter.isVideoWatched ? 1 : 0) +
                  (chapter.isPracticeDone ? 1 : 0);
    }, 0);
    return (completedTasks / totalTasks) * 100;
  };

  const getActivityProgress = (type: 'theory' | 'lecture' | 'practice') => {
    const field = type === 'theory' ? 'isNCERTRead' : 
                 type === 'lecture' ? 'isVideoWatched' : 'isPracticeDone';
    
    return subjects.map(subject => {
      const completed = subject.chapters.filter(chapter => chapter[field]).length;
      return (completed / subject.chapters.length) * 100;
    });
  };

  const subjectProgressData = {
    labels: subjects.map(s => s.name),
    datasets: [
      {
        label: 'Overall Progress',
        data: subjects.map(getSubjectProgress),
        backgroundColor: subjects.map(s => s.color.replace('bg-', 'rgba(') + ', 0.7)'),
        borderColor: subjects.map(s => s.color.replace('bg-', 'rgb(') + ')'),
        borderWidth: 1,
      },
    ],
  };

  const activityProgressData = {
    labels: subjects.map(s => s.name),
    datasets: [
      {
        label: 'Theory',
        data: getActivityProgress('theory'),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Lecture',
        data: getActivityProgress('lecture'),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
      },
      {
        label: 'Practice',
        data: getActivityProgress('practice'),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const totalProgress = subjects.reduce((acc, subject) => acc + getSubjectProgress(subject), 0) / subjects.length;

  const quotes = [
    "Success in NEET is not just about intelligence, it's about persistence and determination.",
    "Every hour of focused study brings you closer to your dream of becoming a doctor.",
    "The pain of studying is temporary, but the pride of becoming a doctor is forever.",
    "Your future patients are waiting for you. Keep pushing forward.",
    "Medicine is not just a career, it's a calling. Stay committed to your goal."
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Overall Progress</h2>
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Theory</p>
                <h3 className="text-2xl font-bold text-blue-700">
                  {Math.round(getActivityProgress('theory').reduce((a, b) => a + b) / subjects.length)}%
                </h3>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Lecture</p>
                <h3 className="text-2xl font-bold text-purple-700">
                  {Math.round(getActivityProgress('lecture').reduce((a, b) => a + b) / subjects.length)}%
                </h3>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Practice</p>
                <h3 className="text-2xl font-bold text-green-700">
                  {Math.round(getActivityProgress('practice').reduce((a, b) => a + b) / subjects.length)}%
                </h3>
              </div>
              <Brain className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Progress Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Subject-wise Progress</h2>
        <Bar
          data={subjectProgressData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      </div>

      {/* Activity Progress Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Activity-wise Progress</h2>
        <Bar
          data={activityProgressData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          }}
        />
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg font-medium italic">"{randomQuote}"</p>
          <div className="mt-4 text-sm opacity-80">
            Keep going! You're {Math.round(totalProgress)}% closer to your NEET goal.
          </div>
        </div>
      </div>
    </div>
  );
}