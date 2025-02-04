import React, { useState, useEffect } from 'react';
import { 
  Plus, X, Clock, Brain, Target, Lightbulb, AlertCircle, CheckCircle2, Calendar 
} from 'lucide-react';
import { subjects } from '../data/subjects';
import { StudyPlan, StudyTask } from '../types';
import {
  getStudySettings,
  saveStudySettings,
  getStudyTasks,
  addStudyTask,
  updateTaskStatus,
  deleteTask
} from '../lib/planner';

// Constants
const NEET_DATE = new Date('2025-05-04');
const THEORY_DEADLINE = new Date('2025-04-01');
const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
type TaskPriority = typeof TASK_PRIORITIES[number];

export function StudyPlanner() {
  // Plan state
  const [plan, setPlan] = useState<StudyPlan>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dailyHours: 6,
    tasks: []
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [showAutoConfig, setShowAutoConfig] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [selectedChapter, setSelectedChapter] = useState(subjects[0].chapters[0].id);
  const [taskType, setTaskType] = useState<'theory' | 'practice'>('theory');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDuration, setTaskDuration] = useState(2);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');

  // Timer states
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isBreak) {
        setPomodoroCount(prev => prev + 1);
        setTimeLeft(BREAK_DURATION);
        setIsBreak(true);
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
      } else {
        setTimeLeft(POMODORO_DURATION);
        setIsBreak(false);
      }
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, isBreak]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const settings = await getStudySettings();
      const tasks = await getStudyTasks();

      setPlan({
        startDate: settings.startDate,
        endDate: settings.endDate,
        dailyHours: settings.dailyHours,
        tasks
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load study plan');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAutoPlan = async () => {
    try {
      // Save study settings
      const settingsResult = await saveStudySettings({
        startDate: plan.startDate,
        endDate: plan.endDate,
        dailyHours: plan.dailyHours
      });

      if (!settingsResult.success) {
        throw new Error('Failed to save study settings');
      }

      // Generate and save tasks
      const start = new Date(plan.startDate);
      const theoryEnd = new Date(Math.min(THEORY_DEADLINE.getTime(), new Date(plan.endDate).getTime()));
      const practiceEnd = new Date(plan.endDate);
      
      const theoryDays = Math.ceil((theoryEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const practiceDays = Math.ceil((practiceEnd.getTime() - theoryEnd.getTime()) / (1000 * 60 * 60 * 24));

      for (const subject of subjects) {
        for (const chapter of subject.chapters) {
          // Theory task
          const theoryDate = new Date(start.getTime() + Math.random() * theoryDays * 24 * 60 * 60 * 1000);
          const theoryTask = {
            subjectId: subject.id,
            chapterId: chapter.id,
            date: theoryDate.toISOString().split('T')[0],
            duration: 2,
            isCompleted: false,
            priority: 'high' as TaskPriority,
            type: 'theory' as const
          };
          
          await addStudyTask(theoryTask);

          // Practice task
          const practiceDate = new Date(theoryEnd.getTime() + Math.random() * practiceDays * 24 * 60 * 60 * 1000);
          const practiceTask = {
            subjectId: subject.id,
            chapterId: chapter.id,
            date: practiceDate.toISOString().split('T')[0],
            duration: 3,
            isCompleted: false,
            priority: 'high' as TaskPriority,
            type: 'practice' as const
          };

          await addStudyTask(practiceTask);
        }
      }

      setShowAutoConfig(false);
      loadData();
    } catch (error) {
      console.error('Error generating auto plan:', error);
      setError('Failed to generate study plan');
    }
  };

  const addManualTask = async () => {
    try {
      const result = await addStudyTask({
        subjectId: selectedSubject,
        chapterId: selectedChapter,
        date: taskDate,
        duration: taskDuration,
        isCompleted: false,
        priority: taskPriority,
        type: taskType
      });

      if (!result.success) {
        throw result.error;
      }

      setShowManualForm(false);
      loadData();
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task');
    }
  };

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    try {
      const result = await updateTaskStatus(taskId, isCompleted);
      if (!result.success) {
        throw result.error;
      }
      loadData();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const getChapterName = (subjectId: string, chapterId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    const chapter = subject?.chapters.find(c => c.id === chapterId);
    return chapter?.name || '';
  };

  const getSubjectColor = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.color || 'bg-gray-500';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = plan.tasks.filter(
    task => task.date.split('T')[0] === today
  );

  return (
    <div className={`space-y-6 ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* Pomodoro Timer */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Study Timer</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Streak: {currentStreak} days</span>
            </div>
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                isFocusMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Focus Mode
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold mb-4">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-4 py-2 rounded-lg font-medium ${
                isTimerRunning
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {isTimerRunning ? 'Pause' : 'Start'} {isBreak ? 'Break' : 'Focus'}
            </button>
            <button
              onClick={() => {
                setTimeLeft(POMODORO_DURATION);
                setIsBreak(false);
                setIsTimerRunning(false);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
            >
              Reset
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Completed Pomodoros: {pomodoroCount}</span>
          </div>
        </div>
      </div>

      {/* Plan Configuration */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Study Schedule</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAutoConfig(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Brain className="w-4 h-4 mr-2" />
              Auto Schedule
            </button>
            <button
              onClick={() => setShowManualForm(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </button>
          </div>
        </div>

        {/* Auto Schedule Configuration Modal */}
        {showAutoConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Auto Schedule Configuration</h4>
                <button onClick={() => setShowAutoConfig(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={plan.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPlan(prev => ({ ...prev, startDate: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={plan.endDate}
                    min={plan.startDate}
                    max={NEET_DATE.toISOString().split('T')[0]}
                    onChange={(e) => setPlan(prev => ({ ...prev, endDate: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Daily Study Hours</label>
                  <input
                    type="number"
                    value={plan.dailyHours}
                    min={1}
                    max={12}
                    onChange={(e) => setPlan(prev => ({ ...prev, dailyHours: Math.max(1, Math.min(12, parseInt(e.target.value) || 1)) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="pt-4">
                  <button
                    onClick={generateAutoPlan}
                    disabled={!plan.endDate || plan.endDate < plan.startDate}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Task Form Modal */}
        {showManualForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Add Study Task</h4>
                <button onClick={() => setShowManualForm(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedChapter(subjects.find(s => s.id === e.target.value)?.chapters[0].id || '');
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chapter</label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {subjects
                      .find(s => s.id === selectedSubject)
                      ?.chapters.map(chapter => (
                        <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <div className="mt-1 flex gap-2">
                    <button
                      onClick={() => setTaskType('theory')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                        taskType === 'theory'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Theory
                    </button>
                    <button
                      onClick={() => setTaskType('practice')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                        taskType === 'practice'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Practice
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-1 flex gap-2">
                    {TASK_PRIORITIES.map(priority => (
                      <button
                        key={priority}
                        onClick={() => setTaskPriority(priority)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                          taskPriority === priority
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={taskDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
                  <input
                    type="number"
                    value={taskDuration}
                    min={1}
                    max={8}
                    onChange={(e) => setTaskDuration(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="pt-4">
                  <button
                    onClick={addManualTask}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Study Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Study Tips</h4>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Complete theory portions by April 1st, 2025</li>
                <li>• Focus on practice and revision after theory completion</li>
                <li>• Take regular breaks to maintain productivity</li>
                <li>• Review difficult topics more frequently</li>
                <li>• Use the Pomodoro timer for focused study sessions</li>
                <li>• Maintain your study streak for consistent progress</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Today's Tasks</h4>
          {todaysTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {todaysTasks.map(task => {
                const subject = subjects.find(s => s.id === task.subjectId);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border ${
                      task.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.type === 'theory' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {task.type === 'theory' ? 'Theory' : 'Practice'}
                          </span>
                          <h4 className={`font-medium ${subject?.color.replace('bg-', 'text-')}`}>
                            {subject?.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {getChapterName(task.subjectId, task.chapterId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {task.duration}h
                        </span>
                        <button
                          onClick={() => toggleTaskCompletion(task.id, !task.isCompleted)}
                          className={`p-2 rounded-full ${
                            task.isCompleted
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-4">Upcoming Tasks</h4>
          <div className="space-y-3">
            {plan.tasks
              .filter(task => task.date.split('T')[0] > today)
              .slice(0, 5)
              .map(task => {
                const subject = subjects.find(s => s.id === task.subjectId);
                return (
                  <div key={task.id} className="p-4 rounded-lg border border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.type === 'theory' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {task.type === 'theory' ? 'Theory' : 'Practice'}
                          </span>
                          <h4 className={`font-medium ${subject?.color.replace('bg-', 'text-')}`}>
                            {subject?.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {getChapterName(task.subjectId, task.chapterId)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(task.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {task.duration}h
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}