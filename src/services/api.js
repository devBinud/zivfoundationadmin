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
  { id: 'usr-1',  name: 'Bhaskar Baruah',     email: 'bhaskar.b@gmail.com',          phone: '+91 94350 12345', role: 'Donor',  bloodGroup: 'O+',  status: 'Active',    joinedDate: '2026-01-15' },
  { id: 'usr-2',  name: 'Jahnabi Deka',        email: 'jahnabi.deka@gmail.com',       phone: '+91 98640 54321', role: 'Seeker', bloodGroup: 'A-',  status: 'Active',    joinedDate: '2026-03-22' },
  { id: 'usr-3',  name: 'Dipankar Saikia',     email: 'dipankar.saikia@yahoo.com',    phone: '+91 88110 98765', role: 'Donor',  bloodGroup: 'B+',  status: 'Suspended', joinedDate: '2026-04-10' },
  { id: 'usr-4',  name: 'Runumi Gogoi',        email: 'runumi.g@outlook.com',         phone: '+91 70020 12346', role: 'Donor',  bloodGroup: 'AB+', status: 'Active',    joinedDate: '2026-05-18' },
  { id: 'usr-5',  name: 'Nabajit Borah',       email: 'nabajit.b@gmail.com',          phone: '+91 91012 34567', role: 'Seeker', bloodGroup: 'O-',  status: 'Active',    joinedDate: '2026-06-01' },
  { id: 'usr-6',  name: 'Priyanka Dutta',      email: 'priyanka.dutta@gmail.com',     phone: '+91 96780 11223', role: 'Donor',  bloodGroup: 'A+',  status: 'Active',    joinedDate: '2026-02-08' },
  { id: 'usr-7',  name: 'Hiten Kalita',        email: 'hiten.kalita@rediffmail.com',  phone: '+91 94013 44556', role: 'Seeker', bloodGroup: 'B-',  status: 'Active',    joinedDate: '2026-03-30' },
  { id: 'usr-8',  name: 'Mousumi Hazarika',    email: 'mousumi.haz@gmail.com',        phone: '+91 85319 77889', role: 'Donor',  bloodGroup: 'O+',  status: 'Suspended', joinedDate: '2026-01-27' },
  { id: 'usr-9',  name: 'Ranjit Phukan',       email: 'ranjit.phukan@yahoo.com',      phone: '+91 78967 20011', role: 'Donor',  bloodGroup: 'AB-', status: 'Active',    joinedDate: '2026-04-14' },
  { id: 'usr-10', name: 'Anita Bhuyan',        email: 'anita.bhuyan@gmail.com',       phone: '+91 97064 33445', role: 'Seeker', bloodGroup: 'A+',  status: 'Active',    joinedDate: '2026-05-05' },
  { id: 'usr-11', name: 'Kamal Nath Sharma',   email: 'kamal.sharma@gmail.com',       phone: '+91 93651 55667', role: 'Donor',  bloodGroup: 'B+',  status: 'Active',    joinedDate: '2026-06-12' },
  { id: 'usr-12', name: 'Deepjyoti Choudhury', email: 'deepjyoti.c@outlook.com',      phone: '+91 80111 98234', role: 'Seeker', bloodGroup: 'O-',  status: 'Suspended', joinedDate: '2026-02-19' },
  { id: 'usr-13', name: 'Purnima Rajkhowa',    email: 'purnima.raj@gmail.com',        phone: '+91 91502 66778', role: 'Donor',  bloodGroup: 'A-',  status: 'Active',    joinedDate: '2026-07-01' },
  { id: 'usr-14', name: 'Sanjib Bordoloi',     email: 'sanjib.bordoloi@gmail.com',    phone: '+91 98765 43210', role: 'Seeker', bloodGroup: 'AB+', status: 'Active',    joinedDate: '2026-07-05' },
  { id: 'usr-15', name: 'Nilufar Begum',       email: 'nilufar.begum@rediffmail.com', phone: '+91 94011 22334', role: 'Donor',  bloodGroup: 'O+',  status: 'Active',    joinedDate: '2026-07-10' },
];

