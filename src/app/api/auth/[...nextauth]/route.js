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
  if (!lineUserId || lineUserId === "null" || lineUserId.trim() === "") {
    console.log(
      "Skipping LINE account linking - invalid LINE User ID:",
      lineUserId
    );
    return false;
  }

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

  // ✅ Add JWT strategy
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // ✅ Add JWT configuration
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

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
              role: result.user.role,
            };

            // ✅ Only add LINE ID if it's not null/empty
            if (
              credentials.lineUserIdToLink &&
              credentials.lineUserIdToLink !== "null" &&
              credentials.lineUserIdToLink.trim() !== ""
            ) {
              user.lineUserIdToLink = credentials.lineUserIdToLink;
              console.log(
                "Adding LINE ID to link:",
                credentials.lineUserIdToLink
              );
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
            "check existing user from callback:",
            profile.sub,
            existingUser
          );

          if (existingUser) {
            return true;
          } else {
            return `/login?error=LineAccountNotLinked&lineUserId=${profile.sub}`;
          }
        } catch (error) {
          console.error("Error in LINE sign-in flow:", error);
          return `/login?error=LineAccountNotLinked&lineUserId=${profile.sub}`;
        }
      }
      return true;
    },

    async jwt({ token, account, profile, user, trigger, session }) {
      console.log("JWT Callback - Input:", { user, account, profile, trigger });

      // ✅ Handle user login (credentials or line)
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          position: user.position,
          image: user.image,
          role: user.role, // ✅ Ensure role is included
        };

        if (user.accessToken) {
          token.accessToken = user.accessToken;
        }

        // ✅ Handle LINE ID linking for credentials login
        if (user.lineUserIdToLink && user.lineUserIdToLink !== "null") {
          token.lineUserIdToLink = user.lineUserIdToLink;
        }
      }

      // ✅ Handle LINE provider login
      if (account?.provider === "line" && profile) {
        console.log("Processing LINE login for:", profile.sub);

        // Try to find existing user by LINE ID
        const existingUser = await getUserByLineId(profile.sub);
        if (existingUser) {
          token.user = {
            id: existingUser.id,
            name: existingUser.name,
            position: existingUser.position,
            image: existingUser.image,
            role: existingUser.role, // ✅ Include role from existing user
          };
          token.provider = "line";
        }
      }

      // ✅ Handle credentials login with LINE linking
      if (account?.provider === "credentials" && token.lineUserIdToLink) {
        if (token.lineUserIdToLink !== "null" && token.user?.id) {
          console.log(
            "Linking LINE account:",
            token.user.id,
            "->",
            token.lineUserIdToLink
          );

          try {
            const linkSuccess = await linkLineAccount(
              token.user.id,
              token.lineUserIdToLink
            );
            if (linkSuccess) {
              token.linkedLineAccount = true;
              console.log("LINE account linked successfully");
            }
          } catch (error) {
            console.error("Failed to link LINE account:", error);
          }

          // Clean up the temporary linking data
          delete token.lineUserIdToLink;
        }
      }

      // ✅ Handle session updates
      if (trigger === "update" && session?.lineUserIdToLink) {
        console.log("Linking LINE account via session update");
        if (token.user?.id) {
          await linkLineAccount(token.user.id, session.lineUserIdToLink);
          token.linkedLineAccount = true;
        }
      }

      console.log("JWT Callback - Output token.user:", token.user);
      return token;
    },

    async session({ session, token }) {
      console.log("Session Callback - Input token:", token);

      if (token.user) {
        session.user = {
          ...token.user,
          role: token.user.role, // ✅ Explicitly include role
        };
      }

      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }

      if (token.provider) {
        session.provider = token.provider;
      }

      if (token.linkedLineAccount) {
        session.linkedLineAccount = true;
      }

      console.log("Session Callback - Output session:", session);
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
