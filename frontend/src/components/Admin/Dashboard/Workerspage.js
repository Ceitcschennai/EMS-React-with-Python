import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../../styles/Admin/Dashboard/Workerspage.css";
import { useNavigate } from "react-router-dom";


const WorkersPage = () => {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [offerLetterFilter, setOfferLetterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  /* ================= FETCH WORKERS ================= */
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:8000/api/admin/workers");
      setWorkers(res.data.workers);
      setFilteredWorkers(res.data.workers);
    } catch (err) {
      console.error("Error fetching workers:", err);
      setError("Failed to load workers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  /* ================= FILTER LOGIC ================= */
  useEffect(() => {
    let data = [...workers];

    // ✅ STATUS FILTER (default: Active)
    data = data.filter((w) => {
      if (statusFilter === "All") return true;
      return w.status === statusFilter;
    });

    // 🔍 SEARCH
    if (search) {
      const normalized = search.trim().toLowerCase();
      data = data.filter((w) => {
        const fullName = `${w.first_name || ""} ${w.last_name || ""}`.trim().toLowerCase();
        const email = (w.email || "").toLowerCase().trim();
        const workerId = String(w.worker_id || "").toLowerCase().trim();
        return (
          fullName.includes(normalized) ||
          email.includes(normalized) ||
          workerId.includes(normalized)
        );
      });
    }

    // 📂 CATEGORY FILTER
    if (categoryFilter) {
      data = data.filter((w) => w.category === categoryFilter);
    }

    // 🧾 TYPE FILTER
    if (typeFilter) {
      data = data.filter((w) => w.employment_type === typeFilter);
    }

    // 📄 OFFER LETTER FILTER
    if (offerLetterFilter) {
      if (offerLetterFilter === "sent") {
        data = data.filter((w) => w.worker_offer_letter_status === "sent");
      } else if (offerLetterFilter === "not_sent") {
        data = data.filter((w) => w.worker_offer_letter_status !== "sent");
      }
    }

    setFilteredWorkers(data);
  }, [search, categoryFilter, typeFilter, offerLetterFilter, statusFilter, workers]);

  /* ================= COUNT CALCULATIONS ================= */
  const totalWorkers = workers.length;
  const contractWorkers = workers.filter((w) => w.employment_type === "Contract").length;
  const permanentWorkers = workers.filter((w) => w.employment_type === "Permanent").length;

  /* ================= VIEW WORKER DETAILS ================= */
  const handleViewWorker = async (workerId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/admin/workers/${workerId}`);
      setSelectedWorker(res.data);
      setShowModal(true);
      setOpenDropdown(null);
    } catch (err) {
      console.error("Error fetching worker details:", err);
      window.alert("Failed to Load: Worker details could not be loaded. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorker(null);
  };

  /* ================= DROPDOWN HANDLERS ================= */
  const toggleDropdown = (workerId) => {
    setOpenDropdown(openDropdown === workerId ? null : workerId);
  };

  const handleViewDocuments = (workerId) => {
    setOpenDropdown(null);
    navigate(`/admin/dashboard/worker/${workerId}/documents`);
  };

  const handleSendEmail = (worker) => {
    setOpenDropdown(null);
    window.alert(`Email Sent To: ${worker.email || "N/A"}`);
  };

  const handleInactiveWorker = async (workerId, workerName) => {
    setOpenDropdown(null);
    const confirmed = window.confirm(`Are you sure you want to inactive ${workerName}?`);
    if (!confirmed) return;

    try {
      await axios.put(`http://localhost:8000/api/admin/workers/${workerId}/Inactive`);
      window.alert(`${workerName} has been marked as inactive.`);
      fetchWorkers(); // Refresh the list
    } catch (err) {
      console.error("Error inactivating worker:", err);
      window.alert("Action Failed: Could not inactive the worker. Please try again.");
    }
  };

  const handleSendOfferLetter = async (workerId, workerName) => {
    setOpenDropdown(null);
    const confirmed = window.confirm(`Send offer letter to ${workerName}?`);
    if (!confirmed) return;

    try {
      const res = await axios.post(`http://localhost:8000/api/admin/send_worker_offer_letter/${workerId}`);
      window.alert("Offer Letter Sent: " + (res.data.message || "Offer letter has been sent successfully."));
      fetchWorkers(); // Refresh the list to update offer letter status
    } catch (err) {
      console.error("Error sending offer letter:", err);
      const msg = err?.response?.data?.message || "Failed to send offer letter. Please try again.";
      window.alert("Send Failed: " + msg);
    }
  };

  /* ================= CLOSE DROPDOWN ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.actions-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <div className="workers-container">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <h2 className="page-title">Workers Directory</h2>
        <p className="page-subtitle">View, search, and manage all workers</p>
      </div>

      {/* ================= COUNT CARDS ================= */}
      <div className="workers-count-cards">
        <div className="count-card total-card">
          <div className="count-icon">👥</div>
          <div className="count-info">
            <h3>Total Workers</h3>
            <p className="count-number">{totalWorkers}</p>
          </div>
        </div>

        <div className="count-card contract-card">
          <div className="count-icon">📋</div>
          <div className="count-info">
            <h3>Contract Workers</h3>
            <p className="count-number">{contractWorkers}</p>
          </div>
        </div>

        <div className="count-card permanent-card">
          <div className="count-icon">✅</div>
          <div className="count-info">
            <h3>Permanent Workers</h3>
            <p className="count-number">{permanentWorkers}</p>
          </div>
        </div>
      </div>

      {/* ================= ERROR MESSAGE ================= */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* ================= FILTER BAR ================= */}
      <div className="workers-filters">
        <input
          type="text"
          placeholder="🔍 Search worker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Civil">Civil</option>
        </select>

        <select onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="Permanent">Permanent</option>
          <option value="Contract">Contract</option>
        </select>

        <select onChange={(e) => setOfferLetterFilter(e.target.value)}>
          <option value="">All Offer Letters</option>
          <option value="sent">Sent</option>
          <option value="not_sent">Not Sent</option>
        </select>

        <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="All">All</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="workers-table">
        {loading ? (
          <div className="loading-message">Loading workers...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Status</th>
                <th>Salary</th>
                <th>Offer Letter</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan="8">No workers found</td>
                </tr>
              ) : (
                filteredWorkers.map((w) => (
                  <tr key={w.worker_id} onClick={() => handleViewWorker(w.worker_id)} style={{ cursor: 'pointer' }}>
                    <td>{w.worker_id}</td>
                    <td>{w.first_name} {w.last_name}</td>
                    <td>{w.category}</td>
                    <td>
                      <span className={`type-badge ${w.employment_type.toLowerCase()}`}>
                        {w.employment_type}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          w.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {w.status}
                      </span>
                    </td>
                    <td>₹ {w.total_salary ?? 0}</td>
                    <td>
                      {w?.worker_offer_letter_status?.toLowerCase() === "sent" ? (
                        <button
                          className="send-offer-letter-btn sent"
                          disabled
                        >
                          ✓ Sent
                        </button>
                      ) : (
                        <button
                          className="send-offer-letter-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendOfferLetter(
                              w.worker_id,
                              `${w.first_name || ""} ${w.last_name || ""}`
                            );
                          }}
                        >
                          📄 Send
                        </button>
                      )}
                    </td>
                    <td className="actions-column">
                      <div className="actions-dropdown">
                        <button 
                          className="actions-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(w.worker_id);
                          }}
                        >
                          ⋮
                        </button>

                        {openDropdown === w.worker_id && (
                          <div className="actions-menu">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewWorker(w.worker_id);
                              }}
                            >
                              👤 View Profile
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDocuments(w.worker_id);
                              }}
                            >
                              📄 Documents
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendEmail(w);
                              }}
                            >
                              📧 Send Email
                            </button>

                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInactiveWorker(w.worker_id, `${w.first_name} ${w.last_name}`);
                              }}
                            >
                              🗑️ Inactive
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= WORKER DETAIL MODAL ================= */}
      {showModal && selectedWorker && (
        <div className="worker-modal-overlay" onClick={handleCloseModal}>
          <div className="worker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Worker Details</h3>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="worker-detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Worker ID</label>
                    <p>{selectedWorker.worker_id}</p>
                  </div>
                  <div className="detail-item">
                    <label>Full Name</label>
                    <p>{selectedWorker.first_name} {selectedWorker.last_name}</p>
                  </div>
                  <div className="detail-item">
                    <label>Initial Name</label>
                    <p>{selectedWorker.initial_name || "N/A"}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone Number</label>
                    <p>{selectedWorker.phone_number}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedWorker.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="worker-detail-section">
                <h4>Work Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Category</label>
                    <p>{selectedWorker.category}</p>
                  </div>
                  <div className="detail-item">
                    <label>Sub Category</label>
                    <p>{selectedWorker.sub_category}</p>
                  </div>
                  <div className="detail-item">
                    <label>Work Location</label>
                    <p>{selectedWorker.work_location}</p>
                  </div>
                  <div className="detail-item">
                    <label>Employment Type</label>
                    <p>
                      <span className={`type-badge ${selectedWorker.employment_type.toLowerCase()}`}>
                        {selectedWorker.employment_type}
                      </span>
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Date of Join</label>
                    <p>{selectedWorker.date_of_join}</p>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <p>
                      <span className={selectedWorker.status === "Active" ? "status-active" : "status-inactive"}>
                        {selectedWorker.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="worker-detail-section">
                <h4>Salary Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Basic Salary</label>
                    <p>₹ {selectedWorker.basic_salary}</p>
                  </div>
                  <div className="detail-item">
                    <label>Overtime</label>
                    <p>₹ {selectedWorker.overtime}</p>
                  </div>
                  <div className="detail-item">
                    <label>Bonus</label>
                    <p>₹ {selectedWorker.bonus}</p>
                  </div>
                  <div className="detail-item">
                    <label>Allowance</label>
                    <p>₹ {selectedWorker.allowance}</p>
                  </div>
                  <div className="detail-item total-salary-item">
                    <label>Total Salary</label>
                    <p className="total-salary-value">₹ {selectedWorker.total_salary}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="close-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersPage;
