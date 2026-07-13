const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiGet(path: string, token?: string) {
    const res = await fetch(`${API_URL}${path}`, {
        headers: token ? { Authorization: token } : {}
    });
    return res.json();
}

export async function apiPost(path: string, body: unknown, token?: string) {
    const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: token } : {})
        },
        body: JSON.stringify(body)
    });
    return res.json();
}
