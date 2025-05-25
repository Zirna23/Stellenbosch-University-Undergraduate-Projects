import { gql } from "@apollo/client";

// Queries

// Fetch a user by ID
export const GET_USER_BY_ID = gql`
    query GetUserById($userId: Float!) {
        getUserById(userId: $userId) {
            user {
                user_id
                name
                email
                password_hash
                user_address
            }
            success
            token
        }
    }
`;

// Search for a user by email
export const SEARCH_USER_BY_EMAIL = gql`
    query SearchUserByEmail($email: String!) {
        searchUserByEmail(email: $email) {
            user {
                user_id
                name
                email
                password_hash
                user_address
            }
            success
            token
        }
    }
`;

export const GET_USER_ADDRESS = gql`
    query Query($userId: Float!) {
        getUserAddress(userId: $userId)
    }
`;

// Mutations

// Create a new user
export const CREATE_USER = gql`
    mutation CreateUser(
        $roleId: Float!
        $password: String!
        $email: String!
        $name: String!
        $userAddress: String
    ) {
        createUser(
            roleId: $roleId
            password: $password
            email: $email
            name: $name
            user_address: $userAddress
        ) {
            user {
                user_id
                name
                email
                password_hash
                user_address
            }
            success
            token
        }
    }
`;

// Update a user
export const UPDATE_USER = gql`
    mutation UpdateUser(
        $roleId: Float!
        $email: String!
        $name: String!
        $userId: Float!
        $userAddress: String
    ) {
        updateUser(
            roleId: $roleId
            email: $email
            name: $name
            userId: $userId
            user_address: $userAddress
        )
    }
`;

// Delete a user
export const DELETE_USER = gql`
    mutation DeleteUser($userId: Float!) {
        deleteUser(userId: $userId)
    }
`;

// Get user role
export const GET_USER_ROLE = gql`
    query GetUserRole($userId: Float!) {
        getUserRole(userId: $userId) {
            role_id
            role_name
        }
    }
`;

// Get user shops
export const GET_USER_SHOPS = gql`
    query GetUserShops($userId: Float!) {
        getUserShops(userId: $userId) {
            shop_id
            name
            address
            open
            contact_number
            weekday_opening_time
            weekday_closing_time
            weekend_opening_time
            weekend_closing_time
        }
    }
`;

// Get user shop id
export const GET_USER_SHOP_ID = gql`
    query Query($userId: Float!) {
        getUserShopId(userId: $userId)
    }
`;

// Assign a user to a shop
export const ASSIGN_USER_TO_SHOP = gql`
    mutation AssignUserToShop(
        $roleId: Float!
        $shopId: Float!
        $userId: Float!
    ) {
        assignUserToShop(roleId: $roleId, shopId: $shopId, userId: $userId)
    }
`;

export const LOGIN_WITH_EMAIL_PASSWORD = gql`
    mutation LoginWithEmailPassword($password: String!, $email: String!) {
        loginWithEmailPassword(password: $password, email: $email) {
            user {
                user_id
                name
                email
                password_hash
                user_address
            }
            success
            token
        }
    }
`;
export const REGISTER_WITH_EMAIL_PASSWORD = gql`
    mutation RegisterWithEmailPassword(
        $userAddress: String!
        $roleId: Float!
        $password: String!
        $email: String!
        $name: String!
    ) {
        registerWithEmailPassword(
            user_address: $userAddress
            roleId: $roleId
            password: $password
            email: $email
            name: $name
        ) {
            user {
                user_id
                name
                email
                password_hash
                user_address
            }
            success
            token
        }
    }
`;
