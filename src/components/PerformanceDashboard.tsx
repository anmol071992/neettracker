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
  Filler,
  RadialLinearScale,
  ArcElement
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { TestScore, Subject } from '../types';
import { subjects } from '../data/subjects';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Star,
  AlertCircle,
  CheckCircle,
  Brain,
  Zap,
  Trophy
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceDashboardProps {
  scores: TestScore[];
  subjects: Subject[];
}

export function PerformanceDashboard({ scores, subjects }: PerformanceDashboardProps) {
  const analytics = useMemo(() => {
    // Group scores by month
    const monthlyScores = scores.reduce((acc, score) => {
      const month = new Date(score.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(score);
      return acc;
    }, {} as Record<string, TestScore[]>);

    // Calculate subject-wise performance
    const subjectPerformance = subjects.reduce((acc, subject) => {
      const subjectScores = scores
        .flatMap(test => test.scores)
        .filter(s => s.subjectId === subject.id);

      const percentages = subjectScores.map(s => (s.score / s.totalMarks) * 100);
      const average = percentages.length > 0
        ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
        : 0;

      // Calculate trend
      const trend = percentages.length >= 2
        ? percentages[percentages.length - 1] > percentages[percentages.length - 2]
          ? 'up'
          : 'down'
        : 'stable';

      // Calculate chapter performance
      const chapterPerformance = subject.chapters.reduce((chapAcc, chapter) => {
        const chapterScores = subjectScores
          .filter(s => s.chapterScores)
          .flatMap(s => s.chapterScores!)
          .filter(cs => cs.chapterId === chapter.id);

        const chapterAverage = chapterScores.length > 0
          ? chapterScores.reduce((sum, cs) => sum + (cs.score / cs.totalMarks) * 100, 0) / chapterScores.length
          : 0;

        chapAcc[chapter.id] = {
          average: chapterAverage,
          attempts: chapterScores.length,
          name: chapter.name
        };
        return chapAcc;
      }, {} as Record<string, { average: number; attempts: number; name: string }>);

      acc[subject.id] = { average, trend, chapterPerformance };
      return acc;
    }, {} as Record<string, {
      average: number;
      trend: 'up' | 'down' | 'stable';
      chapterPerformance: Record<string, { average: number; attempts: number; name: string }>;
    }>);

    return {
      monthlyScores,
      subjectPerformance,
      overallAverage: Object.values(subjectPerformance)
        .reduce((sum, { average }) => sum + average, 0) / subjects.length,
      totalTests: scores.length,
      recentImprovement: scores.length >= 2
        ? ((getTotalPercentage(scores[0]) - getTotalPercentage(scores[1])) / getTotalPercentage(scores[1])) * 100
        : 0
    };
  }, [scores, subjects]);

  const getTotalPercentage = (score: TestScore) => {
    const total = score.scores.reduce((acc, s) => acc + s.score, 0);
    const maxTotal = score.scores.reduce((acc, s) => acc + s.totalMarks, 0);
    return (total / maxTotal) * 100;
  };

  const getMotivationalMessage = (improvement: number) => {
    if (improvement > 10) return "Outstanding progress! Keep up the excellent work!";
    if (improvement > 5) return "Good improvement! You're on the right track!";
    if (improvement > 0) return "Steady progress! Keep pushing forward!";
    if (improvement === 0) return "Maintain consistency and keep practicing!";
    return "Don't give up! Every challenge is an opportunity to grow!";
  };

  const performanceData = {
    labels: Object.keys(analytics.monthlyScores),
    datasets: subjects.map(subject => ({
      label: subject.name,
      data: Object.values(analytics.monthlyScores).map(monthScores => {
        const subjectScores = monthScores
          .flatMap(score => score.scores)
          .filter(s => s.subjectId === subject.id);
        return subjectScores.length > 0
          ? subjectScores.reduce((acc, s) => acc + (s.score / s.totalMarks) * 100, 0) / subjectScores.length
          : null;
      }),
      borderColor: `rgb(var(--${subject.color.replace('bg-', '')}))`,
      backgroundColor: `rgba(var(--${subject.color.replace('bg-', '')}), 0.1)`,
      fill: true,
      tension: 0.4
    }))
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span className="text-sm text-gray-500">Overall Average</span>
          </div>
          <div className="text-2xl font-bold">{analytics.overallAverage.toFixed(1)}%</div>
          <div className="mt-2 text-sm text-gray-600">Across all subjects</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500">Total Tests</span>
          </div>
          <div className="text-2xl font-bold">{analytics.totalTests}</div>
          <div className="mt-2 text-sm text-gray-600">Tests completed</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-gray-500">Recent Progress</span>
          </div>
          <div className="text-2xl font-bold flex items-center">
            {analytics.recentImprovement > 0 ? (
              <>
                <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                +{analytics.recentImprovement.toFixed(1)}%
              </>
            ) : analytics.recentImprovement < 0 ? (
              <>
                <TrendingDown className="w-6 h-6 text-red-500 mr-2" />
                {analytics.recentImprovement.toFixed(1)}%
              </>
            ) : (
              "No change"
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">Since last test</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-indigo-500" />
            <span className="text-sm text-gray-500">Achievement</span>
          </div>
          <div className="text-2xl font-bold">
            {analytics.overallAverage >= 90 ? 'Excellent' :
             analytics.overallAverage >= 80 ? 'Very Good' :
             analytics.overallAverage >= 70 ? 'Good' :
             analytics.overallAverage >= 60 ? 'Fair' : 'Needs Work'}
          </div>
          <div className="mt-2 text-sm text-gray-600">Performance level</div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
        <Line
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
                position: 'top' as const
              }
            }
          }}
        />
      </div>

      {/* Subject-wise Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {subjects.map(subject => {
          const performance = analytics.subjectPerformance[subject.id];
          const topChapters = Object.entries(performance.chapterPerformance)
            .filter(([_, data]) => data.attempts > 0)
            .sort((a, b) => b[1].average - a[1].average)
            .slice(0, 3);
          
          const weakChapters = Object.entries(performance.chapterPerformance)
            .filter(([_, data]) => data.attempts > 0)
            .sort((a, b) => a[1].average - b[1].average)
            .slice(0, 3);

          return (
            <div key={subject.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${subject.color.replace('bg-', 'text-')}`}>
                  {subject.name}
                </h3>
                {performance.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : performance.trend === 'down' ? (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                ) : null}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Performance</span>
                  <span className="text-lg font-bold">{performance.average.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${subject.color}`}
                    style={{ width: `${performance.average}%` }}
                  />
                </div>
              </div>

              {topChapters.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Strong Chapters</span>
                  </div>
                  <div className="space-y-2">
                    {topChapters.map(([id, data]) => (
                      <div key={id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{data.name}</span>
                        <span className="text-sm font-medium">{data.average.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {weakChapters.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Needs Improvement</span>
                  </div>
                  <div className="space-y-2">
                    {weakChapters.map(([id, data]) => (
                      <div key={id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{data.name}</span>
                        <span className="text-sm font-medium">{data.average.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-8 text-white">
        <div className="flex items-center gap-4">
          <Zap className="w-8 h-8" />
          <div>
            <h3 className="text-lg font-semibold mb-1">Performance Insight</h3>
            <p className="opacity-90">{getMotivationalMessage(analytics.recentImprovement)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}