import React, { useState } from "react";
import logo from "../assets/logo.png";
import "../styles/Navbar.css"; 
import { useNavigate } from "react-router-dom"; 

const Navbar = ({ onSignOut }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate(); 

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleHomeClick = () => {
    navigate("/home"); 
  };

  const handleSignOutClick = () => {
    localStorage.removeItem("token"); 
    const rememberMeValue = localStorage.getItem("RememberMe");
    if (rememberMeValue) {
      localStorage.removeItem("RememberMe");
    }
    navigate("/"); 
  };

  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="logo" />
      <h1 className="navbar-title">Document Editor</h1>
      <div className="dropdown">
        <button onClick={toggleDropdown} className="dropdown-toggle">
          Menu
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleHomeClick} className="dropdown-item">
              Home
            </button>
            <button onClick={handleSignOutClick} className="dropdown-item">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
