import { useState } from "react";
import FocusTrapModal from "./FocusTrapModal";
import { validatePassword } from "../hooks/useAuth";

const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
    : "";

function ProfileModal({ user, authToken, onClose, onUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    try {
      if (authToken && API_BASE_URL) {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
        });
        const data = await res.json();
        if (!data.ok) {
          setSaveError(data.error || "Failed to update profile on server.");
          setSaving(false);
          return;
        }
      }

      onUpdate?.({ name: trimmedName, email: trimmedEmail });
      onClose();
    } catch {
      setSaveError("Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMessage("");
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordMessage(validationError);
      return;
    }

    if (!authToken || !API_BASE_URL) {
      setPasswordMessage("Sign in with the cloud API to change your password.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.ok) {
        setPasswordMessage(data.error || "Password update failed.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password updated successfully.");
    } catch {
      setPasswordMessage("Password update failed.");
    }
  };

  return (
    <FocusTrapModal onClose={onClose} labelledBy="profile-modal-title" className="w-full max-w-md">
      <div
        className="rounded-[28px] border p-6 shadow-2xl"
        style={{ background: "var(--bg-panel)", borderColor: "var(--border-color)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="profile-modal-title" className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border px-3 py-1 text-sm"
            style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
            aria-label="Close profile"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)", color: "var(--text-primary)" }}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)", color: "var(--text-primary)" }}
            />
          </label>

          {authToken && (
            <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Change password</p>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-primary)" }}
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-primary)" }}
              />
              <button
                type="button"
                onClick={handlePasswordChange}
                className="rounded-xl border px-4 py-2 text-sm"
                style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                Update password
              </button>
              {passwordMessage && (
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{passwordMessage}</p>
              )}
            </div>
          )}

          {saveError && (
            <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>
              {saveError}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim() || !email.trim()}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))" }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </FocusTrapModal>
  );
}

export default ProfileModal;
