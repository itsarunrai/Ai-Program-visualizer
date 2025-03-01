import React from 'react';
import './Navbar.css'; // Make sure this path is correct based on your project structure

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="project-name">
          <span className="ai-red">AI</span> Based Program Visualizer
        </h1>
      </div>
      <div className="navbar-right">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="http://localhost:3000/AlgorithmVisualizer" target="_blank" rel="noopener noreferrer">Visualizers</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
