/* API Service Client with Offline Mock Database Fallback */

const API_BASE_URL = 'http://localhost:5000/api';

// Retrieve token from local storage
const getAuthHeaders = () => {
  const token = localStorage.getItem('ziv_admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ── Simple in-memory cache ──────────────────────────────────────────────────
// Stores list results so navigating back to a page never shows the loader again.
// Invalidated after any write operation so data stays fresh.
const _cache = {};

function invalidateCache(...keys) {
  keys.forEach(k => { delete _cache[k]; });
}

// Helper to make request, fallback to mock data on error
async function request(endpoint, options = {}, mockFallbackData = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`API Error [${endpoint}]: ${error.message}. Using mockup fallback data.`);
    if (mockFallbackData !== null) {
      // Simulate delay for realism
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockFallbackData;
    }
    throw error;
  }
}

// Cached wrapper — returns instantly on repeat calls
async function cachedRequest(cacheKey, endpoint, mockFallbackData) {
  if (_cache[cacheKey] !== undefined) {
    return _cache[cacheKey];
  }
  const data = await request(endpoint, { method: 'GET' }, mockFallbackData);
  _cache[cacheKey] = data;
  return data;
}

/* ==========================================================================
   MOCK DATABASE (Stateful client-side fallback)
   ========================================================================== */

let mockUsers = [
  { id: 'usr-1', name: 'Bhaskar Baruah', email: 'bhaskar.b@gmail.com', phone: '+91 94350 12345', role: 'Donor', bloodGroup: 'O+', status: 'Active', joinedDate: '2026-01-15' },
  { id: 'usr-2', name: 'Jahnabi Deka', email: 'jahnabi.deka@gmail.com', phone: '+91 98640 54321', role: 'Seeker', bloodGroup: 'A-', status: 'Active', joinedDate: '2026-03-22' },
  { id: 'usr-3', name: 'Dipankar Saikia', email: 'dipankar.saikia@yahoo.com', phone: '+91 88110 98765', role: 'Donor', bloodGroup: 'B+', status: 'Suspended', joinedDate: '2026-04-10' },
  { id: 'usr-4', name: 'Runumi Gogoi', email: 'runumi.g@outlook.com', phone: '+91 70020 12346', role: 'Donor', bloodGroup: 'AB+', status: 'Active', joinedDate: '2026-05-18' },
  { id: 'usr-5', name: 'Nabajit Borah', email: 'nabajit.b@gmail.com', phone: '+91 91012 34567', role: 'Seeker', bloodGroup: 'O-', status: 'Active', joinedDate: '2026-06-01' },
];

let mockPartners = [
  { id: 'prt-1', name: 'Guwahati Medical College & Hospital (GMCH)', type: 'Hospital', address: 'Bhangagarh, Guwahati, Assam', phone: '+91 361 252 9457', email: 'contact@gmchassam.gov.in', contactPerson: 'Dr. Rini Barman' },
  { id: 'prt-2', name: 'Baruah Blood Bank & Research Center', type: 'Blood Bank', address: 'G.S. Road, Christian Basti, Guwahati', phone: '+91 94350 99999', email: 'intake@baruahbloodbank.org', contactPerson: 'Manoj Hazarika' },
  { id: 'prt-3', name: 'Dibrugarh University Health Centre', type: 'College', address: 'Rajabheta, Dibrugarh, Assam', phone: '+91 373 237 0231', email: 'healthcentre@dibru.ac.in', contactPerson: 'Nurse Runu Devi' },
];

let mockRequests = [
  { id: 'req-1', seekerName: 'Jahnabi Deka', bloodGroup: 'A-', unitsNeeded: 3, hospitalName: 'Guwahati Medical College & Hospital (GMCH)', urgency: 'High', status: 'Pending', documentUrl: '#', dateRequested: '2026-07-12' },
  { id: 'req-2', seekerName: 'Nabajit Borah', bloodGroup: 'O-', unitsNeeded: 2, hospitalName: 'Baruah Blood Bank & Research Center', urgency: 'High', status: 'Approved', documentUrl: '#', dateRequested: '2026-07-11' },
  { id: 'req-3', seekerName: 'Priyanka Dutta', bloodGroup: 'B+', unitsNeeded: 4, hospitalName: 'Guwahati Medical College & Hospital (GMCH)', urgency: 'Medium', status: 'Pending', documentUrl: '#', dateRequested: '2026-07-10' },
  { id: 'req-4', seekerName: 'Hiten Kalita', bloodGroup: 'AB-', unitsNeeded: 1, hospitalName: 'Baruah Blood Bank & Research Center', urgency: 'Low', status: 'Rejected', documentUrl: '#', dateRequested: '2026-07-08' },
];

