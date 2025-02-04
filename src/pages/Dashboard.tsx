import React, { useState, useEffect, useCallback } from 'react';
import { GraduationCap, BookOpen, Calendar, BarChart3, FileText, AlertCircle, Loader2, Brain } from 'lucide-react';
import { subjects as initialSubjects } from '../data/subjects';
import { SubjectCard } from '../components/SubjectCard';
import { TestScoreForm } from '../components/TestScoreForm';
import { TestScoreList } from '../components/TestScoreList';
import { TestAnalytics } from '../components/TestAnalytics';
import { PerformanceOverview } from '../components/PerformanceOverview';
import { StudyPlanner } from '../components/StudyPlanner';
import { Reports } from '../components/Reports';
import { CountdownTimer } from '../components/CountdownTimer';
import { Subject, Chapter, TestScore, TestScoreFormData } from '../types';
import { signOut, getCurrentUser } from '../lib/auth';
import {
  getChapterProgress,
  updateChapterProgress,
  getTestScores,
  addTestScore,
  subscribeToProgress,
  subscribeToTestScores
} from '../lib/api';

const loadingQuotes = [
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "Your NEET journey is shaping your future in medicine. Every moment counts.",
    author: "NEET Tracker"
  },
  {
    quote: "The pain of studying is temporary, but the pride of becoming a doctor is forever.",
    author: "NEET Tracker"
  },
  {
    quote: "Your future patients are waiting for you. Keep pushing forward.",
    author: "NEET Tracker"
  },
  {
    quote: "Medicine is not just a career, it's a calling. Stay committed to your goal.",
    author: "NEET Tracker"
  }
];

