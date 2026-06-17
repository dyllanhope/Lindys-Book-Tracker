import dns from 'node:dns'

// On some dual-stack networks the first connection attempt to an external host
// resolves to an unreachable IPv6 address and hangs until the ~10s connect
// timeout — which made the first book search return nothing. Prefer IPv4.
try { dns.setDefaultResultOrder('ipv4first') } catch { /* not supported everywhere */ }

/**
 * fetch with retries on network errors / 5xx, so a transient first-hit failure
 * (cold connection, timeout) is retried within the same request instead of
 * surfacing as empty results.
 */
export async function fetchWithRetry(
  url: string,
  init: Parameters<typeof fetch>[1] = {},
  retries = 2,
): Promise<Response> {
  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init)
      if (res.status < 500) return res
      lastErr = new Error(`HTTP ${res.status}`)
    } catch (e) {
      lastErr = e
    }
    if (attempt < retries) await new Promise((r) => setTimeout(r, 250 * (attempt + 1)))
  }
  throw lastErr instanceof Error ? lastErr : new Error('fetch failed')
}
