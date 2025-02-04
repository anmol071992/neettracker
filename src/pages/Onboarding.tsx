import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, Clock, Brain, Target, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

const EDUCATION_LEVELS = [
  '11th Grade',
  '12th Grade',
  'Drop Year',
  'Other'
];

const STUDY_HOURS = [
  { value: 4, label: '4 hours' },
  { value: 6, label: '6 hours' },
  { value: 8, label: '8 hours' },
  { value: 10, label: '10+ hours' }
];

const LEARNING_STYLES = [
  { id: 'visual', label: 'Visual Learning', description: 'Learn best through diagrams and illustrations' },
  { id: 'auditory', label: 'Auditory Learning', description: 'Learn best through lectures and discussions' },
  { id: 'reading', label: 'Reading/Writing', description: 'Learn best through reading and note-taking' },
  { id: 'kinesthetic', label: 'Hands-on Learning', description: 'Learn best through practical experiments' }
];

const IMPROVEMENT_AREAS = [
  { id: 'time_management', label: 'Time Management' },
  { id: 'concept_clarity', label: 'Concept Clarity' },
  { id: 'problem_solving', label: 'Problem Solving' },
  { id: 'exam_strategy', label: 'Exam Strategy' },
  { id: 'revision', label: 'Regular Revision' },
  { id: 'stress_management', label: 'Stress Management' }
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    educationLevel: '',
    studyHours: 6,
    learningStyle: '',
    improvementAreas: [] as string[],
    subjectPreferences: {
      physics: { confidence: 'medium' },
      chemistry: { confidence: 'medium' },
      biology: { confidence: 'medium' }
    }
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/login';
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImprovementAreaToggle = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      improvementAreas: prev.improvementAreas.includes(areaId)
        ? prev.improvementAreas.filter(id => id !== areaId)
        : [...prev.improvementAreas, areaId]
    }));
  };

  const handleConfidenceUpdate = (subject: string, level: 'low' | 'medium' | 'high') => {
    setFormData(prev => ({
      ...prev,
      subjectPreferences: {
        ...prev.subjectPreferences,
        [subject]: { ...prev.subjectPreferences[subject], confidence: level }
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          education_level: formData.educationLevel,
          study_hours_target: formData.studyHours,
          learning_style: formData.learningStyle,
          preferences: {
            improvement_areas: formData.improvementAreas,
            subject_preferences: formData.subjectPreferences
          }
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      window.location.href = '/';
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Education Background</h2>
            <div className="grid grid-cols-2 gap-4">
              {EDUCATION_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => updateFormData('educationLevel', level)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.educationLevel === level
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <span className="font-medium">{level}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Daily Study Goal</h2>
            <div className="grid grid-cols-2 gap-4">
              {STUDY_HOURS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateFormData('studyHours', value)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.studyHours === value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <Clock className="w-5 h-5 mb-2 text-gray-600" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Learning Style</h2>
            <div className="grid grid-cols-1 gap-4">
              {LEARNING_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => updateFormData('learningStyle', style.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.learningStyle === style.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <span className="font-medium">{style.label}</span>
                  <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Areas for Improvement</h2>
            <div className="grid grid-cols-2 gap-4">
              {IMPROVEMENT_AREAS.map(area => (
                <button
                  key={area.id}
                  onClick={() => handleImprovementAreaToggle(area.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.improvementAreas.includes(area.id)
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <span className="font-medium">{area.label}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">Select all that apply</p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Subject Confidence</h2>
            <div className="space-y-4">
              {Object.entries(formData.subjectPreferences).map(([subject, data]) => (
                <div key={subject} className="space-y-2">
                  <p className="font-medium capitalize">{subject}</p>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleConfidenceUpdate(subject, level as 'low' | 'medium' | 'high')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                          data.confidence === level
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.educationLevel;
      case 2: return !!formData.studyHours;
      case 3: return !!formData.learningStyle;
      case 4: return formData.improvementAreas.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <GraduationCap className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalize Your Journey</h1>
          <p className="text-gray-600">Help us customize your study experience</p>
        </div>
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stepNumber === step
                      ? 'bg-indigo-600 text-white'
                      : stepNumber < step
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-100 rounded-full">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {renderStep()}

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => step === 5 ? handleSubmit() : setStep(step + 1)}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : step === 5 ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}