let mockPartners = [
  { id: 'prt-1',  name: 'Guwahati Medical College & Hospital (GMCH)',     type: 'Hospital',   address: 'Bhangagarh, Guwahati, Assam',                phone: '+91 361 252 9457', email: 'contact@gmchassam.gov.in',         contactPerson: 'Dr. Rini Barman' },
  { id: 'prt-2',  name: 'Baruah Blood Bank & Research Center',            type: 'Blood Bank', address: 'G.S. Road, Christian Basti, Guwahati',        phone: '+91 94350 99999', email: 'intake@baruahbloodbank.org',        contactPerson: 'Manoj Hazarika' },
  { id: 'prt-3',  name: 'Dibrugarh University Health Centre',             type: 'College',    address: 'Rajabheta, Dibrugarh, Assam',                 phone: '+91 373 237 0231', email: 'healthcentre@dibru.ac.in',         contactPerson: 'Nurse Runu Devi' },
  { id: 'prt-4',  name: 'Assam Medical College & Hospital (AMCH)',        type: 'Hospital',   address: 'Barbari, Dibrugarh, Assam 786002',            phone: '+91 373 223 0001', email: 'contact@amchdibrugarh.gov.in',     contactPerson: 'Dr. Pranjal Bora' },
  { id: 'prt-5',  name: 'Pratiksha Hospital',                             type: 'Hospital',   address: 'Hatigaon, Guwahati, Assam 781038',            phone: '+91 361 230 0100', email: 'info@pratikshahospital.com',       contactPerson: 'Dr. Monikangkana Das' },
  { id: 'prt-6',  name: 'Jorhat Medical College & Hospital (JMCH)',       type: 'Hospital',   address: 'Barbheta, Jorhat, Assam 785001',              phone: '+91 376 232 0002', email: 'jmch@assam.gov.in',                contactPerson: 'Dr. Hemanta Gogoi' },
  { id: 'prt-7',  name: 'Red Cross Blood Bank Guwahati',                  type: 'Blood Bank', address: 'Red Cross Road, Paltan Bazar, Guwahati',      phone: '+91 361 254 1234', email: 'bloodbank@redcrossassam.org',      contactPerson: 'Bina Kalita' },
  { id: 'prt-8',  name: 'Silchar Medical College Blood Centre',           type: 'Blood Bank', address: 'Ghungoor, Silchar, Assam 788014',             phone: '+91 384 223 5678', email: 'blood@smchsilchar.gov.in',         contactPerson: 'Nurse Priya Nath' },
  { id: 'prt-9',  name: 'Sewa Bharati Assam — Blood Aid Wing',            type: 'NGO',        address: 'Chandmari, Guwahati, Assam 781003',           phone: '+91 94012 77665', email: 'bloodaid@sewabharatiassam.org',    contactPerson: 'Rupam Deka' },
  { id: 'prt-10', name: 'Rotary Blood Bank Jorhat',                       type: 'NGO',        address: 'M.L. Road, Jorhat, Assam 785001',             phone: '+91 94350 56677', email: 'rotaryblood.jorhat@gmail.com',    contactPerson: 'Sanjay Phukan' },
  { id: 'prt-11', name: 'Guwahati Diagnostic Centre',                    type: 'Clinic',     address: 'Dispur, Guwahati, Assam 781006',              phone: '+91 361 260 1122', email: 'info@guwahatidc.com',              contactPerson: 'Dr. Amir Hussain' },
  { id: 'prt-12', name: 'Downtown Hospital Guwahati',                    type: 'Clinic',     address: 'Dispur, Guwahati, Assam 781005',              phone: '+91 361 233 3000', email: 'care@downtownhospital.in',         contactPerson: 'Dr. Pallabi Sharma' },
  { id: 'prt-13', name: 'Cotton University Health & Blood Drive Camp',    type: 'College',    address: 'Panbazar, Guwahati, Assam 781001',            phone: '+91 361 254 0098', email: 'healthcamp@cottonuniversity.ac.in', contactPerson: 'Prof. Ankur Nath' },
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
  { id: 'cert-3', donorName: 'Dipankar Saikia', email: 'dipankar.saikia@yahoo.com', donationCount: 2, tier: 'Silver', issueDate: '2026-07-10' },
  { id: 'cert-4', donorName: 'Jahnabi Deka', email: 'jahnabi.deka@gmail.com', donationCount: 10, tier: 'Platinum', issueDate: '2026-05-20' },
  { id: 'cert-5', donorName: 'Nabajit Borah', email: 'nabajit.borah@gmail.com', donationCount: 5, tier: 'Gold', issueDate: '2026-06-02' },
  { id: 'cert-6', donorName: 'Priyanka Dutta', email: 'priyanka.d@outlook.com', donationCount: 3, tier: 'Silver', issueDate: '2026-07-05' },
  { id: 'cert-7', donorName: 'Hiten Kalita', email: 'hiten.kalita@yahoo.com', donationCount: 9, tier: 'Platinum', issueDate: '2026-04-18' },
  { id: 'cert-8', donorName: 'Partha Pratim', email: 'partha.pratim@gmail.com', donationCount: 6, tier: 'Gold', issueDate: '2026-06-25' },
  { id: 'cert-9', donorName: 'Nilakshi Devi', email: 'nilakshi.devi@gmail.com', donationCount: 2, tier: 'Silver', issueDate: '2026-07-11' },
  { id: 'cert-10', donorName: 'Ananya Goswami', email: 'ananya.gos@outlook.com', donationCount: 3, tier: 'Silver', issueDate: '2026-07-12' }
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

let mockOrgTypes = [
  { id: 'ot-1', label: 'Hospital',   color: 'blue',   isSystem: true },
  { id: 'ot-2', label: 'Blood Bank', color: 'red',    isSystem: true },
  { id: 'ot-3', label: 'NGO',        color: 'purple', isSystem: true },
  { id: 'ot-4', label: 'Clinic',     color: 'amber',  isSystem: true },
  { id: 'ot-5', label: 'College',    color: 'green',  isSystem: true },
];

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
  },

  // Organization Type Master
  orgTypes: {
    list: async () => {
      return cachedRequest('orgTypes', '/org-types', mockOrgTypes);
    },
    create: async (payload) => {
      const responseHandler = async () => {
        const newType = { id: `ot-${Date.now()}`, label: payload.label, color: payload.color || 'blue', isSystem: false };
        mockOrgTypes = [...mockOrgTypes, newType];
        return newType;
      };
      const result = await request('/org-types', { method: 'POST', body: JSON.stringify(payload) }, await responseHandler());
      invalidateCache('orgTypes');
      return result;
    },
    update: async (typeId, payload) => {
      const responseHandler = async () => {
        mockOrgTypes = mockOrgTypes.map(t => {
          if (t.id === typeId) {
            return { ...t, label: payload.label, color: payload.color };
          }
          return t;
        });
        return mockOrgTypes.find(t => t.id === typeId);
      };
      const result = await request(`/org-types/${typeId}`, { method: 'PUT', body: JSON.stringify(payload) }, await responseHandler());
      invalidateCache('orgTypes');
      return result;
    },
    delete: async (typeId) => {
      const responseHandler = async () => {
        mockOrgTypes = mockOrgTypes.filter(t => t.id !== typeId);
        return { success: true, id: typeId };
      };
      const result = await request(`/org-types/${typeId}`, { method: 'DELETE' }, await responseHandler());
      invalidateCache('orgTypes');
      return result;
    }
  }
};
