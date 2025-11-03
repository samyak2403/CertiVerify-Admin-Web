# 🚀 Quick Start Guide

## Your React Admin Portal is Ready!

### ✅ Firebase Configuration
Your Firebase credentials have been configured and are ready to use.

### 📦 Installation Complete
All dependencies have been installed.

---

## 🎯 Run the Application

### Development Mode (with hot reload):
```bash
cd react-admin
npm run dev
```

The app will automatically open at: **http://localhost:3000**

---

## 🔐 First Time Setup

### 1. Create Admin User in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ai-based-student**
3. Navigate to **Authentication** → **Users**
4. Click **Add User**
5. Create an admin account with email and password

### 2. Login to Admin Portal

Use the credentials you just created to login at `http://localhost:3000/login`

---

## 📱 Available Pages

- **Dashboard** (`/`) - Statistics and recent activity
- **Users** (`/users`) - Manage all users
- **Certificates** (`/certificates`) - Verify and manage certificates

---

## 🎨 Features

✨ **Modern Dark Theme** with gradient accents
🔒 **Secure Authentication** with Firebase
📊 **Real-time Data** from Firestore
🔍 **Search & Filter** functionality
✅ **Certificate Verification** system
📱 **Responsive Design** for all devices

---

## 🛠️ Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 📝 Firebase Collections Required

Make sure these collections exist in Firestore:

- `users` - User profiles
  - Fields: name, email, studentId, phone, certificateCount
  
- `certificates` - Certificate documents
  - Fields: studentName, title, type, issueDate, status, uploadDate

---

## 🎯 Next Steps

1. Run `npm run dev` to start the development server
2. Create an admin user in Firebase Console
3. Login and start managing certificates!

---

## 💡 Tips

- Press `Ctrl+C` to stop the development server
- Changes will auto-reload in the browser
- Check browser console for any errors
- Firebase config is in `src/firebase/config.js`

---

**Happy Coding! 🎉**