let mockDisputes = [
  { id: 'dsp-1', reporterName: 'Bhaskar Baruah', offenderName: 'Dipankar Saikia', commentText: 'Spam comments about paying for blood services', reason: 'Commercial solicitation', dateReported: '2026-07-10', status: 'Pending' },
  { id: 'dsp-2', reporterName: 'Runumi Gogoi', offenderName: 'Baruah Blood Bank & Research Center', commentText: 'Unprofessional service response during intake', reason: 'Abusive language', dateReported: '2026-07-09', status: 'Resolved' },
];

let mockCertificates = [
  { id: 'cert-1', donorName: 'Bhaskar Baruah', email: 'bhaskar.b@gmail.com', donationCount: 8, tier: 'Platinum', issueDate: '2026-06-15' },
  { id: 'cert-2', donorName: 'Runumi Gogoi', email: 'runumi.g@outlook.com', donationCount: 4, tier: 'Gold', issueDate: '2026-07-01' },
  { id: 'cert-3', donorName: 'Dipankar Saikia', email: 'dipankar.saikia@yahoo.com', donationCount: 2, tier: 'Silver', issueDate: '2026-07-10' }
];

let mockBroadcasts = [
  { id: 'broad-1', title: 'Summer Blood Drive Initiative', message: 'Join Ziv at Baruah Blood Bank this Saturday for a community-wide drive. Earn double reward tiers.', target: 'All', category: 'Success', status: 'Active', datePublished: '2026-07-12' },
  { id: 'broad-2', title: 'Clinical Code Red: O- Urgently Needed', message: 'Immediate O- donor matching is approved for clinical emergencies at GMCH Hospital.', target: 'Donors', category: 'Danger', status: 'Active', datePublished: '2026-07-13' }
];

let mockCampaigns = [
  { id: 'camp-1', title: 'Weekly Honors Update', body: 'Platinum tier certificates have been processed. Print your badge in settings!', audience: 'Platinum Donors', reached: 45, status: 'Sent', dateSent: '2026-07-10' },
  { id: 'camp-2', title: 'New Facility Partnership', body: 'GMCH Hospital is now integrated as a gold intake facility.', audience: 'All Registered', reached: 238, status: 'Sent', dateSent: '2026-07-08' }
];

let mockSettings = {
  autoApproveVetting: false,
  minDonationsGold: 5,
  emailConfirmation: true,
  smsUrgentBroadcasts: true,
  sessionTimeout: '30m',
  enforce2FA: false
};

/* ==========================================================================
   API METHODS
   ========================================================================== */