export function Dashboard() {
  const [userName, setUserName] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [testScores, setTestScores] = useState<TestScore[]>([]);
  const [activeTab, setActiveTab] = useState<'progress' | 'tests' | 'planner' | 'reports'>('progress');
  const [selectedSubject, setSelectedSubject] = useState<'physics' | 'chemistry' | 'biology'>('physics');
  const [loadingStates, setLoadingStates] = useState({
    progress: true,
    scores: true,
    error: null as string | null
  });

  useEffect(() => {
    const loadUserData = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserName(user.full_name);
      }
    };
    loadUserData();
  }, []);

  const updateSubjectsWithProgress = useCallback((progress: any[]) => {
    setSubjects(prev => prev.map(subject => ({
      ...subject,
      chapters: subject.chapters.map(chapter => {
        const chapterProgress = progress.find(p =>
          p.subject_id === subject.id && p.chapter_id === chapter.id
        );
        return chapterProgress ? {
          ...chapter,
          isNCERTRead: chapterProgress.is_ncert_read || false,
          isVideoWatched: chapterProgress.is_video_watched || false,
          isPracticeDone: chapterProgress.is_practice_done || false,
          revisionCount: chapterProgress.revision_count || 0
        } : chapter;
      })
    })));
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const result = await getChapterProgress();
        if (result.success && result.data) {
          updateSubjectsWithProgress(result.data);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
        setLoadingStates(prev => ({ ...prev, error: 'Failed to load progress' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, progress: false }));
      }
    };

    const loadScores = async () => {
      try {
        const result = await getTestScores();
        if (result.success) {
          setTestScores(result.scores);
        }
      } catch (error) {
        console.error('Error loading scores:', error);
        setLoadingStates(prev => ({ ...prev, error: 'Failed to load test scores' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, scores: false }));
      }
    };

    loadProgress();
    loadScores();
  }, [updateSubjectsWithProgress]);

  useEffect(() => {
    let progressSubscription: { unsubscribe: () => void } | null = null;
    let scoresSubscription: { unsubscribe: () => void } | null = null;

    const setupSubscriptions = async () => {
      try {
        progressSubscription = await subscribeToProgress((payload) => {
          if (payload.new) {
            updateSubjectsWithProgress([payload.new]);
          }
        });

        scoresSubscription = await subscribeToTestScores((payload) => {
          if (payload.eventType === 'INSERT') {
            setTestScores(prev => [payload.new, ...prev]);
          }
        });
      } catch (error) {
        console.error('Error setting up subscriptions:', error);
      }
    };

    setupSubscriptions();

    return () => {
      progressSubscription?.unsubscribe();
      scoresSubscription?.unsubscribe();
    };
  }, [updateSubjectsWithProgress]);

  const handleToggleStatus = async (subjectId: string, chapterId: string, field: keyof Chapter) => {
    const chapter = subjects
      .find(s => s.id === subjectId)
      ?.chapters.find(c => c.id === chapterId);
    
    if (!chapter) return;

    setSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          chapters: subject.chapters.map(ch => {
            if (ch.id === chapterId) {
              return { ...ch, [field]: !ch[field] };
            }
            return ch;
          })
        };
      }
      return subject;
    }));

    const result = await updateChapterProgress(
      subjectId,
      chapterId,
      field,
      !chapter[field]
    );

    if (!result.success) {
      setSubjects(prev => prev.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            chapters: subject.chapters.map(ch => {
              if (ch.id === chapterId) {
                return { ...ch, [field]: chapter[field] };
              }
              return ch;
            })
          };
        }
        return subject;
      }));
    }
  };

  const handleIncrementRevision = async (subjectId: string, chapterId: string) => {
    const chapter = subjects
      .find(s => s.id === subjectId)
      ?.chapters.find(c => c.id === chapterId);
    
    if (!chapter) return;

    setSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          chapters: subject.chapters.map(ch => {
            if (ch.id === chapterId) {
              return { ...ch, revisionCount: ch.revisionCount + 1 };
            }
            return ch;
          })
        };
      }
      return subject;
    }));

    const result = await updateChapterProgress(
      subjectId,
      chapterId,
      'revisionCount',
      chapter.revisionCount + 1
    );

    if (!result.success) {
      setSubjects(prev => prev.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            chapters: subject.chapters.map(ch => {
              if (ch.id === chapterId) {
                return { ...ch, revisionCount: chapter.revisionCount };
              }
              return ch;
            })
          };
        }
        return subject;
      }));
    }
  };

  const handleAddTestScore = async (data: TestScoreFormData) => {
    const newScore = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...data
    };
    setTestScores(prev => [newScore, ...prev]);

    const result = await addTestScore(data);
    if (!result.success) {
      setTestScores(prev => prev.filter(score => score.id !== newScore.id));
    }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      window.location.href = '/login';
    }
  };

  if (loadingStates.progress && loadingStates.scores) {
    const randomQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-6 animate-pulse" />
            <blockquote className="text-xl font-medium text-gray-900 mb-4">
              "{randomQuote.quote}"
            </blockquote>
            <cite className="text-sm text-gray-600 block">— {randomQuote.author}</cite>
          </div>
          <div className="flex justify-center">
            <div className="bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-sm text-indigo-600">Loading your progress...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingStates.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="max-w-lg w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{loadingStates.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                <h1 className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  NCERT Nichod
                </h1>
              </div>
              <div className="hidden md:block">
                <span className="text-gray-600">Welcome,</span>
                <span className="ml-1 font-semibold text-indigo-700">Dr. {userName}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="hidden md:inline">Your Path to NEET Success</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-20">
        {activeTab === 'progress' && (
          <div>
            <CountdownTimer />
            <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
              {['physics', 'chemistry', 'biology'].map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject as typeof selectedSubject)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    selectedSubject === subject
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </button>
              ))}
            </div>
            <SubjectCard
              subject={subjects.find(s => s.id === selectedSubject)!}
              onToggleStatus={handleToggleStatus}
              onIncrementRevision={handleIncrementRevision}
            />
          </div>
        )}
        
        {activeTab === 'tests' && (
          <div className="space-y-6">
            <PerformanceOverview scores={testScores} />
            <TestScoreForm onSubmit={handleAddTestScore} />
            <TestAnalytics scores={testScores} />
            <TestScoreList scores={testScores} />
          </div>
        )}

        {activeTab === 'planner' && <StudyPlanner />}
        {activeTab === 'reports' && <Reports subjects={subjects} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around py-3">
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex flex-col items-center ${
                activeTab === 'progress' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-xs mt-1">Progress</span>
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex flex-col items-center ${
                activeTab === 'tests' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <FileText className="w-6 h-6" />
              <span className="text-xs mt-1">Tests</span>
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex flex-col items-center ${
                activeTab === 'planner' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-xs mt-1">Planner</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center ${
                activeTab === 'reports' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs mt-1">Reports</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}