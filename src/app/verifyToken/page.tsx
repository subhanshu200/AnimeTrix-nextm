"use client"
import axios from "axios"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import SpinLoading from "@/components/loading/SpinLoading"
export default function VerifyEmailPage() {
    const [token, setToken] = useState("")
    const [verified, setVerified] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)

    const verifyUserEmail = async () => {
        try {
            const response = await axios.post('/api/verifyEmail', { token })
            setVerified(true)
            setMessage(response.data.message)
            console.log(response)
        } catch (error: any) {
            setError(error.response.data.error)
            console.log(error)
        }
    }
    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        setToken(urlToken || "")
    }, []);

    useEffect(() => {
        if (token.length > 0) {
            verifyUserEmail()
            setLoading(false)
        }
    }, [token])

    return (
        <div className="flex justify-center items-center  flex-col min-h-[70vh] p-3 gap-5">
            {
                loading ?
                    <div className="flex min-h-[70vh] flex-col">
                        <SpinLoading />
                    </div> : (
                        <>
                            <h1 className=" text-3xl font-semibold">Verify Email</h1>
                            <h2 className=" text-2xl font-semibold text-red-500">{token ? "" : "No token Found"}</h2>
                            {
                                verified ? (
                                    <>
                                        <h2 className=" text-2xl font-semibold text-green-500">{message}</h2>
                                        <Link href={"/login"} className=" bg-white p-3 rounded-lg text-black font-semibold w-52 text-center">Login</Link>
                                    </>
                                ) : (
                                    <h2 className=" text-2xl font-semibold text-red-500">{error}</h2>
                                )
                            }</>
                    )
            }

        </div>
    )
}