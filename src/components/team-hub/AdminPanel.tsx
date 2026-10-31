"use client";

import { useState } from "react";
import type { Player, Invite, AuditEntry } from "@/lib/db";
import type { OrgRole } from "@/lib/permissions";

type Props = {
  players: Player[];
  invites: Invite[];
  auditLog: AuditEntry[];
  assignableRoles: OrgRole[];
  roleLabels: Record<OrgRole, string>;
  ownerDiscordId: string;
};

type Tab = "users" | "invites" | "audit";

export default function AdminPanel({ players, invites, auditLog, assignableRoles, roleLabels, ownerDiscordId }: Props) {
  const [tab, setTab] = useState<Tab>("users");
  const [localPlayers, setLocalPlayers] = useState(players);
  const [localInvites, setLocalInvites] = useState(invites);
  const [confirmArchive, setConfirmArchive] = useState<Player | null>(null);
  const [newInviteRole, setNewInviteRole] = useState<OrgRole>("PLAYER");
  const [newInviteDiscordId, setNewInviteDiscordId] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [creatingInvite, setCreatingInvite] = useState(false);

  async function handleRoleChange(discordId: string, orgRole: OrgRole, captainOf?: string) {
    setSaving(discordId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discord_id: discordId, org_role: orgRole, captain_of: captainOf ?? null }),
    });
    if (res.ok) {
      setLocalPlayers((prev) =>
        prev.map((p) => p.discord_id === discordId ? { ...p, org_role: orgRole, captain_of: captainOf ?? null } : p)
      );
    }
    setSaving(null);
  }

  async function handleArchive(player: Player) {
    const res = await fetch(`/api/admin/users/${player.discord_id}`, { method: "DELETE" });
    if (res.ok) {
      setLocalPlayers((prev) => prev.map((p) => p.discord_id === player.discord_id ? { ...p, archived: true } : p));
    }
    setConfirmArchive(null);
  }

  async function handleCreateInvite() {
    setCreatingInvite(true);
    setInviteError(null);
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_role: newInviteRole, invited_discord_id: newInviteDiscordId.trim() }),
    });
    if (res.ok) {
      const invite = await res.json() as Invite;
      setLocalInvites((prev) => [invite, ...prev]);
      setNewInviteDiscordId("");
    } else {
      const body = await res.json().catch(() => null) as { error?: string } | null;
      setInviteError(body?.error ?? "Could not create the invite");
    }
    setCreatingInvite(false);
  }

  async function handleDeleteInvite(id: string) {
    await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
    setLocalInvites((prev) => prev.filter((i) => i.id !== id));
  }

  const active = localPlayers.filter((p) => !p.archived);
  const archived = localPlayers.filter((p) => p.archived);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-black text-white tracking-wide uppercase">
          <span className="text-[#c5d400]">Admin</span> Panel
        </h1>
        <p className="text-white/40 text-sm mt-1">Owner-only access. All actions are logged.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 mb-6 w-fit">
        {(["users", "invites", "audit"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-widest transition-all ${
              tab === t ? "bg-[#c5d400] text-black" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "users" ? "Members" : t === "invites" ? "Invites" : "Audit Log"}
          </button>
        ))}
      </div>

      {/* ── Members ── */}
      {tab === "users" && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Active Members ({active.length})</h2>
          {active.map((player) => (
            <PlayerRow
              key={player.discord_id}
              player={player}
              isOwner={player.discord_id === ownerDiscordId}
              assignableRoles={assignableRoles}
              roleLabels={roleLabels}
              saving={saving === player.discord_id}
              onRoleChange={handleRoleChange}
              onArchive={() => setConfirmArchive(player)}
            />
          ))}

          {archived.length > 0 && (
            <details className="mt-6">
              <summary className="text-xs font-semibold text-white/20 uppercase tracking-widest cursor-pointer hover:text-white/40 transition-colors mb-2">
                Archived ({archived.length})
              </summary>
              <div className="space-y-2 mt-2 opacity-50">
                {archived.map((player) => (
                  <div key={player.discord_id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs font-bold">
                      {player.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white/40 line-through">{player.display_name}</span>
                    <span className="text-xs text-white/20 ml-auto">{player.discord_id}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* ── Invites ── */}
      {tab === "invites" && (
        <div className="space-y-4">
          {/* Create invite */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-white/60 font-medium">New invite for:</span>
            <select
              value={newInviteRole}
              onChange={(e) => setNewInviteRole(e.target.value as OrgRole)}
              className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#c5d400]/40"
            >
              {assignableRoles.map((r) => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
            <input
              value={newInviteDiscordId}
              onChange={(e) => setNewInviteDiscordId(e.target.value)}
              placeholder="Discord user ID"
              inputMode="numeric"
              aria-label="Discord user ID of the person this invite is for"
              className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white font-mono w-52 focus:outline-none focus:border-[#c5d400]/40"
            />
            <button
              onClick={handleCreateInvite}
              disabled={creatingInvite || !newInviteDiscordId.trim()}
              className="px-4 py-1.5 bg-[#c5d400] text-black text-sm font-bold rounded-lg hover:bg-[#d4e500] disabled:opacity-50 transition-colors uppercase tracking-wide"
            >
              {creatingInvite ? "Generating..." : "Generate Link"}
            </button>
            <p className="w-full text-[11px] text-white/30">
              Only this Discord account can use the link (Discord: Developer Mode, right-click the user, Copy User ID).
            </p>
            {inviteError && <p className="w-full text-xs text-red-400">{inviteError}</p>}
          </div>

          {localInvites.length === 0 && (
            <p className="text-white/30 text-sm text-center py-8">No active invites</p>
          )}
          {localInvites.map((invite) => {
            const expired = new Date(invite.expires_at) < new Date();
            const inviteUrl = typeof window !== "undefined"
              ? `${window.location.origin}/team-hub/join/${invite.token}`
              : `/team-hub/join/${invite.token}`;
            return (
              <div key={invite.id} className={`bg-white/[0.03] border rounded-xl p-4 flex items-center gap-3 flex-wrap ${expired || invite.used_by ? "border-white/[0.04] opacity-50" : "border-white/[0.08]"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#c5d400]">{roleLabels[invite.org_role]}</span>
                    {invite.used_by && <span className="text-xs text-white/30 bg-white/[0.06] px-2 py-0.5 rounded">Used</span>}
                    {expired && !invite.used_by && <span className="text-xs text-red-400/60 bg-red-500/10 px-2 py-0.5 rounded">Expired</span>}
                  </div>
                  <p className="text-xs text-white/30 mt-1 font-mono truncate">{inviteUrl}</p>
                  <p className="text-[10px] text-white/20 mt-0.5">
                    For: {invite.invited_discord_id ?? "not bound (old invite, cannot be used)"} · Expires: {new Date(invite.expires_at).toLocaleDateString()}
                    {invite.used_by && ` · Used by: ${invite.used_by}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!invite.used_by && !expired && (
                    <button
                      onClick={() => navigator.clipboard.writeText(inviteUrl)}
                      className="text-xs text-white/40 hover:text-white border border-white/[0.08] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteInvite(invite.id)}
                    className="text-xs text-red-400/60 hover:text-red-400 border border-white/[0.06] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Audit Log ── */}
      {tab === "audit" && (
        <div className="space-y-2">
          {auditLog.length === 0 && (
            <p className="text-white/30 text-sm text-center py-8">No audit entries yet</p>
          )}
          {auditLog.map((entry) => (
            <div key={entry.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#c5d400] uppercase tracking-widest">{entry.action_type}</span>
                  <span className="text-xs text-white/40">{entry.entity_type}: {entry.entity_id.slice(0, 12)}</span>
                </div>
                <p className="text-xs text-white/30 mt-1">By: {entry.actor_discord_id}</p>
                {entry.before_val && (
                  <details className="mt-1">
                    <summary className="text-[10px] text-white/20 cursor-pointer hover:text-white/40">Show diff</summary>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-red-500/5 rounded p-2 text-red-300/60 overflow-auto max-h-20">{JSON.stringify(entry.before_val, null, 1)}</div>
                      <div className="bg-green-500/5 rounded p-2 text-green-300/60 overflow-auto max-h-20">{JSON.stringify(entry.after_val, null, 1)}</div>
                    </div>
                  </details>
                )}
              </div>
              <p className="text-[10px] text-white/20 whitespace-nowrap">{new Date(entry.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Confirm archive modal */}
      {confirmArchive && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-heading text-xl text-white font-bold mb-2">Remove Member?</h3>
            <p className="text-white/50 text-sm mb-1">
              This will archive <strong className="text-white">{confirmArchive.display_name}</strong> and revoke their Team Hub access.
            </p>
            <p className="text-white/30 text-xs mb-6">Historical data (availability, schedule blocks) is kept. This action is logged.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmArchive(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/50 hover:text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchive(confirmArchive)}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-bold transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerRow({
  player, isOwner, assignableRoles, roleLabels, saving, onRoleChange, onArchive,
}: {
  player: Player;
  isOwner: boolean;
  assignableRoles: OrgRole[];
  roleLabels: Record<OrgRole, string>;
  saving: boolean;
  onRoleChange: (id: string, role: OrgRole, captainOf?: string) => void;
  onArchive: () => void;
}) {
  const [captainOf, setCaptainOf] = useState(player.captain_of ?? "");

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
      <div className="w-8 h-8 rounded-full bg-[#c5d400]/10 flex items-center justify-center text-[#c5d400] text-sm font-bold flex-shrink-0">
        {player.display_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-white font-semibold">{player.display_name}</p>
          {isOwner && <span className="text-[10px] bg-[#c5d400]/10 text-[#c5d400] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Owner</span>}
          <span className="text-[10px] text-white/30 font-mono">{player.division}</span>
        </div>
        <p className="text-[10px] text-white/20 font-mono mt-0.5">{player.discord_id}</p>
      </div>

      {!isOwner && (
        <div className="flex items-center gap-2 flex-wrap">
          <select
            defaultValue={player.org_role}
            onChange={(e) => {
              const newRole = e.target.value as OrgRole;
              onRoleChange(player.discord_id, newRole, newRole === "CAPTAIN" ? captainOf : undefined);
            }}
            disabled={saving}
            className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5d400]/40 disabled:opacity-50"
          >
            {assignableRoles.map((r) => (
              <option key={r} value={r}>{roleLabels[r]}</option>
            ))}
          </select>
          {player.org_role === "CAPTAIN" && (
            <input
              type="text"
              value={captainOf}
              onChange={(e) => setCaptainOf(e.target.value)}
              onBlur={() => onRoleChange(player.discord_id, "CAPTAIN", captainOf)}
              placeholder="Team name"
              className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white w-28 focus:outline-none focus:border-[#c5d400]/40"
            />
          )}
          <button
            onClick={onArchive}
            className="text-xs text-red-400/50 hover:text-red-400 border border-white/[0.06] px-2 py-1.5 rounded-lg transition-colors"
          >
            Remove
          </button>
        </div>
      )}
      {saving && <span className="text-[10px] text-white/30">Saving...</span>}
    </div>
  );
}
