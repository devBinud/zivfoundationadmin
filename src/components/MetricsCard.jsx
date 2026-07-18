/* MetricsCard - Reusable Dashboard KPI Widget */

import React from 'react';

const MetricsCard = ({ title, value, icon, trend, status = 'primary' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className="glass-card metrics-card">
      <div className="metrics-header">
        <span className="metrics-title">{title}</span>
        <div className="metrics-icon-wrapper">
          {icon}
        </div>
      </div>
      
      <div className="metrics-body">
        <h3 className="metrics-value">{value}</h3>
        {trend && (
          <span className={`metrics-trend trend-${status}`}>
            {trend}
          </span>
        )}
      </div>

      <style>{`
        .metrics-card {
          position: relative;
          overflow: hidden;
          cursor: default;
          background: var(--border) !important;
          border: none !important;
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
          box-shadow: var(--shadow-sm);
        }

        .metrics-card::before {
          content: "";
          position: absolute;
          top: 1px;
          left: 1px;
          right: 1px;
          bottom: 1px;
          background: rgba(22, 24, 30, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
          z-index: 0;
        }

        html.light-theme .metrics-card::before {
          background: rgba(255, 255, 255, 0.85);
        }


        .metrics-header, .metrics-body {
          position: relative;
          z-index: 1;
        }

        .metrics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .metrics-title {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: capitalize;
          letter-spacing: 0;
        }

        .metrics-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          background: var(--primary-light);
        }

        .metrics-body {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .metrics-value {
          font-size: 2.25rem;
          font-family: var(--font-heading);
          font-weight: 700;
          color: var(--text-primary);
        }

        .metrics-trend {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }

        .trend-success {
          background: rgba(16, 185, 129, 0.12);
          color: var(--success);
        }

        .trend-warning {
          background: rgba(245, 158, 11, 0.12);
          color: var(--warning);
        }

        .trend-danger {
          background: rgba(239, 68, 68, 0.12);
          color: var(--danger);
        }

        .trend-primary {
          background: var(--primary-light);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default MetricsCard;
