"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";
import { apiGet } from "../lib/api";
import { CountdownTimer } from "../components/CountdownTimer";

type Contest = {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
};

export default function HomePage() {
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const [active, setActive] = useState<Contest[]>([]);
    const [finished, setFinished] = useState<Contest[]>([]);
    const [tab, setTab] = useState<"active" | "finished">("active");
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace("/login");
        }
    }, [token, isLoading]);

    useEffect(() => {
        if (!token) return;
        Promise.all([
            apiGet("/contest/active"),
            apiGet("/contest/finished")
        ]).then(([a, f]) => {
            setActive(a.contests ?? []);
            setFinished(f.contests ?? []);
            setFetching(false);
        });
    }, [token]);

    if (isLoading || !token) return null;

    const contests = tab === "active" ? active : finished;

    return (
        <div className="container">
            <div className="page-header">
                <h1 className="page-title">Contests</h1>
                <p className="page-subtitle">Solve dev challenges and climb the leaderboard</p>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${tab === "active" ? "active" : ""}`}
                    onClick={() => setTab("active")}
                >
                    Active
                </button>
                <button
                    className={`tab ${tab === "finished" ? "active" : ""}`}
                    onClick={() => setTab("finished")}
                >
                    Finished
                </button>
            </div>

            {fetching ? (
                <p className="empty">Loading...</p>
            ) : contests.length === 0 ? (
                <p className="empty">No {tab} contests right now.</p>
            ) : (
                contests.map((c) => (
                    <div key={c.id} className="card" onClick={() => router.push(`/contest/${c.id}`)}>
                        <div>
                            <div className="card-title">{c.title}</div>
                            <div className="card-meta">
                                {tab === "active" ? (
                                    <CountdownTimer target={c.endTime} label="Ends in" />
                                ) : (
                                    `Ended ${new Date(c.endTime).toLocaleDateString()}`
                                )}
                            </div>
                        </div>
                        <span className={`badge ${tab === "active" ? "badge-active" : "badge-finished"}`}>
                            {tab === "active" ? "Live" : "Ended"}
                        </span>
                    </div>
                ))
            )}
        </div>
    );
}
