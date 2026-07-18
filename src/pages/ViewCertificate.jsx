import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaCertificate, FaMedal, FaDownload, FaArrowLeft, FaGem, FaTrophy } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import html2pdf from 'html2pdf.js';

const ViewCertificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const certs = await api.certificates.list();
        const foundCert = certs.find(c => c.id === id);
        if (foundCert) {
          setCert(foundCert);
        } else {
          Swal.fire({
            title: 'Not Found',
            text: 'Certificate not found in the records.',
            icon: 'error',
            confirmButtonColor: 'var(--primary)'
          }).then(() => {
            navigate('/certificates');
          });
        }
        setLoading(false);
      } catch (err) {
        Swal.fire('Error', 'Could not load certificate detail.', 'error');
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id, navigate]);

  const handleDownload = () => {
    if (!cert) return;

    const element = document.getElementById('cert-download-area');
    if (!element) {
      Swal.fire('Error', 'Certificate content area not found.', 'error');
      return;
    }

    Swal.fire({
      title: 'Downloading Certificate...',
      html: `Preparing PDF for <strong>${cert.donorName}</strong> (${cert.tier} Tier)`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    element.classList.add('html2pdf-printing');

    const opt = {
      margin: 10,
      filename: `Donation_Certificate_${cert.donorName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        element.classList.remove('html2pdf-printing');
        Swal.fire({
          title: 'Download Successful!',
          text: `Donation_Certificate_${cert.donorName.replace(/\s+/g, '_')}.pdf has been saved to your downloads.`,
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      })
      .catch((err) => {
        element.classList.remove('html2pdf-printing');
        console.error('PDF generation error:', err);
        Swal.fire({
          title: 'Download Failed',
          text: 'There was an error generating the PDF certificate.',
          icon: 'error',
          confirmButtonColor: 'var(--primary)'
        });
      });
  };

  return (
    <div className="view-cert-page">
      {/* Header Controls */}
      <div className="glass-card controls-card view-cert-header mb-6">
        <div>
          <h2 className="controls-title" style={{ fontSize: '1.1rem', margin: 0 }}>
            {loading ? 'Loading Certificate...' : `Honors Certificate - ${cert?.donorName}`}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            {loading ? 'Fetching records...' : `Previewing Ziv Foundation honor recognition document for ${cert?.donorName}.`}
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/certificates')} style={{ gap: '6px' }}>
            <FaArrowLeft /> View All Certificates
          </button>
          {cert && (
            <button className="btn btn-success" onClick={handleDownload} style={{ gap: '6px' }}>
              <FaDownload /> Download PDF
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass-card text-center" style={{ padding: '4rem' }}>
          <Skeleton circle width={80} height={80} style={{ marginBottom: '1.5rem' }} />
          <Skeleton width={200} height={28} style={{ marginBottom: '1rem' }} />
          <Skeleton count={3} width={400} style={{ marginBottom: '1rem' }} />
        </div>
      ) : cert ? (
        <div className="cert-preview-wrapper animate-fade">
          <div id="cert-download-area" className="cert-document-frame">
            <div className="cert-border-outer">
              <div className="cert-border-inner">
                <div className="cert-seal-icon">
                  <FaCertificate />
                </div>
                
                <h3 className="cert-org">ZIV FOUNDATION</h3>
                <h4 className="cert-subtitle">CERTIFICATE OF HONOR</h4>
                <p className="cert-awarded">Gratefully presented to</p>
                
                <h2 className="cert-donor-name">{cert.donorName}</h2>
                
                <p className="cert-statement">
                  in recognition and deep appreciation of outstanding humanitarian service. By selflessly completing <strong>{cert.donationCount} blood donations</strong>, this lifesaver has helped preserve hope, sustain clinical operations, and rescue up to <strong>{cert.donationCount * 3} lives</strong>.
                </p>

                <div className="cert-tier-stamp" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#b8860b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {cert.tier.toLowerCase() === 'platinum' && <FaGem style={{ fontSize: '0.9rem' }} />}
                    {cert.tier.toLowerCase() === 'gold' && <FaTrophy style={{ fontSize: '0.9rem' }} />}
                    {cert.tier.toLowerCase() === 'silver' && <FaMedal style={{ fontSize: '0.9rem' }} />}
                    <span>ৰক্তবন্ধু ({cert.tier.toUpperCase()})</span>
                  </div>
                </div>

                <div className="cert-signatures">
                  <div className="sig-line">
                    <span className="sig-name">Ziv Foundation Board</span>
                    <span className="sig-title">Director of Vetting</span>
                  </div>
                  <div className="sig-line">
                    <span className="sig-name">{cert.issueDate}</span>
                    <span className="sig-title">Date of Issue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}


      <style>{`
        .view-cert-page {
          max-width: 900px;
          margin: 0 auto;
        }

        .view-cert-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .cert-preview-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        @media (max-width: 576px) {
          .view-cert-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-actions {
            width: 100%;
            flex-direction: column;
          }
          .header-actions .btn {
            width: 100%;
            justify-content: center;
          }
        }

        /* Certificate Document Styling */
        .cert-document-frame {
          background: #fdfbf7;
          border: 16px double #b8860b;
          padding: 3rem 2.5rem;
          color: #2b2b2b;
          font-family: 'Georgia', serif;
          text-align: center;
          box-shadow: var(--shadow-lg);
          border-radius: 12px;
          margin-top: 1.5rem;
          width: 100%;
          max-width: 800px;
          box-sizing: border-box;
        }

        .cert-border-outer {
          border: 2px solid #b8860b;
          padding: 2rem;
          height: 100%;
        }

        .cert-border-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .cert-seal-icon {
          font-size: 3rem;
          color: #b8860b;
          line-height: 1;
        }

        .cert-org {
          font-size: 1.5rem;
          letter-spacing: 3px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .cert-subtitle {
          font-size: 1.15rem;
          color: #b8860b;
          letter-spacing: 5px;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .cert-awarded {
          font-style: italic;
          font-size: 1rem;
          color: #555;
          margin: 0;
        }

        .cert-donor-name {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          border-bottom: 2px solid #b8860b;
          padding-bottom: 0.5rem;
          min-width: 300px;
          margin: 0.75rem 0;
        }

        .cert-statement {
          font-size: 0.95rem;
          line-height: 1.9;
          color: #444;
          max-width: 580px;
          margin: 0.75rem auto;
        }

        .cert-tier-stamp {
          margin: 0.75rem 0;
          font-weight: 700;
          font-size: 0.95rem;
          color: #b8860b;
          border: 2px solid #b8860b;
          padding: 0.35rem 1rem;
          border-radius: 4px;
          display: inline-block;
          letter-spacing: 1px;
        }

        .cert-signatures {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-top: 3rem;
          padding: 0 2rem;
        }

        .sig-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 180px;
          border-top: 1px solid #777;
          padding-top: 0.5rem;
        }

        .sig-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: #222;
        }

        .sig-title {
          font-size: 0.72rem;
          color: #666;
          margin-top: 2px;
        }

        @media (max-width: 576px) {
          .cert-document-frame {
            border-width: 8px;
            padding: 1.5rem 1rem;
          }
          .cert-border-outer {
            padding: 1rem;
          }
          .cert-donor-name {
            font-size: 1.75rem;
            min-width: 100%;
          }
          .cert-org {
            font-size: 1.2rem;
          }
          .cert-subtitle {
            font-size: 0.95rem;
            letter-spacing: 2px;
          }
          .cert-statement {
            font-size: 0.85rem;
            line-height: 1.6;
          }
          .cert-signatures {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            margin-top: 2rem;
          }
        }

        /* Specific style layout overrides for rendering PDF */
        .html2pdf-printing {
          width: 1000px !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: #fdfbf7 !important;
          box-sizing: border-box !important;
        }

        .html2pdf-printing .cert-border-inner {
          gap: 1.25rem !important;
        }

        .html2pdf-printing .cert-signatures {
          flex-direction: row !important;
          justify-content: space-between !important;
          width: 100% !important;
          margin-top: 4rem !important;
          padding: 0 3rem !important;
        }

        .html2pdf-printing .sig-line {
          width: 220px !important;
        }
      `}</style>
    </div>
  );
};

export default ViewCertificate;
