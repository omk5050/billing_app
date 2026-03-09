const API_BASE = ""

function getToken() {
    return localStorage.getItem("token")
}

async function apiRequest(endpoint, options = {}) {

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
        ...options.headers
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "API Error")
    }

    return res.json()
}