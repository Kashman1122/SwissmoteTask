import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Challenges() {
  const [username, setUsername] = useState("");
  const [challenges, setChallenges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [selectedCategory]); // Refetch when category changes

  // Fetch challenges from the API with category filter
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

  const handleLeaderboardClick = (challenge) => {
    navigate("/leaderboard", { state: { challenge } });
  };

  const handleCodeClick = (challenge) => {
    localStorage.setItem("currentChallenge", JSON.stringify(challenge));
    window.location.href = `/editor?challengeId=${challenge.id}`;
  };

  return (
    <div className="container">
      <h1>Challenges for you, {username || "User"}!</h1>

      {/* Category Filter Buttons */}
      <div className="category-buttons">
        {["All", "c++", "python", "JavaScript", "Java", "R", "Machine Learning"].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "active" : ""}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Display Selected Category */}
      <h2 className="selected-category">Selected Category: {selectedCategory}</h2>

      {/* Challenges List */}
<div className="challenges-list">
  {challenges.length === 0 ? (
    <p>No challenges available for this category.</p>
  ) : (
    challenges
      .filter((challenge) => selectedCategory === "All" || challenge.category === selectedCategory)
      .map((challenge) => (
        <div key={challenge.id} className="challenge-box">
          <div className="challenge-content">
            <div className="challenge-text">
              <h1>{challenge.title}</h1>
              <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
              <p><strong>Category:</strong> {challenge.category}</p>
            </div>
            <div className="button-group">
              <button className="code-btn" onClick={() => handleCodeClick(challenge)}>
                Code
              </button>
              <button className="leaderboard-btn" onClick={() => handleLeaderboardClick(challenge)}>
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      ))
  )}
</div>

    </div>
  );
}
