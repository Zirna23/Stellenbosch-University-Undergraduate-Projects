import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Alert,
  AlertIcon,
  Image,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { createClient } from "@supabase/supabase-js";
import "../styles/Login.css";
import { SIGNUP_MUTATION } from "../components/mutations";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Use Apollo's useMutation hook to send the signup mutation
  const [signup] = useMutation(SIGNUP_MUTATION);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    setAvatar(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // Function to upload the avatar to Supabase

  const uploadAvatarToSupabase = async (file, username) => {
    try {
      // Use the username for the filename without an extension

      const fileExtension = file.name.split(".").pop();

      const fileName = `${username}`;

      const { data, error } = await supabase.storage

        .from("avatars")

        .upload(`public/${fileName}`, file, {
          cacheControl: "360",

          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);

        throw new Error(error.message);
      }

      const { publicUrl, error: urlError } = supabase.storage

        .from("avatars")

        .getPublicUrl(data.path);

      if (urlError) {
        console.error("Error generating public URL:", urlError);

        throw new Error(urlError.message);
      }

      return publicUrl;
    } catch (error) {
      console.error("Avatar upload failed:", error);

      throw error;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Execute signup mutation (create user)
      const { data } = await signup({
        variables: { username, email, password }, // No avatar URL yet
      });

      if (!data.signup.token) {
        setError("Failed to create account. No token returned.");
        return;
      }

      // At this point, the signup was successful, and we can now handle avatar upload.
      let avatarUrl = "";

      // Upload avatar to Supabase if an avatar is selected
      if (avatar) {
        try {
          console.log("Uploading avatar to Supabase...");
          avatarUrl = await uploadAvatarToSupabase(avatar, username);
          console.log("Avatar successfully uploaded. URL:", avatarUrl);
        } catch (uploadError) {
          setError("Avatar upload failed. Please try again.");
          return; // Stop execution if avatar upload fails
        }
      }

      // After successful signup and avatar upload, store the token and redirect
      localStorage.setItem("token", data.signup.token); // Store JWT token
      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (generalError) {
      console.error("Unexpected error:", generalError);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-page-container">
      {" "}
      {/* Full page container for gradient */}
      <Box className="login-box">
        {" "}
        {/* Styling for the login box */}
        <h2>Register</h2>
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
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="login-input"
            />
          </FormControl>
          <FormControl id="password" mb={4}>
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
          <FormControl id="confirmPassword" mb={6}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="login-input"
            />
          </FormControl>
          {/* Avatar Upload Section */}

          <FormControl id="avatar" mb={6}>
            <FormLabel>Upload Avatar</FormLabel>

            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="login-input"
            />

            {avatarPreview && (
              <Image
                src={avatarPreview}
                alt="Avatar Preview"
                boxSize="100px"
                mt={4}
                borderRadius="full"
              />
            )}
          </FormControl>
          <Button type="submit" colorScheme="green" width="full">
            Register
          </Button>
        </form>
        <div className="login-text">
          <Text>
            Already have an account?{" "}
            <Link to="/" className="text-blue-600">
              {" "}
              {/* Updated to use Tailwind's class */}
              Login here
            </Link>
          </Text>
        </div>
      </Box>
    </div>
  );
};

export default RegisterPage;
