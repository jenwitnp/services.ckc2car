import NextAuth from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line"; // <-- 1. Import LineProvider

async function getUserByLineId(lineUserId) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/v1/users/line-connect/by-line-id/${lineUserId}`
    );

    console.log("getUserByLineId", lineUserId, res);
    if (!res.ok) return null;
    const data = await res.json();

    // Check if the API returned a success status and a user
    if (!data.success || !data.user) {
      console.log("No user found with LINE ID:", lineUserId);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error("Failed to fetch user by LINE ID", error);
    return null;
  }
}

async function linkLineAccount(userId, lineUserId) {
  console.log("linkLineAccount : ", lineUserId);
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/v1/users/line-connect/link`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, lineUserId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to link LINE account: ${errorData.message || response.status}`
      );
    }

    console.log("LINE Account linked successfully.");
    return true;
  } catch (error) {
    console.error("Error linking LINE account:", error);
    return false;
  }
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "email,public_profile,pages_show_list",
        },
      },
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "CKC2Car",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
        lineUserIdToLink: { label: "Line User ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const res = await fetch(`${process.env.AUTH_URL}/api/user/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Clientid: process.env.CKC_CLIENT_ID,
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const result = await res.json();

          console.log("CredentialsProvider : ", result);

          if (result.status === "ok" && result.user && result.token) {
            const user = {
              id: result.user.id,
              name: result.user.name ?? result.user.username ?? "",
              position: result.user.position ?? "",
              image: result.user.image ?? "",
              accessToken: result.token,
            };

            // Add the LINE ID to link if it was provided
            if (credentials.lineUserIdToLink) {
              user.lineUserIdToLink = credentials.lineUserIdToLink;
            }

            return user;
          }
          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account.provider === "line") {
        try {
          const existingUser = await getUserByLineId(profile.sub);
          console.log(
            "check existing user from callback : ",
            profile.sub,
            existingUser
          );

          if (existingUser) {
            // Linked account found, allow sign in
            return true;
          } else {
            // No linked account found - redirect to login page with special parameter
            return `/login?error=LineAccountNotLinked&lineUserId=${profile.sub}`;
          }
        } catch (error) {
          console.error("Error in LINE sign-in flow:", error);
          // Still redirect to login in case of error
          return `/login?error=LineAccountNotLinked&lineUserId=${profile.sub}`;
        }
      }

      return true; // Allow other providers
    },

    async jwt({ token, account, profile, user, trigger, session }) {
      // 1. Handle credential logins or if user object is passed on first login
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          position: user.position,
          image: user.image,
        };
        if (user.accessToken) {
          token.accessToken = user.accessToken;
        }

        if (user.lineUserIdToLink) {
          token.lineUserIdToLink = user.lineUserIdToLink;
        }
      }

      console.log("jwt user data : ", user);
      console.log("jwt user account data : ", account);
      console.log("jwt trigger :", trigger);

      // CASE A: Direct LINE login (with existing link)
      if (account?.provider === "line" && profile) {
        console.log("line login logic : ");
        // If user already has a session, link the accounts
        if (token.user?.id) {
          console.log("Attempting to link LINE account directly...");
          await linkLineAccount(token.user.id, profile.sub);
        }
        // Otherwise, try to find user with this LINE ID
        else {
          const existingUser = await getUserByLineId(profile.sub);
          if (existingUser) {
            token.user = {
              id: existingUser.id,
              name: existingUser.name,
              position: existingUser.position,
              image: existingUser.image,
            };
          }
        }
      }

      // CASE B: User logged in with credentials and has a pending LINE ID to link
      // This handles the case when they were redirected from LINE login to credential login
      if (account?.provider === "credentials" && user) {
        // Check URL for lineUserId parameter
        console.log("credential logic");

        try {
          const lineUserIdToLink =
            token.lineUserIdToLink || user.lineUserIdToLink;

          if (lineUserIdToLink) {
            console.log(
              "Found LINE ID to link after credential login:",
              lineUserIdToLink
            );
            await linkLineAccount(user.id, lineUserIdToLink);

            // Store successful linking in token for notification
            token.linkedLineAccount = true;
            // Remove the temporary property to keep the token clean
            delete token.lineUserIdToLink;
          }
        } catch (error) {
          // URL parsing error, just continue
          console.log("credential error", error);
        }
      }

      // CASE C: Handle LINE linking via update session
      if (trigger === "update" && session?.lineUserIdToLink) {
        console.log("Linking LINE account via session update");
        await linkLineAccount(token.user.id, session.lineUserIdToLink);
        token.linkedLineAccount = true;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
        session.provider =
          typeof token.provider === "string" ? token.provider : undefined;
      }

      // Pass along the LINE linking status to the client
      if (token.linkedLineAccount) {
        session.linkedLineAccount = true;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
