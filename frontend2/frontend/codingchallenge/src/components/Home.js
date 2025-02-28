import React from "react";
import "./Home.css"; // Import the CSS file

const Home = () => {
  return (
    <div className="home-container">
      {/* Title */}
      <h1 className="title">
        <span className="white-text">Your Coding</span> <span className="blue-text">Buddy</span>
      </h1>

      <button 
  className="get-started-btn" 
  onClick={() => window.location.href = "http://localhost:3000/register/"}
>
  Get Started
</button>

      {/* Code Editor Image */}
      <img
        src="https://preview.redd.it/vaylse-comeback-pc-v0-q6ekxik19uuc1.jpg?width=3072&format=pjpg&auto=webp&s=1f2efee66340177d907aec473a1a5334fa2567ae"
        alt="Code Editor"
        className="code-editor-img"
      />

      {/* Programming Languages */}
      <div className="languages">C++ | Python | Java | JavaScript</div>

      {/* Features Section */}
      <div className="features">
        <h2 className="features-title">Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>AI Code Assistance</h3>
            <p>Get instant suggestions and bug fixes.</p>
          </div>
          <div className="feature-card">
            <h3>Multi-Language Support</h3>
            <p>Supports C++, Python, Java, JavaScript, and more.</p>
          </div>
          <div className="feature-card">
            <h3>Real-Time Collaboration</h3>
            <p>Work together on code seamlessly.</p>
          </div>
          <div className="feature-card">
            <h3>Cloud-Based Compiler</h3>
            <p>Run code online without installations.</p>
          </div>
          <div className="feature-card">
            <h3>Community Support</h3>
            <p>Collaborate and Contribute in Community</p>
          </div>
          <div className="feature-card">
            <h3>Telegram BOT</h3>
            <p>Collaborate and Contribute in Community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
