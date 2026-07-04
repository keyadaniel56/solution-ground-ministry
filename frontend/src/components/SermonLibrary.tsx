/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { UserRole, Sermon } from '../types';
import { Search, Play, Pause, Disc, Filter, Volume2, PlusCircle, X, Check, Clock, Calendar, User } from 'lucide-react';

interface SermonLibraryProps {
  selectedSermonId?: string | null;
  setSelectedSermonId?: (id: string | null) => void;
}

export const SermonLibrary: React.FC<SermonLibraryProps> = ({ selectedSermonId, setSelectedSermonId }) => {
  const { sermons, currentUser, addSermon } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);
  
  // Media Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [playMode, setPlayMode] = useState<'audio' | 'video' | null>(null);

  // New Sermon States (For Youth Leader admin function)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPreacher, setNewPreacher] = useState('');
  const [newCategory, setNewCategory] = useState('Spiritual Growth');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState('30:00');
  const [formSuccess, setFormSuccess] = useState(false);

  // Sync external selectedSermonId
  useEffect(() => {
    if (selectedSermonId) {
      const found = sermons.find((s) => s.id === selectedSermonId);
      if (found) {
        setActiveSermon(found);
      }
    }
  }, [selectedSermonId, sermons]);

  // Simulate progress when playing audio/video
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayerProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSermonSelect = (sermon: Sermon) => {
    setActiveSermon(sermon);
    setIsPlaying(false);
    setPlayerProgress(0);
    setPlayMode(null);
  };

  const handleCloseDetails = () => {
    setActiveSermon(null);
    setIsPlaying(false);
    setPlayerProgress(0);
    setPlayMode(null);
    if (setSelectedSermonId) {
      setSelectedSermonId(null);
    }
  };

  const handleStartPlay = (mode: 'audio' | 'video') => {
    setPlayMode(mode);
    setIsPlaying(true);
    setPlayerProgress(0);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Get unique categories from current sermons list
  const categories: string[] = ['All', ...Array.from(new Set<string>(sermons.map((s) => s.category)))];

  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch =
      sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.preacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || sermon.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddSermon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPreacher || !newDescription) return;

    addSermon({
      title: newTitle,
      preacher: newPreacher,
      category: newCategory,
      description: newDescription,
      duration: newDuration,
      date: new Date().toISOString().split('T')[0],
      thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=600',
    });

    setFormSuccess(true);
    setNewTitle('');
    setNewPreacher('');
    setNewDescription('');
    setNewDuration('35:00');

    setTimeout(() => {
      setFormSuccess(false);
      setShowAddForm(false);
    }, 2000);
  };

  return (
    <div className="flex-grow py-12 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 pb-6 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">
              Solution Pulpit Library
            </span>
            <h1 className="text-3xl font-light text-stone-900 font-serif mt-1">
              Sermons & Spoken Resources
            </h1>
            <p className="text-stone-500 text-xs mt-1 font-light">
              Listen to message podcasts, study scriptures, and download transcripts.
            </p>
          </div>

          {currentUser?.role === UserRole.YOUTH_LEADER && (
            <button
              id="btn-show-add-sermon"
              onClick={() => setShowAddForm(!showAddForm)}
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer shadow-sm"
            >
              <PlusCircle className="h-4 w-4 text-white" />
              <span>{showAddForm ? 'Close Add Form' : 'Upload New Sermon'}</span>
            </button>
          )}
        </div>

        {/* 1. Youth Leader Sermon Upload Form */}
        {showAddForm && (
          <div className="mb-10 p-6 bg-white rounded-xl border border-stone-200 shadow-md max-w-2xl">
            <h3 className="text-lg font-bold text-stone-900 font-serif mb-4">
              Upload Sermon Content (Leader Portal)
            </h3>
            {formSuccess ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center space-x-2">
                <Check className="h-5 w-5 shrink-0" />
                <span>Sermon uploaded successfully! It is now live in the sermon grid.</span>
              </div>
            ) : (
              <form onSubmit={handleAddSermon} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Sermon Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Breaking Generational Barriers"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Preacher Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pastor Jonathan Wright"
                      value={newPreacher}
                      onChange={(e) => setNewPreacher(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none text-stone-900"
                    >
                      <option value="Faith & Deliverance">Faith & Deliverance</option>
                      <option value="Youth Ministry">Youth Ministry</option>
                      <option value="Spiritual Growth">Spiritual Growth</option>
                      <option value="Prayer">Prayer</option>
                      <option value="Worship">Worship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 45:12"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Sermon Summary / Scriptures</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide a summary of the teachings and core Bible references..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs tracking-wider uppercase cursor-pointer shadow-sm"
                >
                  Publish Content
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. Filters & Search Controls */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input
              id="sermon-search-input"
              type="text"
              placeholder="Search sermons, preachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-stone-900"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="h-4 w-4 text-indigo-600 hidden md:block shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Sermon Cards Grid */}
        {filteredSermons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <Disc className="h-12 w-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No sermons found matching your current filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="mt-3 text-indigo-600 hover:text-indigo-500 font-semibold text-xs"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSermons.map((sermon, idx) => (
              <motion.div
                key={sermon.id}
                id={`sermon-card-${sermon.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: idx * 0.08, duration: 0.4, ease: 'easeOut' }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 group">
                    <img
                      src={sermon.thumbnailUrl}
                      alt={sermon.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/40 transition-colors flex items-center justify-center cursor-pointer"
                      onClick={() => handleSermonSelect(sermon)}
                    >
                      <div className="p-3 bg-indigo-600 text-white rounded-full scale-90 group-hover:scale-100 transition-transform shadow-md">
                        <Play className="h-4 w-4 fill-white stroke-white" />
                      </div>
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 bg-stone-900/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {sermon.duration}
                    </span>
                  </div>

                  <div className="p-5">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono bg-indigo-50 px-2 py-0.5 rounded">
                      {sermon.category}
                    </span>
                    <h3 className="text-lg font-light text-stone-900 font-serif leading-snug mt-2.5 cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => handleSermonSelect(sermon)}
                    >
                      {sermon.title}
                    </h3>
                    <p className="text-stone-400 text-xs mt-1.5 font-medium">
                      By {sermon.preacher}
                    </p>
                    <p className="text-stone-500 text-xs mt-3 line-clamp-3 leading-relaxed font-light">
                      {sermon.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4 bg-stone-50/55 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-stone-400" />
                    <span>{sermon.date}</span>
                  </span>
                  <button
                    onClick={() => handleSermonSelect(sermon)}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    View Resource
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 4. Active Sermon Detail Modal with Simulated Player */}
        {activeSermon && (
          <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col md:flex-row">
              {/* Left Side: Media Cover & Visualizer */}
              <div className="md:w-2/5 bg-indigo-950 relative h-48 md:h-auto min-h-[250px] flex flex-col justify-between overflow-hidden">
                <img
                  src={activeSermon.thumbnailUrl}
                  alt={activeSermon.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900/40 to-indigo-950/80"></div>
                
                {/* Header info */}
                <div className="relative p-5">
                  <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest font-mono bg-indigo-900/40 border border-indigo-700/50 px-2.5 py-1 rounded">
                    SGM Online Pulpit
                  </span>
                </div>

                {/* Simulated Audio/Video player */}
                <div className="relative p-5 flex flex-col justify-end h-full z-10 text-white">
                  {playMode ? (
                    <div className="space-y-4">
                      {/* Equalizer animation simulation */}
                      <div className="flex items-end justify-center space-x-1.5 h-10 mb-2">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 bg-indigo-500 rounded-t transition-all duration-300 ${
                              isPlaying 
                                ? i % 3 === 0 ? 'animate-bounce h-8' : i % 3 === 1 ? 'animate-pulse h-5' : 'animate-bounce h-10' 
                                : 'h-2'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-center">
                        <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-mono">
                          Simulated {playMode === 'audio' ? 'Audio Stream' : 'Video Screen'}
                        </p>
                        <p className="text-xs text-stone-300 font-mono truncate">
                          Playing: {activeSermon.duration}
                        </p>
                      </div>

                      {/* Custom timeline bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${playerProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                          <span>0:{playerProgress < 10 ? `0${playerProgress}` : playerProgress}</span>
                          <span>{activeSermon.duration}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={handleTogglePlay}
                          className="p-3 bg-indigo-600 text-white rounded-full hover:scale-105 transition-transform"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white text-white" />}
                        </button>
                        <div className="flex items-center space-x-1 text-stone-400">
                          <Volume2 className="h-4 w-4 text-stone-400" />
                          <span className="text-[10px] font-mono">100%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center py-6">
                      <p className="text-xs text-stone-300 italic">Select stream mode to begin teaching:</p>
                      <div className="flex flex-col space-y-2">
                        <button
                          id="btn-play-audio"
                          onClick={() => handleStartPlay('audio')}
                          className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5 shadow-sm"
                        >
                          <Volume2 className="h-4 w-4" />
                          <span>Simulate Audio Podcast</span>
                        </button>
                        <button
                          id="btn-play-video"
                          onClick={() => handleStartPlay('video')}
                          className="py-2 bg-indigo-950/80 hover:bg-indigo-950 text-indigo-200 rounded-lg text-xs font-semibold border border-indigo-800/50 flex items-center justify-center space-x-1.5"
                        >
                          <Play className="h-4 w-4 fill-indigo-200 text-indigo-200" />
                          <span>Simulate Video Broad</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Sermon Details & Summary */}
              <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between max-h-[500px] md:max-h-none overflow-y-auto">
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase font-mono tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                        {activeSermon.category}
                      </span>
                      <h2 className="text-2xl font-light font-serif text-stone-900 mt-2 leading-tight">
                        {activeSermon.title}
                      </h2>
                    </div>
                    <button
                      onClick={handleCloseDetails}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-200/60">
                    <div className="flex items-center space-x-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate"><strong>By:</strong> {activeSermon.preacher}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Date:</strong> {activeSermon.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Length:</strong> {activeSermon.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest font-mono">
                      Sermon Summary
                    </h4>
                    <p className="text-stone-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-light">
                      {activeSermon.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-mono">
                  <span>Available on Spotify / SGM app</span>
                  <button
                    onClick={() => alert('Transcript download started! (Simulated PDF download)')}
                    className="text-indigo-600 hover:text-indigo-500 font-semibold uppercase tracking-wider"
                  >
                    Download Transcript
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
