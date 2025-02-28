import React, { useState } from "react";
import "./Navbar.css"; // Importing CSS for styling

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">MyLogo</div>

      {/* Hamburger Menu Button */}
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><a href="http://localhost:3000/">Home</a></li>
        <li><a href="http://localhost:3000/challenges/">Challenges</a></li>
        <li><a href="http://localhost:3000/community/">Community</a></li>
        <li><a href="http://localhost:3000/register/">Register</a></li>
        <li><a href="http://localhost:3000/dashboard/">Dashboard</a></li>

      </ul>
    </nav>
  );
};

export default Navbar;
