import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { subjects } from '../data/subjects';
import { supabase } from '../lib/supabase';
import type { Mistake } from '../types';

export function MistakeBook() {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [selectedChapter, setSelectedChapter] = useState(subjects[0].chapters[0].id);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [showMistakeForm, setShowMistakeForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [solution, setSolution] = useState('');
  const [mistakeImage, setMistakeImage] = useState<File | null>(null);
  const [solutionImage, setSolutionImage] = useState<File | null>(null);
  const [mistakeImagePreview, setMistakeImagePreview] = useState<string>('');
  const [solutionImagePreview, setSolutionImagePreview] = useState<string>('');

  // Fetch mistakes
  useEffect(() => {
    fetchMistakes();
  }, [selectedSubject, selectedChapter]);

  async function fetchMistakes() {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('mistakes')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject_id', selectedSubject)
        .eq('chapter_id', selectedChapter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMistakes(data || []);
    } catch (err) {
      setError('Failed to load mistakes');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageUpload = async (file: File, type: 'mistake' | 'solution') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('mistake_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('mistake_images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  async function handleAddMistake() {
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let mistakeImageUrl = null;
      let solutionImageUrl = null;

      if (mistakeImage) {
        mistakeImageUrl = await handleImageUpload(mistakeImage, 'mistake');
      }

      if (solutionImage) {
        solutionImageUrl = await handleImageUpload(solutionImage, 'solution');
      }

      const { error } = await supabase.from('mistakes').insert({
        user_id: user.id,
        subject_id: selectedSubject,
        chapter_id: selectedChapter,
        content: content.trim(),
        priority,
        solution: solution.trim() || null,
        image_url: mistakeImageUrl,
        solution_image_url: solutionImageUrl
      });

      if (error) throw error;

      // Refresh mistakes list
      fetchMistakes();
      resetForm();
    } catch (err) {
      setError('Failed to add mistake');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'mistake' | 'solution') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'mistake') {
        setMistakeImagePreview(reader.result as string);
        setMistakeImage(file);
      } else {
        setSolutionImagePreview(reader.result as string);
        setSolutionImage(file);
      }
    };
    reader.readAsDataURL(file);
  };

  async function handleRevision(mistakeId: string) {
    try {
      const { error } = await supabase
        .from('mistakes')
        .update({
          revision_count: mistakes.find(m => m.id === mistakeId)!.revision_count + 1,
          last_revised: new Date().toISOString()
        })
        .eq('id', mistakeId);

      if (error) throw error;
      fetchMistakes();
    } catch (err) {
      setError('Failed to update revision');
      console.error('Error:', err);
    }
  }

  async function toggleResolved(mistakeId: string) {
    const mistake = mistakes.find(m => m.id === mistakeId);
    if (!mistake) return;

    try {
      const { error } = await supabase
        .from('mistakes')
        .update({ is_resolved: !mistake.is_resolved })
        .eq('id', mistakeId);

      if (error) throw error;
      fetchMistakes();
    } catch (err) {
      setError('Failed to update status');
      console.error('Error:', err);
    }
  }

  const resetForm = () => {
    setContent('');
    setPriority('medium');
    setSolution('');
    setMistakeImage(null);
    setSolutionImage(null);
    setMistakeImagePreview('');
    setSolutionImagePreview('');
    setShowMistakeForm(false);
  };

  const getPriorityColor = (p: Mistake['priority']) => {
    switch (p) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
    }
  };

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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Mistake Book Content */}
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
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                          priority === p
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
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your mistake..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      id="mistakeImage"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'mistake')}
                    />
                    <label
                      htmlFor="mistakeImage"
                      className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Image
                    </label>
                    {mistakeImagePreview && (
                      <div className="mt-2 relative inline-block">
                        <img src={mistakeImagePreview} alt="Mistake preview" className="h-20 w-20 object-cover rounded" />
                        <button
                          onClick={() => {
                            setMistakeImage(null);
                            setMistakeImagePreview('');
                          }}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Solution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Solution (Optional)</label>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Write the correct solution..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      id="solutionImage"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'solution')}
                    />
                    <label
                      htmlFor="solutionImage"
                      className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Solution Image
                    </label>
                    {solutionImagePreview && (
                      <div className="mt-2 relative inline-block">
                        <img src={solutionImagePreview} alt="Solution preview" className="h-20 w-20 object-cover rounded" />
                        <button
                          onClick={() => {
                            setSolutionImage(null);
                            setSolutionImagePreview('');
                          }}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMistake}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Mistake'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mistakes List */}
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading mistakes...</p>
          ) : mistakes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No mistakes recorded yet</p>
          ) : (
            mistakes.map(mistake => (
              <div
                key={mistake.id}
                className={`p-4 rounded-lg border ${
                  mistake.is_resolved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(mistake.priority)}`}>
                        {mistake.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{mistake.content}</p>
                    {mistake.image_url && (
                      <div className="mb-2">
                        <img src={mistake.image_url} alt="Mistake" className="max-h-48 rounded-lg" />
                      </div>
                    )}
                    {(mistake.solution || mistake.solution_image_url) && (
                      <div className="bg-indigo-50 p-3 rounded-lg mb-2">
                        <p className="text-indigo-700 font-medium text-sm">Solution:</p>
                        {mistake.solution && <p className="text-indigo-600">{mistake.solution}</p>}
                        {mistake.solution_image_url && (
                          <div className="mt-2">
                            <img src={mistake.solution_image_url} alt="Solution" className="max-h-48 rounded-lg" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {new Date(mistake.created_at).toLocaleDateString()}</span>
                      <span>{mistake.revision_count} revisions</span>
                      {mistake.last_revised && (
                        <span>Last revised: {new Date(mistake.last_revised).toLocaleDateString()}</span>
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
                        mistake.is_resolved
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={mistake.is_resolved ? 'Mark as unresolved' : 'Mark as resolved'}
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