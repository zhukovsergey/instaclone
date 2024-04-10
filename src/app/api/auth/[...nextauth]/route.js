import NextAuth from "next-auth";
import VkProvider from "next-auth/providers/vk";
const handler = NextAuth({
  // Configure one or more authentication providers
  providers: [
    VkProvider({
      clientId: process.env.VK_CLIENT_ID,
      clientSecret: process.env.VK_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.username = session.user.name
        .split(" ")
        .join("")
        .toLocaleLowerCase();
      session.user.uid = token.sub;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
