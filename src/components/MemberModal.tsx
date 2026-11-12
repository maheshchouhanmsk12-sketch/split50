"use client";

import React, { useState } from "react";
import { useSplit } from "@/context/SplitContext";
import { formatPaise } from "@/lib/calculations";
import { ConfirmModal } from "./ConfirmModal";
import { Partner } from "@/types";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  Archive,
  RefreshCw,
} from "lucide-react";

export function MemberModal() {
  const {
    isMemberModalOpen,
    setIsMemberModalOpen,
    partners,
    activePartners,
    summary,
    addPartner,
    renamePartner,
    deletePartner,
    archivePartner,
    unarchivePartner,
  } = useSplit();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isMemberModalOpen) return null;

  const handleClose = () => {
    setIsMemberModalOpen(false);
    setEditingId(null);
    setError(null);
    setNewName("");
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = addPartner(newName);
    if (result.success) {
      setNewName("");
    } else {
      setError(result.error || "Failed to add member");
    }
  };

  const handleStartRename = (partner: Partner) => {
    setEditingId(partner.id);
    setEditingName(partner.name);
    setError(null);
  };

  const handleSaveRename = (id: string) => {
    const result = renamePartner(id, editingName);
    if (result.success) {
      setEditingId(null);
      setEditingName("");
    } else {
      setError(result.error || "Failed to rename member");
    }
  };

  const archivedPartners = partners.filter((p) => p.isArchived);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
        <div
          className="w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-primary)] transition-all my-auto max-h-[92vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#B8F36B] text-[#17152B] font-bold">
                <Users className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Manage Members</h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Add, edit, or remove expense-sharing members
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Member Form */}
          <form onSubmit={handleAdd} className="mt-5 flex gap-2">
            <input
              type="text"
              placeholder="Enter new member name..."
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (error) setError(null);
              }}
              className="flex-1 px-4 py-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl font-bold text-xs bg-[#B8F36B] hover:brightness-105 active:scale-95 transition-all text-[#17152B] flex items-center gap-1.5 shadow-md shadow-[#B8F36B]/20 shrink-0"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </form>

          {/* Active Members List */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Active Members ({activePartners.length})
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">
                All changes save permanently
              </span>
            </div>

            <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--bg-subtle)]/50">
              {activePartners.map((partner) => {
                const isRenaming = editingId === partner.id;
                const metric = summary.partnerMetrics.find((m) => m.partnerId === partner.id);
                const paidPaise = metric?.paidPaise || 0;
                const netBalancePaise = metric?.netBalancePaise || 0;

                return (
                  <div
                    key={partner.id}
                    className="p-3.5 flex items-center justify-between gap-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar initial */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-zinc-950 shrink-0 shadow-sm"
                        style={{ backgroundColor: partner.avatarColor || "#B8F36B" }}
                      >
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>

                      {isRenaming ? (
                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-strong)] text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 w-full"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(partner.id)}
                            className="p-1.5 rounded-lg text-emerald-500 hover:bg-[var(--bg-subtle)]"
                            title="Save"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                              {partner.name}
                            </span>
                            {netBalancePaise !== 0 && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold font-tabular shrink-0 ${
                                  netBalancePaise > 0
                                    ? "bg-[#B8F36B]/20 text-emerald-600 dark:text-[#B8F36B]"
                                    : "bg-rose-500/20 text-rose-500"
                                }`}
                              >
                                {netBalancePaise > 0
                                  ? `+${formatPaise(netBalancePaise)}`
                                  : formatPaise(netBalancePaise)}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                            Paid: {formatPaise(paidPaise)}
                          </p>
                        </div>
                      )}
                    </div>

                    {!isRenaming && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartRename(partner)}
                          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                          title="Rename member"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (partners.length <= 1) {
                              setError("At least one member is required in Split50.");
                            } else {
                              setDeleteTargetId(partner.id);
                            }
                          }}
                          disabled={partners.length <= 1}
                          className={`p-2 rounded-xl transition-colors ${
                            partners.length <= 1
                              ? "opacity-30 cursor-not-allowed text-[var(--text-muted)]"
                              : "text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10"
                          }`}
                          title={
                            partners.length <= 1
                              ? "At least one member is required"
                              : "Delete member"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Archived Members Section */}
          {archivedPartners.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Archived Members ({archivedPartners.length})
                </label>
              </div>
              <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--bg-subtle)]/30">
                {archivedPartners.map((partner) => (
                  <div key={partner.id} className="p-3 flex items-center justify-between gap-3 bg-[var(--bg-surface)]">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] line-through">
                      {partner.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => unarchivePartner(partner.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-500 hover:bg-[var(--bg-subtle)] transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-subtle)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Delete Member Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Member"
        message="Are you sure you want to permanently delete this member? All balances and expense splits will be cleanly updated immediately."
        confirmLabel="Delete Member"
        isDestructive={true}
        onConfirm={() => {
          if (deleteTargetId) {
            deletePartner(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </>
  );
}

