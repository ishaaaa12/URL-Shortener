function TopUrls({ urls }) {
  return (
    <div className="bg-white text-black rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        🏆 Top URLs
      </h2>

      {urls.map((url, index) => (
        <div
          key={url._id}
          className="flex justify-between py-2 border-b"
        >
          <span>
            #{index + 1} {url.shortId}
          </span>

          <span>
            {url.clicks} clicks
          </span>
        </div>
      ))}
    </div>
  );
}

export default TopUrls;