"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../lib/auth";
import { apiGet } from "../../../../lib/api";
import { NotionRenderer } from "../../../../components/NotionRenderer";

type Challenge = {
    id: string;
    title: string;
    maxPoints: number;
    content: any[];
};

export default function ChallengePage() {
    const { contestId, challengeId } = useParams<{ contestId: string; challengeId: string }>();
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!isLoading && !token) router.replace("/login");
    }, [token, isLoading]);

    useEffect(() => {
        if (!token || !contestId || !challengeId) return;
        apiGet(`/contest/${contestId}/${challengeId}`, token)
            .then((d) => {
                setChallenge(d.challenge ?? null);
                setFetching(false);
            });
    }, [token, contestId, challengeId]);

    if (isLoading || !token) return null;

    return (
        <div className="container">
            <div className="page-header">
                <Link href={`/contest/${contestId}`} className="back-link">
                    ← Back to contest
                </Link>

                {fetching || !challenge ? (
                    <p className="empty">Loading...</p>
                ) : (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <h1 className="page-title">{challenge.title}</h1>
                            <span className="badge badge-active" style={{ marginTop: 6 }}>
                                {challenge.maxPoints} pts
                            </span>
                        </div>

                        <hr className="divider" />

                        <NotionRenderer blocks={challenge.content} />

                        <hr className="divider" />

                        <button
                            className="btn btn-primary"
                            onClick={() => router.push(`/contest/${contestId}/${challengeId}/submit`)}
                        >
                            Submit solution →
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
