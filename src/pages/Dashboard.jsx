/* Dashboard - Overviews, System KPI summaries, and Latest Alerts */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import MetricsCard from '../components/MetricsCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    donorsCount: 0,
    seekersCount: 0,
    activeUsersCount: 0,
    partnersCount: 0,
    pendingRequestsCount: 0,
    approvedRequestsCount: 0,
    totalRequestsCount: 0,
    pendingFlaggedReviewsCount: 0,
    resolvedFlaggedReviewsCount: 0
  });
  
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [users, partners, requests, disputes] = await Promise.all([
        api.users.list(),
        api.partners.list(),
        api.requests.list(),
        api.disputes.list()
      ]);

      const donors = users.filter(u => u.role === 'Donor').length;
      const seekers = users.filter(u => u.role === 'Seeker').length;
      const activeUsers = users.filter(u => u.status === 'Active').length;
      const pendingReqs = requests.filter(r => r.status === 'Pending').length;
      const approvedReqs = requests.filter(r => r.status === 'Approved').length;
      const pendingDisps = disputes.filter(d => d.status === 'Pending').length;
      const resolvedDisps = disputes.filter(d => d.status === 'Resolved').length;

      setStats({
        usersCount: users.length,
        donorsCount: donors,
        seekersCount: seekers,
        activeUsersCount: activeUsers,
        partnersCount: partners.length,
        pendingRequestsCount: pendingReqs,
        approvedRequestsCount: approvedReqs,
        totalRequestsCount: requests.length,
        pendingFlaggedReviewsCount: pendingDisps,
        resolvedFlaggedReviewsCount: resolvedDisps
      });

      // Show top 5 recent requests
      setRecentRequests(requests.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleGlobalSuccess = () => {
      fetchDashboardData();
    };
    window.addEventListener('on-behalf-success', handleGlobalSuccess);
    return () => {
      window.removeEventListener('on-behalf-success', handleGlobalSuccess);
    };
  }, []);

  // Calculate percentages for the role breakdown visual meter
  const donorPercentage = stats.usersCount ? Math.round((stats.donorsCount / stats.usersCount) * 100) : 0;
  const seekerPercentage = stats.usersCount ? Math.round((stats.seekersCount / stats.usersCount) * 100) : 0;

  return (
    <div className="dashboard-view">
      {/* Metrics Row */}
      {loading ? (
        <div className="metrics-grid">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Skeleton width={130} height={14} />
                <Skeleton width={42} height={42} borderRadius={10} />
              </div>
              <Skeleton width={70} height={36} />
            </div>
          ))}
        </div>
      ) : (
        <div className="metrics-grid">
          <MetricsCard
            title="Total Registered Users"
            value={stats.usersCount}
            status="primary"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />

          <MetricsCard
            title="Total Donors"
            value={stats.donorsCount}
            status="danger"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            }
          />

          <MetricsCard
            title="Total Seekers"
            value={stats.seekersCount}
            status="warning"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
          />

          <MetricsCard
            title="Total Partners"
            value={stats.partnersCount}
            status="success"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
              </svg>
            }
          />
        </div>
      )}

      {/* Bottom: Charts & Tables Layout */}
      {loading ? (
        <div>
          <div className="dashboard-grid mt-4">
            {/* Left chart skeleton */}
            <div className="glass-card" style={{ padding: '1.5rem', height: '280px' }}>
              <Skeleton width={180} height={18} style={{ marginBottom: '1.5rem' }} />
              <Skeleton width={'100%'} height={180} />
            </div>
            {/* Right breakdown skeleton */}
            <div className="glass-card" style={{ padding: '1.5rem', height: '280px' }}>
              <Skeleton width={160} height={18} style={{ marginBottom: '1.5rem' }} />
              <Skeleton width={'100%'} height={12} style={{ marginBottom: '0.5rem' }} />
              <Skeleton width={'100%'} height={8} borderRadius={999} style={{ marginBottom: '1.5rem' }} />
              <Skeleton width={'100%'} height={12} style={{ marginBottom: '0.5rem' }} />
              <Skeleton width={'100%'} height={8} borderRadius={999} style={{ marginBottom: '1.5rem' }} />
            </div>
          </div>
          {/* Table skeleton */}
          <div className="glass-card mt-4" style={{ padding: '1.5rem' }}>
            <Skeleton width={180} height={18} style={{ marginBottom: '1.5rem' }} />
            <Skeleton width={'100%'} height={120} />
          </div>
        </div>
      ) : (
        <div>
          {/* Charts Row */}
          <div className="dashboard-grid mt-4">
            {/* Left: Trend SVG Chart */}
            <div className="glass-card chart-card">
              <h3 className="card-headline mb-4">Weekly Blood Request Trends</h3>
              <div className="chart-wrapper">
                <svg viewBox="0 0 600 200" className="trend-chart-svg">
                  <defs>
                    <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="chart-stroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ff4d6d" />
                      <stop offset="100%" stopColor="var(--primary)" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="50" y1="20" x2="550" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="50" y1="65" x2="550" y2="65" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="50" y1="110" x2="550" y2="110" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="50" y1="155" x2="550" y2="155" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  
                  {/* Y Axis Labels */}
                  <text x="35" y="24" className="chart-axis-label">20</text>
                  <text x="35" y="69" className="chart-axis-label">15</text>
                  <text x="35" y="114" className="chart-axis-label">10</text>
                  <text x="35" y="159" className="chart-axis-label">5</text>
                  
                  {/* Area Fill */}
                  <path 
                    d="M 50 140 C 100 110, 120 70, 150 90 C 200 110, 220 130, 250 120 C 300 110, 320 50, 350 40 C 400 30, 420 70, 450 60 C 500 50, 520 15, 550 25 L 550 155 L 50 155 Z" 
                    fill="url(#chart-fill)" 
                  />

                  {/* Chart Line Path */}
                  <path 
                    d="M 50 140 C 100 110, 120 70, 150 90 C 200 110, 220 130, 250 120 C 300 110, 320 50, 350 40 C 400 30, 420 70, 450 60 C 500 50, 520 15, 550 25" 
                    fill="none" 
                    stroke="url(#chart-stroke)" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                  />
                  
                  {/* Circular Indicators for data points */}
                  <circle cx="50" cy="140" r="5" className="chart-dot" />
                  <circle cx="150" cy="90" r="5" className="chart-dot" />
                  <circle cx="250" cy="120" r="5" className="chart-dot" />
                  <circle cx="350" cy="40" r="5" className="chart-dot" />
                  <circle cx="450" cy="60" r="5" className="chart-dot" />
                  <circle cx="550" cy="25" r="5" className="chart-dot" />
                  
                  {/* X Axis Labels */}
                  <text x="50" y="180" className="chart-axis-label" textAnchor="middle">W1</text>
                  <text x="150" y="180" className="chart-axis-label" textAnchor="middle">W2</text>
                  <text x="250" y="180" className="chart-axis-label" textAnchor="middle">W3</text>
                  <text x="350" y="180" className="chart-axis-label" textAnchor="middle">W4</text>
                  <text x="450" y="180" className="chart-axis-label" textAnchor="middle">W5</text>
                  <text x="550" y="180" className="chart-axis-label" textAnchor="middle">W6</text>
                </svg>
              </div>
            </div>

            {/* Right: Role Breakdown & Platform Summary */}
            <div className="glass-card dashboard-summary-card">
              <h3 className="card-headline mb-4">User Roles Breakdown</h3>
              
              <div className="role-progress-wrapper mb-6">
                <div className="flex-between mb-2">
                  <span className="role-label">Donors ({stats.donorsCount})</span>
                  <span className="role-percentage">{donorPercentage}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill progress-donor" style={{ width: `${donorPercentage}%` }}></div>
                </div>
              </div>

              <div className="role-progress-wrapper mb-6">
                <div className="flex-between mb-2">
                  <span className="role-label">Seekers ({stats.seekersCount})</span>
                  <span className="role-percentage">{seekerPercentage}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill progress-seeker" style={{ width: `${seekerPercentage}%` }}></div>
                </div>
              </div>

              <div className="quick-actions-box mt-4">
                <h4 className="quick-headline">Admin Operations Tip</h4>
                <p className="quick-description mt-2">
                  Use the user directories page to execute an <strong>On-Behalf Creation</strong>. This allows admins to manually override or construct user files or create emergency requests when seekers have no digital internet access.
                </p>
                <div className="mt-4">
                  <Link to="/users" className="btn btn-primary btn-full-width">Go to User Directory</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Active Request Dispatch (Full Width Table) */}
          <div className="glass-card mt-4 dashboard-requests-card-full">
            <div className="flex-between mb-4">
              <h3 className="card-headline">Active Request Dispatch</h3>
              <Link to="/requests" className="btn btn-secondary btn-sm-text">View All queue</Link>
            </div>

            <div className="table-container" style={{ margin: 0 }}>
              {recentRequests.length === 0 ? (
                <p style={{ padding: '2rem', color: 'var(--text-muted)' }} className="text-center">No blood requests currently registered.</p>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Seeker</th>
                      <th>Group</th>
                      <th>Required qty</th>
                      <th>Urgency</th>
                      <th>Vetting State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map(r => (
                      <tr key={r.id}>
                        <td>{r.seekerName}</td>
                        <td>
                          <span className="blood-group-tag">{r.bloodGroup}</span>
                        </td>
                        <td>{r.unitsNeeded} Units</td>
                        <td>
                          <span className={`urgency-dot ${r.urgency.toLowerCase()}`}></span>
                          {r.urgency}
                        </td>
                        <td>
                          <span className={`badge badge-${r.status.toLowerCase()}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 1.5rem;
        }

        .card-headline {
          font-size: 1.1rem;
          color: var(--text-primary);
          font-family: var(--font-heading);
        }

        .btn-sm-text {
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
        }

        .blood-group-tag {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.15rem 0.4rem;
          font-family: var(--font-sans);
          font-weight: 700;
          color: var(--primary);
        }

        .urgency-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
        }
        .urgency-dot.high { background: var(--danger); box-shadow: 0 0 8px var(--danger); }
        .urgency-dot.medium { background: var(--warning); box-shadow: 0 0 8px var(--warning); }
        .urgency-dot.low { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; }

        .progress-bar-bg {
          height: 8px;
          background: var(--progress-bg, rgba(255, 255, 255, 0.04));
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.8s ease-out;
        }

        .progress-donor {
          background: linear-gradient(90deg, var(--primary) 0%, #ff4d6d 100%);
        }

        .progress-seeker {
          background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
        }

        .role-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .role-percentage {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .quick-actions-box {
          background: var(--quick-box-bg, rgba(255, 255, 255, 0.02));
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
        }

        .quick-headline {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .quick-description {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .btn-full-width {
          width: 100%;
          font-size: 0.85rem;
          padding: 0.6rem;
        }

        /* SVG Trend Chart Styling */
        .chart-card {
          padding: 1.5rem;
        }

        .trend-chart-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .chart-axis-label {
          fill: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 500;
          font-family: var(--font-sans);
          opacity: 0.85;
        }

        .chart-dot {
          fill: #ffffff;
          stroke: var(--primary);
          stroke-width: 2.5px;
          cursor: pointer;
          transition: transform 0.2s ease, r 0.2s ease;
        }

        .chart-dot:hover {
          r: 7px;
          transform-origin: center;
        }

        .dashboard-requests-card-full {
          padding: 1.5rem;
        }

        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
