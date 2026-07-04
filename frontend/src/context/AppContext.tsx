/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AppContext now communicates with the Go/Gin backend via the API service.
 * Local state is hydrated from the backend on login and kept in sync.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, Sermon, ChurchEvent, ContributionType, ContributionPayment } from '../types';
import { INITIAL_SERMONS, INITIAL_EVENTS, INITIAL_CONTRIBUTION_TYPES } from '../data/mockData';
import { api, setToken, getToken } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  sermons: Sermon[];
  events: ChurchEvent[];
  contributionTypes: ContributionType[];
  payments: ContributionPayment[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string, role: UserRole, phone?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (fullName: string, phone?: string) => void;
  registerForEvent: (eventId: string) => void;
  unregisterFromEvent: (eventId: string) => void;
  createContributionType: (title: string, description: string, targetAmount?: number, deadline?: string) => void;
  deleteContributionType: (id: string) => void;
  makeContribution: (contributionTypeId: string, amount: number, paymentMethod: string) => void;
  updatePaymentStatus: (paymentId: string, status: 'Pending' | 'Completed') => void;
  addSermon: (sermon: Omit<Sermon, 'id'>) => void;
  addEvent: (event: Omit<ChurchEvent, 'id' | 'registeredUserIds'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Seed data for static features (sermons, events) ─────────────────────────
const SEED_USERS: User[] = [
  {
    id: 1,
    firstname: 'Grace',
    lastname: 'Olamide',
    email: 'leader@sgm.org',
    role: 'youth_leader',
    phone: '+234 812 345 6789',
    gender: 'female',
    category: 'youth',
    created_at: '2026-01-10T00:00:00Z',
    fullName: 'Grace Olamide',
  },
  {
    id: 2,
    firstname: 'Efe',
    lastname: 'Clinton',
    email: 'youth@sgm.org',
    role: 'member',
    phone: '+234 809 876 5432',
    gender: 'male',
    category: 'youth',
    created_at: '2026-03-15T00:00:00Z',
    fullName: 'Efe Clinton',
  },
  {
    id: 3,
    firstname: 'Sarah',
    lastname: 'Johnson',
    email: 'member@sgm.org',
    role: 'member',
    phone: '+234 703 111 2222',
    gender: 'female',
    category: 'adult',
    created_at: '2026-02-20T00:00:00Z',
    fullName: 'Sarah Johnson',
  },
];

const SEED_PAYMENTS: ContributionPayment[] = [
  {
    id: 1,
    contribution_id: 1,
    user_id: 2,
    amount: 150,
    status: 'completed',
    mpesa_code: '',
    phone: '',
    created_at: '2026-07-01T00:00:00Z',
  },
  {
    id: 2,
    contribution_id: 1,
    user_id: 3,
    amount: 200,
    status: 'completed',
    mpesa_code: '',
    phone: '',
    created_at: '2026-07-02T00:00:00Z',
  },
  {
    id: 3,
    contribution_id: 2,
    user_id: 2,
    amount: 50,
    status: 'pending',
    mpesa_code: '',
    phone: '',
    created_at: '2026-07-03T00:00:00Z',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ─── Auth state ────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('sgm_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  // ─── Data state (hydrated from backend or fallback to localStorage) ────────
  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('sgm_users');
    return local ? JSON.parse(local) : SEED_USERS;
  });

  const [sermons, setSermons] = useState<Sermon[]>(() => {
    const local = localStorage.getItem('sgm_sermons');
    return local ? JSON.parse(local) : INITIAL_SERMONS;
  });

  const [events, setEvents] = useState<ChurchEvent[]>(() => {
    const local = localStorage.getItem('sgm_events');
    return local ? JSON.parse(local) : INITIAL_EVENTS;
  });

  const [contributionTypes, setContributionTypes] = useState<ContributionType[]>(() => {
    const local = localStorage.getItem('sgm_contribution_types');
    return local ? JSON.parse(local) : INITIAL_CONTRIBUTION_TYPES;
  });

  const [payments, setPayments] = useState<ContributionPayment[]>(() => {
    const local = localStorage.getItem('sgm_payments');
    return local ? JSON.parse(local) : SEED_PAYMENTS;
  });

  // ─── Hydrate from backend when user logs in ────────────────────────────────
  const hydrateFromBackend = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [profile, contribs] = await Promise.all([
        api.getProfile(),
        api.getContributions(),
      ]);

      // Build fullName from firstname + lastname
      const fullName = `${profile.firstname} ${profile.lastname}`;
      const user: User = { ...profile, fullName };
      setCurrentUser(user);
      localStorage.setItem('sgm_current_user', JSON.stringify(user));

      // Map contributions to our ContributionType shape
      const mappedContribs: ContributionType[] = contribs.map((c) => ({
        id: c.id,
        user_id: c.user_id,
        title: c.title,
        description: c.description,
        target_amount: c.target_amount,
        raised_amount: c.raised_amount,
        created_by: c.created_by,
        status: c.status,
        deadline: c.deadline,
        created_at: c.created_at,
        payments: c.payments?.map((p) => ({
          id: p.id,
          contribution_id: p.contribution_id,
          user_id: p.user_id,
          amount: p.amount,
          mpesa_code: p.mpesa_code,
          phone: p.phone,
          status: p.status,
          created_at: p.created_at,
          user: p.user,
        })),
      }));
      setContributionTypes(mappedContribs);
      localStorage.setItem('sgm_contribution_types', JSON.stringify(mappedContribs));

      // Flatten all payments from all contributions
      const allPayments: ContributionPayment[] = [];
      for (const c of mappedContribs) {
        if (c.payments) {
          allPayments.push(...c.payments);
        }
      }
      setPayments(allPayments);
      localStorage.setItem('sgm_payments', JSON.stringify(allPayments));
    } catch (err) {
      console.warn('Failed to hydrate from backend, using local state:', err);
    }
  }, []);

  // On mount, if we have a token, try to hydrate
  useEffect(() => {
    if (getToken()) {
      hydrateFromBackend();
    }
  }, [hydrateFromBackend]);

  // ─── Persist static data to localStorage ───────────────────────────────────
  useEffect(() => { localStorage.setItem('sgm_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('sgm_sermons', JSON.stringify(sermons)); }, [sermons]);
  useEffect(() => { localStorage.setItem('sgm_events', JSON.stringify(events)); }, [events]);

  // ─── Auth Operations ───────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.login(email, password);
      setToken(res.token);

      const user: User = {
        id: res.user_id,
        firstname: res.name.split(' ')[0] || '',
        lastname: res.name.split(' ').slice(1).join(' ') || '',
        email,
        phone: '',
        role: res.role,
        gender: '',
        category: res.category || '',
        created_at: new Date().toISOString(),
        fullName: res.name,
      };

      setCurrentUser(user);
      localStorage.setItem('sgm_current_user', JSON.stringify(user));

      // Hydrate contributions from backend
      await hydrateFromBackend();
      return true;
    } catch (err: any) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    role: UserRole,
    phone?: string,
  ): Promise<User> => {
    const nameParts = fullName.trim().split(/\s+/);
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    // Map frontend role to backend role
    let backendRole = 'member';
    if (role === UserRole.YOUTH_LEADER) backendRole = 'youth_leader';
    else if (role === UserRole.PASTOR) backendRole = 'pastor';
    else if (role === UserRole.ADMIN) backendRole = 'admin';

    // Map category based on role
    let category = 'adult';
    if (role === UserRole.YOUTH || role === UserRole.YOUTH_LEADER) category = 'youth';

    try {
      const res = await api.register({
        firstname,
        lastname,
        email,
        password,
        phone: phone || '',
        role: backendRole,
        gender: '',
        category,
      });

      setToken(res.token);

      const user: User = {
        id: res.user_id,
        firstname,
        lastname,
        email,
        phone: phone || '',
        role: res.role,
        gender: '',
        category,
        created_at: new Date().toISOString(),
        fullName,
      };

      setCurrentUser(user);
      localStorage.setItem('sgm_current_user', JSON.stringify(user));
      return user;
    } catch (err: any) {
      console.error('Signup failed:', err);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('sgm_current_user');
  };

  const updateProfile = (fullName: string, phone?: string) => {
    if (!currentUser) return;

    const nameParts = fullName.trim().split(/\s+/);
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    const updatedUser: User = {
      ...currentUser,
      firstname,
      lastname,
      phone: phone || '',
      fullName,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('sgm_current_user', JSON.stringify(updatedUser));
  };

  // ─── Event Registrations (local only, no backend endpoint) ─────────────────
  const registerForEvent = (eventId: string) => {
    if (!currentUser) return;
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          if (!evt.registeredUserIds.includes(String(currentUser.id))) {
            return {
              ...evt,
              registeredUserIds: [...evt.registeredUserIds, String(currentUser.id)],
            };
          }
        }
        return evt;
      })
    );
  };

  const unregisterFromEvent = (eventId: string) => {
    if (!currentUser) return;
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            registeredUserIds: evt.registeredUserIds.filter((id) => id !== String(currentUser.id)),
          };
        }
        return evt;
      })
    );
  };

  // ─── Contributions (backed by API) ─────────────────────────────────────────
  const createContributionType = async (title: string, description: string, targetAmount?: number, deadline?: string) => {
    if (!currentUser || (currentUser.role !== 'youth_leader' && currentUser.role !== 'pastor' && currentUser.role !== 'admin')) return;

    try {
      const res = await api.createContribution({
        title,
        description: description || '',
        target_amount: targetAmount || 0,
        deadline: deadline || '',
      });

      // Refresh contributions from backend
      const contribs = await api.getContributions();
      const mappedContribs: ContributionType[] = contribs.map((c) => ({
        id: c.id,
        user_id: c.user_id,
        title: c.title,
        description: c.description,
        target_amount: c.target_amount,
        raised_amount: c.raised_amount,
        created_by: c.created_by,
        status: c.status,
        deadline: c.deadline,
        created_at: c.created_at,
        payments: c.payments?.map((p) => ({
          id: p.id,
          contribution_id: p.contribution_id,
          user_id: p.user_id,
          amount: p.amount,
          mpesa_code: p.mpesa_code,
          phone: p.phone,
          status: p.status,
          created_at: p.created_at,
          user: p.user,
        })),
      }));
      setContributionTypes(mappedContribs);
      localStorage.setItem('sgm_contribution_types', JSON.stringify(mappedContribs));
    } catch (err) {
      console.error('Failed to create contribution:', err);
    }
  };

  const deleteContributionType = async (id: string) => {
    if (!currentUser || (currentUser.role !== 'youth_leader' && currentUser.role !== 'pastor' && currentUser.role !== 'admin')) return;

    try {
      await api.updateContributionStatus(Number(id), 'cancelled');
      // Refresh
      const contribs = await api.getContributions();
      const mappedContribs: ContributionType[] = contribs.map((c) => ({
        id: c.id,
        user_id: c.user_id,
        title: c.title,
        description: c.description,
        target_amount: c.target_amount,
        raised_amount: c.raised_amount,
        created_by: c.created_by,
        status: c.status,
        deadline: c.deadline,
        created_at: c.created_at,
        payments: c.payments?.map((p) => ({
          id: p.id,
          contribution_id: p.contribution_id,
          user_id: p.user_id,
          amount: p.amount,
          mpesa_code: p.mpesa_code,
          phone: p.phone,
          status: p.status,
          created_at: p.created_at,
          user: p.user,
        })),
      }));
      setContributionTypes(mappedContribs);
      localStorage.setItem('sgm_contribution_types', JSON.stringify(mappedContribs));
    } catch (err) {
      console.error('Failed to delete contribution:', err);
    }
  };

  const makeContribution = async (contributionTypeId: string, amount: number, paymentMethod: string) => {
    if (!currentUser) return;

    try {
      const res = await api.contributeToFund(Number(contributionTypeId), {
        amount,
        phone: currentUser.phone || '',
      });

      // Refresh contributions to get updated payments
      const contribs = await api.getContributions();
      const mappedContribs: ContributionType[] = contribs.map((c) => ({
        id: c.id,
        user_id: c.user_id,
        title: c.title,
        description: c.description,
        target_amount: c.target_amount,
        raised_amount: c.raised_amount,
        created_by: c.created_by,
        status: c.status,
        deadline: c.deadline,
        created_at: c.created_at,
        payments: c.payments?.map((p) => ({
          id: p.id,
          contribution_id: p.contribution_id,
          user_id: p.user_id,
          amount: p.amount,
          mpesa_code: p.mpesa_code,
          phone: p.phone,
          status: p.status,
          created_at: p.created_at,
          user: p.user,
        })),
      }));
      setContributionTypes(mappedContribs);
      localStorage.setItem('sgm_contribution_types', JSON.stringify(mappedContribs));

      // Flatten payments
      const allPayments: ContributionPayment[] = [];
      for (const c of mappedContribs) {
        if (c.payments) {
          allPayments.push(...c.payments);
        }
      }
      setPayments(allPayments);
      localStorage.setItem('sgm_payments', JSON.stringify(allPayments));
    } catch (err) {
      console.error('Failed to make contribution:', err);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: 'Pending' | 'Completed') => {
    if (!currentUser || (currentUser.role !== 'youth_leader' && currentUser.role !== 'pastor' && currentUser.role !== 'admin')) return;

    // The backend doesn't have a direct payment status update endpoint,
    // so we update locally for now
    setPayments((prev) =>
      prev.map((p) => (String(p.id) === paymentId ? { ...p, status: status.toLowerCase() } : p))
    );
  };

  // ─── Static features (sermons, events) ─────────────────────────────────────
  const addSermon = (sermon: Omit<Sermon, 'id'>) => {
    const newSermon: Sermon = {
      ...sermon,
      id: 'sermon-' + Date.now(),
    };
    setSermons((prev) => [newSermon, ...prev]);
  };

  const addEvent = (event: Omit<ChurchEvent, 'id' | 'registeredUserIds'>) => {
    const newEvent: ChurchEvent = {
      ...event,
      id: 'event-' + Date.now(),
      registeredUserIds: [],
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        sermons,
        events,
        contributionTypes,
        payments,
        login,
        signup,
        logout,
        updateProfile,
        registerForEvent,
        unregisterFromEvent,
        createContributionType,
        deleteContributionType,
        makeContribution,
        updatePaymentStatus,
        addSermon,
        addEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};