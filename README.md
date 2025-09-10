# React + Vite

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

⚡ Admin Dashboard (React + Vite)

A React + Vite Admin Dashboard with authentication, roles/permissions, package management, feedback system, audit logs, and advanced reporting.
Built for scalability and ease of use with RTK Query, TailwindCSS, Formik, Yup, and Chart.js.

✨ Features
🔑 Authentication

Email & OTP-based login flow

Secure session handling

## Roles & Permissions

| Module / Feature       | Super Admin 👑 | Admin ✅ | Manager ✅ | Viewer 👀 |
|-------------------------|----------------|----------|------------|-----------|
| 📊 Dashboard            | Yes            | Yes      | Yes        | Yes       |
| 👤 User Management      | Yes            | Yes      | Yes        | No        |
| 👥 Client Management    | Yes            | Yes      | Yes        | No        |
| 📦 Package Management   | Yes            | Yes      | Limited*   | No        |
| 📝 Feedbacks            | Yes            | Yes      | Yes        | No       |
| 🔍 Audit Logs           | Yes            | Yes      | No         | No        |
| ⚙️ Role & Permissions   | Yes            | Yes      | No         | No        |




📊 Dashboard

KPIs for users & clients

Daily activity chart (line/bar)

User distribution pie chart

👤 User Management

Add new users from dropdown

Users listing with filters

Role assignment (Admin, Manager, Viewer, etc.)

Role & permission management (Create, Update, Delete roles)

👥 Client Management

Clients dropdown with list of all clients

CRUD operations for clients

📦 Package Management

View all packages

Create new package

Update existing package

Audit trail of all package changes

📝 Feedback System

Collect feedbacks from users

View feedback reports

Export feedback reports as CSV

🔍 Audit Logs

Admin Audit Logs → track all admin actions

Package Audit Logs → track package changes (before/after state)

Feedback Audit Logs → track feedback changes

📤 Export & Reporting

Export audit logs in Excel

Export feedback reports in CSV

🛠️ Tech Stack

React 18 + Vite → frontend framework

Redux Toolkit Query → API data fetching & caching

Formik + Yup → forms & validation

TailwindCSS → UI styling

Chart.js → charts (activity, pie, KPIs)

React Hot Toast → notifications




## Developer Details
Created by Abdul Zakir 
frontend developer
gmail : abdulzakir632@gmail.com