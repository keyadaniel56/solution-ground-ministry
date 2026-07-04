/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ContributionTracker } from './ContributionTracker';
import { User, Mail, Phone, Calendar, Landmark, HeartHandshake, Settings, Save, BellRing, Sparkles, LogOut, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const { currentUser, updateProfile, events, payments, logout } = useApp();
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.fullName || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl max-w-md mx-auto space-y-4">
          <ShieldAlert className="h-12 w-12 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-light font-serif text-stone-900">Secure Member Portal</h2>
          <p className="text-stone-500 text-xs leading-relaxed">
            Please register or log in to your Solution Ground Ministry account to access your personalized giving dashboard, registration listings, and leadership tools.
          </p>
        </div>
      </div>
    );
  }

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editName, editPhone);
    setUpdateSuccess(true);
    setIsEditing(false);
    setTimeout(() => setUpdateSuccess(false), 2000);
  };

  // 1. Calculate dynamic statistics
  const userRegisteredEvents = events.filter((e) => e.registeredUserIds.includes(String(currentUser.id)));
  const userPayments = payments.filter((p) => p.user_id === currentUser.id && p.status === 'completed');
  const userTotalGave = userPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex-grow py-12 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Greeting Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-stone-950 rounded-2xl border border-stone-800 p-6 md:p-8 text-white relative overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-overlay opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=600')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/40 to-transparent"></div>
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-900/40 text-indigo-300 border border-indigo-700/50 uppercase tracking-widest font-mono">
                {currentUser.role} Account Portal
              </span>
              <h1 className="text-3xl font-light font-serif text-white tracking-tight">
                Shalom, {currentUser.fullName}!
              </h1>
              <p className="text-stone-300 text-xs max-w-xl font-light">
                Welcome back to your Solution Ground Ministry secure portal. Manage your profile, view financial histories, or track upcoming camp schedules.
              </p>
            </div>

            {/* Micro stats summary */}
            <div className="flex flex-wrap gap-4 text-stone-300 font-mono text-[11px]">
              <div className="bg-stone-950/60 p-3 rounded-lg border border-stone-800">
                <span className="text-stone-500 uppercase font-bold block text-[9px] tracking-wider">Missions Supported</span>
                <span className="text-white font-bold text-sm mt-0.5">${userTotalGave}</span>
              </div>
              <div className="bg-stone-950/60 p-3 rounded-lg border border-stone-800">
                <span className="text-stone-500 uppercase font-bold block text-[9px] tracking-wider">Events Registered</span>
                <span className="text-white font-bold text-sm mt-0.5">{userRegisteredEvents.length} Sessions</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Profile Details & Editing (Columns 4) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-lg font-serif font-light text-stone-900">Your Member Profile</h2>
              <button
                id="btn-edit-profile-toggle"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setEditName(currentUser.fullName);
                  setEditPhone(currentUser.phone || '');
                }}
                className="text-indigo-600 hover:text-indigo-500 text-xs font-semibold flex items-center space-x-1"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{isEditing ? 'Cancel' : 'Edit Info'}</span>
              </button>
            </div>

            {updateSuccess && (
              <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center space-x-1.5 animate-pulse">
                <span>✓ Profile changes saved securely!</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  id="btn-save-profile"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Save className="h-3.5 w-3.5 text-white" />
                  <span>Save Profile Updates</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-stone-600 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">FullName</span>
                    <p className="font-semibold text-stone-900 text-sm">{currentUser.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Email Address</span>
                    <p className="font-semibold text-stone-900">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Phone Contact</span>
                    <p className="font-semibold text-stone-900">{currentUser.phone || 'No phone added'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                  <span>Joined Online: {currentUser.created_at ? currentUser.created_at.split('T')[0] : 'N/A'}</span>
                  <span className="text-indigo-600 font-bold uppercase tracking-widest">{currentUser.role}</span>
                </div>
              </div>
            )}

            {/* Youth church announcements panel for youth roles */}
            {(currentUser.role === UserRole.YOUTH || currentUser.role === UserRole.YOUTH_LEADER) && (
              <div className="bg-stone-950 text-stone-300 p-5 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-300">
                  <BellRing className="h-4 w-4 text-indigo-300" />
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Youth Group Board</span>
                </div>
                <h4 className="font-serif font-light text-white text-xs">Annual SGM Camp Preparations</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                  Attention all SGM youths! Youth contributions for the 2026 Annual Camp are now active. Ensure you confirm your registration to book your seats. Our next Praise Jam is next Friday!
                </p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Dynamic Action Module / Stewardship system (Columns 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Contribution Module wrapper */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <ContributionTracker />
            </div>

            {/* 2. Event Registrations summary log */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-serif font-light text-stone-900 mb-1">
                Your Registered Events & Meetings
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light">
                Keep track of seats you reserved for conferences and prophetic weekly services.
              </p>

              {userRegisteredEvents.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                  <Calendar className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-stone-500 text-xs">You haven't reserved any event seats yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userRegisteredEvents.map((evt) => (
                    <div key={evt.id} className="p-4 bg-stone-50 border border-stone-200 rounded-lg flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase font-mono tracking-wider">
                          {evt.category}
                        </span>
                        <h4 className="font-light text-stone-900 text-sm font-serif mt-1">{evt.title}</h4>
                        <div className="text-[11px] text-stone-500 font-mono mt-2 space-y-0.5">
                          <p>📅 {evt.date}</p>
                          <p>🕒 {evt.time}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-400">
                        <span>Seat Confirmed ✓</span>
                        <span className="text-indigo-600 font-semibold font-sans">SGM Main Annex</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
