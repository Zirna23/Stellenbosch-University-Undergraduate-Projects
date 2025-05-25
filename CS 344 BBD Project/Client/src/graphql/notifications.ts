// notification.ts
import { gql } from '@apollo/client';

// Queries

// Get notifications for a user
export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($userId: Float!) {
    getUserNotifications(userId: $userId) {
      notification_id
      message
      created_at
    }
  } 
`;

// Mutations

// Create a new notification
export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($message: String!, $userId: Float!) {
    createNotification(message: $message, userId: $userId) {
      notification_id
      message
      created_at
    }
  }
`;
