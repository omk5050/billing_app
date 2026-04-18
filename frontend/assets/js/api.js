/*
 * API_BASE auto-detects the environment:
 *  - On Render (or any deployed host): same-origin, so empty string → relative URLs
 *  - On localhost: point to the backend dev server on port 5000
 */
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? `http://localhost:5000`
  : "";

/*
Token helpers
*/

function getAccessToken() {
  return localStorage.getItem("accessToken")
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken")
}

function setTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken)
  localStorage.setItem("refreshToken", refreshToken)
}

function clearTokens() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}


/*
Login
*/

async function login(email, password) {

  const res = await fetch(API_BASE + "/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "Login failed")
  }

  setTokens(data.accessToken, data.refreshToken)

  return data
}


/*
Refresh Access Token
*/

async function refreshAccessToken() {

  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error("No refresh token")
  }

  const res = await fetch(API_BASE + "/api/auth/refresh-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken })
  })

  const data = await res.json()

  if (!res.ok) {
    clearTokens()
    window.location.href = "login.html"
    throw new Error("Session expired")
  }

  localStorage.setItem("accessToken", data.accessToken)

  return data.accessToken
}


/*
Authenticated API Request
*/

async function apiRequest(endpoint, options = {}) {

  let accessToken = getAccessToken()

  let res = await fetch(API_BASE + endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + accessToken,
      ...(options.headers || {})
    }
  })

  /*
  Token expired → refresh
  */

  if (res.status === 401) {

    accessToken = await refreshAccessToken()

    res = await fetch(API_BASE + endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken,
        ...(options.headers || {})
      }
    })

  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "API request failed")
  }

  return data
}


/*
Logout
*/

function logout() {
  clearTokens()
  window.location.href = "login.html"
}