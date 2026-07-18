/* Dashboard - Overviews, System KPI summaries, and Latest Alerts */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import MetricsCard from '../components/MetricsCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

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
    resolvedFlaggedReviewsCount: 0,
    activeDonorsCount: 0,
    suspendedDonorsCount: 0,
    activeSeekersCount: 0,
    suspendedSeekersCount: 0
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
      const activeDonors = users.filter(u => u.role === 'Donor' && u.status === 'Active').length;
      const suspendedDonors = users.filter(u => u.role === 'Donor' && u.status === 'Suspended').length;
      const activeSeekers = users.filter(u => u.role === 'Seeker' && u.status === 'Active').length;
      const suspendedSeekers = users.filter(u => u.role === 'Seeker' && u.status === 'Suspended').length;

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
        resolvedFlaggedReviewsCount: resolvedDisps,
        activeDonorsCount: activeDonors,
        suspendedDonorsCount: suspendedDonors,
        activeSeekersCount: activeSeekers,
        suspendedSeekersCount: suspendedSeekers
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
  const maxOperationsVal = Math.max(stats.pendingRequestsCount, stats.approvedRequestsCount, stats.pendingFlaggedReviewsCount, 1);

  // Recharts Mock Datasets
  const bloodGroupData = React.useMemo(() => [
    { name: 'O+', count: 8 },
    { name: 'O-', count: 4 },
    { name: 'A+', count: 5 },
    { name: 'A-', count: 2 },
    { name: 'B+', count: 6 },
    { name: 'B-', count: 1 },
    { name: 'AB+', count: 3 },
    { name: 'AB-', count: 2 }
  ], []);

  const requestsTrendData = React.useMemo(() => [
    { name: 'Jan', requests: 2 },
    { name: 'Feb', requests: 5 },
    { name: 'Mar', requests: 8 },
    { name: 'Apr', requests: 12 },
    { name: 'May', requests: 9 },
    { name: 'Jun', requests: 15 },
    { name: 'Jul', requests: 18 }
  ], []);

  const statusDistributionData = React.useMemo(() => [
    { name: 'Pending', value: stats.pendingRequestsCount || 2, color: '#f59e0b' },
    { name: 'Approved', value: stats.approvedRequestsCount || 1, color: '#3b82f6' },
    { name: 'Completed', value: 3, color: '#10b981' },
    { name: 'Rejected', value: stats.pendingFlaggedReviewsCount || 1, color: '#ef4444' }
  ], [stats.pendingRequestsCount, stats.approvedRequestsCount, stats.pendingFlaggedReviewsCount]);

  const donorRegistrationData = React.useMemo(() => [
    { name: 'Jan', donors: 4 },
    { name: 'Feb', donors: 7 },
    { name: 'Mar', donors: 5 },
    { name: 'Apr', donors: 10 },
    { name: 'May', donors: 8 },
    { name: 'Jun', donors: 14 },
    { name: 'Jul', donors: 12 }
  ], []);

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
          {/* Recharts Analytics Grid */}
          <div className="analytics-grid mt-4">
            {/* 1. Blood Group Availability */}
            <div className="glass-card chart-card">
              <h3 className="card-headline mb-3">Blood Group Availability</h3>
              <p className="page-subtitle mb-4">Number of active available donors classified by blood group</p>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={bloodGroupData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                    <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '11px' }}
                      itemStyle={{ color: 'var(--primary)' }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Blood Requests Trend */}
            <div className="glass-card chart-card">
              <h3 className="card-headline mb-3">Blood Requests Trend</h3>
              <p className="page-subtitle mb-4">Monthly aggregation of seeker blood requests submitted to the platform</p>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <AreaChart data={requestsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="requestsColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                    <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="requests" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#requestsColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Request Status Distribution */}
            <div className="glass-card chart-card">
              <h3 className="card-headline mb-3">Request Status Distribution</h3>
              <p className="page-subtitle mb-4">Breakdown of seeker blood requests by current moderation status</p>
              <div style={{ width: '100%', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Donor Registration Trend */}
            <div className="glass-card chart-card">
              <h3 className="card-headline mb-3">Donor Registration Trend</h3>
              <p className="page-subtitle mb-4">Outreach growth showing monthly count of newly registered blood donors</p>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={donorRegistrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                    <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '11px' }}
                      itemStyle={{ color: '#10b981' }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="donors" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Table & Timeline */}
          <div className="dashboard-bottom-grid mt-4">
            {/* Left: Active Request Dispatch (Full Table) */}
            <div className="glass-card dashboard-requests-card-full">
              <div className="flex-between mb-4">
                <h3 className="card-headline">Active Request Dispatch</h3>
                <Link to="/requests" className="btn btn-secondary btn-sm-text">View All Queue</Link>
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
                        <th>Required Qty</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Action</th>
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
                          <td>{r.urgency}</td>
                          <td>
                            <span className={`badge badge-${r.status.toLowerCase()}`}>
                              {r.status}
                            </span>
                          </td>
                          <td>
                            <Link to="/requests" className="btn btn-secondary btn-sm-text" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: '6px' }}>View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right: System Activity Log */}
            <div className="glass-card activity-timeline-card">
              <h3 className="card-headline mb-4">System Activity Log</h3>

              <div className="timeline-container">
                <div className="timeline-item">
                  <div className="timeline-badge danger"></div>
                  <div className="timeline-content">
                    <p className="timeline-text"><strong>AB- request</strong> created by Hiten Kalita</p>
                    <span className="timeline-time">5 mins ago</span>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-badge success"></div>
                  <div className="timeline-content">
                    <p className="timeline-text"><strong>Donor Nabajit</strong> approved & verified</p>
                    <span className="timeline-time">2 hours ago</span>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-badge primary"></div>
                  <div className="timeline-content">
                    <p className="timeline-text"><strong>New donor</strong> Jahnabi Deka registered</p>
                    <span className="timeline-time">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
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
          background: rgba(120, 120, 120, 0.08);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.15rem 0.4rem;
          font-family: var(--font-sans);
          font-weight: 700;
          color: var(--text-primary);
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

        .roles-breakdown-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .donut-chart-container {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .donut-chart-svg {
          transform: rotate(0deg);
          transition: transform 0.5s ease;
        }

        .donut-segment {
          transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .donut-center-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .donut-count {
          font-size: 1.75rem;
          font-weight: 700;
          font-family: var(--font-heading);
          color: var(--text-primary);
          line-height: 1;
        }

        .donut-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .roles-legend-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex-grow: 1;
        }

        .legend-item {
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.02);
          transition: all 0.25s ease;
        }

        .legend-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.06);
          transform: translateX(4px);
        }

        .legend-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .donor-legend .legend-dot {
          background: var(--primary);
          box-shadow: 0 0 6px var(--primary);
        }

        .seeker-legend .legend-dot {
          background: #3b82f6;
          box-shadow: 0 0 6px #3b82f6;
        }

        .legend-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .legend-val {
          font-size: 0.85rem;
          font-weight: 700;
          margin-left: auto;
          color: var(--text-primary);
        }

        .legend-sub-stats {
          display: flex;
          gap: 6px;
          padding-left: 14px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .sub-stat.active {
          color: var(--success);
        }

        .sub-stat.suspended {
          color: var(--danger);
        }

        .sub-stat.divider {
          color: rgba(255, 255, 255, 0.1);
        }

        html.light-theme .legend-item {
          background: rgba(0, 0, 0, 0.01);
          border-color: rgba(0, 0, 0, 0.04);
        }

        html.light-theme .legend-item:hover {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        html.light-theme .sub-stat.divider {
          color: rgba(0, 0, 0, 0.1);
        }

        .quick-actions-box {
          background: linear-gradient(135deg, rgba(197, 17, 46, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
          border: 1px solid rgba(197, 17, 46, 0.15);
          border-radius: 14px;
          padding: 1.25rem;
          position: relative;
          overflow: hidden;
        }

        .quick-actions-box::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(197, 17, 46, 0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        html.light-theme .quick-actions-box {
          background: linear-gradient(135deg, rgba(197, 17, 46, 0.04) 0%, rgba(0, 0, 0, 0.01) 100%);
          border-color: rgba(197, 17, 46, 0.12);
        }

        .quick-headline {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .quick-headline svg {
          color: var(--primary);
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
          box-shadow: 0 4px 10px rgba(197, 17, 46, 0.15);
        }
        
        .btn-full-width:hover {
          box-shadow: 0 6px 14px rgba(197, 17, 46, 0.3);
        }

        /* Recharts Analytics Grid Styling */
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 992px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .page-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Bottom Grid: Table + System Activity Log Stack */
        .dashboard-bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1200px) {
          .dashboard-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-requests-card-full {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .dashboard-requests-card-full .custom-table {
          font-size: 0.8rem;
        }

        .dashboard-requests-card-full .custom-table th {
          padding: 0.6rem 0.8rem;
          font-size: 0.78rem;
        }

        .dashboard-requests-card-full .custom-table td {
          padding: 0.6rem 0.8rem;
          font-size: 0.78rem;
        }

        /* Activity Timeline Styling */
        .activity-timeline-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .timeline-container {
          display: flex;
          flex-direction: column;
          position: relative;
          padding-left: 14px;
          margin-top: 0.5rem;
        }

        .timeline-container::before {
          content: '';
          position: absolute;
          top: 8px;
          bottom: 8px;
          left: 4px;
          width: 2px;
          background: var(--border);
        }

        .timeline-item {
          display: flex;
          position: relative;
          padding-bottom: 1.5rem;
        }

        .timeline-item:last-child {
          padding-bottom: 0;
        }

        .timeline-badge {
          position: absolute;
          left: -14px;
          top: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--border);
          border: 2px solid var(--card-bg);
          z-index: 2;
        }

        .timeline-badge.danger { background: var(--danger); }
        .timeline-badge.success { background: var(--success); }
        .timeline-badge.primary { background: var(--primary); }

        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-left: 10px;
        }

        .timeline-text {
          font-size: 0.78rem;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .timeline-text strong {
          font-weight: 700;
        }

        .timeline-time {
          font-size: 0.68rem;
          color: var(--text-secondary);
        }

        /* Non-hoverable Cards Override */
        .chart-card,
        .dashboard-requests-card-full,
        .activity-timeline-card {
          cursor: default;
        }
        
        .chart-card:hover,
        .dashboard-requests-card-full:hover,
        .activity-timeline-card:hover {
          transform: none !important;
          box-shadow: var(--shadow-lg) !important;
          border-color: var(--glass-border) !important;
        }

        /* Recharts custom legend customization */
        .recharts-default-legend {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 10px !important;
        }

        .recharts-legend-item-text {
          color: var(--text-secondary) !important;
          font-weight: 600;
        }

        /* Dashboard Right Column Stack Layout */
        .dashboard-right-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-card-compact {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .roles-breakdown-content-compact {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .donut-chart-container-compact {
          position: relative;
          width: 84px;
          height: 84px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .donut-center-text-compact {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 1.1;
        }

        .donut-count-compact {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .donut-label-compact {
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .roles-legend-container-compact {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-grow: 1;
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
