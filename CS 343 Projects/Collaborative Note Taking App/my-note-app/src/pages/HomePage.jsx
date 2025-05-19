import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  FormControl,
  Input,
  Heading,
  Text,
  HStack,
  VStack,
  IconButton,
  Select,
  Divider,
  useToast,
  Avatar,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  FormLabel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";

import { createClient } from "@supabase/supabase-js";
import {
  DeleteIcon,
  EditIcon,
  AddIcon,
  EmailIcon,
  HamburgerIcon,
  Container,
} from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import {
  GET_NOTES_QUERY,
  GET_USER_QUERY,
  GET_USER_CATEGORIES_QUERY,
} from "../components/queries";
import {
  DELETE_NOTE_MUTATION,
  CREATE_NOTE_MUTATION,
  ADD_CATEGORY_MUTATION,
  ADD_NOTE_TO_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  USERNAME_MUTATION,
} from "../components/mutations";
import NewNoteButton from "../components/NewNoteButton";
import DropDownButton from "../components/DropDownButton";
import { SHARE_NOTE_MUTATION } from "../components/mutations";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,

  import.meta.env.VITE_SUPABASE_KEY
);

const HomePage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Disclosure hooks for various modals
  const {
    isOpen: isCreateNoteOpen,
    onOpen: onCreateNoteOpen,
    onClose: onCreateNoteClose,
  } = useDisclosure();
  const {
    isOpen: isCategoryOpen,
    onOpen: onCategoryOpen,
    onClose: onCategoryClose,
  } = useDisclosure();
  const {
    isOpen: isAddCatOpen,
    onOpen: onAddCatOpen,
    onClose: onAddCatClose,
  } = useDisclosure();

  // New Disclosure hook for Sign Out confirmation
  const {
    isOpen: isSignOutOpen,
    onOpen: onSignOutOpen,
    onClose: onSignOutClose,
  } = useDisclosure();
  const signOutCancelRef = useRef(); // Reference for the cancel button in Sign Out dialog

  // State variables
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categoryNote, setCategoryNote] = useState(0);
  const [newCategory, setNewCategory] = useState("");
  const [user, setUser] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortCategory, setSortCategory] = useState("all");
  const [sortCategoryId, setSortCategoryId] = useState("0");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [usernameToInvite, setUsernameToInvite] = useState("");
  const [permissionLevel, setPermissionLevel] = useState("view");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [noteToShareId, setNoteToShareId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isOpen: isInviteOpen,
    onOpen: onInviteOpen,
    onClose: onInviteClose,
  } = useDisclosure();

  console.log("Sort Category:", sortCategory);
  console.log("Sort Category ID:", sortCategoryId);

  // State for deletion confirmation
  const [noteToDelete, setNoteToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const {
    isOpen: isDeleteCategoryOpen,
    onOpen: onDeleteCategoryOpen,
    onClose: onDeleteCategoryClose,
  } = useDisclosure();
  const [deleteCategory, setDeleteCategory] = useState("");
  const [deleteCategoryId, setDeleteCategoryId] = useState(0);
  // Apollo Client instance
  const client = useApolloClient();

  // GraphQL Queries and Mutations
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER_QUERY);
  const { data, loading, error, refetch } = useQuery(GET_NOTES_QUERY);
  console.log("Data:", data);
  const [createCategory] = useMutation(ADD_CATEGORY_MUTATION);
  const [addNoteToCategory] = useMutation(ADD_NOTE_TO_CATEGORY_MUTATION);
  const {
    data: categories,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery(GET_USER_CATEGORIES_QUERY);
  console.log("Categories:", categories);
  const [deleteCategoryMutation] = useMutation(DELETE_CATEGORY_MUTATION);
  const [deleteNoteMutation] = useMutation(DELETE_NOTE_MUTATION, {
    onCompleted: () => {
      refetch();
      onDeleteClose();
      toast({
        title: "Note deleted successfully!",
        status: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting note.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    },
  });
  const [createNoteMutation] = useMutation(CREATE_NOTE_MUTATION, {
    onCompleted: () => {
      refetch();
      onCreateNoteClose();
      setNewNoteTitle("");
      setNewNoteContent("");
      toast({
        title: "Note created successfully!",
        status: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating note.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    },
  });

  useEffect(() => {
    if (userData?.me?.username) {
      fetchAvatar(userData?.me?.username);
    }
  }, [userData]);

  useEffect(() => {
    const hasRefreshed = sessionStorage.getItem("hasRefreshed");

    // Only refresh once per session and avoid infinite reload
    if (!hasRefreshed) {
      sessionStorage.setItem("hasRefreshed", "true");
      refetch();
    }
  }, [refetch]);

  const handleSortCategoryChange = (e) => {
    const selectedCategoryName = e.target.value;
    const selectedCategoryId =
      e.target.options[e.target.selectedIndex].dataset.id;
    setSortCategory(selectedCategoryName);
    setSortCategoryId(selectedCategoryId);
    console.log("Selected Category Name:", selectedCategoryName);
    console.log("Selected Category ID:", selectedCategoryId);
  };

  const fetchAvatar = async (username) => {
    const possibleExtensions = ["jpg", "png", "jpeg", "avif"];

    let avatarUrl = null;

    try {
      for (const ext of possibleExtensions) {
        const avatarFilePath = `public/${username}`;

        console.log(`Attempting to fetch avatar at path: ${avatarFilePath}`);

        const { data: fileData, error: downloadError } = await supabase.storage

          .from("avatars")

          .download(avatarFilePath);

        if (downloadError || !fileData) {
          console.log(`File not found: ${avatarFilePath}`);

          continue;
        }

        const { data: publicUrlData, error: publicUrlError } = supabase.storage

          .from("avatars")

          .getPublicUrl(avatarFilePath);

        if (publicUrlError || !publicUrlData.publicUrl) {
          console.log(`No public URL found for: ${avatarFilePath}`);

          continue;
        }

        avatarUrl = `${
          publicUrlData.publicUrl
        }?timestamp=${new Date().getTime()}`;

        console.log(`Avatar found at: ${avatarUrl}`);

        break; 
      }

      if (avatarUrl) {
        setAvatarUrl(avatarUrl); 
      } else {
        setAvatarUrl("/path/to/default/avatar.png"); 
      }
    } catch (err) {
      console.error("Failed to load avatar URL:", err);

      setAvatarUrl("/path/to/default/avatar.png"); 
    }
  };

  const addToCategory = async () => {
    console.log("Category:", category);
    console.log("Category Note:", categoryNote);
    try {
      await addNoteToCategory({
        variables: {
          note_id: categoryNote,
          category_name: category,
        },
      });
      refetch();
      toast({
        title: "Category added successfully!",
        status: "success",
        duration: 3000,
      });
      onAddCatClose();
    } catch (err) {
      toast({
        title: "Error adding to category!",
        status: "error",
        duration: 3000,
      });
      onAddCatClose();
    }
  };

  const onCreateCategory = async () => {
    console.log("Category:", newCategory);
    try {
      await createCategory({ variables: { category_name: newCategory } });
      refetch();
      onCategoryClose();
      refetchCategories();
      toast({
        title: "Category created successfully!",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error creating category.",
        status: "error",
        duration: 3000,
      });
    }
  };

  const onCategoryDeletion = async () => {
    console.log("Category:", deleteCategory);
    console.log("Category ID:", deleteCategoryId);
    try {
      await deleteCategoryMutation({
        variables: { category_id: deleteCategoryId },
      });
      refetch();
      onDeleteCategoryClose();
      refetchCategories();
      toast({
        title: "Category deleted successfully!",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting category.",
        status: "error",
        duration: 3000,
      });
    }
  };
  const [shareNoteMutation] = useMutation(SHARE_NOTE_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Note shared successfully!",
        status: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error sharing note.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    },
  });

  // Invite user mutation
  const [checkUsername] = useMutation(USERNAME_MUTATION, {
    onCompleted: async (data) => {
      if (data.username) {
        console.log("Username exists:", data.username);

        // Share note mutation logic
        try {
          setIsLoading(true); // Start loading
          await shareNoteMutation({
            variables: {
              noteId: noteToShareId, 
              username: usernameToInvite,
              permission: permissionLevel,
            },
          });
          toast({
            title: "Note shared successfully!",
            status: "success",
            duration: 3000,
          });
          onInviteClose();
        } catch (error) {
          toast({
            title: "Error sharing note.",
            description: error.message,
            status: "error",
            duration: 3000,
          });
        } finally {
          setIsLoading(false); 
        }
      } else {
        toast({
          title: "Username does not exist. Please try another username.",
          status: "warning",
          duration: 3000,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error checking username.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    },
  });

  const handleInviteCollaborator = async () => {
    try {
      await checkUsername({ variables: { username: usernameToInvite } });
    } catch (error) {
      console.error("Error inviting collaborator:", error);
    }
  };

  // Updated handleDeleteNote to open confirmation dialog
  const handleDeleteNote = (note_id) => {
    setNoteToDelete(note_id);
    onDeleteOpen();
  };
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };
  // Confirm deletion
  const confirmDeleteNote = async () => {
    try {
      await deleteNoteMutation({ variables: { note_id: noteToDelete } });
      setNoteToDelete(null);
    } catch (err) {
      // Error handling is managed by onError in the mutation
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) {
      toast({
        title: "Title is required.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await createNoteMutation({
        variables: {
          title: newNoteTitle.trim(),
          content: newNoteContent.trim(),
        },
      });
    } catch (err) {
      // Error handling is managed by onError in the mutation
    }
  };

  // Map permissions to notes
  const permissionsMap = {};
  if (data?.getNotes?.permissions) {
    data.getNotes.permissions.forEach((perm) => {
      permissionsMap[perm.note_id] = perm.permission;
    });
  }

  // Enhance notes with their corresponding permissions
  const enhancedNotes = Array.isArray(data?.getNotes?.notes)
    ? data.getNotes.notes.map((note) => ({
        ...note,
        permission: permissionsMap[note.note_id] || "viewer", // Default to 'viewer' if no permission found
      }))
    : [];

  const filteredNotes = enhancedNotes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(search.toLowerCase()) &&
        (sortCategory === "all" ||
          (note.category_id && note.category_id === sortCategoryId))
    )
    .sort((a, b) => {
      return sortOrder === "asc"
        ? new Date(a.date_created) - new Date(b.date_created)
        : sortOrder === "lastEdited"
        ? new Date(b.last_edited) - new Date(a.last_edited)
        : new Date(b.date_created) - new Date(a.date_created);
    });

  const NoteBox = ({ children, onClick }) => (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      boxShadow="lg"
      bg="white"
      width="90%"
      transform="scale(1)"
      transition="transform 0.2s ease-in-out"
      _hover={{
        transform: "scale(1.05)",
        shadow: "xl",
        cursor: "pointer",
      }}
      onClick={onClick}
      m="auto"
      position="relative"
    >
      {children}
    </Box>
  );

  const getCategoryName = (id) => {
    if (categoriesLoading || !categories) {
      return "Loading...";
    }

    const category = categories.getUserCategories?.find(
      (cat) => cat.category_id === id
    );

    return category ? category.category_name : null;
  };

  // Sign-Out Handler
  const handleSignOut = async () => {
    try {
      // Clear authentication tokens
      localStorage.removeItem("token");
      const rememberMeValue = localStorage.getItem("RememberMe");
      if (rememberMeValue) {
        localStorage.removeItem("RememberMe");
      }
      await client.resetStore(); //here
      // Redirect to login before clearing Apollo Client's cache
      navigate("/", { replace: true });

      // Reset Apollo Client's cache after the redirection to prevent queries from using stale data
      await client.clearStore();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newAvatarUrl = avatarUrl;

    if (newAvatarFile) {
      newAvatarUrl = await updateAvatar(newAvatarFile, username); // Update the avatar file

      if (newAvatarUrl) {
        // Add a timestamp to bust the cache after update

        setAvatarUrl(`${newAvatarUrl}?timestamp=${new Date().getTime()}`);
      }
    }

    // Update profile without changing the username

    updateProfile({
      variables: { input: { username, email } },

      refetchQueries: [{ query: GET_USER_QUERY }],
    });

    console.log("DONE");
  };

  return (
    <Flex minHeight="100vh" width="100vw">
      {/* Sidebar */}
      <Box
        width="60px"
        bg="purple.500"
        color="white"
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={4}
      >
        <NewNoteButton onOpen={onCreateNoteOpen} />
      </Box>

      {/* Main Content */}
      <Box flex="1" p={8} bg="gray.100">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <HStack spacing={4}>
            {!userLoading && userData && userData.me ? (
              <>
                <Menu>
                  <MenuButton>
                    <Avatar
                      name={userData?.me?.username} // Fallback if no image is available
                      size="2xl"
                      src={avatarUrl} // The URL fetched from Supabase
                      cursor="pointer"
                    />
                  </MenuButton>

                  <MenuList>
                    {/* Removed "View Profile" MenuItem */}
                    <MenuItem
                      onClick={() => {
                        navigate("/edit-profile");
                      }}
                    >
                      Edit Profile
                    </MenuItem>
                    <MenuItem onClick={onSignOutOpen}>Sign Out</MenuItem>
                  </MenuList>
                </Menu>

                <Text fontSize="lg" fontWeight="bold">
                  {userData.me.username}
                </Text>
              </>
            ) : userLoading ? (
              <Text>Loading user data...</Text>
            ) : (
              <Text>Error loading user data.</Text>
            )}
          </HStack>
          <HStack spacing={1}>
            <Button
              colorScheme="purple"
              onClick={onCategoryOpen}
              leftIcon={<AddIcon />}
              size="lg"
              width="200px"
              padding="1.5rem"
              fontSize="lg"
            >
              Add Category
            </Button>
            <IconButton
              icon={<DeleteIcon />}
              aria-label="Delete Note"
              colorScheme="purple"
              size="sm"
              width="50px"
              padding="1.5rem"
              fontSize="lg"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCategoryOpen();
                console.log("Delete all category");
              }}
            />
          </HStack>
        </Flex>

        {/* Search and Filters */}
        <HStack spacing={4} mb={6}>
          <FormControl flex="1">
            <Input
              placeholder="Search notes by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="filled"
            />
          </FormControl>
          <FormControl w="auto">
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="Sort by Date"
            >
              <option value="asc">Oldest First</option>
              <option value="desc">Newest First</option>
              <option value="lastEdited">Last Edited</option>
            </Select>
          </FormControl>
          <FormControl w="auto">
            <Select
              value={sortCategory}
              onChange={handleSortCategoryChange}
              placeholder="Select Category"
            >
              <option value="all" key={0}>
                All Categories
              </option>
              {categoriesLoading
                ? null
                : categories?.getUserCategories.map((category) => (
                    <option
                      key={category.category_id}
                      data-id={category.category_id}
                      value={category.category_name}
                    >
                      {category.category_name}
                    </option>
                  ))}
            </Select>
          </FormControl>
        </HStack>

        <Divider mb={6} />

        {/* List of Notes */}
        <Container maxW="container.md">
          <VStack spacing={4} align="stretch" width="100%">
            {loading ? (
              <Text>Loading notes...</Text>
            ) : error ? (
              <Text>Error loading notes.</Text>
            ) : filteredNotes.length === 0 ? (
              <Text>No notes found.</Text>
            ) : (
              filteredNotes.map((note) => (
                <HStack
                  key={note.note_id}
                  spacing={4}
                  align="center"
                  width="100%"
                >
                  <Box
                    as="div"
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="lg"
                    bg="white"
                    width="100%"
                    onClick={() => {
                      navigate(`/edit-note/${note.note_id}`, {
                        state: { noteData: note },
                      });
                    }}
                    cursor="pointer"
                    _hover={{
                      transform: "scale(1.02)",
                      shadow: "xl",
                    }}
                  >
                    <HStack justify="space-between" align="center" w="100%">
                      <VStack align="flex-start" spacing={1}>
                        <Heading size="md" color="purple.600">
                          {note.title}
                        </Heading>
                        {note.category_id && (
                          <Text fontSize="sm" color="gray.500">
                            {getCategoryName(note.category_id)}
                          </Text>
                        )}
                        <Text fontSize="sm" color="gray.500">
                          {new Date(note.last_edited).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <DropDownButton
                    note={note}
                    handleDeleteNote={handleDeleteNote}
                    setCategoryNote={setCategoryNote}
                    onAddCatOpen={onAddCatOpen}
                    onInviteOpen={onInviteOpen}
                    setNoteToShareId={setNoteToShareId}
                  />
                </HStack>
              ))
            )}
          </VStack>
        </Container>
        {/* Invite Collaborator Modal */}
        <Modal isOpen={isInviteOpen} onClose={onInviteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Invite Collaborator</ModalHeader>
            <ModalBody>
              <FormControl mb={4}>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={usernameToInvite}
                  onChange={(e) => setUsernameToInvite(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Permission Level</FormLabel>
                <Select
                  value={permissionLevel}
                  onChange={(e) => setPermissionLevel(e.target.value)}
                  placeholder="Select permission level"
                >
                  <option value="view">View</option>
                  <option value="edit">Edit</option>
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleInviteCollaborator}>
                Confirm
              </Button>
              <Button onClick={onInviteClose} ml={3}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Create Note Modal */}
        <Modal isOpen={isCreateNoteOpen} onClose={onCreateNoteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Note</ModalHeader>
            <ModalBody>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Enter note title"
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Content</FormLabel>
                <Input
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Enter note content"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" onClick={handleCreateNote}>
                Create
              </Button>
              <Button onClick={onCreateNoteClose} ml={3}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Create Category Modal */}
        <Modal isOpen={isCategoryOpen} onClose={onCategoryClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create a New Category</ModalHeader>
            <ModalBody>
              <FormControl mb={4}>
                <FormLabel>Category Name</FormLabel>
                <Input
                  placeholder="Enter category name"
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                  }}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" mr={3} onClick={onCreateCategory}>
                Create Category
              </Button>
              <Button onClick={onCategoryClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Category Modal */}
        <Modal isOpen={isDeleteCategoryOpen} onClose={onDeleteCategoryClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete a Category</ModalHeader>
            <ModalBody>
              <FormControl w="auto">
                <Select
                  value={deleteCategory}
                  onChange={(e) => {
                    setDeleteCategory(e.target.value);
                    setDeleteCategoryId(
                      e.target.options[e.target.selectedIndex].dataset.id
                    );
                  }}
                  placeholder="Select Category"
                >
                  {categoriesLoading ? (
                    <option>Loading categories...</option>
                  ) : (
                    categories?.getUserCategories.map((category) => (
                      <option
                        key={category.category_id}
                        data-id={category.category_id}
                        value={category.category_name}
                      >
                        {category.category_name}
                      </option>
                    ))
                  )}
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" mr={3} onClick={onCategoryDeletion}>
                Delete Category
              </Button>
              <Button onClick={onDeleteCategoryClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Add to Category Modal */}
        <Modal isOpen={isAddCatOpen} onClose={onAddCatClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select a Category</ModalHeader>
            <ModalBody>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  placeholder="Select category"
                  value={category}
                  onChange={handleCategoryChange}
                >
                  {categoriesLoading
                    ? null
                    : categories?.getUserCategories.map((category) => (
                        <option
                          key={category.category_id}
                          data-key={category.category_name}
                          value={category.category_name}
                        >
                          {category.category_name}
                        </option>
                      ))}
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" onClick={addToCategory} mr={3}>
                Add
              </Button>
              <Button onClick={onAddCatClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation AlertDialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Note
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this note? This action cannot be
                undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={confirmDeleteNote} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Sign Out Confirmation AlertDialog */}
        <AlertDialog
          isOpen={isSignOutOpen}
          leastDestructiveRef={signOutCancelRef}
          onClose={onSignOutClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Sign Out
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to sign out?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={signOutCancelRef} onClick={onSignOutClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleSignOut} ml={3}>
                  Sign Out
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Flex>
  );
};

export default HomePage;
