import React from 'react';
import { TestScore } from '../types';
import { subjects } from '../data/subjects';
import { TrendingUp, TrendingDown, Target, Brain, Award } from 'lucide-react';

interface PerformanceOverviewProps {
  scores: TestScore[];
}

export function PerformanceOverview({ scores }: PerformanceOverviewProps) {
  const getOverallStats = () => {
    if (scores.length === 0) return { average: 0, trend: 'neutral' as const };

    const percentages = scores.map(test => {
      const totalScore = test.scores.reduce((acc, s) => acc + s.score, 0);
      const totalMarks = test.scores.reduce((acc, s) => acc + s.totalMarks, 0);
      return (totalScore / totalMarks) * 100;
    });

    const average = percentages.reduce((acc, p) => acc + p, 0) / percentages.length;
    const trend = percentages.length >= 2
      ? percentages[0] > percentages[1] ? 'up' as const : 'down' as const
      : 'neutral' as const;

    return { average, trend };
  };

  const getSubjectStats = () => {
    return subjects.map(subject => {
      const subjectScores = scores
        .flatMap(test => test.scores)
        .filter(score => score.subjectId === subject.id);

      if (subjectScores.length === 0) return { subject, average: 0 };

      const average = subjectScores.reduce((acc, score) => 
        acc + (score.score / score.totalMarks) * 100, 0
      ) / subjectScores.length;

      return { subject, average };
    });
  };

  const { average, trend } = getOverallStats();
  const subjectStats = getSubjectStats();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Performance */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <div className="flex items-center">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Overall Performance</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{average.toFixed(1)}%</p>
        </div>

        {/* Total Tests */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Tests</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{scores.length}</p>
        </div>

        {/* Recent Tests */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Recent Tests</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {scores.slice(0, 30).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>

        {/* Best Subject */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Best Subject</h3>
          {subjectStats.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subjectStats.reduce((best, curr) => 
                  curr.average > best.average ? curr : best
                ).subject.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {subjectStats.reduce((best, curr) => 
                  curr.average > best.average ? curr : best
                ).average.toFixed(1)}% average
              </p>
            </>
          ) : (
            <p className="text-lg font-medium text-gray-400 mt-1">No data yet</p>
          )}
        </div>
      </div>

      {/* Subject-wise Performance */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjectStats.map(({ subject, average }) => (
          <div key={subject.id} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${subject.color.replace('bg-', 'text-')}`}>
                  {subject.name}
                </span>
                <span className="text-sm text-gray-600">{average.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${subject.color}`}
                  style={{ width: `${average}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}