import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Flex,
  Avatar,
  VStack,
  InputGroup,
  InputRightElement,
  Divider,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  UPDATE_USER_PROFILE_MUTATION,
  DELETE_USER_MUTATION,
} from "../components/mutations";
import { GET_USER_QUERY } from "../components/queries";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

import { createClient } from '@supabase/supabase-js'; 



const supabase = createClient(

  import.meta.env.VITE_SUPABASE_URL, 

  import.meta.env.VITE_SUPABASE_KEY

);

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/path/to/default/avatar.png");
  const [newAvatarFile, setNewAvatarFile] = useState(null); 
  const toast = useToast();
  const client = useApolloClient();

  const { data: userData, loading: userLoading } = useQuery(GET_USER_QUERY);

  useEffect(() => {
    if (userData && userData.me) {
      setUsername(userData.me.username);
      setEmail(userData.me.email);
    }
  }, [userData]);

  useEffect(() => {

    if (userData?.me?.username) {

      fetchAvatar(userData?.me?.username); // Fetch the avatar based on the new user's username

    }

  }, [userData]);

  const handleChangeProfileImage = (event) => {

    const file = event.target.files[0];

    setNewAvatarFile(file);  // Set the new avatar file in the state

  };









  // Sign-Out Handler
  const handleSignOut = async () => {
    try {
      // Clear authentication tokens
      //localStorage.removeItem("token");

      // Reset Apollo Client's cache
      await client.resetStore();

      // Navigate to the login page, replacing the current history entry
      navigate("/", { replace: true });

      // Show a success toast
      toast({
        title: "Signed out successfully.",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error signing out.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const [deleteProfile] = useMutation(DELETE_USER_MUTATION);
  const [updateProfile] = useMutation(UPDATE_USER_PROFILE_MUTATION, {
    onCompleted: (data) => {
      if (data.updateProfile.user) {
        toast({
          title: "Profile updated successfully!",
          status: "success",
          duration: 3000,
        });
      } else {
        console.error("Update failed:", data.updateProfile.errors);
        toast({
          title: "Error updating profile.",
          description:
            data.updateProfile.errors[0]?.message || "Unknown error occurred",
          status: "error",
          duration: 3000,
        });
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error updating profile.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    },
  });

  
  const fetchAvatar = async (username) => {
    const filePath = `public/${username}`;
    const { data, error } = supabase.storage.from("avatars").getPublicUrl(filePath);

    if (error) {
      console.error("Error fetching avatar:", error.message);
      return;
    }

    // Cache busting by appending timestamp
    const newAvatarUrl = `${data.publicUrl}?timestamp=${new Date().getTime()}`;
    setAvatarUrl(newAvatarUrl);
  };

  const moveAvatarToTrashAndCopy = async (oldUsername, newUsername, fileExtension) => {
    const oldFilePath = `public/${oldUsername}`;
    const newFilePath = `public/${newUsername}`;
    const trashFilePath = `trash/${oldUsername}`;

    try {
      // Move the old avatar to the trash directory
      const { error: moveError } = await supabase
        .storage
        .from('avatars')
        .move(oldFilePath, trashFilePath);

      if (moveError) {
        console.error("Error moving avatar to trash:", moveError.message);
        return false;
      }

      console.log(`Moved avatar to trash: ${trashFilePath}`);

      // Copy the avatar under the new username
      const { error: copyError } = await supabase
        .storage
        .from('avatars')
        .copy(trashFilePath, newFilePath);

      if (copyError) {
        console.error("Error copying avatar to new username:", copyError.message);
        return false;
      }

      console.log(`Copied avatar to new username: ${newFilePath}`);
      return newFilePath;

    } catch (err) {
      console.error("Failed to move and copy avatar:", err);
      return false;
    }
  };

  const updateAvatar = async (file, username) => {
    const fileExtension = file.name.split(".").pop();  // Extract extension
    const fileName = `${username}`;  // New filename with extension
    const filePath = `public/${fileName}`;
  
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, {
      upsert: true,
    });
  
    if (error) {
      console.error("Error updating avatar:", error.message);
      toast({
        title: "Error updating avatar",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      return null;
    }
  
    // Get the public URL for the updated avatar
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let newAvatarUrl = avatarUrl;
    const oldUsername = userData?.me?.username; // Store the old username
    const fileExtension = newAvatarFile ? newAvatarFile.name.split('.').pop() : 'avif'; // Assuming .avif if no new image
  
    if (username !== oldUsername) {
      // Move the old avatar to trash and copy it with the new username
      const avatarPath = await moveAvatarToTrashAndCopy(oldUsername, username, 'jpg');
      if (avatarPath) {
        newAvatarUrl = `${avatarPath}?timestamp=${new Date().getTime()}`;
        setAvatarUrl(newAvatarUrl);
      }
    }
  
    if (newAvatarFile) {
      // Update the avatar file with the new username
      newAvatarUrl = await updateAvatar(newAvatarFile, username);
      if (newAvatarUrl) {
        // Add a timestamp to bust the cache after update
        setAvatarUrl(`${newAvatarUrl}?timestamp=${new Date().getTime()}`);
      }
    }
  
    // Update profile and include the new username
    updateProfile({
      variables: { input: { username, email } },
      refetchQueries: [{ query: GET_USER_QUERY }]
    });
  
    console.log("DONE");
  };
  

  const handleDeleteProfile = async () => {
    console.log("Delete Profile clicked");
    try {
      await deleteProfile();
      toast({
        title: "Profile deleted successfully!",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Delete profile error:", error);
      toast({
        title: "Error deleting profile.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
    handleSignOut();
  };

  if (userLoading) return <Box>Loading...</Box>;

  return (
    <Box>
      <Navbar />
      <Flex
        direction="column"
        align="center"
        maxWidth="400px"
        margin="auto"
        mt={8}
      >
      <Flex width="100%" justify="space-between" align="center" mb={6}>
  <Avatar
    name={userData?.me?.username}
    size="2xl"
    src={avatarUrl}
    cursor="pointer"
  />
  {/* Hidden file input */}
  <Input
    type="file"
    accept="image/*"
    onChange={handleChangeProfileImage}  // Handle file selection here
    display="none"
    id="avatar-upload"  // This is referenced in the button
  />
  {/* Button triggers the file input */}
  <Button
    as="label"  // Make the button act as a label for the file input
    htmlFor="avatar-upload"  // This links the button to the hidden file input
    colorScheme="purple"
    variant="outline"
    size="sm"
    width={"200px"}
    leftIcon={<EditIcon />}
  >
    Change Profile Image
  </Button>
</Flex>

        <VStack
          as="form"
          onSubmit={handleSubmit}
          spacing={4}
          align="stretch"
          width="100%"
          alignItems="center"
        >
          <FormControl id="username">
            <FormLabel>Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </FormControl>
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </FormControl>
          <Divider my={3} />
          <Button type="submit" colorScheme="purple" width={"200px"}>
            Update Profile
          </Button>
        </VStack>
        <Button
          type="submit"
          colorScheme="purple"
          leftIcon={<DeleteIcon />}
          width={"200px"}
          onClick={handleDeleteProfile}
          marginTop={2}
        >
          Delete Profile
        </Button>
      </Flex>
    </Box>
  );
};

export default EditProfilePage;
