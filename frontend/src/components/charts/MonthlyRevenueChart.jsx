import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import api from "../../api/axios";

const MonthlyRevenueChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMonthlyRevenue();
  }, []);

  const fetchMonthlyRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/dashboard/charts/monthly-revenue");
      const { labels, values } = res.data;

      const data = labels.map((label, i) => ({
        month: label,
        revenue: values[i],
      }));

      setChartData(data);
    } catch (err) {
      console.error("Error fetching monthly revenue:", err);
      setError("Impossible de charger les données du graphique.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    `${value.toLocaleString("fr-FR")} MAD`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "10px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: "#1a202c" }}>
            {label}
          </p>
          <p style={{ margin: "4px 0 0", color: "#0d9488", fontWeight: 600 }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="chart-loading">
        <div className="loading-spinner" />
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-error">
        <i className="bi bi-exclamation-triangle" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "#718096", fontSize: 12, fontWeight: 500 }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#718096", fontSize: 12, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value.toLocaleString("fr-FR")}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            paddingTop: "12px",
            fontSize: "13px",
            color: "#4a5568",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          name="CA (MAD)"
          stroke="#0d9488"
          strokeWidth={3}
          dot={{
            r: 5,
            fill: "#0d9488",
            stroke: "#fff",
            strokeWidth: 2,
          }}
          activeDot={{
            r: 7,
            fill: "#0d9488",
            stroke: "#fff",
            strokeWidth: 3,
          }}
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyRevenueChart;
