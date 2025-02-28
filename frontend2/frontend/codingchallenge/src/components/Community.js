import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Community.css"; // ✅ Import the CSS file

export default function CommunityPage() {
  const [username, setUsername] = useState("");
  const [challenges, setChallenges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [queries, setQueries] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
    fetchUserProgress();
  }, [selectedCategory]);

  const fetchChallenges = async () => {
    try {
      const url =
        selectedCategory === "All"
          ? "http://127.0.0.1:8000/challenge/"
          : `http://127.0.0.1:8000/challenge/?category=${selectedCategory}`;
      const response = await fetch(url);
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/get-user-progress/");
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  const handleLeaderboardClick = (challenge) => {
    navigate("/leaderboard", { state: { challenge } });
  };

  const handleCodeClick = (challenge) => {
    localStorage.setItem("currentChallenge", JSON.stringify(challenge));
    window.location.href = `/editor?challengeId=${challenge.id}`;
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setQueries([
        ...queries, 
        { 
          text: query, 
          user: username || "Coder", 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setQuery("");
    }
  };

  return (
    <div className="community-container">
      <div className="event-slider">
        {[
          { title: "Hackathon 2024 🚀", desc: "Join the biggest online coding challenge!", color: "#007bff" },
          { title: "AI Bootcamp 🎓", desc: "Master AI & ML with industry experts.", color: "#ff007b" },
          { title: "JS Challenge ⚡", desc: "Improve your JavaScript skills!", color: "#ffaa00" }
        ].map((event, index) => (
          <div className="event" key={index} style={{ background: event.color }}>
            <h2>{event.title}</h2>
            <p>{event.desc}</p>
            <button className="join-btn">Join Now</button>
          </div>
        ))}
      </div>

      <h1 className="welcome-text">Welcome, {username || "Coder"}! 🎯</h1>

      <div className="user-stats-section">
        <h2>Top Performers</h2>
        <div className="bar-chart-container">
          {userStats.map((user, index) => (
            <div className="bar-chart-item" key={index}>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ height: "20px", width: `${(user.questions / 105) * 100}%` }}
                >
                  {user.questions}
                </div>
              </div>
              <div className="user-name">{user.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="query-section">
        <form onSubmit={handleQuerySubmit} className="query-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your coding question..."
            className="query-input"
          />
          <button type="submit" className="query-btn">Ask Query</button>
        </form>
        
        {queries.length > 0 && (
          <div className="queries-container">
            <h3>Recent Queries</h3>
            {queries.map((q, index) => (
              <div className="query-item" key={index}>
                <div className="query-header">
                  <span className="query-label">Query</span>
                  <span className="user-name-badge">{q.user}</span>
                </div>
                <p className="query-text">{q.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="category-buttons">
        {["All", "C++", "Python", "JavaScript", "Java", "R", "Machine Learning"].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "active" : ""}
          >
            {category}
          </button>
        ))}
      </div>

      <h2 className="selected-category">Selected: {selectedCategory}</h2>

      <div className="challenges-grid">
        {challenges.length === 0 ? (
          <p className="no-challenges">No challenges available.</p>
        ) : (
          challenges.map((challenge) => (
            <div key={challenge.id} className="challenge-card">
              <div className="challenge-text">
                <h1>{challenge.title}</h1>
                <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
                <p><strong>Category:</strong> {challenge.category}</p>
              </div>
              <div className="button-group">
                <button className="code-btn" onClick={() => handleCodeClick(challenge)}>Code</button>
                <button className="leaderboard-btn" onClick={() => handleLeaderboardClick(challenge)}>Leaderboard</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
