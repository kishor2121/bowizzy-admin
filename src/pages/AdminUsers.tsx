import React, { useEffect, useState } from "react";
import { getInterviewers, confirmInterviewer } from "../services/admin";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import "./AdminUsers.css";

type ViewType = "interviewers" | "approved-interviewers" | "all-users";

const AdminUsers: React.FC = () => {
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.classList.add("full-bleed");
    return () => {
      if (root) root.classList.remove("full-bleed");
    };
  }, []);

  const [activeView, setActiveView] = useState<ViewType>("interviewers");
  const [pendingUsers, setPendingUsers] = useState<Array<any>>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [confirmingIds, setConfirmingIds] = useState<Array<number | string>>([]);
  const [currentPage, setCurrentPage] = useState<Record<ViewType, number>>({
    interviewers: 1,
    "approved-interviewers": 1,
    "all-users": 1,
  });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchField, setSearchField] = useState<"name" | "email" | "role">("name");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const ITEMS_PER_PAGE = 5;

  // Sort data by earliest first (created_at or updated_at)
  const sortedUsers = [...pendingUsers].sort((a, b) => {
    const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
    const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
    return dateA - dateB;
  });

  // Filter users based on search field and query
  const filteredUsers = sortedUsers.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    try {
      if (searchField === "name") {
        const fullName = [
          user.personal_details?.first_name || "",
          user.personal_details?.middle_name || "",
          user.personal_details?.last_name || "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fullName.includes(query);
      } else if (searchField === "email") {
        const email = (user.email || "").toLowerCase();
        return email.includes(query);
      } else if (searchField === "role") {
        const role = user.job_roles && user.job_roles.length > 0
          ? (user.job_roles[0].job_role || "").toLowerCase()
          : "n/a";
        return role.includes(query);
      }
    } catch (e) {
      console.error("Search filter error:", e);
    }
    return true;
  });

  useEffect(() => {
    let mounted = true;
    setLoadingPending(true);
    setPendingError(null);

    const fetchData = async () => {
      try {
        let res;
        if (activeView === "interviewers") {
          res = await getInterviewers();
          const isVerified = (u: any) => {
            const v = u.is_interviewer_verified;
            return v === true || v === "true" || v === "verified" || v === 1;
          };
          const pending = (res || []).filter((u: any) => {
            if (u.is_interviewer_verified !== undefined && u.is_interviewer_verified !== null) {
              return !isVerified(u);
            }
            return !u.is_verified;
          });
          if (mounted) setPendingUsers(pending);
        } else if (activeView === "approved-interviewers") {
          res = await api.get(`/admin/approved-interviewers`);
          if (mounted) setPendingUsers(res.data || []);
        } else if (activeView === "all-users") {
          res = await api.get(`/admin/all-users`);
          if (mounted) setPendingUsers(res.data || []);
        }
      } catch (err: any) {
        if (mounted) {
          setPendingError(
            err?.response?.data?.message ||
              err?.message ||
              `Failed to load ${activeView}`
          );
        }
      } finally {
        if (mounted) setLoadingPending(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [activeView]);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    setCurrentPage((prev) => ({ ...prev, [view]: 1 }));
    setSearchQuery(""); // Reset search when changing view
  };

  const totalPages = filteredUsers.length > 0 ? Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) : 1;
  const startIndex = (currentPage[activeView] - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;
    let startPage = Math.max(1, currentPage[activeView] - 1);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const getLastEducation = (user: any) => {
    if (!user.education_details || user.education_details.length === 0) {
      return null;
    }
    const sortedEdu = [...user.education_details].sort((a, b) => {
      const dateA = new Date(a.end_year || 0).getTime();
      const dateB = new Date(b.end_year || 0).getTime();
      return dateB - dateA;
    });
    return sortedEdu[0];
  };

  const getJobRole = (user: any) => {
    if (user.job_roles && user.job_roles.length > 0) {
      return user.job_roles[0].job_role;
    }
    return "N/A";
  };

  const getTotalExperience = (user: any) => {
    if (!user.work_experience || user.work_experience.length === 0) {
      return "Fresher";
    }

    let totalMonths = 0;
    user.work_experience.forEach((exp: any) => {
      const startDate = new Date(exp.start_date);
      const endDate = exp.currently_working_here ? new Date() : new Date(exp.end_date);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    });

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? "s" : ""}`;
    } else {
      return `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
    }
  };

  const openModal = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "approved-interviewers":
        return "Approved Interviewers";
      case "all-users":
        return "All Users";
      default:
        return "Pending Interviewers";
    }
  };

  return (
    <AdminLayout
      headerTitle="Users Management"
      headerSubtitle="Review and approve interviewer requests"
    >
      <div className="users-root">
        {/* VIEW BUTTONS */}
        <div className="view-buttons-container">
          <button
            className={`view-btn ${activeView === "interviewers" ? "active" : ""}`}
            onClick={() => handleViewChange("interviewers")}
          >
            Pending Interviewers
          </button>
          <div className="button-spacer"></div>
          <button
            className={`view-btn ${activeView === "approved-interviewers" ? "active" : ""}`}
            onClick={() => handleViewChange("approved-interviewers")}
          >
            Approved Interviewers
          </button>
          <div className="button-spacer"></div>
          <button
            className={`view-btn ${activeView === "all-users" ? "active" : ""}`}
            onClick={() => handleViewChange("all-users")}
          >
            All Users
          </button>
        </div>

        {/* SEARCH SECTION */}
        <div className="search-container">
          <div className="search-field-group">
            <label htmlFor="search-field">Search By:</label>
            <select
              id="search-field"
              className="search-field-dropdown"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as "name" | "email" | "role")}
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
          </div>
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder={`Search by ${searchField}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage((prev) => ({ ...prev, [activeView]: 1 }));
              }}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* LIST */}
        <div className="card">
          <div className="card-header">
            <h3>{getViewTitle()}</h3>
            <div className="card-count">
              <span className="count-dot"></span>
              <span className="count-label">
                {searchQuery
                  ? "Search Results"
                  : activeView === "interviewers"
                  ? "Pending Requests"
                  : activeView === "approved-interviewers"
                  ? "Approved"
                  : "Total"}
              </span>
              <span className="count-value">{filteredUsers.length}</span>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {activeView === "interviewers" || activeView === "approved-interviewers" || activeView === "all-users" ? (
                    <>
                      <th>S/N</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Education</th>
                      <th>Experience</th>
                      <th className="action-col">
                        {activeView === "interviewers" ? "Action" : activeView === "approved-interviewers" ? "Status" : "Interviewer"}
                      </th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {loadingPending && (
                  <tr>
                    <td colSpan={activeView === "interviewers" || activeView === "approved-interviewers" || activeView === "all-users" ? 7 : 4} className="table-state">
                      Loading users…
                    </td>
                  </tr>
                )}

                {pendingError && (
                  <tr>
                    <td colSpan={activeView === "interviewers" || activeView === "approved-interviewers" || activeView === "all-users" ? 7 : 4} className="table-error">
                      {pendingError}
                    </td>
                  </tr>
                )}

                {!loadingPending &&
                  !pendingError &&
                  filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={activeView === "interviewers" || activeView === "approved-interviewers" || activeView === "all-users" ? 7 : 4} className="table-state">
                      {searchQuery ? `No results found for "${searchQuery}"` : "No users found"}
                    </td>
                  </tr>
                )}

                {!loadingPending &&
                  !pendingError &&
                  paginatedUsers.map((u, index) => {
                    const id = u.user_id || u.email;
                    const isVerified = (u: any) => {
                      const v = u.is_interviewer_verified;
                      return v === true || v === "true" || v === "verified" || v === 1;
                    };
                    const isPending = activeView === "interviewers";
                    const isApproved = activeView === "approved-interviewers";
                    const isAllUsers = activeView === "all-users";
                    const lastEducation = getLastEducation(u);

                    if (isPending || isApproved || isAllUsers) {
                      return (
                        <tr key={id} onClick={() => openModal(u)} className="clickable-row">
                          <td className="serial-col">{startIndex + index + 1}</td>
                          <td>
                            <div className="user-name-only">
                              {[u.personal_details?.first_name, u.personal_details?.middle_name, u.personal_details?.last_name]
                                .filter(Boolean)
                                .join(" ") || "—"}
                            </div>
                          </td>
                          <td className="mono">{u.email}</td>
                          <td>{getJobRole(u)}</td>
                          <td>
                            {lastEducation?.field_of_study || "N/A"}
                          </td>
                          <td>
                            {getTotalExperience(u)}
                          </td>
                          <td className="action-col">
                            {isPending ? (
                              <button
                                className="btn primary"
                                disabled={confirmingIds.includes(id)}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setConfirmingIds((p) => [...p, id]);
                                  try {
                                    await confirmInterviewer(u.user_id);
                                    setPendingUsers((prev) =>
                                      prev.filter(
                                        (p) => (p.user_id || p.email) !== id
                                      )
                                    );
                                  } catch (err: any) {
                                    setPendingError(
                                      err?.response?.data?.message ||
                                        err?.message ||
                                        "Failed to confirm user"
                                    );
                                  } finally {
                                    setConfirmingIds((p) =>
                                      p.filter((x) => x !== id)
                                    );
                                  }
                                }}
                              >
                                {confirmingIds.includes(id) ? "Confirming…" : "Approve"}
                              </button>
                            ) : isApproved ? (
                              <span className="badge success">Approved</span>
                            ) : (
                              <span className={`badge ${isVerified(u) ? "success" : "pending"}`}>
                                {isVerified(u) ? "Yes" : "No"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    } else {
                      return null;
                    }
                  })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!loadingPending && !pendingError && totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="pagination-btn"
                disabled={currentPage[activeView] === 1}
                onClick={() =>
                  setCurrentPage((prev) => ({
                    ...prev,
                    [activeView]: Math.max(1, prev[activeView] - 1),
                  }))
                }
              >
                &lt;
              </button>

              <div className="pagination-numbers">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    className={`page-number ${
                      currentPage[activeView] === page ? "active" : ""
                    }`}
                    onClick={() =>
                      setCurrentPage((prev) => ({ ...prev, [activeView]: page }))
                    }
                  >
                    {page}
                  </button>
                ))}
                {totalPages > (getPageNumbers()[getPageNumbers().length - 1] || 0) && (
                  <span className="pagination-dots">...</span>
                )}
              </div>

              <button
                className="pagination-btn"
                disabled={currentPage[activeView] === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => ({
                    ...prev,
                    [activeView]: Math.min(totalPages, prev[activeView] + 1),
                  }))
                }
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Interviewer Details</h2>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Personal Details */}
              <div className="modal-section">
                <h3>Personal Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>
                      {[selectedUser.personal_details?.first_name, selectedUser.personal_details?.middle_name, selectedUser.personal_details?.last_name]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Mobile:</label>
                    <span>{selectedUser.personal_details?.mobile_number || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Gender:</label>
                    <span>{selectedUser.personal_details?.gender || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth:</label>
                    <span>
                      {selectedUser.personal_details?.date_of_birth
                        ? new Date(selectedUser.personal_details.date_of_birth).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Location:</label>
                    <span>
                      {[selectedUser.personal_details?.city, selectedUser.personal_details?.state, selectedUser.personal_details?.country]
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Job Role */}
              <div className="modal-section">
                <h3>Role</h3>
                <div className="detail-item">
                  <span className="role-badge">{getJobRole(selectedUser)}</span>
                </div>
              </div>

              {/* Education */}
              <div className="modal-section">
                <h3>Education</h3>
                {selectedUser.education_details && selectedUser.education_details.length > 0 ? (
                  <div className="education-list">
                    {selectedUser.education_details.map((edu: any, idx: number) => (
                      <div key={idx} className="education-item">
                        <div className="edu-header">
                          <span className="edu-type">{edu.education_type?.toUpperCase()}</span>
                          <span className="edu-year">{edu.end_year ? new Date(edu.end_year).getFullYear() : "—"}</span>
                        </div>
                        <div className="edu-details">
                          <p>
                            <strong>Institution:</strong> {edu.institution_name || "N/A"}
                          </p>
                          {edu.education_type?.toLowerCase() === "higher" && edu.field_of_study && (
                            <p className="field-highlight">
                              <strong>Field:</strong> {edu.field_of_study}
                            </p>
                          )}
                          {edu.degree && (
                            <p>
                              <strong>Degree:</strong> {edu.degree}
                            </p>
                          )}
                          {edu.field_of_study && edu.education_type?.toLowerCase() !== "higher" && (
                            <p>
                              <strong>Field:</strong> {edu.field_of_study}
                            </p>
                          )}
                          <p>
                            <strong>Result:</strong> {edu.result} ({edu.result_format})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No education details found</p>
                )}
              </div>

              {/* Skills */}
              <div className="modal-section">
                <h3>Skills</h3>
                {selectedUser.skills && selectedUser.skills.length > 0 ? (
                  <div className="skills-list">
                    {selectedUser.skills.map((skill: any, idx: number) => (
                      <span key={idx} className="skill-tag">
                        {skill.skill_name || skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No skills listed</p>
                )}
              </div>

              {/* Work Experience */}
              {selectedUser.work_experience && selectedUser.work_experience.length > 0 && (
                <div className="modal-section">
                  <h3>Work Experience</h3>
                  <div className="experience-list">
                    {selectedUser.work_experience.map((exp: any, idx: number) => (
                      <div key={idx} className="experience-item">
                        <div className="exp-header">
                          <h4>{exp.job_title}</h4>
                          <span className="exp-company">{exp.company_name}</span>
                        </div>
                        <div className="exp-details">
                          <p>
                            <strong>Type:</strong> {exp.employment_type} | <strong>Mode:</strong> {exp.work_mode}
                          </p>
                          <p>
                            <strong>Location:</strong> {exp.location}
                          </p>
                          <p>
                            <strong>Duration:</strong> {new Date(exp.start_date).getFullYear()} - {exp.currently_working_here ? "Present" : new Date(exp.end_date).getFullYear()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {selectedUser.bank_details && selectedUser.bank_details.length > 0 && (
                <div className="modal-section">
                  <h3>Bank Details</h3>
                  <div className="bank-list">
                    {selectedUser.bank_details.map((bank: any, idx: number) => (
                      <div key={idx} className="bank-item">
                        <div className="bank-header">
                          <h4>{bank.bank_name}</h4>
                          <span className="account-type">{bank.account_type}</span>
                        </div>
                        <div className="bank-details">
                          <p>
                            <strong>Account Holder:</strong> {bank.account_holder_name}
                          </p>
                          <p>
                            <strong>Account Number:</strong> <span className="account-masked">{bank.account_number}</span>
                          </p>
                          <p>
                            <strong>IFSC Code:</strong> {bank.ifsc_code}
                          </p>
                          <p>
                            <strong>Branch:</strong> {bank.branch_name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
