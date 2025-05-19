const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Note {
    note_id: ID!
    title: String!
    content: String
    date_created: String!
    last_edited: String!
    category_id: ID
  }

  type Permission {
    user_id: ID!
    note_id: ID!
    permission: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type NoteWithPermission {
    note: Note!
    permission: Permission!
  }

  type NotesWithPermission {
    notes: [Note]!
    permissions: [Permission]!
  }

  type Category {
    category_id: ID!
    category_name: String!
    owner_id: ID!
  }

  type UpdateProfileResponse {
    user: User
    errors: [Error]
  }

  type Error {
    field: String
    message: String
  }

  type TokenResponse {
    token: String!
  }

  type Query {
    me: User
    getNotes: NotesWithPermission
    getUserCategories: [Category]!
    checkEmail(email: String!): TokenResponse
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): AuthPayload
    login(username: String!, password: String!): AuthPayload
    createNote(title: String!, content: String!): NoteWithPermission
    addPermission(note_id: ID!, user_id: ID!, permission: String!): Permission
    editNote(note_id: ID!, content: String!): Note
    resetPassword(password: String!, token: String!): User
    deleteUser: String
    deleteNote(note_id: ID!): String
    addCategory(category_name: String!): Category
    deleteCategory(category_id: ID!): String
    addNoteToCategory(note_id: ID!, category_name: String!): Note
    updateProfile(input: UpdateProfileInput!): UpdateProfileResponse!
    editUser(username: String!, email: String!): User
    shareNote(noteId: ID!, username: String!, permission: String!): Boolean!
    username(username: String!): User
  }

  input UpdateProfileInput {
    username: String
    email: String
  }
`;

module.exports = typeDefs;
