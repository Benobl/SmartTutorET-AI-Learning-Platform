# SmartTutorET-AI-Learning-Platform

SmartTutorET is a production-ready educational platform offering personalized learning, AI tutoring, peer collaboration, gamification, and emotional well-being support for students, tutors, instructors, and administrators.

## Project Structure

This is a monorepo containing both the frontend and backend services:

- **[frontend/](file:///home/nebil/SmartTutorET-AI-Learning-Platform/frontend)**: Next.js application with Tailwind CSS and Lucide React.
- **[backend/](file:///home/nebil/SmartTutorET-AI-Learning-Platform/backend)**: Node.js/Express API with MongoDB and Socket.io.

## Documentation

- [Backend Documentation](file:///home/nebil/SmartTutorET-AI-Learning-Platform/backend/README.md)
- [Frontend Documentation](file:///home/nebil/SmartTutorET-AI-Learning-Platform/frontend/README.md)

## Demo Accounts & Dashboards

For easy evaluation during job applications and demos, the platform is seeded with pre-configured mock accounts for all dashboards. Use the credentials below to log in:

| Dashboard / Role | Email Address | Password | Features & Access |
| :--- | :--- | :--- | :--- |
| **Admin Dashboard** | `admin@smarttutor.com` | `adminpassword` | Full system control, user management, global settings, platform monitoring |
| **Manager Dashboard** | `manager@smarttutor.com` | `managerpassword` | School administration, tutor approvals, analytics, curriculum oversight |
| **Tutor Dashboard** | `abrham@tutor.com` <br> *or* `tigist@tutor.com` | `tutorpassword` | Course creation, teaching schedule, student assessments, AI assistance |
| **Student Dashboard** | `abel@student.com` <br> *or* `sara@student.com` | `studentpassword` | Interactive learning, AI chatbot tutor, quizzes, progress tracking, study groups |

> [!NOTE]
> All passwords and users are automatically seeded upon the first database connection. If needed, you can run a clean database seeding from the backend.

## Development

To run the full project locally:

1. **Backend**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

Core Architecture: Controller → Service → Model → Route
