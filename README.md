
# 🧠 Web Assessment Platform

A full-featured, modern assessment platform built using **React**, **Next.js**, **TypeScript**, and **Tailwind CSS**. This project supports separate interfaces for Admins and Candidates, enabling test creation, test-taking, and results management.

---

## 🚀 Features

### 👨‍💼 Admin Panel
- Create and manage tests
- View test results
- Dedicated admin routes

### 🧑‍🎓 Candidate Dashboard
- Take assessments
- View test results
- Intuitive and clean UI

---

## 🛠 Tech Stack

- **Frontend Framework**: [React](https://reactjs.org/)
- **Routing & Server Rendering**: [Next.js (App Router)](https://nextjs.org/docs/app)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Version Control**: Git & GitHub

---

## 📁 Folder Structure

```
assessment-platform/
├── app/                 # Routing and layouts for pages
│   ├── admin/           # Admin-specific pages
│   └── candidate/       # Candidate-specific pages
├── components/          # Shared reusable components
├── hooks/               # Custom React hooks
├── lib/                 # Utility and helper functions
├── public/              # Static assets (images, etc.)
├── styles/              # Global styles
├── package.json         # Project metadata and scripts
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
```

---

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/SOHAIL1510/web-assesment-platform.git
cd web-assesment-platform
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start the development server**
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📌 Upcoming Enhancements

- Authentication (Admin/Candidate login)
- Persistent database storage (MongoDB, PostgreSQL)
- Rich test analytics
- Timer and question randomization

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙌 Acknowledgments

Thanks to the open-source community and frameworks like React, Next.js, Tailwind, and TypeScript for making rapid development possible.
