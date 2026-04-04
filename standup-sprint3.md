# Sprint 3 Stand-Up — Jooho Kim

---

**1. What have you accomplished?**

Completed the following user dashboard frontend tickets this sprint:

- **#54** – Implemented frontend component for background check document upload (PDF/JPG/PNG), including file selection, submit, and remove functionality
- **#56** – Implemented profile settings component: profile picture upload with live preview, address field, and password change form with validation
- **#58** – Implemented frontend logic to display background check status (Pending / Approved badge) on the dashboard overview
- **#60** – Designed and built UI for volunteer history (with total hours summary) and upcoming shifts list
- **#75** – Implemented shift cancellation component with inline confirmation flow

Additional improvements made:
- Added a weekly calendar view for upcoming shifts (toggleable with list view), with week navigation and time-block rendering
- Removed the Certificate section (per team agreement)
- Sidebar profile avatar and user info centered

---

**2. What is blocking you or causing you concerns?**

Currently waiting on backend integration — all features are running on mock data (`mockUsers.js`). Once the backend API endpoints are ready, the frontend will need to be updated to replace mock data with real API calls. This is a dependency that could affect testing and final delivery.

---

**3. What do you intend to accomplish next?**

- Pull in frontend tasks from other user stories that are not yet started and complete them ahead of schedule
- Once frontend work is wrapped up, plan to assist with backend integration or testing depending on team needs
