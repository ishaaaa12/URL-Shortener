import { Link } from "react-router-dom";
import { BACKEND_URL } from "../services/api";


function UrlTable({ urls = [] }) {
   console.log("UrlTable urls:", urls);
  return (
    <div className="overflow-x-auto bg-white text-black rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-100 text-black">
          <tr>
            <th className="p-3 text-left">Short URL</th>
            <th className="p-3 text-left">Original URL</th>
            <th className="p-3 text-left">Clicks</th>
            <th className="p-3 text-left">Created</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {urls?.map((url) => (
            <tr
              key={url._id}
              className="border-t hover:bg-gray-50"
            >
              <td className="p-3">
                <a
                  href={`${BACKEND_URL}/${url.shortId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {url.shortId}
                </a>
              </td>

              <td className="p-3 max-w-md truncate">
                {url.originalUrl}
              </td>

              <td className="p-3">
                {url.clicks}
              </td>

              <td className="p-3">
                {new Date(
                  url.createdAt
                ).toLocaleDateString()}
              </td>

              <td className="p-3">
                <Link
                  to={`/dashboard/url/${url.shortId}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Analytics
                </Link>
              </td>
            </tr>
          ))}

          {urls.length === 0 && (
            <tr>
              <td
                colSpan="5"
                className="text-center p-6 text-gray-500"
              >
                No URLs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UrlTable;