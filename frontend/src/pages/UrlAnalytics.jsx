import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import api from "../services/api";

function UrlAnalytics() {
  const { shortId } = useParams();

  const [analytics, setAnalytics] = useState(null);
  const [daily, setDaily] = useState([]);
  const [referrers, setReferrers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const res = await api.get(`/analytics/${shortId}`);
    const dailyRes = await api.get(`/analytics/${shortId}/daily`);
    const referrerRes = await api.get(`/analytics/${shortId}/referrers`);
    const recentRes = await api.get(`/analytics/${shortId}/recent`);

    setReferrers(referrerRes.data);
    setRecentActivity(recentRes.data);
    setDaily(dailyRes.data);
    setAnalytics(res.data);
  }

  if (!analytics) return <h2>Loading...</h2>;

  const hasAnalytics = analytics.totalClicks > 0;

  if (!hasAnalytics) {
    return (
      <div className="min-h-screen bg-gray-100 text-black p-8">
        <h1 className="text-3xl font-bold mb-8">Analytics: {shortId}</h1>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📊</div>

          <h2 className="text-2xl font-bold mb-2">No analytics data yet</h2>

          <p className="text-gray-600">
            This URL hasn't received any clicks. Share it to start collecting
            analytics.
          </p>
        </div>
      </div>
    );
  }

  const countryData = analytics.countries.map((c) => ({
    name: c._id,
    value: c.count,
  }));

  const browserData = analytics.browsers.map((b) => ({
    name: b._id,
    value: b.count,
  }));

  const deviceData = analytics.devices.map((d) => ({
    name: d._id,
    value: d.count,
  }));
  return (
    <div className="min-h-screen bg-gray-100 text-black p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics: {shortId}</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white text-black p-6 rounded shadow">
          <h3>Total Clicks</h3>

          <p className="text-3xl font-bold">{analytics.totalClicks}</p>
        </div>

        <div className="bg-white text-black p-6 rounded shadow">
          <h3>Unique Visitors</h3>

          <p className="text-3xl font-bold">{analytics.uniqueVisitors}</p>
        </div>
      </div>

      <div className="bg-white text-black p-6 rounded shadow mt-8">
        <h2 className="mb-4">Countries</h2>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={countryData}
              dataKey="value"
              nameKey="name"
              cx="35%"
              cy="50%"
              outerRadius={100}
            />

            <Tooltip />

            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white text-black p-6 rounded shadow mt-8">
        <h2 className="mb-4">Browsers</h2>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={browserData}
              dataKey="value"
              nameKey="name"
              cx="35%"
              cy="50%"
              outerRadius={100}
            />

            <Tooltip />

            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white text-black p-6 rounded shadow mt-8">
        <h2 className="mb-4">Devices</h2>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={deviceData}
              dataKey="value"
              nameKey="name"
              cx="35%"
              cy="50%"
              outerRadius={100}
            />

            <Tooltip />

            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white text-black p-6 rounded shadow mt-8">
        <h2>Clicks Over Time</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={daily}>
            <XAxis dataKey="_id" />

            <YAxis />

            <Tooltip />

            <Line type="monotone" dataKey="clicks" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white text-black p-6 rounded shadow mt-8">
        <h2 className="text-xl font-bold mb-4">Top Referrers</h2>

        {referrers.map((item) => (
          <div key={item._id} className="flex justify-between py-2">
            <span>{item._id}</span>

            <span>{item.count}</span>
          </div>
        ))}
      </div>

      <div className="bg-white text-black p-6 rounded shadow mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

        {recentActivity.map((item) => (
          <div key={item._id} className="border-b py-2">
            <p>
              {item.country}
              {" • "}
              {item.browser}
              {" • "}
              {item.device}
            </p>

            <small>{new Date(item.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UrlAnalytics;
