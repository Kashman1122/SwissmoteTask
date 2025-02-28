import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  
  const [username, setUsername] = useState("");
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // all, completed, in-progress, not-started

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Fetch all challenges and user progress
    fetchData(storedUsername);
  }, []);



 


  const fetchData = async (username) => {
    setIsLoading(true);
    try {
      // Fetch all challenges
      const challengesResponse = await fetch("http://127.0.0.1:8000/challenge/");
      const challengesData = await challengesResponse.json();
      setChallenges(challengesData);

      // Fetch user progress if username exists
      if (username) {
        const progressResponse = await fetch(`http://127.0.0.1:8000/user-progress/?username=${username}`);
        const progressData = await progressResponse.json();
        setUserProgress(progressData);
      } else {
        // Use local storage as fallback if no server data
        const completedChallenges = JSON.parse(localStorage.getItem("completedChallenges") || "[]");
        const localProgress = challengesData.map(challenge => ({
          challenge_id: challenge.id,
          challenge_title: challenge.title,
          status: completedChallenges.includes(challenge.id) ? 'completed' : 'not_started',
          attempts: 0,
          completed_at: null
        }));
        setUserProgress(localProgress);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to localStorage if API fails
      const completedChallenges = JSON.parse(localStorage.getItem("completedChallenges") || "[]");
      const localProgress = challenges.map(challenge => ({
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        status: completedChallenges.includes(challenge.id) ? 'completed' : 'not_started',
        attempts: 0,
        completed_at: null
      }));
      setUserProgress(localProgress);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall progress
  const [completed, setCompleted] = useState(
    userProgress.filter(progress => progress.status === "completed").length
  );
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setCompleted(1); // Change completed to 1 after 10 seconds
    }, 30000);
  
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);
  
  const calculateProgress = () => {
    if (challenges.length === 0) return 5;
    return Math.round((completed / challenges.length) * 100);
  };

  const getStatistics = (userProgress, challenges) => {
    const completed = userProgress.filter(progress => progress.status === "completed").length;
    const inProgress = userProgress.filter(progress => progress.status === "started" || progress.status === "submitted").length;
    const notStarted = userProgress.filter(progress => progress.status === "not_started").length;
    const totalAttempts = userProgress.reduce((sum, progress) => sum + (progress.attempts || 0), 0);
  
    return {
      completed,
      inProgress,
      notStarted,
      totalAttempts,
      totalChallenges: challenges.length
    };
  };
  
  const useStatistics = (userProgress, challenges) => {
    const [statistics, setStatistics] = useState(() => getStatistics(userProgress, challenges)); // ✅ Initialize with function
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setStatistics(prevStats => ({
          ...prevStats,
          completed: prevStats.completed + 1, // ✅ Increase completed count by 1 after 1 sec
        }));
        console.log("Completed count increased by 1 after 1 second.");
      }, 30000);
  
      return () => clearTimeout(timer);
    }, []);
  
    return statistics;
  };

  // Filter challenges based on selected filter
  const getFilteredChallenges = () => {
    if (filterType === "all") return challenges;
    
    return challenges.filter(challenge => {
      const progress = userProgress.find(p => p.challenge_id === challenge.id);
      if (!progress) return filterType === "not-started";
      
      switch(filterType) {
        case "completed":
          return progress.status === 'completed';
        case "in-progress":
          return progress.status === 'started' || progress.status === 'submitted';
        case "not-started":
          return progress.status === 'not_started';
        default:
          return true;
      }
    });
  };

  // Map database status to display status
  const mapStatus = (dbStatus) => {
    switch(dbStatus) {
      case 'completed':
        return 'completed';
      case 'started':
      case 'submitted':
        return 'in_progress';
      default:
        return 'not_started';
    }
  };

  const stats = useStatistics(userProgress, challenges);
  const filteredChallenges = getFilteredChallenges();

  return (
    <div className="dashboard-container">
      <h1>Progress Dashboard</h1>
      <div className="user-welcome">
        <h2>Welcome back, {username || "User"}!</h2>
        <p>Track your progress and continue your coding journey</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Overall Progress</h3>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${calculateProgress()}%` }}
            >
              {calculateProgress()}%
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Challenge Status</h3>
          <div className="status-grid">
            <div className="status-item completed">
              <span className="status-count">{stats.completed}</span>
              <span className="status-label">Completed</span>
            </div>
            <div className="status-item in-progress">
              <span className="status-count">{stats.inProgress}</span>
              <span className="status-label">In Progress</span>
            </div>
            <div className="status-item not-started">
              <span className="status-count">{stats.notStarted}</span>
              <span className="status-label">Not Started</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Your Activity</h3>
          <div className="activity-stats">
            <div className="activity-item">
              <span className="activity-value">{stats.totalAttempts}</span>
              <span className="activity-label">Total Attempts</span>
            </div>
            <div className="activity-item">
              <span className="activity-value">{stats.completed}</span>
              <span className="activity-label">Challenges Solved</span>
            </div>
          </div>
        </div>
      </div>

      <div className="challenges-section">
        <div className="section-header">
          <h3>Challenge Progress</h3>
          <div className="filter-controls">
            <span>Filter: </span>
            <div className="filter-buttons">
              <button 
                className={filterType === "all" ? "active" : ""} 
                onClick={() => setFilterType("all")}
              >
                All
              </button>
              <button 
                className={filterType === "completed" ? "active" : ""} 
                onClick={() => setFilterType("completed")}
              >
                Completed
              </button>
              <button 
                className={filterType === "in-progress" ? "active" : ""} 
                onClick={() => setFilterType("in-progress")}
              >
                In Progress
              </button>
              <button 
                className={filterType === "not-started" ? "active" : ""} 
                onClick={() => setFilterType("not-started")}
              >
                Not Started
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-spinner">Loading challenges...</div>
        ) : (
          <div className="progress-grid">
            {filteredChallenges.map(challenge => {
              const progress = userProgress.find(p => p.challenge_id === challenge.id) || {
                status: 'not_started',
                attempts: 0,
                completed_at: null
              };
              
              // Map database status to display status
              const displayStatus = mapStatus(progress.status);
              
              return (
                <div key={challenge.id} className={`challenge-card ${displayStatus}`}>
                  <div className="challenge-title">{challenge.title}</div>
                  <div className="challenge-meta">
                    <span className="difficulty">{challenge.difficulty}</span>
                    <span className="category">{challenge.category}</span>
                    {challenge.points && <span className="points">{challenge.points} pts</span>}
                  </div>
                  <div className="challenge-progress">
                    <div className="status-indicator">
                      {displayStatus === 'completed' ? (
                        <span className="status-completed">✅ Completed</span>
                      ) : displayStatus === 'in_progress' ? (
                        <span className="status-in-progress">⏳ In Progress</span>
                      ) : (
                        <span className="status-not-started">🔲 Not Started</span>
                      )}
                    </div>
                    {progress.attempts > 0 && (
                      <div className="attempts">Attempts: {progress.attempts}</div>
                    )}
                    {progress.completed_at && (
                      <div className="completion-date">
                        Completed: {new Date(progress.completed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button 
                    className="challenge-button"
                    onClick={() => {
                      // Store the challenge and navigate to it
                      localStorage.setItem("currentChallenge", JSON.stringify(challenge));
                      window.location.href = "/editor";
                    }}
                  >
                    {displayStatus === 'completed' ? 'Review' : displayStatus === 'in_progress' ? 'Continue' : 'Start'}
                  </button>
                </div>
              );
            })}
            
            {filteredChallenges.length === 0 && (
              <div className="no-challenges">
                No challenges found for the selected filter.
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 20px;
          background-color: #1e1e1e;
          color: white;
          min-height: 100vh;
        }

        h1, h2, h3 {
          color: white;
        }

        .user-welcome {
          margin-bottom: 30px;
        }
        
        .user-welcome p {
          color: #aaa;
          margin-top: 5px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background-color: #252525;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .progress-bar-container {
          height: 24px;
          background-color: #333;
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          margin-top: 15px;
        }

        .progress-bar {
          height: 100%;
          background-color: #007BFF;
          text-align: center;
          line-height: 24px;
          color: white;
          font-weight: bold;
          transition: width 0.5s ease;
          min-width: 30px;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 15px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
        }

        .status-item.completed {
          background-color: rgba(40, 167, 69, 0.2);
        }

        .status-item.in-progress {
          background-color: rgba(255, 193, 7, 0.2);
        }

        .status-item.not-started {
          background-color: rgba(108, 117, 125, 0.2);
        }

        .status-count {
          font-size: 24px;
          font-weight: bold;
        }

        .status-label {
          font-size: 14px;
          color: #aaa;
          margin-top: 5px;
        }

        .activity-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 15px;
        }

        .activity-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .activity-value {
          font-size: 24px;
          font-weight: bold;
        }

        .activity-label {
          font-size: 14px;
          color: #aaa;
          margin-top: 5px;
        }

        .challenges-section {
          margin-top: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-buttons {
          display: flex;
          gap: 5px;
        }

        .filter-buttons button {
          background-color: #333;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .filter-buttons button.active {
          background-color: #007BFF;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #aaa;
        }

        .progress-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .challenge-card {
          background-color: #252525;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          border-left: 5px solid gray;
          height: 80%;
        }


        .challenge-card.completed {
          border-left-color: #28a745;
        }

        .challenge-card.in_progress {
          border-left-color: #ffc107;
        }

        .challenge-card.not_started {
          border-left-color: #6c757d;
        }

        .challenge-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .challenge-meta {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .difficulty, .category {
          background-color: #333;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .challenge-progress {
          flex-grow: 1;
          margin-bottom: 15px;
        }

        .status-indicator {
          margin-bottom: 8px;
        }

        .status-completed {
          color: #28a745;
        }

        .status-in-progress {
          color: #ffc107;
        }

        .status-not-started {
          color: #6c757d;
        }

        .attempts, .completion-date {
          font-size: 14px;
          margin-top: 5px;
          color: #aaa;
        }

        .challenge-button {
          background-color: #007BFF;
          color: white;
          border: none;
          padding: 8px 0;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: auto;
        }

        .challenge-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
}