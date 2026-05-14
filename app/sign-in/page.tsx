"use client"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { signInSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"
import Link from "next/link"

function page() {
    const router = useRouter();
    const form = useForm<z.infer<typeof signInSchema>>(
            {
                resolver:zodResolver(signInSchema),
                defaultValues:{ 
                    identifier:"",
                    password:""
                }
            }
        )
        async function onSubmit(data: z.infer<typeof signInSchema>) {
            try {
                let result = await signIn("Credentials",
                    {
                        redirect:false,
                        identifier:data.identifier,
                        password:data.password
                    }
                )
                if(result?.error)
                    toast.error(result.error)
                else
                {
                    toast.success("signin successfull")
                    router.replace("/")
                }
            } catch (error: any) {
                toast.error("error in logging in")
            }
        }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
        <div className="w-full max-w-xl p-8 space-y-8 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-center">Welcome To SkillPeak</h2>
            <div className="flex gap-4 w-fit mx-auto">
                <Button className="bg-white text-gray-800 border hover:bg-white hover:cursor-pointer"
                onClick={() => {signIn("google")}}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="200" height="200" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,
                        12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,
                        24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,
                        20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0
                        ,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,
                        14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,
                        26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,
                        44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,
                        5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg> Continue with Google</Button>
                <Button className="bg-white text-gray-800 border hover:bg-white hover:cursor-pointer"
                onClick={() => {signIn("github")}}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="200" height="200" viewBox="0 0 30 30">
                        <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051
                            c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526
                            c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769
                            c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098
                            c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,
                            14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594
                                c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,
                                0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
                    </svg>
                    Continue with github</Button>
            </div>
            <div className="flex justify-center items-center"><hr className="flex-1"/><span className="">OR</span><hr className="flex-1" /></div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>UserName/Email</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="username/email" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <Button type="submit" className="w-full">Submit</Button>
                    <span>Don't have an account? <Link href={"/sign-up"}><span className="text-blue-600">register here</span></Link></span>
                </form>
            </Form>
        </div>
    </div>
  )
}

export default page
