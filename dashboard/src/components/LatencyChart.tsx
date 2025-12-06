import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ApiLog {
    timestamp: string;
    latency: number;
}

interface LatencyChartProps {
    data: ApiLog[];
}

export function LatencyChart({ data }: LatencyChartProps) {
    // Process data to be suitable for chart (e.g. sort by time)
    const chartData = [...data]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(log => ({
            time: new Date(log.timestamp).toLocaleTimeString(),
            latency: log.latency
        }));

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
                <XAxis
                    dataKey="time"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}ms`}
                />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#8884d8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
