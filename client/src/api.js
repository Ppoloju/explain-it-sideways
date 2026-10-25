export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function explainTopic(payload, signal) {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  const data = await res.json().catch(() => ({
    success: false,
    error: 'Invalid response from server.',
  }));

  if (!res.ok && !data.error) {
    data.error = 'Request failed.';
    data.success = false;
  }

  return { ok: res.ok, status: res.status, data };
}
