/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Auth page with password-based login/signup for the Go backend.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { User, ShieldAlert, KeyRound, Smartphone, LogIn, UserPlus, Lock } from 'lucide-react';

interface AuthPageProps {
  setCurrentPage: (page: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ setCurrentPage }) => {
  const { login, signup, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>(UserRole.NORMAL);
  const [signupPhone, setSignupPhone] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) {
      setLoginError('Email is required.');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Password is required.');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(loginEmail, loginPassword);
      setCurrentPage('dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!signupName.trim()) {
      setSignupError('Full Name is required.');
      return;
    }
    if (!signupEmail.trim()) {
      setSignupError('Email is required.');
      return;
    }
    if (!signupPassword.trim() || signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }

    setIsSigningUp(true);
    try {
      await signup(signupName, signupEmail, signupPassword, signupRole, signupPhone);
      setCurrentPage('dashboard');
    } catch (err: any) {
      setSignupError(err.message || 'Failed to create account.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handlePresetLogin = async (email: string, password: string) => {
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await login(email, password);
      setCurrentPage('dashboard');
    } catch (err: any) {
      setLoginError('Preset login failed. Make sure the backend is running with seeded users.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex-grow py-16 bg-stone-50 flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50">
            <button
              id="tab-login"
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
              className={`w-1/2 py-4 text-center text-sm font-semibold transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'login'
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Login to Portal</span>
            </button>
            <button
              id="tab-signup"
              onClick={() => { setActiveTab('signup'); setSignupError(''); }}
              className={`w-1/2 py-4 text-center text-sm font-semibold transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'signup'
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Register Account</span>
            </button>
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif font-light text-stone-900 leading-tight">
                SOLUTION <span className="text-stone-400">GROUND</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {activeTab === 'login' 
                  ? 'Access your giving dashboard, registered events, and tools.' 
                  : 'Join the Solution Ground Ministry online family.'}
              </p>
            </div>

            {/* TAB CONTENT: LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5" id="login-form">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start space-x-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="e.g. admin@church.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-stone-900"
                    />
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-lg shadow-md transition-colors text-sm uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isLoggingIn ? 'Verifying Account...' : 'Log In to Dashboard'}
                </button>
              </form>
            )}

            {/* TAB CONTENT: SIGNUP */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-5" id="signup-form">
                {signupError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start space-x-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{signupError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="signup-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="e.g. Samuel Adebayo"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-stone-900"
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="e.g. samuel@gmail.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-stone-900"
                  />
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="signup-password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-phone" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="signup-phone"
                      type="tel"
                      placeholder="e.g. +234 812 345 6789"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                    Are you joining as:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <label 
                      id="label-role-normal"
                      className={`p-3.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1 ${
                        signupRole === UserRole.NORMAL
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600'
                      }`}
                    >
                      <input
                        id="role-normal"
                        type="radio"
                        name="signupRole"
                        className="sr-only"
                        checked={signupRole === UserRole.NORMAL}
                        onChange={() => setSignupRole(UserRole.NORMAL)}
                      />
                      <span className="text-sm">Normal Member</span>
                      <span className="text-[9px] text-stone-400 uppercase tracking-widest font-mono">Family / Adult</span>
                    </label>

                    <label 
                      id="label-role-youth"
                      className={`p-3.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1 ${
                        signupRole === UserRole.YOUTH
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600'
                      }`}
                    >
                      <input
                        id="role-youth"
                        type="radio"
                        name="signupRole"
                        className="sr-only"
                        checked={signupRole === UserRole.YOUTH}
                        onChange={() => setSignupRole(UserRole.YOUTH)}
                      />
                      <span className="text-sm">Youth Member</span>
                      <span className="text-[9px] text-stone-400 uppercase tracking-widest font-mono">SGM Youth Church</span>
                    </label>
                  </div>

                  <div className="mt-3 flex items-center justify-center">
                    <label 
                      id="label-role-leader"
                      className={`w-full py-2.5 rounded-lg border text-center cursor-pointer transition-all flex items-center justify-center space-x-2 ${
                        signupRole === UserRole.YOUTH_LEADER
                          ? 'border-indigo-600 bg-indigo-950 text-indigo-100 font-semibold'
                          : 'border-stone-200 hover:border-stone-300 text-stone-500 text-xs'
                      }`}
                    >
                      <input
                        id="role-leader"
                        type="radio"
                        name="signupRole"
                        className="sr-only"
                        checked={signupRole === UserRole.YOUTH_LEADER}
                        onChange={() => setSignupRole(UserRole.YOUTH_LEADER)}
                      />
                      <span>Register as Youth Leader</span>
                    </label>
                  </div>
                </div>

                <button
                  id="signup-submit-btn"
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full py-3 bg-indigo-900 hover:bg-indigo-850 disabled:bg-stone-700 text-white font-bold rounded-lg shadow-md transition-colors text-sm uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSigningUp ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>
            )}

            {/* QUICK PRESET LOGINS SECTION */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              <span className="block text-center text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono mb-4 flex items-center justify-center space-x-1.5">
                <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                <span>Demo Quick-Login Presets (Backend Users)</span>
              </span>
              
              <div className="space-y-2.5">
                <button
                  id="preset-admin"
                  onClick={() => handlePresetLogin('admin@church.com', 'admin123')}
                  className="w-full p-2.5 bg-stone-50 hover:bg-indigo-50 hover:border-indigo-500 border border-stone-200 rounded-lg text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="block text-xs font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">
                      Admin User
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      admin@church.com • admin
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono uppercase">
                    Admin View
                  </span>
                </button>

                <button
                  id="preset-pastor"
                  onClick={() => handlePresetLogin('pastor@church.com', 'pastor123')}
                  className="w-full p-2.5 bg-stone-50 hover:bg-indigo-50 hover:border-indigo-500 border border-stone-200 rounded-lg text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="block text-xs font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">
                      Pastor Main
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      pastor@church.com • pastor
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono uppercase">
                    Pastor View
                  </span>
                </button>

                <button
                  id="preset-leader"
                  onClick={() => handlePresetLogin('youth@church.com', 'youth123')}
                  className="w-full p-2.5 bg-stone-50 hover:bg-indigo-50 hover:border-indigo-500 border border-stone-200 rounded-lg text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="block text-xs font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">
                      Youth Leader
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      youth@church.com • youth_leader
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono uppercase">
                    Leader View
                  </span>
                </button>

                <button
                  id="preset-member"
                  onClick={() => handlePresetLogin('john@church.com', 'member123')}
                  className="w-full p-2.5 bg-stone-50 hover:bg-indigo-50 hover:border-indigo-500 border border-stone-200 rounded-lg text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="block text-xs font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">
                      John Member
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      john@church.com • member
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono uppercase">
                    Member View
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};