import React from 'react';
import { BookOpen, Video, PenTool, CheckCircle2 } from 'lucide-react';
import { Subject, Chapter } from '../types';

interface SubjectCardProps {
  subject: Subject;
  onToggleStatus: (subjectId: string, chapterId: string, field: keyof Chapter) => void;
  onIncrementRevision: (subjectId: string, chapterId: string) => void;
}

export function SubjectCard({ subject, onToggleStatus, onIncrementRevision }: SubjectCardProps) {
  const isChapterComplete = (chapter: Chapter) => {
    return chapter.isNCERTRead && chapter.isVideoWatched && chapter.isPracticeDone;
  };

  const canRevise = (chapter: Chapter) => {
    return isChapterComplete(chapter) && chapter.revisionCount < 5;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {subject.chapters.map((chapter, index) => (
        <div 
          key={chapter.id}
          className={`rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md ${
            isChapterComplete(chapter) 
              ? `${subject.color} bg-opacity-5` 
              : 'bg-white'
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${subject.color} bg-opacity-20 flex items-center justify-center text-sm font-medium ${subject.color.replace('bg-', 'text-')}`}>
                  {index + 1}
                </div>
                <h3 className="font-medium text-gray-900">{chapter.name}</h3>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 transition-colors duration-200 ${
                isChapterComplete(chapter) 
                  ? `${subject.color} bg-opacity-20 border-none` 
                  : 'border-gray-300'
              } flex items-center justify-center`}>
                {isChapterComplete(chapter) && (
                  <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => onToggleStatus(subject.id, chapter.id, 'isNCERTRead')}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  chapter.isNCERTRead 
                    ? `${subject.color} bg-opacity-10 ${subject.color.replace('bg-', 'text-')}` 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-medium">Theory</span>
                {chapter.isNCERTRead && (
                  <div className={`w-4 h-1 ${subject.color} mt-1 rounded-full`} />
                )}
              </button>

              <button
                onClick={() => onToggleStatus(subject.id, chapter.id, 'isVideoWatched')}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  chapter.isVideoWatched 
                    ? `${subject.color} bg-opacity-10 ${subject.color.replace('bg-', 'text-')}` 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-medium">Lecture</span>
                {chapter.isVideoWatched && (
                  <div className={`w-4 h-1 ${subject.color} mt-1 rounded-full`} />
                )}
              </button>

              <button
                onClick={() => onToggleStatus(subject.id, chapter.id, 'isPracticeDone')}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  chapter.isPracticeDone 
                    ? `${subject.color} bg-opacity-10 ${subject.color.replace('bg-', 'text-')}` 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-medium">Practice</span>
                {chapter.isPracticeDone && (
                  <div className={`w-4 h-1 ${subject.color} mt-1 rounded-full`} />
                )}
              </button>

              <button
                onClick={() => {
                  if (canRevise(chapter)) {
                    onIncrementRevision(subject.id, chapter.id);
                  }
                }}
                disabled={!canRevise(chapter)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  chapter.revisionCount > 0 
                    ? `${subject.color} bg-opacity-10 ${subject.color.replace('bg-', 'text-')}` 
                    : canRevise(chapter)
                    ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="text-xs font-medium">Revised</span>
                {chapter.revisionCount > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-4 h-1 ${subject.color} rounded-full`} />
                    <span className="text-xs">{chapter.revisionCount}/5</span>
                  </div>
                )}
              </button>
            </div>

            {isChapterComplete(chapter) && (
              <div className="mt-3 flex justify-end">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className={`w-4 h-4 ${subject.color.replace('bg-', 'text-')}`} />
                  <span className="text-xs text-gray-600">
                    {chapter.revisionCount === 5 
                      ? 'All revisions completed!' 
                      : `${chapter.revisionCount}/5 revisions done`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}