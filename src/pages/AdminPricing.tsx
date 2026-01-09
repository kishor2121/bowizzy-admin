import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
} from "../services/admin";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import "./AdminPricing.css";

const AdminPricing: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateId, setDuplicateId] = useState<number | string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const res = await getPricing();
    setItems(res || []);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setType("");
    setAmount("");
    setEditingId(null);
    setShowForm(false);
    setError(null);
    setDuplicateId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!type || !amount) {
      setError("Please provide plan type and amount");
      return;
    }

    // If creating, prevent duplicates of plan type
    const exists = items.find((it) => (it.bowizzy_plan_type || "").toLowerCase() === String(type).toLowerCase());
    if (!editingId && exists) {
      setError("A pricing for this plan type already exists. Please update the existing entry.");
      setDuplicateId(exists.id ?? exists.pricing_id ?? null);
      return;
    }

    if (editingId) {
      await updatePricing(editingId, {
        bowizzy_plan_type: type,
        amount: Number(amount),
      });
    } else {
      await createPricing({
        bowizzy_plan_type: type,
        amount: Number(amount),
      });
    }
    resetForm();
    await load();
  };

  const edit = (it: any) => {
    setEditingId(it.id || it.pricing_id);
    setType(it.bowizzy_plan_type);
    setAmount(it.amount);
    setShowForm(true);
  };

  const openDelete = (it: any) => {
    setDeleteTarget(it);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePricing(deleteTarget.id ?? deleteTarget.pricing_id);
      await load();
    } catch (e) {
      // optionally show error
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout headerTitle="Pricing" headerSubtitle="Manage pricing plans">
      <div className="pricing-page">

        {/* HEADER */}
        <div className="pricing-header">
          <h2>Pricing List</h2>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus /> Add Pricing
          </button>
        </div>

        {/* FORM MODAL */}
        {showForm && (
  <div className="modal-backdrop">
    <div className="pricing-modal">
      <h3>{editingId ? "Edit Pricing" : "Add Pricing"}</h3>

      <form onSubmit={submit}>
        <div className="field">
          <label>Plan Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Select plan</option>
            <option value="interview">Interview</option>
            <option value="template">Template</option>
          </select>
        </div>

        <div className="field">
          <label>Amount</label>
          <input
            type="number"
            step={1}
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") {
                setAmount("");
                return;
              }
              // Strip decimal part if user types a float (prevent floats)
              const cleaned = v.split(".")[0];
              // If cleaned is empty (e.g. user typed '.') treat as empty
              if (cleaned === "") {
                setAmount("");
                return;
              }
              // Only allow digits
              const digits = cleaned.replace(/[^0-9]/g, "");
              setAmount(digits === "" ? "" : Number(digits));
            }}
            placeholder="199"
          />
        </div>

        {error && (
          <div style={{ color: "#d9534f", marginBottom: 8 }}>
            {error}
            {duplicateId && (
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-secondary edit-existing"
                  onClick={() => {
                    // open existing for edit
                    const existing = items.find(
                      (it) => (it.id ?? it.pricing_id) === duplicateId
                    );
                    if (existing) {
                      setEditingId(existing.id ?? existing.pricing_id);
                      setType(existing.bowizzy_plan_type);
                      setAmount(existing.amount);
                      setDuplicateId(null);
                      setError(null);
                      setShowForm(true);
                    }
                  }}
                >
                  <FiEdit2 />
                  <span style={{ marginLeft: 8 }}>Edit existing</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-primary" type="submit">
            {editingId ? "Save" : "Create"}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={resetForm}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* DELETE CONFIRM MODAL */}
        {showDeleteModal && deleteTarget && (
          <div className="modal-backdrop">
            <div className="pricing-modal">
              <h3>Delete Pricing</h3>
              <div style={{ marginTop: 6, marginBottom: 12, color: '#222' }}>
                Are you sure you want to delete the pricing for <strong>{deleteTarget.bowizzy_plan_type}</strong> (₹ {deleteTarget.amount})?
              </div>

              <div className="modal-actions">
                <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button className="btn-cancel" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {/* TABLE (DESKTOP) */}
        <div className="table-wrapper">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Plan Type</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id || it.pricing_id}>
                  <td>{idx + 1}</td>
                  <td>{it.bowizzy_plan_type}</td>
                  <td>₹ {it.amount}</td>
                  <td className="actions">
                    <button className="icon edit" onClick={() => edit(it)}>
                      <FiEdit2 />
                    </button>
                    <button
                      className="icon delete"
                      onClick={() => openDelete(it)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="pricing-cards">
          {items.map((it, idx) => (
            <div className="pricing-card" key={it.id || it.pricing_id}>
              <div>
                <strong>{idx + 1}. {it.bowizzy_plan_type}</strong>
                <div className="amount">₹ {it.amount}</div>
              </div>
              <div className="card-actions">
                <button className="icon edit" onClick={() => edit(it)}>
                  <FiEdit2 />
                </button>
                <button
                  className="icon delete"
                  onClick={() => openDelete(it)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
