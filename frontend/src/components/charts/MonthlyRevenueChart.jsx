import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyRevenueChart = ({ data }) => {

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Monthly Revenue (MAD)",
        data: data.values,
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.2)",
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Last 6 Months Revenue"
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

export default MonthlyRevenueChart;