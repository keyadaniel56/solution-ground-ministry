/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Types aligned with the Go/Gin backend models.
 */

export enum UserRole {
  NORMAL = 'member',
  YOUTH = 'member',
  YOUTH_LEADER = 'youth_leader',
  PASTOR = 'pastor',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: string;
  gender: string;
  category: string;
  created_at: string;
  // Computed helper
  fullName?: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  category: string;
  description: string;
  audioUrl?: string;
  videoUrl?: string;
  duration: string;
  thumbnailUrl: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  category: 'General' | 'Youth' | 'Worship' | 'Community';
  capacity?: number;
  registeredUserIds: string[]; // Track registrations
  imageUrl: string;
}

export interface ContributionType {
  id: number;
  user_id: number;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  created_by: string;
  status: string;
  deadline: string;
  created_at: string;
  payments?: ContributionPayment[];
}

export interface ContributionPayment {
  id: number;
  contribution_id: number;
  user_id: number;
  amount: number;
  mpesa_code: string;
  phone: string;
  status: string;
  created_at: string;
  user?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export interface Tithe {
  id: number;
  user_id: number;
  amount: number;
  mpesa_code: string;
  phone: string;
  month: string;
  year: number;
  status: string;
  created_at: string;
  user?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export interface Offering {
  id: number;
  user_id: number;
  amount: number;
  mpesa_code: string;
  phone: string;
  service_type: string;
  status: string;
  created_at: string;
  user?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export interface MpesaTransaction {
  id: number;
  checkout_request_id: string;
  merchant_request_id: string;
  phone: string;
  amount: number;
  mpesa_code: string;
  result_desc: string;
  status: string;
  payment_type: string;
  payment_ref_id: number;
  created_at: string;
}