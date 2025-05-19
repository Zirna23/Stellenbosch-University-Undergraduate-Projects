import React, { useState } from 'react';
import emailjs from 'emailjs-com'; 
import { Box, FormControl, FormLabel, Input, Button, Alert, AlertIcon } from '@chakra-ui/react'; 
import '../styles/Reset.css'

const ContactForm = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [error, setError] = useState(false); 
    const [success, setSuccess] = useState(false); 

    const handleSubmit = (e) => {
        e.preventDefault();

        // Initialize EmailJS
        emailjs.init('pdPpGwdBQGTLCoZ4D');

        const resetLink = `http://localhost:3000/reset-password/${generatedToken}`;
        // Send the form using EmailJS
        emailjs.send("service_bmnl1ye", "template_fl61437", {
            message: message,
            reset_link: name,
            email: email,
        }).then(
            () => {
                console.log('SUCCESS!');
                setSuccess('Email sent successfully!');
                setFormMessage('');
            },
            (error) => {
                console.log('FAILED...', error);
                setError('Failed to send email. Please try again later.');
                setFormMessage('');
            }
        );
    };

    return (
        <div className="contact-page-container">
            <Box className="contact-box">
                <h2>Send Verification Email</h2>

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
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setMessage("hello!");
                                setName(resetLink);
                            }}
                            placeholder="Enter your email"
                            required
                            className="contact-input"
                        />
                    </FormControl>

                    <Button type="submit" colorScheme="blue">Send</Button>
                </form>

                <div className="form-message">{formMessage}</div>
            </Box>
        </div>
    );
};

export default ContactForm;
