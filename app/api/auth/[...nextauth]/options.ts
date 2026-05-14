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
                            throw new Error("invalid c  redentials")
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
        async jwt({ token, user }) {
        // Always fetch the latest user data from DB to ensure role is up to date
        if (token._id) {
          await connectToDatabase();
          const dbUser = await userModel.findById(token._id);
          if (dbUser) {
            token.role = dbUser.role;
            token.userName = dbUser.userName;
            token.isVerified = dbUser.isVerified;
          }
        } else if (user) {
          // This only runs on the very first sign in call
          token._id = user._id?.toString();
          token.isVerified = user.isVerified;
          token.userName = user.userName;
          token.role = user.role;
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