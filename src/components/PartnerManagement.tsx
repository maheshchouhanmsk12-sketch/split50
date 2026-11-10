"use client";

import React, { useState } from "react";
import { useSplit } from "@/context/SplitContext";
import { ConfirmModal } from "./ConfirmModal";
import { Partner } from "@/types";
import {
  Users,
  UserPlus,
  Archive,
  RefreshCw,
  Edit2,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export function PartnerManagement() {
  const {
    partners,
    activePartners,
    addPartner,
    renamePartner,
    archivePartner,
    unarchivePartner,
  } = useSplit();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = addPartner(newName);
    if (result.success) {
      setNewName("");
    } else {
      setError(result.error || "Failed to add partner");
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
      setError(result.error || "Failed to rename partner");
    }
  };

  const archivedPartners = partners.filter((p) => p.isArchived);

  return (
    <>
      <div className="rounded-3xl p-6 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8B83F6]" />
            <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              Partner Management
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage members sharing expenses. A minimum of 2 active partners is required.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-[#FF8C72]/15 border border-[#FF8C72]/30 text-[#FF8C72] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Add Partner Form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new partner name..."
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (error) setError(null);
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--muted-violet)]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#B8F36B] text-[#17152B] hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Active Partners List */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Active Partners ({activePartners.length})
          </label>
          <div className="divide-y divide-[var(--border-subtle)]">
            {activePartners.map((partner) => {
              const isRenaming = editingId === partner.id;

              return (
                <div
                  key={partner.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-[#17152B] shrink-0"
                      style={{ backgroundColor: partner.avatarColor || "#8B83F6" }}
                    >
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>

                    {isRenaming ? (
                      <div className="flex items-center gap-2 flex-1 max-w-xs">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-primary)] focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(partner.id)}
                          className="p-1 rounded text-[#B8F36B] hover:bg-[var(--bg-subtle)]"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {partner.name}
                      </span>
                    )}
                  </div>

                  {!isRenaming && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartRename(partner)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                        title="Rename partner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (activePartners.length <= 2) {
                            setError("Split50 requires at least two active partners. You cannot archive this member.");
                          } else {
                            setArchiveTargetId(partner.id);
                          }
                        }}
                        disabled={activePartners.length <= 2}
                        className={`p-1.5 rounded-lg transition-colors ${
                          activePartners.length <= 2
                            ? "opacity-30 cursor-not-allowed text-[var(--text-muted)]"
                            : "text-[var(--text-muted)] hover:text-[#FF8C72] hover:bg-[var(--bg-subtle)]"
                        }`}
                        title={
                          activePartners.length <= 2
                            ? "Minimum 2 active partners required"
                            : "Archive partner"
                        }
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Archived Partners Section (Historical Record Protection) */}
        {archivedPartners.length > 0 && (
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8B83F6]" />
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Archived Partners ({archivedPartners.length})
              </label>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Archived members are excluded from new expenses while their past transactions and settlement records are preserved permanently.
            </p>
            <div className="divide-y divide-[var(--border-subtle)]">
              {archivedPartners.map((partner) => (
                <div key={partner.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center font-bold text-[10px] text-[var(--text-muted)] shrink-0">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-secondary)] truncate line-through">
                      {partner.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => unarchivePartner(partner.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#8B83F6] hover:bg-[var(--bg-subtle)] transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(archiveTargetId)}
        title="Archive Partner"
        message="Are you sure you want to archive this partner? They will be removed from future expense forms, but their past transactions and calculations will remain completely preserved."
        confirmLabel="Archive"
        isDestructive={false}
        onConfirm={() => {
          if (archiveTargetId) {
            archivePartner(archiveTargetId);
            setArchiveTargetId(null);
          }
        }}
        onCancel={() => setArchiveTargetId(null)}
      />
    </>
  );
}

