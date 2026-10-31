import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { cookies } from "next/headers";
import type { OrgRole } from "@/lib/permissions";

const approvedIds = (process.env.APPROVED_DISCORD_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

// Extract the join token the user is actively redeeming, if any.
// NextAuth stores the post-login destination (set via signIn redirectTo)
// in the callback-url cookie. A brand new member only ever reaches sign-in
// by following a /team-hub/join/<token> link, so the token in that cookie
// is the specific invite this identity is claiming.
async function getRedeemingInviteToken(): Promise<string | null> {
  try {
    const store = await cookies();
    const raw =
      store.get("__Secure-authjs.callback-url")?.value ??
      store.get("authjs.callback-url")?.value ??
      null;
    if (!raw) return null;
    const decoded = decodeURIComponent(raw);
    const match = decoded.match(/\/team-hub\/join\/([^/?#]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID ?? process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH_DISCORD_SECRET ?? process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "discord") return false;
      // A brand new member must be following THEIR invite link, and the
      // invite must be bound to this exact Discord user id (see lib/invites).
      const { getPlayerByDiscordId, getInviteByToken } = await import("@/lib/db");
      const { checkSignIn } = await import("@/lib/invites");
      return checkSignIn((profile as { id?: string })?.id, await getRedeemingInviteToken(), {
        ownerDiscordId: process.env.OWNER_DISCORD_ID,
        approvedIds,
        getPlayerByDiscordId,
        getInviteByToken,
      });
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile) {
        const discordId = (profile as { id?: string }).id ?? "";
        token.discordId = discordId;
        token.isOwner = discordId === process.env.OWNER_DISCORD_ID;

        try {
          const { getPlayerByDiscordId } = await import("@/lib/db");
          const player = await getPlayerByDiscordId(discordId);
          token.role = player?.role ?? "player";
          token.orgRole = (player?.org_role as OrgRole | undefined) ?? (token.isOwner ? "OWNER" : "PLAYER");
          token.division = player?.division ?? null;
          token.captainOf = player?.captain_of ?? null;
          token.displayName = player?.display_name ?? token.name ?? "";
          token.game = player?.game ?? null;
        } catch {
          token.role = "player";
          token.orgRole = token.isOwner ? "OWNER" : "PLAYER";
          token.division = null;
          token.captainOf = null;
          token.displayName = token.name ?? "";
          token.game = null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as unknown as Record<string, unknown>;
        u.discordId  = token.discordId;
        u.isOwner    = token.isOwner ?? false;
        u.role       = token.role ?? "player";
        u.orgRole    = token.orgRole ?? "PLAYER";
        u.division   = token.division ?? null;
        u.captainOf  = token.captainOf ?? null;
        u.displayName = token.displayName ?? session.user.name;
        u.game       = token.game ?? null;
        u.id         = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/team-hub",
    error:  "/team-hub",
  },
  trustHost: true,
});
