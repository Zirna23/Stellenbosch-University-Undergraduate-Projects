import { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { RESET_PASSWORD_MUTATION } from "../components/mutations";

const ContactForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const resetToken = queryParams.get("token");
  const [resetPassword] = useMutation(RESET_PASSWORD_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");

    // Check if the passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      console.log("Reset token: " + resetToken);
      const decodedToken = JSON.parse(atob(resetToken.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      console.log("Decoded token:", decodedToken);
      if (decodedToken.exp < currentTime) {
        setError(
          "Reset token has expired. Please request a new password reset."
        );
        return;
      }
    } catch (err) {
      setError("Invalid reset token. Please request a new password reset.");
      return;
    }

    // If passwords match, proceed with form submission (you can modify this as needed)
    try {
      console.log("password:", password);
      console.log("resetToken:", resetToken);
      const { data } = await resetPassword({
        variables: { password, token: resetToken },
      });
      console.log("data:", data);
      console.log("data.resetPassword.Id:", data.resetPassword.id);
      if (data && data.resetPassword && data.resetPassword.id) {
        alert("Password reset successfully!");
        setSuccess("Passwords match! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError("Error resetting password. Please try again.");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
    }
  };

  return (
    <div className="contact-page-container">
      <Box className="contact-box">
        <h2>Set Your Password</h2>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {success && (
          <Alert status="success" mb={4}>
            <AlertIcon />
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl id="password" mb={4}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="contact-input"
            />
          </FormControl>

          <FormControl id="confirm-password" mb={4}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="contact-input"
            />
          </FormControl>

          <Button type="submit" colorScheme="blue">
            Submit
          </Button>
        </form>
      </Box>
    </div>
  );
};

export default ContactForm;
