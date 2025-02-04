import React, { useState, useRef } from 'react';
import { 
  BookOpen, Plus, Trash2, RotateCcw, Calendar, Clock, 
  Image as ImageIcon, CheckCircle2, Tag, AlertCircle
} from 'lucide-react';
import { subjects } from '../data/subjects';
import { Mistake } from '../types';

export function MistakeBook() {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [selectedChapter, setSelectedChapter] = useState(subjects[0].chapters[0].id);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [showMistakeForm, setShowMistakeForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'revised'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  
  // Form state
  const [mistakeContent, setMistakeContent] = useState('');
  const [mistakePriority, setMistakePriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [solution, setSolution] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // File inputs
  const mistakeImageInput = useRef<HTMLInputElement>(null);
  const solutionImageInput = useRef<HTMLInputElement>(null);
  const [mistakeImagePreview, setMistakeImagePreview] = useState<string>('');
  const [solutionImagePreview, setSolutionImagePreview] = useState<string>('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMistake = () => {
    if (mistakeContent.trim()) {
      const mistake: Mistake = {
        id: crypto.randomUUID(),
        subjectId: selectedSubject,
        chapterId: selectedChapter,
        priority: mistakePriority,
        content: mistakeContent.trim(),
        imageUrl: mistakeImagePreview || undefined,
        solution: solution.trim() || undefined,
        solutionImageUrl: solutionImagePreview || undefined,
        createdAt: new Date().toISOString(),
        revisionCount: 0,
        lastRevised: null,
        isResolved: false,
        tags
      };
      setMistakes([mistake, ...mistakes]);
      resetForm();
    }
  };

  const resetForm = () => {
    setMistakeContent('');
    setMistakePriority('medium');
    setSolution('');
    setTags([]);
    setNewTag('');
    setMistakeImagePreview('');
    setSolutionImagePreview('');
    setShowMistakeForm(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleRevision = (mistakeId: string) => {
    setMistakes(mistakes.map(mistake => {
      if (mistake.id === mistakeId) {
        return {
          ...mistake,
          revisionCount: mistake.revisionCount + 1,
          lastRevised: new Date().toISOString()
        };
      }
      return mistake;
    }));
  };

  const toggleResolved = (mistakeId: string) => {
    setMistakes(mistakes.map(mistake => {
      if (mistake.id === mistakeId) {
        return {
          ...mistake,
          isResolved: !mistake.isResolved
        };
      }
      return mistake;
    }));
  };

  const getPriorityColor = (priority: Mistake['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
    }
  };

  const filteredMistakes = mistakes
    .filter(mistake => 
      mistake.subjectId === selectedSubject && 
      mistake.chapterId === selectedChapter &&
      (filter === 'all' || 
       (filter === 'pending' && !mistake.isResolved) ||
       (filter === 'revised' && mistake.isResolved))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    });

  return (
    <div className="space-y-6">
      {/* Subject and Chapter Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Mistake Book Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Mistake Book</h3>
          <button
            onClick={() => setShowMistakeForm(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Mistake
          </button>
        </div>

        {/* Add Mistake Form */}
        {showMistakeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Add New Mistake</h4>
                <button onClick={resetForm}>
                  <Trash2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Priority Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setMistakePriority(p)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                          mistakePriority === p
                            ? getPriorityColor(p)
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mistake Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mistake Description</label>
                  <textarea
                    value={mistakeContent}
                    onChange={(e) => setMistakeContent(e.target.value)}
                    placeholder="Describe your mistake..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => mistakeImageInput.current?.click()}
                      className="flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Image
                    </button>
                    <input
                      type="file"
                      ref={mistakeImageInput}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setMistakeImagePreview)}
                    />
                    {mistakeImagePreview && (
                      <div className="relative">
                        <img src={mistakeImagePreview} alt="Mistake" className="h-20 w-20 object-cover rounded" />
                        <button
                          onClick={() => setMistakeImagePreview('')}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Solution (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Solution (Optional)</label>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Write the correct solution..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => solutionImageInput.current?.click()}
                      className="flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Solution Image
                    </button>
                    <input
                      type="file"
                      ref={solutionImageInput}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setSolutionImagePreview)}
                    />
                    {solutionImagePreview && (
                      <div className="relative">
                        <img src={solutionImagePreview} alt="Solution" className="h-20 w-20 object-cover rounded" />
                        <button
                          onClick={() => setSolutionImagePreview('')}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a tag..."
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMistake}
                    className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Save Mistake
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mistakes List */}
        <div className="space-y-4">
          {filteredMistakes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No mistakes recorded yet</p>
          ) : (
            filteredMistakes.map(mistake => (
              <div
                key={mistake.id}
                className={`p-4 rounded-lg border ${
                  mistake.isResolved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(mistake.priority)}`}>
                        {mistake.priority}
                      </span>
                      {mistake.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-2">{mistake.content}</p>
                    {mistake.imageUrl && (
                      <img src={mistake.imageUrl} alt="Mistake" className="mb-2 rounded-lg max-h-48 object-contain" />
                    )}
                    {(mistake.solution || mistake.solutionImageUrl) && (
                      <div className="bg-indigo-50 p-3 rounded-lg mb-2">
                        <p className="text-indigo-700 font-medium text-sm">Solution:</p>
                        {mistake.solution && <p className="text-indigo-600">{mistake.solution}</p>}
                        {mistake.solutionImageUrl && (
                          <img src={mistake.solutionImageUrl} alt="Solution" className="mt-2 rounded-lg max-h-48 object-contain" />
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(mistake.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        {mistake.revisionCount} revisions
                      </span>
                      {mistake.lastRevised && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Last revised: {new Date(mistake.lastRevised).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRevision(mistake.id)}
                      className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50"
                      title="Mark as revised"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleResolved(mistake.id)}
                      className={`p-2 rounded-full ${
                        mistake.isResolved
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={mistake.isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}