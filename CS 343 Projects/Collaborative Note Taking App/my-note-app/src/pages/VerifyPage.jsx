import React, { useState } from "react";
import emailjs from "emailjs-com"; // Make sure to install emailjs-com
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"; // Import Chakra UI components
import "../styles/Verify.css";
import { CHECK_EMAIL_QUERY } from "../components/queries";
import { useQuery } from "@apollo/client";

const ContactForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false); // Add error state
  const [success, setSuccess] = useState(false); // Add success state
  const { refetch: checkEmail } = useQuery(CHECK_EMAIL_QUERY, {
    skip: true, // Skip the query on initial render
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the checkEmail query
      const { data } = await checkEmail({ email });
      console.log("data:", data);
      if (data && data.checkEmail && data.checkEmail.token) {
        // Initialize EmailJS
        emailjs.init("pdPpGwdBQGTLCoZ4D");

        // Create a form object with the required fields
        const formData = {
          email: email,
          reset_link: `http://localhost:5173/reset-password?token=${data.checkEmail.token}`,
        };
        console.log("formData:", formData);
        // Send the form using EmailJS
        emailjs.send("service_bmnl1ye", "template_fl61437", formData).then(
          () => {
            console.log("SUCCESS!");
            setSuccess("Email sent successfully!");
          },
          (error) => {
            console.log("FAILED...", error);
            setError("Failed to send email. Please try again later.");
          }
        );
      }
    } catch (err) {
      console.error("Error checking email:", err);
    }
  };

  return (
    <div className="contact-page-container">
      <Box className="contact-box">
        <h2>Contact Us</h2>

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
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="contact-input" // Added class for custom styles
            />
          </FormControl>

          <Button type="submit" colorScheme="blue">
            Send Email
          </Button>
        </form>
      </Box>
    </div>
  );
};

export default ContactForm;
