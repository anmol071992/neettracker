import React from 'react';
import { TestScore } from '../types';
import { subjects } from '../data/subjects';
import { BookOpen, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface TestScoreListProps {
  scores: TestScore[];
}

export function TestScoreList({ scores }: TestScoreListProps) {
  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown';
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTotalScore = (scores: TestScore['scores']) => {
    return scores.reduce((acc, curr) => ({
      score: acc.score + curr.score,
      total: acc.total + curr.totalMarks
    }), { score: 0, total: 0 });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Recent Test Scores</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {scores.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No test scores recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first test score to start tracking your progress</p>
          </div>
        ) : (
          scores.map((test) => (
            <div key={test.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      test.type === 'full' 
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {test.type === 'full' ? 'Full Test' : 'Subject Test'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(test.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {test.type === 'full' ? (
                    <div>
                      {test.scores.map(score => (
                        <p key={score.subjectId} className={`text-sm ${getScoreColor(score.score, score.totalMarks)}`}>
                          {getSubjectName(score.subjectId)}: {score.score}/{score.totalMarks}
                        </p>
                      ))}
                      <div className="mt-1 pt-1 border-t">
                        {(() => {
                          const { score, total } = getTotalScore(test.scores);
                          return (
                            <p className={`font-bold ${getScoreColor(score, total)}`}>
                              Total: {score}/{total}
                              <span className="text-sm ml-1">
                                ({((score / total) * 100).toFixed(1)}%)
                              </span>
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {test.scores.map(score => {
                        const percentage = (score.score / score.totalMarks) * 100;
                        return (
                          <div key={score.subjectId}>
                            <p className={`font-bold ${getScoreColor(score.score, score.totalMarks)}`}>
                              {score.score}/{score.totalMarks}
                              <span className="text-sm ml-1">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </p>
                            {score.chapterScores && score.chapterScores.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {score.chapterScores.map(chapter => {
                                  const chapterPercentage = (chapter.score / chapter.totalMarks) * 100;
                                  return (
                                    <div key={chapter.chapterId} className="flex items-center justify-end gap-2">
                                      <span className="text-xs text-gray-500">
                                        {subjects
                                          .find(s => s.id === score.subjectId)
                                          ?.chapters.find(c => c.id === chapter.chapterId)
                                          ?.name}:
                                      </span>
                                      <span className={`text-xs ${getScoreColor(chapter.score, chapter.totalMarks)}`}>
                                        {chapter.score}/{chapter.totalMarks}
                                        <span className="ml-1">
                                          ({chapterPercentage.toFixed(1)}%)
                                        </span>
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              {test.remarks && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                  {test.remarks}
                </div>
              )}
              {test.weakAreas && test.weakAreas.length > 0 && (
                <div className="mt-2 flex items-start gap-1 text-red-600">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <p className="text-sm">
                    Areas to improve: {test.weakAreas.join(', ')}
                  </p>
                </div>
              )}
              {test.strongAreas && test.strongAreas.length > 0 && (
                <div className="mt-1 flex items-start gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4 mt-0.5" />
                  <p className="text-sm">
                    Strong areas: {test.strongAreas.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}