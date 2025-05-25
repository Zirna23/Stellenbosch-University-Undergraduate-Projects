# E-Spaza Project

## Usage

### Starting the server
In Server/ run
```
npm install
npm run dev
```
### Starting the client
In Client/ run
```
npm install
npm run dev
```
## Introduction

  The E-Spaza project is designed to support spaza shop owners and their customers in South Africa. A spaza shop is an informal convenience store, typically operated from someone’s home. These shops are essential to communities, but they often face challenges such as irregular operating hours, stock shortages, and limited inventory tracking.

  E-Spaza aims to provide a web-based solution that enables shop owners to manage stock efficiently and allows customers to place orders across multiple shops with ease. The platform also suggests the most efficient routes for customers to collect their goods after placing an order.


## Project Objectives
  
    - Implement the Agile methodology with a test-driven development approach.
    - Utilize Continuous Integration and Continuous Deployment (CI-CD) principles.
    - Deliver a public-facing web application that meets the following functional requirements.

## Features

### 1. Shpopping and Order Management
    
    - Customers can browse items from all spaza shops in the area, search, filter, and add items to their cart.
    - Customers can complete orders, view order status (packing, ready for collection), and receive updates.

### 2. Route Suggestions
    
    - Provide an efficient route for customers to pick up all their ordered items from different shops.

### 3. Stock Management for Shop Owners
    
    - Staff can fulfill orders and manage inventory through the platform, using a camera to add or update stock.

### 4. Reporting Dashboard
    
    - Admins can view and export reports on stock availability, order history, and more.
    - Reports are available in CSV or PDF formats.

### 5. User Roles and Permissions
    
    - Support for three user roles: Shopper, Staff, and Admin (shop owner)
    - Admins can manage user permissions, onboard staff, and remove access.

### 6. Notifications
    
    - Notify users of order updates and other relevant information.
    - Bonus feature: Automatically warn shoppers of extreme weather conditions when placing orders.


## Technologies Used

  - Frontend: React.js, Apollo GraphQL
  - Backend: PostgreSQL, Node.js with Express
  - Authentication: Third-party identity provider (e.g., Auth0)
  - CI/CD: Integrated continuous deployment pipeline


This project is a step forward in improving the efficiency and reliability of spaza shops, empowering both owners and customers in local communities.