/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * API service layer for communicating with the Go/Gin backend.
 */

const API_BASE = '/api';

// Token management
let authToken: string | null = localStorage.getItem('sgm_api_token');

export const setToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('sgm_api_token', token);
  } else {
    localStorage.removeItem('sgm_api_token');
  }
};

export const getToken = (): string | null => authToken;

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  authenticated = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authenticated && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  message: string;
  token: string;
  user_id: number;
  role: string;
  name: string;
  category: string;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user_id: number;
  role: string;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<LoginResponse>('POST', '/login', { email, password }),

  register: (data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    gender?: string;
    category?: string;
  }) => request<RegisterResponse>('POST', '/register', data),

  getProfile: () =>
    request<{
      id: number;
      firstname: string;
      lastname: string;
      email: string;
      phone: string;
      role: string;
      gender: string;
      category: string;
      created_at: string;
    }>('GET', '/profile'),

  getUsers: () =>
    request<
      Array<{
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        role: string;
        gender: string;
        category: string;
        created_at: string;
      }>
    >('GET', '/users'),

  // Dashboard
  getDashboardStats: () =>
    request<Record<string, number | string>>('GET', '/dashboard/stats'),

  // Contributions
  createContribution: (data: {
    title: string;
    description?: string;
    target_amount: number;
    deadline?: string;
  }) => request<{ message: string; id: number }>('POST', '/contributions', data),

  getContributions: () =>
    request<
      Array<{
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
        payments?: Array<{
          id: number;
          contribution_id: number;
          user_id: number;
          amount: number;
          mpesa_code: string;
          phone: string;
          status: string;
          created_at: string;
          user: {
            id: number;
            firstname: string;
            lastname: string;
            email: string;
          };
        }>;
      }>
    >('GET', '/contributions'),

  getContribution: (id: number) =>
    request<{
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
      payments?: Array<{
        id: number;
        contribution_id: number;
        user_id: number;
        amount: number;
        mpesa_code: string;
        phone: string;
        status: string;
        created_at: string;
        user: { id: number; firstname: string; lastname: string; email: string };
      }>;
    }>('GET', `/contributions/${id}`),

  contributeToFund: (id: number, data: { amount: number; mpesa_code?: string; phone?: string }) =>
    request<{ message: string; amount: number; total: number }>(
      'POST',
      `/contributions/${id}/pay`,
      data,
    ),

  getContributionPayments: (id: number) =>
    request<
      Array<{
        id: number;
        contribution_id: number;
        user_id: number;
        amount: number;
        mpesa_code: string;
        phone: string;
        status: string;
        created_at: string;
        user: { id: number; firstname: string; lastname: string; email: string };
      }>
    >('GET', `/contributions/${id}/payments`),

  updateContributionStatus: (id: number, status: string) =>
    request<{ message: string }>('PUT', `/contributions/${id}/status`, { status }),

  // Tithes
  payTithe: (data: { amount: number; mpesa_code?: string; phone?: string; month?: string }) =>
    request<{ message: string; id: number }>('POST', '/tithes/pay', data),

  getTithes: () =>
    request<
      Array<{
        id: number;
        user_id: number;
        amount: number;
        mpesa_code: string;
        phone: string;
        month: string;
        year: number;
        status: string;
        created_at: string;
        user: { id: number; firstname: string; lastname: string; email: string };
      }>
    >('GET', '/tithes'),

  // Offerings
  payOffering: (data: {
    amount: number;
    mpesa_code?: string;
    phone?: string;
    service_type?: string;
  }) => request<{ message: string; id: number }>('POST', '/offerings/pay', data),

  getOfferings: () =>
    request<
      Array<{
        id: number;
        user_id: number;
        amount: number;
        mpesa_code: string;
        phone: string;
        service_type: string;
        status: string;
        created_at: string;
        user: { id: number; firstname: string; lastname: string; email: string };
      }>
    >('GET', '/offerings'),

  // M-Pesa
  initiateSTKPush: (data: { phone: string; amount: number; payment_type?: string; ref_id?: number }) =>
    request<{
      message: string;
      checkout_id: string;
      merchant_id: string;
      response_code: string;
      response_desc: string;
      transaction_id: number;
    }>('POST', '/mpesa/stkpush', data),

  getTransactions: () =>
    request<
      Array<{
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
      }>
    >('GET', '/mpesa/transactions'),
};