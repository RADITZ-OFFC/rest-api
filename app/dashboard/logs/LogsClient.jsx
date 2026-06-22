"use client";

import { useState } from "react";
import { Search, FileText, ChevronDown } from "lucide-react";
import EmptyState from "@/components/EmptyState";

function StatusBadge({ code }) {
  if (!code) return <span className="text-text-faint text-xs">—</span>;
  if (code < 300) return <span className="badge-active text-xs">{code}</span>;
  if (code < 400) return <span className="badge-pending text-xs">{code}</span>;
  return <span className="badge-inactive text-xs">{code}</span>;
}

export default function LogsClient({ keys }) {
  const [selectedKey,   setSelectedKey]   = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [endpoint,      setEndpoint]      = useState("");
  const [logs,          setLogs]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [searched,      setSearched]      = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!selectedKey) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ keyId: selectedKey });
      if (statusFilter) params.set("status", statusFilter);
      if (endpoint)     params.set("endpoint", endpoint);
      const res  = await fetch(`/api/logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filter form */}
      <div className="card">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Filter logs</h2>
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">API Key *</label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="select"
              >
                <option value="">Select a key...</option>
                {keys.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name || k.products?.name || "Unnamed"} — {k.key.substring(0, 10)}...
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select"
              >
                <option value="">All status</option>
                <option value="success">Success (2xx)</option>
                <option value="error">Error (4xx/5xx)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Endpoint path</label>
              <input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/api/weather..."
                className="input"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={!selectedKey || loading}
              className="btn-primary text-sm disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                <><Search size={14} /> Search logs</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {!searched ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="Select an API key"
            description="Choose a key above to view its request logs."
          />
        </div>
      ) : loading ? (
        <div className="card flex items-center justify-center py-12">
          <span className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="No logs found"
            description="No requests match your filter criteria."
          />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">Results</p>
            <span className="badge-muted text-xs">{logs.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>IP Address</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <code className="font-mono text-xs text-text-muted">
                        {log.endpoint || "/api/..."}
                      </code>
                    </td>
                    <td><StatusBadge code={log.status_code} /></td>
                    <td className="font-mono text-xs text-text-faint">{log.ip_address || "—"}</td>
                    <td className="text-xs text-text-faint">
                      {new Date(log.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
