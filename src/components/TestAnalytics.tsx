import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TestScore } from '../types';
import { subjects } from '../data/subjects';
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TestAnalyticsProps {
  scores: TestScore[];
}

export function TestAnalytics({ scores }: TestAnalyticsProps) {
  const analytics = useMemo(() => {
    const subjectPerformance = subjects.reduce((acc, subject) => {
      const subjectScores = scores
        .map(test => test.scores.find(s => s.subjectId === subject.id))
        .filter((s): s is NonNullable<typeof s> => s !== undefined);

      const percentages = subjectScores.map(s => (s.score / s.totalMarks) * 100);
      const average = percentages.length > 0
        ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
        : 0;

      // Calculate trend based on last two scores
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (percentages.length >= 2) {
        trend = percentages[percentages.length - 1] > percentages[percentages.length - 2]
          ? 'up'
          : percentages[percentages.length - 1] < percentages[percentages.length - 2]
            ? 'down'
            : 'stable';
      }

      // Calculate chapter performance
      const chapterPerformance = subject.chapters.reduce((chapAcc, chapter) => {
        const chapterScores = subjectScores
          .filter(s => s.chapterScores)
          .map(s => s.chapterScores!.find(cs => cs.chapterId === chapter.id))
          .filter((cs): cs is NonNullable<typeof cs> => cs !== undefined);

        const chapterPercentages = chapterScores.map(cs => (cs.score / cs.totalMarks) * 100);
        const chapterAverage = chapterPercentages.length > 0
          ? chapterPercentages.reduce((sum, p) => sum + p, 0) / chapterPercentages.length
          : 0;

        chapAcc[chapter.id] = {
          average: chapterAverage,
          attempts: chapterScores.length
        };
        return chapAcc;
      }, {} as Record<string, { average: number; attempts: number }>);

      // Identify weak and strong chapters
      const chapterEntries = Object.entries(chapterPerformance);
      const weakChapters = chapterEntries
        .filter(([_, data]) => data.attempts > 0 && data.average < 60)
        .map(([id]) => id);
      const strongChapters = chapterEntries
        .filter(([_, data]) => data.attempts > 0 && data.average >= 80)
        .map(([id]) => id);

      acc[subject.id] = {
        average,
        trend,
        weakChapters,
        strongChapters,
        chapterPerformance
      };
      return acc;
    }, {} as Record<string, {
      average: number;
      trend: 'up' | 'down' | 'stable';
      weakChapters: string[];
      strongChapters: string[];
      chapterPerformance: Record<string, { average: number; attempts: number }>;
    }>);

    return {
      subjectPerformance,
      overallAverage: Object.values(subjectPerformance)
        .reduce((sum, { average }) => sum + average, 0) / subjects.length
    };
  }, [scores]);

  const trendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color.replace('bg-', '') || 'gray-500';
  };

  const performanceData = {
    labels: subjects.map(s => s.name),
    datasets: [
      {
        label: 'Average Performance',
        data: subjects.map(s => analytics.subjectPerformance[s.id].average),
        backgroundColor: subjects.map(s => `rgba(var(--${getSubjectColor(s.id)}), 0.2)`),
        borderColor: subjects.map(s => `rgb(var(--${getSubjectColor(s.id)}))`),
        borderWidth: 2,
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map(subject => {
            const performance = analytics.subjectPerformance[subject.id];
            return (
              <div
                key={subject.id}
                className={`p-4 rounded-lg bg-opacity-10 ${subject.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${subject.color.replace('bg-', 'text-')}`}>
                    {subject.name}
                  </h4>
                  {trendIcon(performance.trend)}
                </div>
                <p className="text-2xl font-bold">
                  {performance.average.toFixed(1)}%
                </p>
                {performance.weakChapters.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {performance.weakChapters.length} weak {performance.weakChapters.length === 1 ? 'chapter' : 'chapters'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Graph */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Subject-wise Performance</h3>
        <Bar
          data={performanceData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: value => `${value}%`
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }}
        />
      </div>

      {/* Chapter Performance */}
      {subjects.map(subject => {
        const performance = analytics.subjectPerformance[subject.id];
        const hasChapterData = Object.values(performance.chapterPerformance).some(c => c.attempts > 0);

        if (!hasChapterData) return null;

        return (
          <div key={subject.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className={`text-lg font-semibold mb-4 ${subject.color.replace('bg-', 'text-')}`}>
              {subject.name} - Chapter Performance
            </h3>
            <div className="space-y-3">
              {subject.chapters.map(chapter => {
                const chapterData = performance.chapterPerformance[chapter.id];
                if (chapterData.attempts === 0) return null;

                return (
                  <div key={chapter.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {chapter.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {chapterData.average.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${subject.color}`}
                          style={{ width: `${chapterData.average}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {chapterData.attempts} {chapterData.attempts === 1 ? 'test' : 'tests'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}