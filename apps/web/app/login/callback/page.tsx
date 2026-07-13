"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import { apiGet } from "../../../lib/api";

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setError("Invalid login link — no token found.");
            return;
        }

        apiGet(`/user/signin/post?token=${token}`)
            .then((data: { token?: string }) => {
                if (data.token) {
                    login(data.token);
                    router.replace("/");
                } else {
                    setError("Invalid or expired login link.");
                }
            })
            .catch(() => setError("Something went wrong. Please try again."));
    }, []);

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <a href="/login">Back to login</a>
            </div>
        );
    }

    return <p>Signing you in...</p>;
}

export default function CallbackPage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <CallbackContent />
        </Suspense>
    );
}
