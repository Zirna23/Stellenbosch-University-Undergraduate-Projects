import { Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react';
import { HamburgerIcon, EmailIcon, AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const DropDownButton = ({ note, handleDeleteNote, setCategoryNote, onAddCatOpen, onInviteOpen, setNoteToShareId }) => {
    const navigate = useNavigate();

    return (
        <Menu>
            <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                aria-label="Options"
                onClick={(e) => e.stopPropagation()}
                width="40px"
                bg="#5f357c"
                color="white"
                _hover={{ bg: "#3f2b54" }}
                borderColor="#5f357c"
            />
            <MenuList zIndex={1}>
                <MenuItem icon={<EmailIcon />} onClick={(e) => {
                    e.stopPropagation();
                    setNoteToShareId(note.note_id); // Set the note ID to share
                    onInviteOpen(); // Call the invite open function
                }}>
                    Share
                </MenuItem>
                <MenuItem icon={<EditIcon />} onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit-note/${note.note_id}`, { state: { noteData: note } });
                }}>
                    Edit
                </MenuItem>
                <MenuItem icon={<AddIcon />} onClick={(e) => {
                    e.stopPropagation();
                    setCategoryNote(note.note_id);
                    onAddCatOpen();
                }}>
                    Add to Category
                </MenuItem>
                {note.permission === "owner" && (
                    <MenuItem icon={<DeleteIcon />} onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.note_id);
                    }}>
                        Delete
                    </MenuItem>
                )}
            </MenuList>
        </Menu>
    );
};

export default DropDownButton;
