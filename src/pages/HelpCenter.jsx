/* HelpCenter - Interactive Admin Documentation & Client User Guide */

import React, { useState } from 'react';
import { FaSearch, FaBook, FaDesktop, FaUsers, FaShieldAlt, FaCertificate, FaBell, FaDatabase, FaQuestionCircle } from 'react-icons/fa';

const DOCS_DATA = [
  {
    id: 'dashboard',
    title: 'System Overview Dashboard',
    icon: <FaDesktop />,
    summary: 'The main screen showing quick stats, blood group availability, and donor/seeker registration charts.',
    audience: 'All Console Users',
    sections: [
      {
        heading: 'What is this page for?',
        text: 'This page provides a high-level summary of the entire platform’s health. It lets you quickly check the total number of users, donors, seekers, and registered organization partners in the system without drilling down into databases.'
      },
      {
        heading: 'Understanding the Statistics Cards',
        text: 'The four cards at the top show active system counts. Clicking any card gives you a quick snapshot. For example, "Total Partners" represents clinics, blood banks, and NGOs that have registered to participate in blood drives.'
      },
      {
        heading: 'Blood Group Availability Chart',
        text: 'A critical bar chart that counts active donors classified by blood type (O+, O-, A+, etc.). Use this chart to verify if the foundation has enough registered donors for a rare blood group when an urgent request comes in.'
      },
      {
        heading: 'Blood Requests Trend Chart',
        text: 'A line graph tracking request volume over the past few months. It helps non-technical coordinators forecast seasonal demands and plan donation campaigns accordingly.'
      }
    ]
  },
  {
    id: 'user-creation',
    title: 'On-Behalf User Creation',
    icon: <FaUsers />,
    summary: 'How to manually register a new blood donor or requestor account on their behalf.',
    audience: 'Administrative Staff',
    sections: [
      {
        heading: 'When to use this page?',
        text: 'If a donor or requestor is unable to register themselves using the mobile application, or they call the foundation helpline, you can manually enroll them using this multi-step wizard.'
      },
      {
        heading: 'Step-by-Step Registration Guide',
        text: '1. Select the account type (Blood Donor or Blood Seeker).\n2. Enter their credentials. For Requestors, enter their password and Date of Birth. (The password must be of at least Medium strength for safety).\n3. Enter address details (State, District, Area, Pincode). For Donors, this is where you enter their date of birth (must be 18+ years old).\n4. Fill in role specifics. For Donors, this includes weight, availability, and emergency contacts. For Requestors, upload a scan of their official ID proof.\n5. Verify and submit to create the database profile.'
      },
      {
        heading: 'OTP Simulation Bypass',
        text: 'For safety verification, the system simulates sending an SMS code. In this offline simulation dashboard, enter the code "123456" to bypass the verification step.'
      }
    ]
  },
  {
    id: 'directories',
    title: 'Directory Records',
    icon: <FaUsers />,
    summary: 'Managing registered users, updating statuses, and configuring organization partner lists.',
    audience: 'Database Coordinators',
    sections: [
      {
        heading: 'Users Directory',
        text: 'Lists all registered system users. You can search by name, email, or phone number, and filter by role (Donor/Seeker) or status (Active/Suspended).'
      },
      {
        heading: 'Suspending or Activating Accounts',
        text: 'If a user violates platform policies or reports fraudulent activity, use the "Suspend" button next to their name. This immediately locks them out of requesting or donating blood. Click "Activate" to restore their access.'
      },
      {
        heading: 'Partners Directory',
        text: 'Manage clinical locations, hospitals, and NGOs. This directory supports Pagination (10 entries per page). You can "View" their full details, "Edit" address and liaison information, or "Delete" their platform registration.'
      }
    ]
  },
  {
    id: 'verification',
    title: 'Verification & Moderation',
    icon: <FaShieldAlt />,
    summary: 'Approving blood requests and moderating community reviews and comments.',
    audience: 'Moderators',
    sections: [
      {
        heading: 'Blood Request Queue',
        text: 'When a seeker submits a request for blood, it appears in the Request Queue. Moderators must review the case details, required quantity, and hospital address before clicking "Approve" to publish the request to active donors.'
      },
      {
        heading: 'Flagged Reviews Board',
        text: 'The system automatically flags community comments reported for commercial solicitation, abuse, or spam. Review the flagged comment context and click "Resolve Report" to settle the dispute.'
      }
    ]
  },
  {
    id: 'certifications',
    title: 'Donation Honors & Certificates',
    icon: <FaCertificate />,
    summary: 'Issuing and printing digital certificates of appreciation for blood donors.',
    audience: 'Public Relations / PR Staff',
    sections: [
      {
        heading: 'Appreciation Tier Certificates',
        text: 'To reward lifesavers, Ziv Foundation issues digital certificates based on donation history:\n- Silver Tier: 2+ donations.\n- Gold Tier: 4+ donations.\n- Platinum Tier: 8+ donations.'
      },
      {
        heading: 'Printing and Revoking Certificates',
        text: 'Click "View" to preview the certificate. Click "Print" to generate a print-ready PDF file for physical distribution. If a certificate was issued in error, click "Revoke" to remove it from the donor\'s profile.'
      }
    ]
  },
  {
    id: 'broadcasts',
    title: 'Broadcasts & Notifications',
    icon: <FaBell />,
    summary: 'Sending push notification alerts and publishing homepage alert banners.',
    audience: 'Communications Officer',
    sections: [
      {
        heading: 'Draft Alert Banners',
        text: 'Allows you to draft critical alert banners (e.g. urgent need for O- blood in Guwahati) that appear at the top of the mobile app home screen. You can draft, edit, and publish banners directly.'
      },
      {
        heading: 'Push Notification Campaigns',
        text: 'Sends mobile push notifications to all users or specific targets. Draft your title, body, and click "Send Campaign" to immediately trigger the notification dispatch.'
      }
    ]
  },
  {
    id: 'masters',
    title: 'Masters Settings (Organization Types)',
    icon: <FaDatabase />,
    summary: 'Configuring custom organization and facility types.',
    audience: 'Super Administrators',
    sections: [
      {
        heading: 'Managing Organization Types',
        text: 'Define the types of partners allowed (e.g. Hospital, Blood Bank, NGO, Clinic, College). You can add new ones, customize their badge colors, or edit existing records.'
      },
      {
        heading: 'System Defaults Protection',
        text: 'Standard defaults (like Hospital) cannot be deleted to prevent system database errors, but their names and colors can be modified using the "Edit" popup action.'
      }
    ]
  }
];

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTopic, setActiveTopic] = useState(DOCS_DATA[0].id);

  // Filter topics by title or contents
  const filteredDocs = DOCS_DATA.filter(doc => {
    const matchesTitle = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSummary = doc.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = doc.sections.some(s => 
      s.heading.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesTitle || matchesSummary || matchesSection;
  });

  const selectedDoc = DOCS_DATA.find(d => d.id === activeTopic) || DOCS_DATA[0];

  return (
    <div className="help-center-view">
      {/* Page Header */}
      <div className="page-header mb-6">
        <h1 className="page-title">Admin Console Help & Documentation</h1>
        <p className="page-subtitle">
          An easy-to-understand reference guide for non-technical clients to manage the Ziv Foundation platform.
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-card mb-6" style={{ padding: '1.25rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaSearch style={{ position: 'absolute', left: '15px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search documentation, topics, or keywords..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '45px', width: '100%', fontSize: '0.9rem', height: '42px', borderRadius: '8px' }}
          />
        </div>
      </div>

      <div className="help-center-grid">
        {/* Left Side: Topic Menu */}
        <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', margin: '0.5rem 0.75rem' }}>
            Documentation Topics
          </h4>
          {filteredDocs.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '1rem 0.75rem' }}>No matching topics found.</p>
          ) : (
            filteredDocs.map(doc => (
              <button
                key={doc.id}
                onClick={() => setActiveTopic(doc.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  background: activeTopic === doc.id ? 'var(--primary-light)' : 'transparent',
                  color: activeTopic === doc.id ? 'var(--primary)' : 'var(--text-primary)',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: activeTopic === doc.id ? '600' : '500',
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
                className="docs-menu-item"
              >
                <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center' }}>{doc.icon}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</span>
              </button>
            ))
          )}
        </div>

        {/* Right Side: Topic Content */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {selectedDoc ? (
            <div className="animate-fade">
              {/* Header Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                  {selectedDoc.icon}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  {selectedDoc.title}
                </h2>
              </div>

              {/* Summary Description */}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                {selectedDoc.summary}
              </p>

              {/* Audience Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Audience:</span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.22rem 0.6rem',
                  borderRadius: '30px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  {selectedDoc.audience}
                </span>
              </div>

              {/* Sections list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {selectedDoc.sections.map((sec, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaQuestionCircle style={{ color: 'var(--primary)', fontSize: '0.85rem' }} /> {sec.heading}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' }}>
                      {sec.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <FaBook style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
              <p>Select a topic from the menu to view the documentation guide.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .help-center-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        .docs-menu-item:hover {
          background: rgba(255,255,255,0.03) !important;
          color: var(--primary) !important;
        }
        html.light-theme .docs-menu-item:hover {
          background: rgba(0,0,0,0.02) !important;
        }
        @media (max-width: 900px) {
          .help-center-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HelpCenter;
