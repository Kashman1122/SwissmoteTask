import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Leaderboard = () => {
  const location = useLocation();
  const challenge = location.state?.challenge || {};
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/get-user-progress/");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const intervalId = setInterval(fetchLeaderboard, 10000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard for {challenge.title || "Challenge"}</h1>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Status</th>
            <th>Attempts</th>
            <th>Score</th>
            <th>Completed At</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => (
              <tr key={entry.userId}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td className={`status ${entry.status.toLowerCase()}`}>{entry.status}</td>
                <td>{entry.attempts}</td>
                <td>{entry.score}/100</td>
                <td>{entry.completed_at ? new Date(entry.completed_at).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <style jsx>{`
        .status.completed { background-color: #28a745; color: white; }
        .status.submitted { background-color: #17a2b8; color: white; }
        .status.in-progress { background-color: #ffc107; color: black; }
      `}</style>
    </div>
  );
};

export default Leaderboard;
