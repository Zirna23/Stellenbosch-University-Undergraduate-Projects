import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Textarea,
  Heading,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  Avatar,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown"; 
import Navbar from "./Navbar"; 
import { useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { EDIT_NOTE_MUTATION } from "../components/mutations";
import { GET_NOTES_QUERY, GET_USER_QUERY } from "../components/queries";
import { io } from "socket.io-client";

const NotePage = () => {
  const [editNote] = useMutation(EDIT_NOTE_MUTATION);
  const location = useLocation();
  const { noteData } = location.state || {}; 
  const [note, setNote] = useState(noteData?.content || `## Markdown Test Document`);
  const [permission, setPermission] = useState(null); 
  const [users, setUsers] = useState([]); 
  const [isOpen, setIsOpen] = useState(false);

  const { data: userData, loading: userLoading } = useQuery(GET_USER_QUERY); 

  // Fetch notes and permissions
  const { data, loading, error } = useQuery(GET_NOTES_QUERY);

  useEffect(() => {
    if (!loading && data && data.getNotes && noteData) {
      const permissionsMap = {};
      data.getNotes.permissions.forEach((perm) => {
        permissionsMap[perm.note_id] = perm.permission;
      });
      const notePermission = permissionsMap[noteData.note_id] || "No permission";
      setPermission(notePermission);
    }
  }, [loading, data, noteData]);

  const socketRef = useRef(null);

  useEffect(() => {
    // Ensure username is available before connecting to the socket
    if (userData && userData.me) {
      // Create the socket instance only once
      socketRef.current = io("http://localhost:4000");

      // Send joinNote event with note_id and username
      socketRef.current.emit("joinNote", {
        note_id: noteData.note_id,
        username: userData.me.username, // Pass actual username
      });

      // Listen for updates to the user list
      socketRef.current.on("userListUpdate", (updatedUserList) => {
        setUsers(updatedUserList);
      });

      // Listen for note updates
      socketRef.current.on("noteUpdated", (data) => {
        if (data.note_id === noteData.note_id) {
          setNote(data.content);
        }
      });

      return () => {
        socketRef.current.emit("leaveNote", {
          note_id: noteData.note_id,
          username: userData.me.username, 
        });
        socketRef.current.disconnect();
      };
    }
  }, [noteData.note_id, userData]);

  const handleEditNote = async (newNoteContent) => {
    socketRef.current.emit("editNote", { note_id: noteData.note_id, content: newNoteContent });
    try {
      await editNote({
        variables: { note_id: noteData.note_id, content: newNoteContent },
      });
    } catch (err) {
      console.log("Error updating note:", err.message);
    }
  };

  const handlePreview = () => {
    setIsOpen(true); 
  };

  const handleClose = () => {
    setIsOpen(false); 
  };

  if (loading || userLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading notes: {error.message}</div>;

  return (
    <div>
      <Navbar />
      <div className="flex flex-col bg-gray-100 p-4 max-w-4xl mx-auto h-full">
        <Box bg="white" p={[4, 6, 8]} rounded="md" shadow="lg" w="full">
          <Heading as="h1" size="lg" mb={4}>
            Markdown Editor
          </Heading>
          <Text mb={4}>Permission: {permission || "Loading permission..."}</Text>

          {/* Display connected users */}
          <Text mb={2}>Users currently viewing this document:</Text>
          <VStack spacing={2} align="start" mb={4}>
            {users.map((user, index) => (
              <Box key={index} display="flex" alignItems="center">
                <Avatar size="sm" name={user} />
                <Text ml={2}>{user}</Text>
              </Box>
            ))}
          </VStack>

          <Textarea
            className="textarea-custom"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              handleEditNote(e.target.value); 
            }}
            placeholder="Write your notes here..."
            size="lg"
            mb={4}
            height="675px"
            isDisabled={permission !== "edit" && permission !== "owner"} 
          />
          <Button className="button-custom" onClick={handlePreview} mb={4}>
            Preview
          </Button>
        </Box>

        <Modal isOpen={isOpen} onClose={handleClose} size="full">
          <ModalOverlay />
          <ModalContent maxW="90vw" height="90vh">
            <ModalHeader>Preview</ModalHeader>
            <ModalCloseButton />
            <ModalBody overflowY="auto" bg="white" p={6}>
              <ReactMarkdown className="prose max-w-full">{note}</ReactMarkdown>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default NotePage;
