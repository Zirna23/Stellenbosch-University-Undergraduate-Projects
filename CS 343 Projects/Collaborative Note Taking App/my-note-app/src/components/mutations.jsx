import { gql } from "@apollo/client";

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($password: String!, $token: String!) {
    resetPassword(password: $password, token: $token) {
      id
      username
      email
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const EDIT_NOTE_MUTATION = gql`
  mutation EditNote($note_id: ID!, $content: String!) {
    editNote(note_id: $note_id, content: $content) {
      content
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;
export const USERNAME_MUTATION = gql`
  mutation Username($username: String!) {
    username(username: $username) {
      id
      username
      email
    }
  }
`;
export const SHARE_NOTE_MUTATION = gql`
  mutation ShareNote($noteId: ID!, $username: String!, $permission: String!) {
    shareNote(noteId: $noteId, username: $username, permission: $permission)
  }
`;

export const CREATE_NOTE_MUTATION = gql`
  mutation CreateNote($title: String!, $content: String!) {
    createNote(title: $title, content: $content) {
      note {
        note_id
        title
        content
        date_created
        last_edited
        category_id
      }
      permission {
        user_id
        note_id
        permission
      }
    }
  }
`;

export const DELETE_NOTE_MUTATION = gql`
  mutation DeleteNote($note_id: ID!) {
    deleteNote(note_id: $note_id)
  }
`;

export const UPDATE_USER_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      user {
        id
        username
        email
      }
      errors {
        field
        message
      }
    }
  }
`;

export const ADD_PERMISSION_MUTATION = gql`
  mutation AddPermission($note_id: ID!, $user_id: ID!, $permission: String!) {
    addPermission(
      note_id: $note_id
      user_id: $user_id
      permission: $permission
    ) {
      user_id
      note_id
      permission
    }
  }
`;

export const ADD_CATEGORY_MUTATION = gql`
  mutation AddCategory($category_name: String!) {
    addCategory(category_name: $category_name) {
      category_id
      category_name
      owner_id
    }
  }
`;

export const ADD_NOTE_TO_CATEGORY_MUTATION = gql`
  mutation AddNoteToCategory($note_id: ID!, $category_name: String!) {
    addNoteToCategory(note_id: $note_id, category_name: $category_name) {
      note_id
      title
      content
      date_created
      last_edited
      category_id
    }
  }
`;

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($category_id: ID!) {
    deleteCategory(category_id: $category_id)
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser {
    deleteUser
  }
`;
