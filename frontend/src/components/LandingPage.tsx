/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Landing page with scroll-triggered animations and image sliders.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BookOpen, Calendar, ArrowRight, HeartHandshake, Sparkles, Flame, GraduationCap, ChevronRight, Play, Quote } from 'lucide-react';
import { ImageSlider, Slide } from './ImageSlider';

interface LandingPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedSermonId?: (id: string) => void;
}

// ─── Reusable fade-in-up animation wrapper ───────────────────────────────────
const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Stagger children container ─────────────────────────────────────────────
const StaggerContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    className={className}
  >
    {children}
  </motion.div>
);

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Hero slides ─────────────────────────────────────────────────────────────
const HERO_SLIDES: Slide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=1600',
    title: 'Where Faith Finds Solutions',
    subtitle: 'Stand upon the solid ground of divine grace, prophetic guidance, and fellowship.',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1600',
    title: 'SGM Youth on Fire',
    subtitle: 'A dynamic network of teenagers and young adults growing in spiritual fire and excellence.',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f30312245d5?auto=format&fit=crop&q=80&w=1600',
    title: 'Join Our Upcoming Encounters',
    subtitle: 'Youth summits, worship nights, community outreach — there is a place for you.',
  },
];

// ─── Testimonial slides ──────────────────────────────────────────────────────
const TESTIMONIAL_SLIDES: Slide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=1200',
    title: '"Solution Ground changed my life. I found purpose and a family of faith."',
    subtitle: '— Sarah J., SGM Member',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
    title: '"The youth programs here are incredible. My teenager has grown so much."',
    subtitle: '— Michael O., Parent',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1445445290250-18a34739cd4c?auto=format&fit=crop&q=80&w=1200',
    title: '"Transparent giving, real impact. I love seeing exactly how my contributions help."',
    subtitle: '— Grace A., Youth Leader',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentPage, setSelectedSermonId }) => {
  const { sermons, events, currentUser } = useApp();

  const featuredSermons = sermons.slice(0, 2);
  const featuredEvents = events.slice(0, 2);

  const scriptureOfTheDay = {
    text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
    reference: "Jeremiah 29:11 (ESV)"
  };

  return (
    <div className="flex-grow bg-stone-50">
      {/* ─── 1. Hero Slider ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mx-4 my-6"
      >
        <ImageSlider
          slides={HERO_SLIDES}
          autoAdvanceInterval={6000}
          className="rounded-2xl border border-stone-200 shadow-sm"
        />

        {/* Hero CTA overlay */}
        <div className="relative -mt-20 z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            {currentUser ? (
              <button
                id="hero-go-dashboard"
                onClick={() => setCurrentPage('dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Enter Member Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  id="hero-signup"
                  onClick={() => {
                    setCurrentPage('auth');
                    setTimeout(() => {
                      const signupTab = document.getElementById('tab-signup');
                      if (signupTab) signupTab.click();
                    }, 50);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Register as a Member</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  id="hero-login"
                  onClick={() => setCurrentPage('auth')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg border border-stone-850 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Member Log In</span>
                </button>
              </>
            )}
            <button
              id="hero-sermons"
              onClick={() => setCurrentPage('sermons')}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white font-semibold hover:text-indigo-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>Watch Sermons</span>
              <Play className="h-4 w-4 fill-white text-white" />
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── 2. Scripture Of the Day ──────────────────────────────────────── */}
      <FadeUp>
        <section className="bg-indigo-50/50 border-y border-indigo-100 py-8 my-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex justify-center mb-2"
            >
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </motion.div>
            <p className="italic text-lg sm:text-xl font-serif text-indigo-950 leading-relaxed max-w-3xl mx-auto font-light">
              "{scriptureOfTheDay.text}"
            </p>
            <span className="block mt-2 text-xs font-semibold text-indigo-800 font-mono tracking-wider uppercase">
              — {scriptureOfTheDay.reference}
            </span>
          </div>
        </section>
      </FadeUp>

      {/* ─── 3. Core Ministries ────────────────────────────────────────────── */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 tracking-widest font-mono uppercase">
              One Church, Structured Fellowships
            </span>
            <h2 className="text-3xl font-light mt-2 text-stone-900 font-serif">
              A Place to Grow for Everyone
            </h2>
            <p className="text-stone-500 text-sm mt-3 font-light">
              Whether you are joining our energetic Youth Fellowship or regular adult fellowships, Solution Ground offers deep pastoral care, career acceleration, and vibrant ministries.
            </p>
          </div>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Youth Church */}
          <motion.div variants={staggerItem} className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 bg-indigo-50/40 text-indigo-600 rounded-bl-3xl">
              <Flame className="h-10 w-10 text-indigo-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-mono bg-indigo-50 px-2.5 py-1 rounded">
                Youth Fellowship
              </span>
              <h3 className="text-2xl font-light text-stone-900 font-serif mt-4">
                SGM Youth on Fire
              </h3>
              <p className="text-stone-500 text-sm mt-3 leading-relaxed font-light">
                A dynamic network of energetic teenagers and young adults. We blend intense spiritual fire, praise sessions, professional career masterclasses, leadership seminars, and peer accountability groups. Youths participate in campaigns, play instruments, and handle events.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-stone-600 font-light">
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full"></span>
                  <span><strong>Weekly Meetups:</strong> Friday Jam Nights & prayer fire</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full"></span>
                  <span><strong>Leadership:</strong> Managed contributions, tech camps, and panels</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  setCurrentPage('auth');
                  setTimeout(() => {
                    const signupTab = document.getElementById('tab-signup');
                    if (signupTab) signupTab.click();
                    const youthRoleRadio = document.getElementById('role-youth');
                    if (youthRoleRadio) youthRoleRadio.click();
                  }, 80);
                }}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Sign Up as a Youth</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Card 2: General Membership */}
          <motion.div variants={staggerItem} className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 bg-indigo-50/40 text-indigo-600 rounded-bl-3xl">
              <GraduationCap className="h-10 w-10 text-indigo-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-mono bg-indigo-50 px-2.5 py-1 rounded">
                General Family
              </span>
              <h3 className="text-2xl font-light text-stone-900 font-serif mt-4">
                Adult & Family Ministry
              </h3>
              <p className="text-stone-500 text-sm mt-3 leading-relaxed font-light">
                For families, professionals, and veterans of faith. Find deep scriptural teachings, couples counseling, neighborhood fellowship circles, monthly community feeding projects, and an integrated system to transparently monitor giving history and personal spiritual metrics.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-stone-600 font-light">
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full"></span>
                  <span><strong>Sunday Service:</strong> Word exposition & prophetic deliverance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full"></span>
                  <span><strong>Giving & Care:</strong> Digital tracking and transparent charity allocation</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  setCurrentPage('auth');
                  setTimeout(() => {
                    const signupTab = document.getElementById('tab-signup');
                    if (signupTab) signupTab.click();
                    const normalRoleRadio = document.getElementById('role-normal');
                    if (normalRoleRadio) normalRoleRadio.click();
                  }, 80);
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Sign Up as normal Member</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </StaggerContainer>
      </section>

      {/* ─── 4. Testimonial Slider ─────────────────────────────────────────── */}
      <FadeUp>
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-indigo-600 tracking-widest font-mono uppercase">
              Testimonies
            </span>
            <h2 className="text-3xl font-light mt-1 text-stone-900 font-serif">
              What Our Community Says
            </h2>
          </div>
          <div className="relative">
            <div className="absolute top-4 left-4 z-10 text-indigo-600/30">
              <Quote className="h-12 w-12" />
            </div>
            <ImageSlider
              slides={TESTIMONIAL_SLIDES}
              autoAdvanceInterval={7000}
              className="rounded-2xl border border-stone-200 shadow-sm"
            />
          </div>
        </section>
      </FadeUp>

      {/* ─── 5. Upcoming Events Spotlight ──────────────────────────────────── */}
      <FadeUp>
        <section className="bg-stone-100/60 py-16 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
              <div>
                <span className="text-xs font-bold text-indigo-600 tracking-widest font-mono uppercase">
                  Events Calendar
                </span>
                <h2 className="text-3xl font-light mt-1 text-stone-900 font-serif">
                  Join Our Upcoming Encounters
                </h2>
              </div>
              <button
                onClick={() => setCurrentPage('events')}
                className="mt-4 sm:mt-0 px-5 py-2.5 bg-white hover:bg-stone-50 text-indigo-600 text-xs font-bold rounded-lg border border-stone-200 transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
              >
                <span>View Full Event Calendar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredEvents.map((evt) => (
                <motion.div
                  key={evt.id}
                  variants={staggerItem}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-stone-200 flex flex-col sm:flex-row"
                >
                  <div className="sm:w-1/3 h-48 sm:h-full relative shrink-0">
                    <img 
                      src={evt.imageUrl} 
                      alt={evt.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded font-sans shadow-sm">
                      {evt.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-lg font-light text-stone-900 font-serif leading-snug">
                        {evt.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-indigo-600 font-mono font-medium mt-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{evt.date} • {evt.time}</span>
                      </div>
                      <p className="text-stone-500 text-xs mt-3 line-clamp-2 leading-relaxed font-light">
                        {evt.description}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-mono uppercase">
                        Location: {evt.location.split('&')[0]}
                      </span>
                      <button
                        onClick={() => setCurrentPage('events')}
                        className="text-indigo-600 hover:text-indigo-500 font-bold text-xs flex items-center space-x-1"
                      >
                        <span>Register Now</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </FadeUp>

      {/* ─── 6. Sermons Spotlight ──────────────────────────────────────────── */}
      <FadeUp>
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
            <div>
              <span className="text-xs font-bold text-indigo-600 tracking-widest font-mono uppercase">
                Online Pulpit
              </span>
              <h2 className="text-3xl font-light mt-1 text-stone-900 font-serif">
                Recent Sermons & Preachings
              </h2>
            </div>
            <button
              onClick={() => setCurrentPage('sermons')}
              className="mt-4 sm:mt-0 px-5 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <span>Browse All Sermons</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredSermons.map((sermon) => (
              <motion.div
                key={sermon.id}
                variants={staggerItem}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stone-200 flex flex-col sm:flex-row"
              >
                <div className="sm:w-2/5 h-48 sm:h-full relative shrink-0">
                  <img 
                    src={sermon.thumbnailUrl} 
                    alt={sermon.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="absolute inset-0 bg-stone-950/20 hover:bg-stone-950/40 transition-colors flex items-center justify-center group cursor-pointer"
                    onClick={() => {
                      if (setSelectedSermonId) setSelectedSermonId(sermon.id);
                      setCurrentPage('sermons');
                    }}
                  >
                    <div className="p-3 bg-indigo-600 rounded-full text-white group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="h-4 w-4 fill-white stroke-white" />
                    </div>
                  </motion.div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-stone-900/80 text-white text-[10px] rounded font-mono">
                    {sermon.duration}
                  </span>
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono tracking-wider">
                      {sermon.category}
                    </span>
                    <h3 className="text-lg font-light text-stone-900 font-serif leading-snug mt-1 hover:text-indigo-600 transition-colors cursor-pointer"
                      onClick={() => {
                        if (setSelectedSermonId) setSelectedSermonId(sermon.id);
                        setCurrentPage('sermons');
                      }}
                    >
                      {sermon.title}
                    </h3>
                    <p className="text-stone-400 text-xs font-medium mt-1">
                      Preached by: {sermon.preacher}
                    </p>
                    <p className="text-stone-500 text-xs mt-3 line-clamp-2 leading-relaxed font-light">
                      {sermon.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                    <span>{sermon.date}</span>
                    <button
                      onClick={() => {
                        if (setSelectedSermonId) setSelectedSermonId(sermon.id);
                        setCurrentPage('sermons');
                      }}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Watch Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerContainer>
        </section>
      </FadeUp>

      {/* ─── 7. Support & Generosity block ─────────────────────────────────── */}
      <FadeUp>
        <section className="bg-indigo-950 text-stone-300 py-16 rounded-2xl mx-4 my-6 border border-stone-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 150, damping: 12 }}
            >
              <HeartHandshake className="h-10 w-10 text-amber-300 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-3xl font-light text-white font-serif mb-4 leading-tight">
              Transparent Contribution Portal
            </h2>
            <p className="max-w-2xl mx-auto text-sm text-stone-300 mb-8 leading-relaxed font-light">
              "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver." SGM guarantees complete transparency in tracking building projects, youth instruments funds, outreach food drives, and camps. View your individual histories at any time.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (currentUser) {
                  setCurrentPage('dashboard');
                } else {
                  setCurrentPage('auth');
                }
              }}
              className="px-6 py-3 bg-white hover:bg-stone-50 text-indigo-950 font-bold rounded-lg shadow-sm border border-stone-200 transition-all cursor-pointer"
            >
              Go to Member Contributions
            </motion.button>
          </div>
        </section>
      </FadeUp>
    </div>
  );
};