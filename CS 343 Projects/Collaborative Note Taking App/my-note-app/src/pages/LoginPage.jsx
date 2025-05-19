import React, { useState, useEffect } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import "../styles/Login.css";
import { LOGIN_MUTATION } from "../components/mutations";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [login] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    // Check if user is already logged in
    const rememberMeValue = localStorage.getItem("RememberMe");
    if (rememberMeValue) {
      const token = localStorage.getItem("token");
      if (token) {
        navigate("/home");
      }
    }
  }, []);

  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    console.log("username:", username);
    console.log("password:", password);
    try {
      const { data } = await login({
        variables: { username, password },
      });

      if (data.login.token) {
        localStorage.removeItem("token");
        const rememberMeValue = localStorage.getItem("RememberMe");
        if (rememberMeValue) {
          localStorage.removeItem("RememberMe");
        }
        localStorage.setItem("token", data.login.token);
        setSuccess("Logged in successfully. Redirecting to dashboard...");
        if (rememberMe) {
          console.log("RememberMe checked");
          localStorage.setItem("RememberMe", "true");
        }

        setTimeout(() => {
          navigate("/home", { state: { username: data.login.user.username } });
        }, 2000);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to log in. Please check your credentials.");
    }
  };

  return (
    <div className="login-page-container">
      <Box className="login-box">
        <h2>Login</h2>
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {success && (
          <div className="alert success">
            <Alert status="success" mb={4}>
              <AlertIcon />
              {success}
            </Alert>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormControl id="username" mb={4}>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="login-input" 
            />
          </FormControl>

          <FormControl id="password" mb={6}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="login-input" 
            />
          </FormControl>

          <FormControl display="flex" alignItems="center" mb={4}>
            <Checkbox
              id="rememberMe"
              isChecked={rememberMe}
              onChange={handleCheckboxChange}
            >
              Remember Me
            </Checkbox>
          </FormControl>

          <button type="submit">Login</button>
        </form>
        <div className="login-text">
          <Text>
            Don't have an account? <Link to="/register">Register here</Link>
          </Text>
          <Text>
            <Link to="/verify-email">Reset Password?</Link>
          </Text>
        </div>
      </Box>
    </div>
  );
};

export default LoginPage;
