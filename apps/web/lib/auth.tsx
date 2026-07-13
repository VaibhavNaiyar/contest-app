"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
    token: string | null;
    userId: string | null;
    role: string | null;
}

interface AuthContextType extends AuthState {
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<AuthState>({ token: null, userId: null, role: null });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]!));
                setAuth({ token, userId: payload.userId, role: payload.role });
            } catch {
                localStorage.removeItem("token");
            }
        }
        setIsLoading(false);
    }, []);

    function login(token: string) {
        localStorage.setItem("token", token);
        const payload = JSON.parse(atob(token.split(".")[1]!));
        setAuth({ token, userId: payload.userId, role: payload.role });
    }

    function logout() {
        localStorage.removeItem("token");
        setAuth({ token: null, userId: null, role: null });
    }

    return (
        <AuthContext.Provider value={{ ...auth, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
