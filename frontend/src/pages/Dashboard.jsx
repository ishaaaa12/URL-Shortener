import { useEffect, useState } from "react";

import api from "../services/api";

import StatsCard from "../components/StatsCard";
import UrlTable from "../components/UrlTable";
import TopUrls from "../components/TopUrls";

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [urls, setUrls] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [topUrls, setTopUrls] = useState([]);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    loadData();
  }, [page, search, sort]);

  async function loadData() {
    try {
      const overviewRes = await api.get("/dashboard/overview");
      const urlsRes = await api.get(
        `/dashboard/urls?page=${page}&search=${search}&sort=${sort}`,
      );
      const topUrlsRes = await api.get("/dashboard/top-urls");

      setTopUrls(topUrlsRes.data);
      setOverview(overviewRes.data);
      setUrls(urlsRes.data.urls);
      setTotalPages(urlsRes.data.totalPages);

      console.log("urls response:", urlsRes.data);
      console.log("urls array:", urlsRes.data.urls);
    } catch (err) {
      console.error(err);
    }
  }

  if (!overview) return <h2>Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-100 text-black p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      <input
        type="text"
        placeholder="Search Short ID..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="border p-2 rounded mb-4 w-full"
      />

      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total URLs" value={overview.totalUrls} />
        <StatsCard title="Total Clicks" value={overview.totalClicks} />
        <StatsCard title="Visitors" value={overview.totalUniqueVisitors} />
      </div>

      <TopUrls urls={topUrls} />

      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          setPage(1);
        }}
        className="border rounded p-2"
      >
        <option value="newest">Newest</option>

        <option value="oldest">Oldest</option>

        <option value="clicks">Most Clicked</option>
      </select>
      <UrlTable urls={urls} />
      <div className="flex gap-4 mt-6">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
