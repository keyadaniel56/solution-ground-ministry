/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { UserRole, ChurchEvent } from '../types';
import { Calendar, MapPin, Clock, Users, PlusCircle, Check, X, ShieldAlert } from 'lucide-react';

interface EventCalendarProps {
  setCurrentPage: (page: string) => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({ setCurrentPage }) => {
  const { events, currentUser, registerForEvent, unregisterFromEvent, addEvent } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  
  // Custom Month Calendar State: July 2026
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(6); // 0-indexed, so 6 is July

  // Add Event Form State (Youth Leaders)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('2026-07-18');
  const [newTime, setNewTime] = useState('10:00 AM - 12:00 PM');
  const [newLoc, setNewLoc] = useState('');
  const [newCat, setNewCat] = useState<'General' | 'Youth' | 'Worship' | 'Community'>('Youth');
  const [newCap, setNewCap] = useState(100);
  const [formSuccess, setFormSuccess] = useState(false);

  // Generate calendar days for July 2026
  // July 1st 2026 is a Wednesday.
  // July has 31 days.
  const daysInMonth = 31;
  const startDayOffset = 3; // Wednesday is 3rd day of week (Sun=0, Mon=1, Tue=2, Wed=3)

  const calendarDays = [];
  // Fill initial offsets
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push({ day: null, fullDate: '' });
  }
  // Fill actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const fullDate = `2026-07-${dayStr}`;
    calendarDays.push({ day, fullDate });
  }

  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => e.date === dateStr);
  };

  const handleRegisterToggle = (evt: ChurchEvent) => {
    if (!currentUser) {
      alert('You must be logged in to register for SGM Events. Redirecting to Portal.');
      setCurrentPage('auth');
      return;
    }

    if (evt.registeredUserIds.includes(currentUser.id)) {
      unregisterFromEvent(evt.id);
    } else {
      registerForEvent(evt.id);
    }
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newLoc) return;

    addEvent({
      title: newTitle,
      description: newDesc,
      date: newDate,
      time: newTime,
      location: newLoc,
      category: newCat,
      capacity: newCap,
      imageUrl: newCat === 'Youth' 
        ? 'https://images.unsplash.com/photo-1523580494863-6f30312245d5?auto=format&fit=crop&q=80&w=600'
        : 'https://images.unsplash.com/photo-1445445290250-18a34739cd4c?auto=format&fit=crop&q=80&w=600',
    });

    setFormSuccess(true);
    setNewTitle('');
    setNewDesc('');
    setNewLoc('');
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddForm(false);
    }, 2000);
  };

  return (
    <div className="flex-grow py-12 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 pb-6 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">
              Solution Event Center
            </span>
            <h1 className="text-3xl font-light text-stone-900 font-serif mt-1">
              Events Calendar & Registration
            </h1>
            <p className="text-stone-500 text-xs mt-1 font-light">
              Check out SGM service calendars, youth meets, and special fellowship conferences.
            </p>
          </div>

          {currentUser?.role === UserRole.YOUTH_LEADER && (
            <button
              id="btn-show-add-event"
              onClick={() => setShowAddForm(!showAddForm)}
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer shadow-sm"
            >
              <PlusCircle className="h-4 w-4 text-white" />
              <span>{showAddForm ? 'Close Event Form' : 'Create New Event'}</span>
            </button>
          )}
        </div>

        {/* Youth Leader Event Creation Form */}
        {showAddForm && (
          <div className="mb-10 p-6 bg-white rounded-xl border border-stone-200 shadow-md max-w-2xl">
            <h3 className="text-lg font-bold text-stone-900 font-serif mb-4">
              Create SGM Event (Leader Portal)
            </h3>
            {formSuccess ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center space-x-2">
                <Check className="h-5 w-5 shrink-0" />
                <span>Event created and added to the SGM database successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleAddEventSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SGM Music Intensive"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SGM Youth Annex"
                      value={newLoc}
                      onChange={(e) => setNewLoc(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Date (July 2026)</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 05:00 PM - 08:00 PM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Capacity</label>
                    <input
                      type="number"
                      value={newCap}
                      onChange={(e) => setNewCap(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Ministry Category</label>
                  <div className="flex space-x-3">
                    {['General', 'Youth', 'Worship', 'Community'].map((cat) => (
                      <label 
                        key={cat}
                        className={`px-3 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
                          newCat === cat
                            ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="eventCat"
                          className="sr-only"
                          checked={newCat === cat}
                          onChange={() => setNewCat(cat as any)}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Event Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide details about the event, scheduled speakers, activities..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs tracking-wider uppercase cursor-pointer"
                >
                  Publish Event
                </button>
              </form>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Calendar Grid Section: Left 5 columns */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-light text-stone-900">
                July {currentYear}
              </h2>
              <span className="text-xs text-indigo-600 font-mono font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Current View
              </span>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono font-semibold text-stone-400 mb-2 border-b border-stone-100 pb-2">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Monthly grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {calendarDays.map((cell, index) => {
                const dateEvts = cell.fullDate ? getEventsForDate(cell.fullDate) : [];
                const hasEvts = dateEvts.length > 0;
                const isYouthEvtOnly = hasEvts && dateEvts.every((e) => e.category === 'Youth');

                return (
                  <div
                    key={index}
                    className={`min-h-[50px] p-1 border rounded-lg flex flex-col justify-between items-center relative transition-colors ${
                      cell.day 
                        ? 'bg-stone-50/50 border-stone-100 hover:bg-stone-100 cursor-pointer' 
                        : 'bg-transparent border-transparent cursor-default'
                    }`}
                    onClick={() => {
                      if (cell.day && hasEvts) {
                        setSelectedEvent(dateEvts[0]);
                      }
                    }}
                  >
                    {cell.day && (
                      <>
                        <span className="text-xs text-stone-800 font-medium font-mono">
                          {cell.day}
                        </span>
                        {hasEvts && (
                          <div className="flex space-x-1 mt-1 justify-center">
                            {dateEvts.map((e, idx) => (
                              <span
                                key={idx}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  e.category === 'Youth' 
                                    ? 'bg-indigo-600' 
                                    : e.category === 'Worship' 
                                    ? 'bg-purple-500' 
                                    : e.category === 'Community' 
                                    ? 'bg-emerald-500' 
                                    : 'bg-blue-500'
                                }`}
                                title={e.title}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-mono text-stone-500">
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                <span>Youth Church</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Worship Prophetic</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Community Outr</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>General Sunday</span>
              </span>
            </div>
          </div>

          {/* Events List Cards: Right 7 columns */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <h2 className="text-lg font-serif font-light text-stone-900 mb-1">
                All Scheduled July Encounters
              </h2>
              <p className="text-stone-500 text-xs font-light">
                Browse detailed agendas, capacity levels, and confirm your seat reservation.
              </p>
            </div>

            <div className="space-y-4">
              {events.map((evt, idx) => {
                const isRegistered = currentUser && evt.registeredUserIds.includes(currentUser.id);
                const spotsLeft = evt.capacity ? evt.capacity - evt.registeredUserIds.length : null;

                return (
                  <motion.div
                    key={evt.id}
                    id={`event-row-${evt.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ delay: idx * 0.1, duration: 0.4, ease: 'easeOut' }}
                    whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                    className={`bg-white rounded-2xl border p-6 shadow-sm transition-all flex flex-col sm:flex-row gap-5 ${
                      isRegistered ? 'border-indigo-600 ring-1 ring-indigo-600/10' : 'border-stone-200'
                    }`}
                  >
                    {/* Event image or category tag visual */}
                    <div className="w-full sm:w-1/4 h-32 sm:h-auto rounded-lg overflow-hidden shrink-0 relative bg-stone-100">
                      <img
                        src={evt.imageUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-sans font-bold uppercase rounded shadow-sm">
                        {evt.category}
                      </div>
                    </div>

                    {/* Details content */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-lg font-light text-stone-900 font-serif leading-tight">
                            {evt.title}
                          </h3>
                          {isRegistered && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 font-mono">
                              ✓ YOU ARE REGISTERED
                            </span>
                          )}
                        </div>

                        {/* Event details block */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600 font-mono mt-3">
                          <span className="flex items-center space-x-1.5">
                            <Calendar className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                            <span>{evt.date}</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <Clock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                            <span>{evt.time}</span>
                          </span>
                          <span className="flex items-center space-x-1.5 col-span-1 sm:col-span-2 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{evt.location}</span>
                          </span>
                        </div>

                        <p className="text-stone-500 text-xs mt-3 leading-relaxed font-light">
                          {evt.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                        {/* Capacity tag */}
                        {spotsLeft !== null ? (
                          <span className="text-[10px] text-stone-500 font-mono flex items-center space-x-1.5">
                            <Users className="h-3.5 w-3.5 text-stone-400" />
                            <span>
                              {spotsLeft > 0 ? `${spotsLeft} of ${evt.capacity} seats left` : 'Fully Booked'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-mono flex items-center space-x-1.5">
                            <Users className="h-3.5 w-3.5 text-stone-400" />
                            <span>General Admission</span>
                          </span>
                        )}

                        {/* Registration Toggle Button */}
                        <button
                          id={`btn-register-${evt.id}`}
                          onClick={() => handleRegisterToggle(evt)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                            isRegistered
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : spotsLeft !== null && spotsLeft <= 0
                              ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow'
                          }`}
                          disabled={!isRegistered && spotsLeft !== null && spotsLeft <= 0}
                        >
                          {isRegistered ? (
                            <>
                              <X className="h-3.5 w-3.5" />
                              <span>Cancel Reservation</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Register For Event</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
