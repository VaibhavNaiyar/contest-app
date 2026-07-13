"use client";

import { useEffect, useState } from "react";

export function CountdownTimer({ target, label }: { target: string; label: string }) {
    const [display, setDisplay] = useState("");

    useEffect(() => {
        function tick() {
            const diff = new Date(target).getTime() - Date.now();
            if (diff <= 0) {
                setDisplay("—");
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setDisplay(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
        }
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [target]);

    return (
        <span className="countdown">
            {label}: <span className="countdown-value">{display}</span>
        </span>
    );
}
