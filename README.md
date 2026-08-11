<div align="center">
  <img src="https://img.icons8.com/color/96/000000/restaurant.png" alt="Logo" width="80" height="80">
  <h1 align="center">Rasoi Junction</h1>
  <p align="center">
    <strong>An Enterprise-Grade Restaurant Management System</strong>
    <br />
    <br />
    <a href="https://rasoijunction.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/Amankr0075/rasoijunction/issues">Report Bug</a>
    ·
    <a href="https://github.com/Amankr0075/rasoijunction/issues">Request Feature</a>
  </p>

  <!-- Badges -->
  <p align="center">
    <img src="https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## 📖 About The Project

**Rasoi Junction** is a comprehensive, full-stack Restaurant Management System built to streamline end-to-end restaurant operations. From the moment a customer views the menu to the final kitchen preparation and delivery, Rasoi Junction handles it all with a modern, responsive, and real-time user interface.

### ✨ Key Features

- **🛍️ Customer Portal**: Dynamic menu browsing, real-time cart management, secure checkout, and live order tracking.
- **👑 Admin Dashboard**: Comprehensive oversight over the entire system. Track revenue, manage inventory, view analytics, and control staff access.
- **👨‍🍳 Kitchen Display System (KDS)**: Real-time incoming order updates using WebSockets. Kitchen staff can manage queue statuses seamlessly.
- **🛵 Delivery Management**: Specialized rider views for assigning, tracking, and updating live delivery statuses.
- **🔒 Secure Architecture**: Robust JWT-based Authentication, Role-Based Access Control (RBAC), and encrypted passwords.
- **💳 Payment Gateway**: Fully integrated Razorpay checkout flow.

---

## 🛠️ Built With

The project utilizes the powerful **MERN** stack alongside modern UI libraries and tools:

### Frontend
- **React.js (Vite)** – High-performance UI rendering
- **Tailwind CSS** – Utility-first responsive styling
- **Framer Motion & Lottie** – Smooth micro-interactions and animations
- **Chart.js** – Data visualization for Admin Analytics
- **Socket.io-client** – Real-time bi-directional events

### Backend
- **Node.js & Express.js** – Scalable server infrastructure
- **MongoDB & Mongoose** – Flexible NoSQL database and ORM
- **Socket.io** – WebSocket integration for live order tracking
- **Nodemailer** – Automated email alerts and receipts
- **Razorpay API** – Payment processing

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [Git](https://git-scm.com/)
- A MongoDB cluster (e.g., [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amankr0075/rasoijunction.git
   cd rasoijunction
   ```

2. **Install all dependencies**  
   *(This project uses `concurrently` to run both client and server from the root directory)*
   ```bash
   npm run install-all
   ```
   *(If the script fails, simply run `npm install` inside the root, `/client`, and `/server` folders respectively).*

3. **Environment Setup**  
   Navigate to the `/server` folder and create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   # Add any other required keys (e.g., Razorpay, Nodemailer)
   ```

4. **Run the Application**
   From the **root directory**, start the development servers:
   ```bash
   npm run dev
   ```

   Your environments will be live at:
   - **Frontend:** `http://localhost:5173`
   - **Backend API:** `http://localhost:5000`

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ by <a href="https://github.com/Amankr0075">Aman</a></b>
</div>
