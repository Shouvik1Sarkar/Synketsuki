# Synketsuki

> A production-oriented backend API for a real-time collaborative document editor built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**.

---

## 📖 Overview

Synketsuki is a backend application that powers a collaborative document editing platform. It is designed with scalability, maintainability, and clean architecture in mind, focusing on real-world backend engineering practices rather than just CRUD operations.

The project currently supports secure authentication, user management, document management, role-based access control, document versioning, soft deletion, archiving, and collaboration through document memberships. Future development will introduce real-time collaboration using WebSockets, Redis Pub/Sub, and advanced conflict resolution techniques.

This project is being built as a portfolio project to explore the architecture behind modern collaborative editors like Google Docs and Notion.

---

# ✨ Features

## Authentication

* JWT Authentication
* Access & Refresh Tokens
* Email Verification
* Password Reset
* Protected Routes
* Role-Based Authorization

## User Management

* Create Account
* Login / Logout
* Get Current User
* Update Profile
* Delete Account
* Product Roles (User / Product Owner / Product Admin)

## Document Management

* Create Documents
* Update Documents
* Get Document by ID
* Get My Documents
* Duplicate Documents
* Archive / Unarchive Documents
* Soft Delete (Trash)
* Restore Documents
* Permanently Delete Documents
* Empty Trash

## Document Versioning

* Manual Version Snapshots
* Snapshot Messages
* Duplicate Snapshot Prevention
* Version History (In Progress)

## Collaboration

* Document Membership Model
* Owner / Editor / Viewer Roles
* Share Documents *(In Progress)*

## Upcoming

* WebSocket Collaboration
* Live Cursor Presence
* Redis Caching
* Redis Pub/Sub
* Operational Transform / CRDT
* Activity Logs
* Notifications
* Docker Deployment
* Automated Testing
* CI/CD Pipeline

---

# 🛠 Tech Stack

| Category         | Technology            |
| ---------------- | --------------------- |
| Runtime          | Node.js               |
| Framework        | Express.js            |
| Database         | MongoDB               |
| ODM              | Mongoose              |
| Authentication   | JWT                   |
| Password Hashing | bcrypt                |
| Validation       | express-validator     |
| Email            | Nodemailer + Mailgen  |
| Logging          | Pino                  |
| Environment      | dotenv                |
| Realtime         | Socket.IO *(Planned)* |
| Cache            | Redis *(Planned)*     |

---

# 🏗 Architecture

The project follows a layered backend architecture.

```text
Client
    │
    ▼
Express Routes
    │
    ▼
Authentication & Validation
    │
    ▼
Controllers
    │
    ▼
Business Logic
    │
    ▼
MongoDB (Mongoose)
```

Future versions will extend the architecture with:

```text
Socket.IO

↓

Redis Pub/Sub

↓

Multiple Backend Instances

↓

MongoDB
```

---

# 📂 Project Structure

```text
src/
│
├── config/
├── constants/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
├── validators/
└── index.js
```

---

# 🗄 Database Models

The project currently consists of the following core models:

### User

Stores user accounts, authentication details, and application roles.

### Document

Stores the latest state of every document.

### DocumentMember

Defines document permissions and collaboration roles.

### DocumentVersion

Stores immutable snapshots of document versions.

Additional models may be introduced as the project grows.

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone <repository-url>
```

## Install dependencies

```bash
npm install
```

## Configure environment variables

Create a `.env` file.

Example:

```env
PORT=

MONGODB_URI=

ACCESS_TOKEN_SECRET=

REFRESH_TOKEN_SECRET=

ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_EXPIRY=

MAILTRAP_USER=

MAILTRAP_PASS=

CLIENT_URL=
```

## Start the development server

```bash
npm run dev
```

---

# 📌 API Modules

Current API modules include:

* Authentication
* Users
* Documents
* Document Versioning

Upcoming modules:

* Sharing & Collaboration
* WebSockets
* Notifications
* Search
* Activity Logs

Detailed endpoint documentation will be available inside the `docs/` directory.

---

# 🛣 Roadmap

## Completed

* User Authentication
* JWT Authorization
* User Management
* Document CRUD
* Soft Delete
* Archive System
* Duplicate Documents
* Manual Version Snapshots

## In Progress

* Document Sharing
* Collaborator Permissions
* Version History API

## Planned

* WebSocket Collaboration
* Redis Pub/Sub
* Real-Time Editing
* Presence Indicators
* Operational Transform / CRDT
* Docker Support
* Unit & Integration Testing
* CI/CD
* Deployment

---

# 🎯 Project Goals

This project aims to demonstrate production-ready backend development practices, including:

* Clean REST API Design
* Secure Authentication
* Role-Based Authorization
* Database Modeling
* Transaction Handling
* Document Versioning
* Collaboration Architecture
* Scalable Project Structure
* Maintainable Codebase

---

# 🤝 Contributing

Contributions, suggestions, and feedback are always welcome.

Feel free to open an issue or submit a pull request if you'd like to improve the project.

---

# 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built by **Shouvik Sarkar** as part of a journey toward becoming a backend engineer specializing in scalable systems, distributed architecture, and real-time collaborative applications.
