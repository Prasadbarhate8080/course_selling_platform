import { connectToDatabase } from "@/lib/dbConnect";
import { Admin, adminModel } from "@/models/admin.model";
import { userModel } from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextAuthOptions, User } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

type credentialsType = {
    indetifier:string,
    password:string
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialProvider({
            id:"Credentials",
            name:"Credentials",
            credentials:{
                identifier:{label:"Email or Username", placeholder:"email/username", type:"text"},
                password:{label:"password",placeholder:"password",type:"password"},
            },
            async authorize(credentials:any):Promise<any> {
                console.log(credentials)
                if(!credentials) return
                await connectToDatabase();
                try {
                        let account = await userModel.findOne({
                            $or: [
                                { email: credentials.identifier },
                                { userName: credentials.identifier },
                            ],
                        });
                        if(!account)
                            throw new Error("invalid credentials")
                        if(!account?.isVerified)
                            throw new Error("please verify your account before logging in")
                        if(!account)
                            throw new Error("invalid credentials")
                        const isPasswordCorrect = await bcrypt.compare(
                            credentials.password,
                            account?.password
                        )
                        if(!isPasswordCorrect) 
                            throw new Error("invalid credentials")
                        else
                            return account;
                } catch (error:any) {
                    throw new Error(error)
                }
            }
        }),

        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET! 
        }),

        GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        
    ],
    callbacks:{
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" || account?.provider === "github") {
                await connectToDatabase();
                try {
                    const existingUser = await userModel.findOne({ email: user.email });
                    if (!existingUser) {
                        const newUser = await userModel.create({
                            email: user.email,
                            userName: user.name?.split(" ").join("").toLowerCase() + Math.floor(Math.random() * 1000),
                            isVerified: true,
                            role: "user", // Default role for new OAuth users
                        });
                        user._id = newUser._id.toString();
                        user.role = newUser.role;
                    } else {
                        user._id = existingUser._id.toString();
                        user.role = existingUser.role;
                    }
                    return true;
                } catch (error) {
                    console.error("Error during OAuth sign-in sync:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
        // 1. If this is the initial sign-in, user will be defined
        if (user) {
          token._id = user._id?.toString();
          token.isVerified = user.isVerified;
          token.userName = user.userName;
          token.role = user.role;
        } 
        
        // 2. Always fetch the latest data from DB if we have an ID
        if (token._id) {
          await connectToDatabase();
          const dbUser = await userModel.findById(token._id);
          if (dbUser) {
            token.role = dbUser.role;
            token.userName = dbUser.userName;
            token.isVerified = dbUser.isVerified;
          }
        }
        
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user._id = token._id;
          session.user.isVerified = token.isVerified;
          session.user.userName = token.userName;
          session.user.role = token.role;
        }
        return session;
      },
    },
    secret:process.env.NEXTAUTH_SECRET,
    session: {
      strategy: 'jwt',
    },
    pages:{
        signIn:"/sign-in"
    }
}