/**
 * Invite rules, kept free of Next/NextAuth imports so they are easy to test.
 *
 * An invite is bound to ONE Discord user id (invited_discord_id). Holding the
 * link is not enough: the person signing in must be that exact Discord user,
 * the invite must be unused and unexpired. Invites made before the binding
 * existed (invited_discord_id null) are never redeemable.
 */
import type { Invite } from "./db";

// Discord user ids are numeric snowflakes, 17 to 20 digits today.
const DISCORD_ID_RE = /^\d{17,20}$/;

export function isValidDiscordId(value: unknown): value is string {
  return typeof value === "string" && DISCORD_ID_RE.test(value);
}

export function isInviteRedeemableBy(
  invite: Pick<Invite, "invited_discord_id" | "used_by" | "expires_at"> | null,
  discordId: string,
  now: Date = new Date(),
): boolean {
  if (!invite || !discordId) return false;
  if (!invite.invited_discord_id || invite.invited_discord_id !== discordId) return false;
  if (invite.used_by) return false;
  return new Date(invite.expires_at) > now;
}

export type SignInDeps = {
  ownerDiscordId: string | undefined;
  approvedIds: string[];
  getPlayerByDiscordId: (id: string) => Promise<unknown | null>;
  getInviteByToken: (token: string) => Promise<Invite | null>;
};

/**
 * Decides whether a Discord identity may sign in.
 * Returns true, or a redirect path when the user is not allowed.
 */
export async function checkSignIn(
  discordId: string | undefined,
  inviteToken: string | null,
  deps: SignInDeps,
): Promise<true | string> {
  const denied = "/team-hub?error=not_approved";
  if (!discordId) return denied;
  if (deps.ownerDiscordId && discordId === deps.ownerDiscordId) return true;
  try {
    if (await deps.getPlayerByDiscordId(discordId)) return true;
    if (inviteToken) {
      const invite = await deps.getInviteByToken(inviteToken);
      if (isInviteRedeemableBy(invite, discordId)) return true;
    }
    return denied;
  } catch {
    // DB unavailable: only the explicit env allowlist gets in. An empty list
    // means nobody (it used to mean everybody).
    return deps.approvedIds.includes(discordId) ? true : denied;
  }
}
