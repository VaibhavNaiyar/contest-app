"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth";
import { apiGet } from "../../../lib/api";
import { CountdownTimer } from "../../../components/CountdownTimer";

type Challenge = {
    id: string;
    title: string;
    maxPoints: number;
};

type Contest = {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    contestToChallengeMapping: { index: number; challenge: Challenge }[];
};

export default function ContestPage() {
    const { contestId } = useParams<{ contestId: string }>();
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const [contest, setContest] = useState<Contest | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!isLoading && !token) router.replace("/login");
    }, [token, isLoading]);

    useEffect(() => {
        if (!token || !contestId) return;
        apiGet(`/contest/${contestId}`, token)
            .then((d) => {
                setContest(d.contest ?? null);
                setFetching(false);
            });
    }, [token, contestId]);

    if (isLoading || !token) return null;

    const now = Date.now();
    const isActive = contest
        ? new Date(contest.startTime).getTime() <= now && new Date(contest.endTime).getTime() >= now
        : false;
    const hasStarted = contest ? new Date(contest.startTime).getTime() <= now : false;

    return (
        <div className="container">
            <div className="page-header">
                <Link href="/" className="back-link">← Back to contests</Link>

                {fetching || !contest ? (
                    <p className="empty">Loading...</p>
                ) : (
                    <>
                        <h1 className="page-title">{contest.title}</h1>
                        <div className="info-row">
                            <div className="info-item">
                                <span className="info-label">Start</span>
                                <span className="info-value">
                                    {new Date(contest.startTime).toLocaleString()}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">End</span>
                                <span className="info-value">
                                    {new Date(contest.endTime).toLocaleString()}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Status</span>
                                <span className="info-value">
                                    {!hasStarted ? (
                                        <CountdownTimer target={contest.startTime} label="Starts in" />
                                    ) : isActive ? (
                                        <CountdownTimer target={contest.endTime} label="Ends in" />
                                    ) : (
                                        "Finished"
                                    )}
                                </span>
                            </div>
                        </div>

                        <hr className="divider" />

                        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                            Challenges
                        </h2>

                        {contest.contestToChallengeMapping.length === 0 ? (
                            <p className="empty">No challenges yet.</p>
                        ) : (
                            contest.contestToChallengeMapping.map(({ index, challenge }) => (
                                <Link
                                    key={challenge.id}
                                    href={`/contest/${contestId}/${challenge.id}`}
                                    className="challenge-row"
                                >
                                    <span className="challenge-index">{index + 1}.</span>
                                    <span className="challenge-title">{challenge.title}</span>
                                    <span className="challenge-points">{challenge.maxPoints} pts</span>
                                </Link>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