export const api = {
  // Auth Service
  auth: {
    login: async (email, password) => {
      try {
        const url = `${API_BASE_URL}/auth/admin-login`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Invalid email or password');
        return await res.json();
      } catch (err) {
        console.warn(`Auth API Login failed: ${err.message}. Using simulated credential match.`);
        // Simulating admin login
        await new Promise(resolve => setTimeout(resolve, 600));
        if (email === 'admin@zivfoundation.org' && password === 'admin123') {
          return {
            token: 'mock-jwt-token-ziv-admin-2026',
            user: { id: 'admin-0', name: 'Ziv Admin', email: 'admin@zivfoundation.org', role: 'SuperAdmin' }
          };
        } else {
          throw new Error('Invalid credentials. Hint: admin@zivfoundation.org / admin123');
        }
      }
    },
    getCurrentUser: async () => {
      return request('/auth/me', { method: 'GET' }, {
        id: 'admin-0',
        name: 'Ziv Admin',
        email: 'admin@zivfoundation.org',
        role: 'SuperAdmin'
      });
    }
  },

  // Users Directory
  users: {
    list: async () => {
      return cachedRequest('users', '/users', mockUsers);
    },
    createOnBehalf: async (userData) => {
      const responseHandler = async () => {
        const newUser = {
          id: `usr-${Date.now()}`,
          joinedDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          ...userData
        };
        mockUsers = [newUser, ...mockUsers];
        return newUser;
      };
      const result = await request('/users/create-on-behalf', {
        method: 'POST',
        body: JSON.stringify(userData)
      }, await responseHandler());
      invalidateCache('users');
      return result;
    },
    toggleStatus: async (userId) => {
      const responseHandler = async () => {
        mockUsers = mockUsers.map(u => {
          if (u.id === userId) {
            return { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' };
          }
          return u;
        });
        return mockUsers.find(u => u.id === userId);
      };
      const result = await request(`/users/${userId}/toggle-status`, { method: 'POST' }, await responseHandler());
      invalidateCache('users');
      return result;
    }
  },

  // Partners Directory CRUD
  partners: {
    list: async () => {
      return cachedRequest('partners', '/partners', mockPartners);
    },
    create: async (partnerData) => {
      const responseHandler = async () => {
        const newPartner = {
          id: `prt-${Date.now()}`,
          ...partnerData
        };
        mockPartners = [...mockPartners, newPartner];
        return newPartner;
      };
      const result = await request('/partners', {
        method: 'POST',
        body: JSON.stringify(partnerData)
      }, await responseHandler());
      invalidateCache('partners');
      return result;
    },
    update: async (partnerId, partnerData) => {
      const responseHandler = async () => {
        mockPartners = mockPartners.map(p => {
          if (p.id === partnerId) {
            return { ...p, ...partnerData };
          }
          return p;
        });
        return mockPartners.find(p => p.id === partnerId);
      };
      const result = await request(`/partners/${partnerId}`, {
        method: 'PUT',
        body: JSON.stringify(partnerData)
      }, await responseHandler());
      invalidateCache('partners');
      return result;
    },
    delete: async (partnerId) => {
      const responseHandler = async () => {
        mockPartners = mockPartners.filter(p => p.id !== partnerId);
        return { success: true, id: partnerId };
      };
      const result = await request(`/partners/${partnerId}`, { method: 'DELETE' }, await responseHandler());
      invalidateCache('partners');
      return result;
    }
  },

  // Blood Request Moderation
  requests: {
    list: async () => {
      return cachedRequest('requests', '/requests', mockRequests);
    },
    updateStatus: async (requestId, status) => {
      const responseHandler = async () => {
        mockRequests = mockRequests.map(r => {
          if (r.id === requestId) {
            return { ...r, status };
          }
          return r;
        });
        return mockRequests.find(r => r.id === requestId);
      };
      const result = await request(`/requests/${requestId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }, await responseHandler());
      invalidateCache('requests');
      return result;
    },
    update: async (requestId, requestData) => {
      const responseHandler = async () => {
        mockRequests = mockRequests.map(r => {
          if (r.id === requestId) {
            return { ...r, ...requestData };
          }
          return r;
        });
        return mockRequests.find(r => r.id === requestId);
      };
      const result = await request(`/requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify(requestData)
      }, await responseHandler());
      invalidateCache('requests');
      return result;
    },
    delete: async (requestId) => {
      const responseHandler = async () => {
        mockRequests = mockRequests.filter(r => r.id !== requestId);
        return { success: true, id: requestId };
      };
      const result = await request(`/requests/${requestId}`, {
        method: 'DELETE'
      }, await responseHandler());
      invalidateCache('requests');
      return result;
    }
  },

  // Disputes & Comment Flagging
  disputes: {
    list: async () => {
      return cachedRequest('disputes', '/disputes', mockDisputes);
    },
    resolve: async (disputeId) => {
      const responseHandler = async () => {
        mockDisputes = mockDisputes.map(d => {
          if (d.id === disputeId) {
            return { ...d, status: 'Resolved' };
          }
          return d;
        });
        return mockDisputes.find(d => d.id === disputeId);
      };
      const result = await request(`/disputes/${disputeId}/resolve`, { method: 'PUT' }, await responseHandler());
      invalidateCache('disputes');
      return result;
    }
  },

  // Certificates Management
  certificates: {
    list: async () => {
      return cachedRequest('certificates', '/certificates', mockCertificates);
    },
    reissue: async (certId) => {
      const responseHandler = async () => {
        mockCertificates = mockCertificates.map(c => {
          if (c.id === certId) {
            return { ...c, issueDate: new Date().toISOString().split('T')[0] };
          }
          return c;
        });
        return mockCertificates.find(c => c.id === certId);
      };
      const result = await request(`/certificates/${certId}/reissue`, { method: 'POST' }, await responseHandler());
      invalidateCache('certificates');
      return result;
    },
    delete: async (certId) => {
      const responseHandler = async () => {
        mockCertificates = mockCertificates.filter(c => {
          return c.id !== certId;
        });
        return { success: true, id: certId };
      };
      const result = await request(`/certificates/${certId}`, { method: 'DELETE' }, await responseHandler());
      invalidateCache('certificates');
      return result;
    }
  },

  // Broadcast Panel Service
  broadcasts: {
    list: async () => {
      return cachedRequest('broadcasts', '/broadcasts', mockBroadcasts);
    },
    create: async (payload) => {
      const responseHandler = async () => {
        const newBroad = {
          id: `broad-${Date.now()}`,
          title: payload.title,
          message: payload.message,
          target: payload.target || 'All',
          category: payload.category || 'Info',
          status: 'Active',
          datePublished: new Date().toISOString().split('T')[0]
        };
        mockBroadcasts = [newBroad, ...mockBroadcasts];
        return newBroad;
      };
      const result = await request('/broadcasts', { method: 'POST', body: JSON.stringify(payload) }, await responseHandler());
      invalidateCache('broadcasts');
      return result;
    },
    expire: async (broadId) => {
      const responseHandler = async () => {
        mockBroadcasts = mockBroadcasts.map(b => {
          if (b.id === broadId) {
            return { ...b, status: 'Expired' };
          }
          return b;
        });
        return mockBroadcasts.find(b => b.id === broadId);
      };
      const result = await request(`/broadcasts/${broadId}/expire`, { method: 'PUT' }, await responseHandler());
      invalidateCache('broadcasts');
      return result;
    },
    delete: async (broadId) => {
      const responseHandler = async () => {
        mockBroadcasts = mockBroadcasts.filter(b => b.id !== broadId);
        return { success: true, id: broadId };
      };
      const result = await request(`/broadcasts/${broadId}`, { method: 'DELETE' }, await responseHandler());
      invalidateCache('broadcasts');
      return result;
    }
  },

  // Push Notifications Service
  campaigns: {
    list: async () => {
      return cachedRequest('campaigns', '/campaigns', mockCampaigns);
    },
    dispatch: async (payload) => {
      const responseHandler = async () => {
        const newCamp = {
          id: `camp-${Date.now()}`,
          title: payload.title,
          body: payload.body,
          audience: payload.audience || 'All Registered',
          reached: Math.floor(Math.random() * 300) + 12,
          status: 'Sent',
          dateSent: new Date().toISOString().split('T')[0]
        };
        mockCampaigns = [newCamp, ...mockCampaigns];
        return newCamp;
      };
      const result = await request('/campaigns/dispatch', { method: 'POST', body: JSON.stringify(payload) }, await responseHandler());
      invalidateCache('campaigns');
      return result;
    },
    delete: async (campId) => {
      const responseHandler = async () => {
        mockCampaigns = mockCampaigns.filter(c => c.id !== campId);
        return { success: true, id: campId };
      };
      const result = await request(`/campaigns/${campId}`, { method: 'DELETE' }, await responseHandler());
      invalidateCache('campaigns');
      return result;
    }
  },

  // System Settings Service
  settings: {
    get: async () => {
      return cachedRequest('settings', '/settings', mockSettings);
    },
    update: async (payload) => {
      const responseHandler = async () => {
        mockSettings = { ...mockSettings, ...payload };
        return mockSettings;
      };
      const result = await request('/settings', { method: 'PUT', body: JSON.stringify(payload) }, await responseHandler());
      invalidateCache('settings');
      return result;
    }
  }
};
