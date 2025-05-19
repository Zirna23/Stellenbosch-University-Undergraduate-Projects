import { gql } from "@apollo/client";

export const GET_NOTES_QUERY = gql`
  query GetNotes {
    getNotes {
      notes {
        note_id
        title
        content
        date_created
        last_edited
        category_id
      }
      permissions {
        note_id
        permission
        user_id
      }
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser {
    me {
      id
      username
      email
    }
  }
`;

export const GET_USER_CATEGORIES_QUERY = gql`
  query GetUserCategories {
    getUserCategories {
      category_id
      category_name
      owner_id
    }
  }
`;

export const CHECK_EMAIL_QUERY = gql`
  query CheckEmail($email: String!) {
    checkEmail(email: $email) {
      token
    }
  }
`;
