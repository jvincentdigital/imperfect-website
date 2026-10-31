import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getInviteByToken, redeemInvite, upsertPlayer, appendAuditLog } from "@/lib/db";

export const metadata = { title: "Join Team Hub — IMPerfect" };

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await auth();

  if (!session?.user?.discordId) {
    // Not logged in — send them to login, then back here
    redirect(`/team-hub?next=/team-hub/join/${token}`);
  }

  const invite = await getInviteByToken(token);

  if (!invite || invite.used_by) {
    return <ErrorPage message="This invite link has already been used or doesn't exist." />;
  }

  if (new Date(invite.expires_at) < new Date()) {
    return <ErrorPage message="This invite link has expired." />;
  }

  const discordId = session.user.discordId;
  if (invite.invited_discord_id !== discordId) {
    return <ErrorPage message="This invite was made for a different Discord account." />;
  }

  const displayName = (session.user as { displayName?: string }).displayName ?? session.user.name ?? discordId;

  // Claim the invite first (atomic, single use). Only the winner gets a
  // player row, so a reused or raced link never creates a member.
  const claimedRole = await redeemInvite(token, discordId);
  if (!claimedRole) {
    return <ErrorPage message="This invite link has already been used or doesn't exist." />;
  }

  // Upsert player with the invited role, mark invite used
  await upsertPlayer({
    discord_id: discordId,
    display_name: displayName,
    division: "IMPerfect",
    role: "player",
    is_admin: false,
    org_role: claimedRole,
    game: null,
    in_game_role: null,
    rank: null,
    captain_of: null,
    archived: false,
  });

  await appendAuditLog({
    actor_discord_id: invite.created_by,
    action_type: "INVITE_REDEEMED",
    entity_type: "player",
    entity_id: discordId,
    before_val: null,
    after_val: { org_role: claimedRole, display_name: displayName },
  });

  redirect("/team-hub/dashboard");
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-xl">✕</span>
        </div>
        <h2 className="font-heading text-xl text-white font-bold mb-2">Invalid Invite</h2>
        <p className="text-white/40 text-sm">{message}</p>
        <Link href="/team-hub" className="mt-6 inline-block text-sm text-[#c5d400] hover:underline">Back to Team Hub</Link>
      </div>
    </div>
  );
}
