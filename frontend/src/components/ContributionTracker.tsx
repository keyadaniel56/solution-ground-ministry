/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Contribution tracker updated for the Go/Gin backend types.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, ContributionType, ContributionPayment } from '../types';
import { HeartHandshake, PlusCircle, CreditCard, Clock, Check, AlertCircle, TrendingUp, Users, DollarSign, Calendar, Landmark, Info, Trash2, X } from 'lucide-react';

export const ContributionTracker: React.FC = () => {
  const { 
    currentUser, 
    contributionTypes, 
    payments, 
    createContributionType, 
    deleteContributionType,
    makeContribution, 
    updatePaymentStatus 
  } = useApp();

  // Dialog / Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<ContributionType | null>(null);

  // New Campaign Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-07-31');

  // New Payment Form State
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [cardNo, setCardNo] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);

  // Filter & tab controls for Admin view
  const [adminActiveTab, setAdminActiveTab] = useState<'campaigns' | 'ledger'>('campaigns');
  const [ledgerFilterStatus, setLedgerFilterStatus] = useState<string>('All');

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-stone-200">
        <AlertCircle className="h-10 w-10 text-amber-600 mx-auto mb-3" />
        <p className="text-stone-600 font-serif font-bold text-lg">Access Denied</p>
        <p className="text-stone-500 text-xs mt-1">Please log in to view and manage contribution portals.</p>
      </div>
    );
  }

  const isLeader = currentUser.role === 'youth_leader' || currentUser.role === 'pastor' || currentUser.role === 'admin';

  // 1. Calculate Financial Analytics
  const totalRaised = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRaised = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const userPayments = payments.filter((p) => p.user_id === currentUser.id);
  const userTotalGave = userPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  // Calculate campaign funding levels
  const getFundingLevel = (type: ContributionType) => {
    if (!type.target_amount || type.target_amount <= 0) return null;
    const raised = payments
      .filter((p) => p.contribution_id === type.id && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pct = Math.min(Math.round((raised / type.target_amount) * 100), 100);
    return { raised, pct };
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    await createContributionType(
      newTitle,
      newDesc,
      newTarget ? parseFloat(newTarget) : undefined,
      newDeadline || undefined
    );

    setNewTitle('');
    setNewDesc('');
    setNewTarget('');
    setShowCreateModal(false);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal || !payAmount) return;

    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid contribution amount.');
      return;
    }

    await makeContribution(String(showPayModal.id), amt, payMethod);
    setTxSuccess(true);
    setPayAmount('');
    setCardNo('');

    setTimeout(() => {
      setTxSuccess(false);
      setShowPayModal(null);
    }, 2000);
  };

  const togglePaymentStatus = (p: ContributionPayment) => {
    const nextStatus = p.status === 'completed' ? 'pending' : 'completed';
    updatePaymentStatus(String(p.id), nextStatus === 'completed' ? 'Completed' : 'Pending');
  };

  // Get display name for a contribution type
  const getContributionName = (contribId: number): string => {
    const found = contributionTypes.find((c) => c.id === contribId);
    return found ? found.title : 'General Fund';
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION A: LEADER ADMINISTRATIVE DASHBOARD */}
      {isLeader ? (
        <div className="space-y-6">
          
          {/* 1. Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                {currentUser.role === 'youth_leader' ? 'Youth Leader' : currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Control Panel
              </span>
              <h2 className="text-2xl font-light font-serif text-stone-900 mt-2">
                SGM Contribution Hub
              </h2>
            </div>
            <button
              id="btn-trigger-create-campaign"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Campaign</span>
            </button>
          </div>

          {/* 2. Analytical KPI Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-stone-500 uppercase">Total SGM Funds Raised</span>
                <div className="p-1.5 bg-green-50 rounded text-green-600"><DollarSign className="h-4 w-4" /></div>
              </div>
              <p className="text-2xl font-bold font-mono text-stone-900 mt-2">${totalRaised.toLocaleString()}</p>
              <span className="text-[10px] text-green-600 font-mono mt-1 block">✓ Verified completed deposits</span>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-stone-500 uppercase">Pending Audited Pledges</span>
                <div className="p-1.5 bg-indigo-50 rounded text-indigo-600"><Clock className="h-4 w-4" /></div>
              </div>
              <p className="text-2xl font-bold font-mono text-stone-900 mt-2">${pendingRaised.toLocaleString()}</p>
              <span className="text-[10px] text-indigo-600 font-mono mt-1 block">⚠️ Awaiting leader signoff</span>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-stone-500 uppercase">Active SGM Campaigns</span>
                <div className="p-1.5 bg-indigo-50 rounded text-indigo-600"><TrendingUp className="h-4 w-4" /></div>
              </div>
              <p className="text-2xl font-bold font-mono text-stone-900 mt-2">{contributionTypes.length}</p>
              <span className="text-[10px] text-stone-400 font-mono mt-1 block">Live giving options online</span>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-stone-500 uppercase">Member Donors</span>
                <div className="p-1.5 bg-blue-50 rounded text-blue-600"><Users className="h-4 w-4" /></div>
              </div>
              <p className="text-2xl font-bold font-mono text-stone-900 mt-2">
                {Array.from(new Set(payments.map((p) => p.user_id))).length}
              </p>
              <span className="text-[10px] text-blue-600 font-mono mt-1 block">Unique contributors registered</span>
            </div>
          </div>

          {/* 3. Navigation Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-100 rounded-lg p-1 max-w-sm">
            <button
              id="tab-leader-campaigns"
              onClick={() => setAdminActiveTab('campaigns')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-colors ${
                adminActiveTab === 'campaigns'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Giving Campaigns ({contributionTypes.length})
            </button>
            <button
              id="tab-leader-ledger"
              onClick={() => setAdminActiveTab('ledger')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-colors ${
                adminActiveTab === 'ledger'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Payment Audits ({payments.length})
            </button>
          </div>

          {/* 4. Tab 1: Campaigns list */}
          {adminActiveTab === 'campaigns' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contributionTypes.map((c) => {
                const funding = getFundingLevel(c);

                return (
                  <div key={c.id} className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col justify-between shadow-sm relative">
                    <button
                      onClick={() => deleteContributionType(String(c.id))}
                      className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-50 rounded transition-all"
                      title="Delete Campaign"
                      id={`btn-delete-campaign-${c.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div>
                      <h3 className="text-base font-bold text-stone-900 font-serif pr-8">{c.title}</h3>
                      <p className="text-stone-500 text-xs mt-1 leading-relaxed">{c.description}</p>
                      
                      {funding && (
                        <div className="mt-5 space-y-2">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-stone-500">Raised: <strong>${funding.raised.toLocaleString()}</strong></span>
                            <span className="text-indigo-600 font-bold">Goal: ${c.target_amount?.toLocaleString()}</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${funding.pct}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-stone-400">
                            <span>{funding.pct}% Completed</span>
                            {c.deadline && <span>Deadline: {c.deadline}</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-400">
                      <span>Created: {c.created_at ? c.created_at.split('T')[0] : ''}</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{c.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Tab 2: Admin Ledger / Member Payment List */}
          {adminActiveTab === 'ledger' && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 bg-stone-50">
                <span className="text-xs font-bold text-stone-700">Financial Ledger Auditing</span>
                
                {/* Status selector */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-stone-500">Filter:</span>
                  <select
                    value={ledgerFilterStatus}
                    onChange={(e) => setLedgerFilterStatus(e.target.value)}
                    className="p-1 bg-white border border-stone-200 rounded text-stone-700"
                  >
                    <option value="All">All Transactions</option>
                    <option value="completed">Completed Only</option>
                    <option value="pending">Pending Only</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 text-stone-600 font-mono font-semibold uppercase tracking-wider border-b border-stone-200">
                      <th className="p-4">Donor Name</th>
                      <th className="p-4">Campaign</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {payments
                      .filter((p) => ledgerFilterStatus === 'All' || p.status === ledgerFilterStatus)
                      .map((p) => {
                        const campaignName = getContributionName(p.contribution_id);
                        const donorName = p.user ? `${p.user.firstname} ${p.user.lastname}` : `User #${p.user_id}`;
                        
                        return (
                          <tr key={p.id} className="hover:bg-stone-50/50">
                            <td className="p-4 font-sans font-semibold text-stone-900">{donorName}</td>
                            <td className="p-4 text-stone-600 truncate max-w-[150px]" title={campaignName}>{campaignName}</td>
                            <td className="p-4 text-stone-400">{p.created_at ? p.created_at.split('T')[0] : ''}</td>
                            <td className="p-4 font-bold text-stone-900">${p.amount.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                p.status === 'completed'
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}>
                                {p.status === 'completed' ? 'Completed' : 'Pending'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                id={`btn-toggle-status-${p.id}`}
                                onClick={() => togglePaymentStatus(p)}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded text-[10px] transition-colors"
                              >
                                Toggle Status
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* SECTION B: MEMBER CONTRIBUTION PORTAL (Normal/Youth) */
        <div className="space-y-8">
          
          {/* Header block */}
          <div className="border-b border-stone-200 pb-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              SGM Stewardship System
            </span>
            <h2 className="text-2xl font-light font-serif text-stone-900 mt-2">
              Support SGM Ministries & Missions
            </h2>
            <p className="text-stone-500 text-xs mt-1 font-light">
              "Honor the Lord with your wealth and with the firstfruits of all your produce." Partner with SGM projects securely.
            </p>
          </div>

          {/* Quick Giving Info */}
          <div className="p-4 bg-stone-950 text-stone-300 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2.5 bg-indigo-600 text-white rounded-lg shrink-0">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-300 font-semibold leading-none">Your Stewardship</span>
                <p className="text-sm font-semibold text-white mt-0.5">Total Contributions Verified: ${userTotalGave.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-xs font-mono text-stone-400 bg-stone-900 px-3 py-1.5 rounded border border-stone-800">
              Tax Deductible Receipt Available
            </div>
          </div>

          {/* Active Campaigns grid to give */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-light text-stone-900">
              Active Giving Channels
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contributionTypes.filter((c) => c.status === 'active').map((c) => {
                const funding = getFundingLevel(c);

                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-sm">
                    <div>
                      <h4 className="text-base font-light text-stone-900 font-serif">{c.title}</h4>
                      <p className="text-stone-500 text-xs mt-1.5 leading-relaxed font-light">{c.description}</p>
                      
                      {funding && (
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-[11px] font-mono text-stone-500">
                            <span>Raised: ${funding.raised.toLocaleString()}</span>
                            <span>Goal: ${c.target_amount?.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${funding.pct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                      {c.deadline ? (
                        <span className="text-[10px] font-mono text-stone-400 flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Ends: {c.deadline}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-stone-400">Open Ongoing</span>
                      )}

                      <button
                        id={`btn-contribute-${c.id}`}
                        onClick={() => setShowPayModal(c)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Contribute Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Giving History List */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-serif font-light text-stone-900 mb-1">
              Your Contribution History
            </h3>
            <p className="text-xs text-stone-500 mb-6 font-light">
              Track your church financial contributions, tithing logs, and outreach donations.
            </p>

            {userPayments.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                <Info className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-500 text-xs">No contribution records found on this account yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 font-mono font-semibold uppercase border-b border-stone-200 text-[10px]">
                      <th className="p-3">Campaign Channel</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {userPayments.map((p) => {
                      const campaign = getContributionName(p.contribution_id);
                      
                      return (
                        <tr key={p.id}>
                          <td className="p-3 font-sans font-semibold text-stone-900">{campaign}</td>
                          <td className="p-3 text-stone-400">{p.created_at ? p.created_at.split('T')[0] : ''}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold ${
                              p.status === 'completed'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {p.status === 'completed' ? '✓ Completed' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-stone-900">${p.amount.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Youth Leader: Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold font-serif text-stone-900">Create SGM Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SGM Annual Camp Logistics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Target Funding Amount ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Campaign Goal Summary</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Briefly state why youths should contribute and how the funds will be used..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Member: Secure Payment Simulator Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold font-serif text-stone-900">
                Secure Stewardship Gateway
              </h3>
              <button onClick={() => setShowPayModal(null)} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {txSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-serif font-bold text-stone-900 text-base">Transaction Successful</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Your payment of <strong>${payAmount}</strong> has been securely transmitted. Thank you for your partnership!
                </p>
              </div>
            ) : (
              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100/80 text-xs">
                  <span className="block font-semibold text-indigo-800 uppercase tracking-wide">Selected Channel:</span>
                  <p className="font-serif text-stone-800 text-sm font-semibold mt-0.5">{showPayModal.title}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Enter Contribution Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 100"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-950 focus:outline-none"
                  >
                    <option value="Bank Transfer">Direct Bank Transfer</option>
                    <option value="Card Payment">Secure Card Payment</option>
                    <option value="Mobile Money">Mobile Money (M-Pesa / SGMpay)</option>
                  </select>
                </div>

                {payMethod === 'Card Payment' ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 font-mono">Simulated Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="4000 1234 5678 9010"
                        value={cardNo}
                        onChange={(e) => setCardNo(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-950 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-500 font-mono">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-500 font-mono">CVC</label>
                        <input type="password" placeholder="123" className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-[10px] font-mono text-stone-500 space-y-1.5 leading-relaxed">
                    <span className="font-bold text-stone-700 block text-xs">Simulated Settlement Details:</span>
                    <p>SGM Bank Account: <strong>Access Bank, 0098765432</strong></p>
                    <p>M-Pesa Paybill: <strong>SGM-YOUTH (900010)</strong></p>
                    <p>Contributions immediately complete in simulation mode.</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Transmit ${payAmount || '0'} Contribution</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};