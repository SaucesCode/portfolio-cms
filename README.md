# Dynamic Portfolio CMS

A full-stack personal portfolio website with a built-in Content Management System (CMS). This project allows me to showcase my projects, skills, experience, certifications, blog posts, and testimonials, while managing all content through a private admin dashboard.

## Features

* Responsive portfolio website built with React and Vite
* Private admin dashboard for content management
* CRUD functionality for:

  * Hero section
  * Projects
  * Skills
  * Experience
  * Certifications
  * Testimonials
  * Blog posts
  * Site statistics
* Contact form with message storage
* GitHub repository integration
* PostgreSQL database with Prisma ORM
* RESTful API built with Express.js

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios

### Backend

* Node.js
* Express.js
* Prisma ORM

### Database

* PostgreSQL

## Project Structure

```text
portfolio-cms/
├── client/          # React frontend
├── server/          # Express backend and Prisma schema
└── README.md
```

## Installation

### 1. Clone the Repository

```bash
git clone -b my-website https://github.com/SaucesCode/portfolio-cms.git
cd portfolio-cms
```

### 2. Install Dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/portfolio_db"
PORT=5000
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 4. Run Prisma Migrations

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the Development Servers

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## Admin Access

The CMS includes a private admin dashboard intended solely for my personal use. It allows me to update all portfolio content without modifying the source code directly.

## API Endpoints

Example endpoints:

```http
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/skills
GET    /api/hero
POST   /api/contact
POST   /api/auth/login
```

## Database Models

The application includes the following Prisma models:

* AdminUser
* Hero
* Project
* Skill
* Experience
* Certification
* Testimonial
* BlogPost
* Stat
* Message

## Repository

[https://github.com/SaucesCode/portfolio-cms/tree/my-website](https://github.com/SaucesCode/portfolio-cms/tree/my-website)

## License

This project is licensed under the MIT License.
