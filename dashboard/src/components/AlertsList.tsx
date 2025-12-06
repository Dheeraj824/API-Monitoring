import { AlertCircle, Check } from "lucide-react";
import api from "@/lib/api";
import { useState } from "react";

interface Alert {
    id: string;
    serviceName: string;
    type: string;
    message: string;
    timestamp: string;
    resolved: boolean;
}

interface AlertsListProps {
    alerts: Alert[];
    onResolve: () => void;
}

export function AlertsList({ alerts, onResolve }: AlertsListProps) {
    const [resolving, setResolving] = useState<string | null>(null);

    const handleResolve = async (id: string) => {
        setResolving(id);
        try {
            await api.post(`/alerts/${id}/resolve`, null, {
                params: { resolvedBy: 'admin' }
            });
            onResolve();
        } catch (error) {
            console.error("Failed to resolve alert", error);
        } finally {
            setResolving(null);
        }
    };

    const activeAlerts = alerts.filter(a => !a.resolved);

    return (
        <div className="space-y-4">
            {activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border rounded-md border-dashed">
                    <Check className="h-8 w-8 mb-2 text-green-500" />
                    <p>No active alerts</p>
                </div>
            ) : (
                activeAlerts.map((alert) => (
                    <div
                        key={alert.id}
                        className="flex items-start space-x-4 rounded-md border p-4 shadow-sm bg-red-50 dark:bg-red-900/20"
                    >
                        <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {alert.type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()} • {alert.serviceName}
                            </p>
                        </div>
                        <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={resolving === alert.id}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                        >
                            {resolving === alert.id ? "Resolving..." : "Resolve"}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
