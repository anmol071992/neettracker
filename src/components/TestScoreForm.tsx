import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TestScoreFormData } from '../types';
import { subjects } from '../data/subjects';

interface TestScoreFormProps {
  onSubmit: (data: TestScoreFormData) => void;
}

export function TestScoreForm({ onSubmit }: TestScoreFormProps) {
  const [formData, setFormData] = useState<TestScoreFormData>({
    type: 'subject',
    scores: [],
  });

  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [selectedChapter, setSelectedChapter] = useState(subjects[0].chapters[0].id);

  const getMaxMarks = (subjectId: string) => {
    return subjectId === 'biology' ? 360 : 180;
  };

  const handleSubjectScoreChange = (subjectId: string, score: number) => {
    const maxMarks = getMaxMarks(subjectId);
    const validScore = Math.min(Math.max(0, score), maxMarks);

    setFormData(prev => ({
      ...prev,
      scores: [
        ...prev.scores.filter(s => s.subjectId !== subjectId),
        { 
          subjectId, 
          score: validScore, 
          totalMarks: maxMarks,
          chapterScores: selectedChapter ? [
            { 
              chapterId: selectedChapter, 
              score: validScore, 
              totalMarks: maxMarks 
            }
          ] : undefined
        }
      ]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === 'full' && formData.scores.length !== 3) {
      alert('Please enter scores for all subjects');
      return;
    }
    onSubmit(formData);
    setFormData({ type: 'subject', scores: [] });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-6">Add Test Score</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'subject' }))}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                formData.type === 'subject'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Subject Test
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'full' }))}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                formData.type === 'full'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Full Test
            </button>
          </div>
        </div>

        {formData.type === 'subject' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  const newSubject = e.target.value;
                  setSelectedSubject(newSubject);
                  setSelectedChapter(subjects.find(s => s.id === newSubject)?.chapters[0].id || '');
                }}
                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {subjects
                  .find(s => s.id === selectedSubject)
                  ?.chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
          <div className="space-y-4">
            {formData.type === 'full' ? (
              subjects.map(subject => (
                <div key={subject.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {subject.name}
                    </label>
                    <input
                      type="number"
                      value={formData.scores.find(s => s.subjectId === subject.id)?.score || ''}
                      onChange={(e) => handleSubjectScoreChange(subject.id, parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder={`Max: ${getMaxMarks(subject.id)}`}
                      min="0"
                      max={getMaxMarks(subject.id)}
                      required
                    />
                  </div>
                  <div className="text-sm text-gray-500 mt-6">
                    / {getMaxMarks(subject.id)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={formData.scores.find(s => s.subjectId === selectedSubject)?.score || ''}
                    onChange={(e) => handleSubjectScoreChange(selectedSubject, parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder={`Max: ${getMaxMarks(selectedSubject)}`}
                    min="0"
                    max={getMaxMarks(selectedSubject)}
                    required
                  />
                </div>
                <div className="text-sm text-gray-500">
                  / {getMaxMarks(selectedSubject)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
          <textarea
            value={formData.remarks || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            placeholder="Add any remarks about the test..."
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Test Score
        </button>
      </div>
    </form>
  );
}