JobHub
Overview
JobHub is a job application platform backend built with Express, Sequelize, and TypeScript. It supports user authentication, job posting, applications with resume uploads, and email notifications.

Tech Stack
Node.js + Express

TypeScript

PostgreSQL with Sequelize ORM

JWT authentication

Multer + Cloudinary for file uploads

Nodemailer for email

Docker + Docker Compose for containerization

Setup Instructions
Prerequisites
Node.js >= 16

PostgreSQL database

Docker & Docker Compose (optional but recommended)

Cloudinary account for file storage

Gmail or SMTP email credentials

Installation
Clone the repo:

bash
Copy
Edit
git clone https://github.com/yourusername/eskalate.git
cd eskalate
Install dependencies:

bash
Copy
Edit
npm install
Create .env file in the root with these variables:

env
Copy
Edit
PORT=8000

# PostgreSQL
PRODUCTION_PG_USER=your_pg_user
PRODUCTION_PG_PASSWORD=your_pg_password
PRODUCTION_PG_DATABASE=eskilate
PRODUCTION_PG_HOST=db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=1d
JWT_COOKIE_EXPIRE=10

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Run migrations:

bash
Copy
Edit
npm run migrate
Start the app (development mode):

bash
Copy
Edit
npm run dev
Access API on http://localhost:8000/api/v1

Running with Docker
bash
Copy
Edit
docker-compose up --build
API Endpoints
Path	Method	Description	Auth Required	Roles Allowed
/api/v1/auth/register	POST	Register a new user	No	-
/api/v1/auth/login	POST	Login user	No	-
/api/v1/auth/verify	GET	Verify user email with token	No	-
/api/v1/jobs	GET	List open jobs	Yes	applicant
/api/v1/jobs/my	GET	List jobs posted by company	Yes	company
/api/v1/jobs	POST	Create a new job	Yes	company
/api/v1/jobs/:id	GET	Get job details	Yes	-
/api/v1/jobs/:id	PUT	Update job	Yes	company
/api/v1/jobs/:id	DELETE	Delete job	Yes	company
/api/v1/applications/:id/apply	POST	Apply to a job (upload resume)	Yes	applicant
/api/v1/applications/my	GET	List my applications	Yes	applicant
/api/v1/applications/job/:jobId	GET	List applications for a job	Yes	company
/api/v1/applications/:id/status	PUT	Update application status (Interview/Hired/etc.)	Yes
