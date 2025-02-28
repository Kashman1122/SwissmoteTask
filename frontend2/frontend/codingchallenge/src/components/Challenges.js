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

      <style jsx>{`

      h1, p {
  text-align: left;
}

     
        .container {
          background-color: rgb(5, 5, 5);
          color: white;
          padding: 20px;
        }
        .selected-category {
          text-align: center;
          font-size: 14px;
          color: white;
          margin-top: 5px;
          margin-bottom: 5px;
        }
        .challenge-box {
          width: 90%;
          border: 1px solid rgb(188, 188, 188);
          background-color: rgba(63, 63, 63, 0.54);
          color: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .challenge-content {
          display: flex;
          width: 100%;
          align-items: center;
        }
        

        .button-group {
          display: flex;
          gap: 10px;
          margin-left: auto;
        }
        .category-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .category-buttons button {
          background-color: #444;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        .category-buttons .active {
          background-color: #007BFF;
        }
        .category-buttons button:hover {
          background-color: #555;
        }
        .challenges-list {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
          overflow-y: auto;
          max-height: 600px;
          scrollbar-width: none;
        }
        .challenges-list::-webkit-scrollbar {
          display: none;
        }
        .code-btn, .leaderboard-btn {
          background-color: rgb(29, 29, 30);
          color: white;
          padding: 8px 16px;
          border: 1px solid #ccc;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        .leaderboard-btn {
          background-color: rgb(105, 7, 218);
        }
        .code-btn:hover {
          background-color: #0056b3;
        }
        .leaderboard-btn:hover {
          background-color: #218838;
        }
      `}</style>
    </div>
  );
}
