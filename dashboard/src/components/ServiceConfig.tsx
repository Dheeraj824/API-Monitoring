import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Save } from "lucide-react";
import { getServiceMetadata, updateRateLimit } from "@/lib/api";

interface ServiceConfigProps {
    serviceName: string;
}

export function ServiceConfig({ serviceName }: ServiceConfigProps) {
    const [rateLimit, setRateLimit] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!serviceName) return;

        setLoading(true);
        getServiceMetadata(serviceName)
            .then(res => {
                setRateLimit(res.data.rateLimit);
                setMessage(null);
            })
            .catch(err => {
                console.error("Failed to load service metadata", err);
            })
            .finally(() => setLoading(false));
    }, [serviceName]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateRateLimit(serviceName, rateLimit);
            setMessage("Rate limit updated successfully");
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error(err);
            setMessage("Failed to update rate limit");
        } finally {
            setSaving(false);
        }
    };

    if (!serviceName) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Service Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Select a service to configure its rate limits.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuration: {serviceName}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Rate Limit (requests per minute)
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            value={rateLimit}
                            onChange={(e) => setRateLimit(Number(e.target.value))}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 bg-black text-white hover:bg-gray-800"
                        >
                            {saving ? (
                                <span className="animate-spin mr-2">⟳</span>
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save
                        </button>
                    </div>
                </div>

                {message && (
                    <p className={`text-sm ${message.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
                        {message}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
