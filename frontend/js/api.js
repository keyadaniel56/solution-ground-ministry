// API Configuration
const API_BASE = '/api';

// Get auth token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Get current user info
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/static/login.html';
        return false;
    }
    return true;
}

// Get role-based redirect URL
function getDashboardURL(role) {
    switch(role) {
        case 'pastor':
        case 'admin':
            return '/static/pastor-dashboard.html';
        case 'youth_leader':
            return '/static/youth-dashboard.html';
        case 'member':
            return '/static/member-dashboard.html';
        default:
            return '/static/login.html';
    }
}

// Generic API request function
async function apiRequest(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Request failed');
        }

        return result;
    } catch (error) {
        throw error;
    }
}

// Auth API calls
async function login(email, password) {
    const result = await apiRequest('/login', 'POST', { email, password });
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify({
        id: result.user_id,
        role: result.role,
        name: result.name,
        category: result.category
    }));
    return result;
}

async function register(userData) {
    const result = await apiRequest('/register', 'POST', userData);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify({
        id: result.user_id,
        role: result.role,
        name: `${userData.firstname} ${userData.lastname}`
    }));
    return result;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/static/login.html';
}

// Dashboard API calls
async function getDashboardStats() {
    return await apiRequest('/dashboard/stats');
}

// Contribution API calls
async function getContributions() {
    return await apiRequest('/contributions');
}

async function getContribution(id) {
    return await apiRequest(`/contributions/${id}`);
}

async function createContribution(data) {
    return await apiRequest('/contributions', 'POST', data);
}

async function contributeToFund(id, data) {
    return await apiRequest(`/contributions/${id}/pay`, 'POST', data);
}

async function getContributionPayments(id) {
    return await apiRequest(`/contributions/${id}/payments`);
}

async function updateContributionStatus(id, status) {
    return await apiRequest(`/contributions/${id}/status`, 'PUT', { status });
}

// Tithe API calls
async function payTithe(data) {
    return await apiRequest('/tithes/pay', 'POST', data);
}

async function getTithes() {
    return await apiRequest('/tithes');
}

// Offering API calls
async function payOffering(data) {
    return await apiRequest('/offerings/pay', 'POST', data);
}

async function getOfferings() {
    return await apiRequest('/offerings');
}

// M-Pesa API calls
async function initiateSTKPush(data) {
    return await apiRequest('/mpesa/stkpush', 'POST', data);
}

async function getTransactions() {
    return await apiRequest('/mpesa/transactions');
}

// User API calls
async function getProfile() {
    return await apiRequest('/profile');
}

async function getUsers() {
    return await apiRequest('/users');
}

// Format helpers
function formatCurrency(amount) {
    return 'KSh ' + Number(amount).toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getProgressPercent(raised, target) {
    if (target === 0) return 0;
    return Math.min(100, Math.round((raised / target) * 100));
}

function getStatusBadge(status) {
    const badges = {
        'active': 'badge-active',
        'completed': 'badge-completed',
        'cancelled': 'badge-cancelled',
        'pending': 'badge-pending'
    };
    return `<span class="badge ${badges[status] || 'badge-pending'}">${status}</span>`;
}