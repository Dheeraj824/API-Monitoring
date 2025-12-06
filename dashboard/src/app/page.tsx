"use client";

import { useEffect, useState } from "react";
import api, { getLogs, getServices } from "@/lib/api";
import { StatsCards } from "@/components/StatsCards";
import { RecentLogsTable } from "@/components/RecentLogsTable";
import { AlertsList } from "@/components/AlertsList";
import { ServiceConfig } from "@/components/ServiceConfig";
import { LatencyChart } from "@/components/LatencyChart";
import { RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";


export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    slowApis: 0,
    brokenApis: 0,
    rateLimitHits: 0,
    activeAlerts: 0
  });
  const [logs, setLogs] = useState([]);
  const [services, setServices] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchServices = async () => {
    try {
      const res = await getServices();
      setServices(res.data);
    } catch (error) {
      console.error("Failed to fetch services", error);
    }
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, alertsRes] = await Promise.all([
        api.get('/stats'),
        getLogs(page, 20, selectedService || undefined),
        api.get('/alerts')
      ]);

      setStats(statsRes.data);
      // logsRes.data is now a Page object
      setLogs(logsRes.data.content);
      setTotalPages(logsRes.data.totalPages);
      setAlerts(alertsRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, [page, selectedService]); // Re-fetch when page or service changes

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground mr-2">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
          </span>
          <select
            className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setPage(0); // Reset to page 0 on filter change
            }}
          >
            <option value="">All Services</option>
            {services.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Latency Trend</h3>
          </div>
          <div className="p-6 pt-0 pl-2">
            <LatencyChart data={logs} />
          </div>
        </div>
        <div className="col-span-3 flex flex-col gap-4">
          <ServiceConfig serviceName={selectedService} />
          <div className="rounded-xl border bg-card text-card-foreground shadow flex-1">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Active Alerts</h3>
            </div>
            <div className="p-6 pt-0">
              <AlertsList alerts={alerts} onResolve={fetchData} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">Recent Logs</h3>
        </div>
        <div className="p-6 pt-0 space-y-4">
          <RecentLogsTable logs={logs} />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
