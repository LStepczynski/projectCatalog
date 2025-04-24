## 🌟 Introduction

Welcome to **Project Catalog**, a dynamic web platform designed to connect curious learners and passionate creators through hands-on guides and articles. Whether you’re seeking inspiration for your next project or eager to share your expertise, Project Catalog provides an intuitive space to explore, create, and learn. Our mission is to foster a vibrant community where users can:

- **Discover** innovative ideas across a wide range of topics.
- **Create** and publish their own step-by-step tutorials.
- **Learn** from the real-world experiences of fellow community members.

By offering a diverse collection of user-contributed content, Project Catalog helps you jumpstart new hobbies, refine valuable skills, and engage in meaningful creative endeavors.

### 🔗 Preview Link

Visit the live site: [https://projectcatalog.click](https://projectcatalog.click)

## 🛠️ How to Use

1. **Create an Account**
   - Sign up or log in via the homepage to access your dashboard.

2. **Browse Content**
   - Use the **Category** page or category filters to explore tutorials.

3. **Publish Your Own**
   - Go to **Create**, fill out your tutorial, and hit **Publish**.

4. **Track Your Work**
   - Use your profile to manage content and view activity.

Start your journey on Project Catalog and turn ideas into action!


## 🧰 Tech Stack Overview

Project Catalog is built using modern technologies tailored for performance, scalability, and developer experience. Below is a breakdown of the core tools and libraries used in both the frontend and backend of the application.

---

## 🌐 Frontend

Built with **React** and powered by **Vite**, the frontend is designed for speed, flexibility, and responsiveness.

### Key Technologies

- **Framework & Build Tools**: React, Vite
- **Styling**: styled-components
- **Routing**: react-router-dom
- **Animation**: animejs
- **Environment Configuration**: dotenv
- **State & Utility Libraries**: lodash
- **Component Library**: @primer/react

### Developer Tools

- TypeScript
- ESLint with React & Vite plugins
- Vite preview and sync to S3
- Linting: eslint-plugin-react-hooks, eslint-plugin-react-refresh

---

## 🛠️ Backend

The backend is a **Node.js** application using **Express** and deployed with the **Serverless Framework**. It is structured for scalability and integrates AWS services like DynamoDB, S3, and SES.

### Core Technologies

- **Runtime**: Node.js with Express
- **Deployment**: Serverless Framework
- **Environment Management**: dotenv, serverless-dotenv-plugin
- **Database**: AWS DynamoDB (with @aws-sdk/client-dynamodb, lib-dynamodb)
- **Authentication**: bcryptjs, jsonwebtoken, cookie-parser
- **Utilities**: uuid, sharp, yaml, joi
- **Email & File Services**: AWS SES, AWS S3, nodemailer
- **Rate Limiting**: express-rate-limit

### Developer Tools

- TypeScript
- Serverless Esbuild
- tsconfig-paths
- docker-compose for DynamoDB Local
- dynamodb-admin (via npx studio script)
- Scripts for creating/deleting/scanning DynamoDB tables using ts-node
- Testing: vitest, supertest

---

## 💻 Local Setup Guide

Follow these steps to run Project Catalog on your local machine:

### 🔧 Backend Setup

1. Install dependencies:
   ```bash
   npm i
   ```
2. Create environment variable file:
   ```bash
   npm run createEnv
   ```
3. Start local DynamoDB with Docker:
   ```bash
   npm run docker
   ```
4. Create DynamoDB tables:
   ```bash
   npm run createTables
   ```
5. (Optional) Open DynamoDB web UI:
   ```bash
   npm run studio
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### 🧪 Frontend Setup

1. Install dependencies:
   ```bash
   npm i
   ```
3. Create .env with the following values:
   ```bash
   VITE_BACKEND_URL # Backend url
   VITE_S3_LINK     # Link to the S3 bucket
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

Your local instance of Project Catalog will now be running and connected to your backend and local DynamoDB.


