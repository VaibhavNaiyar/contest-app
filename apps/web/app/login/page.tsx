"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await apiPost("/user/signin", { email });
            setSent(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div>
                <h1>Check your email</h1>
                <p>We sent a login link to <strong>{email}</strong></p>
                <p>Click the link in the email to sign in.</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Sign in to Dev-Forces</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send login link"}
                </button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
}
