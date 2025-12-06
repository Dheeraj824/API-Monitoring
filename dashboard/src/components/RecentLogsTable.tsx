import { format } from "date-fns";

interface ApiLog {
    id: string;
    serviceName: string;
    endpoint: string;
    method: string;
    status: number;
    latency: number;
    timestamp: string;
    rateLimitHit: boolean;
}

interface RecentLogsTableProps {
    logs: ApiLog[];
}

export function RecentLogsTable({ logs }: RecentLogsTableProps) {
    return (
        <div className="rounded-md border">
            <div className="w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Service</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Method</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Endpoint</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Latency</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {logs.slice(0, 10).map((log) => (
                            <tr key={log.id || Math.random().toString()} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="p-4 align-middle">{log.serviceName}</td>
                                <td className="p-4 align-middle font-bold">{log.method}</td>
                                <td className="p-4 align-middle">{log.endpoint}</td>
                                <td className="p-4 align-middle">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${log.status >= 500 ? 'bg-red-100 text-red-800' :
                                            log.status >= 400 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="p-4 align-middle">
                                    <span className={log.latency > 500 ? 'text-red-600 font-bold' : ''}>
                                        {log.latency}ms
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-muted-foreground">No logs found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
