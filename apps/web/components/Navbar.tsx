"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";

export function Navbar() {
    const { token, logout } = useAuth();
    const router = useRouter();

    function handleLogout() {
        logout();
        router.replace("/login");
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo">Dev-Forces</Link>
                <div className="navbar-actions">
                    {token && (
                        <button className="btn btn-ghost" onClick={handleLogout}>
                            Sign out
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
