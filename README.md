# 💻 MetaHub

![image](https://github.com/VictorBravim/MetaHub/assets/122113588/872b9eeb-e6df-4da2-944c-5c1704bbbab9)

## 🚀 Overview

MetaHub is a social media application built using React and Firebase. The platform allows users to create personalized profiles, publish content, follow other users, and interact with posts through likes. The application is designed to provide a smooth and interactive user experience, leveraging modern front-end and back-end technologies.

## 📋 Requirements

- Node.js
- Firestore
- React Router
- React Icons

## 🔧 Installation

1. Clone the repository:

```
git clone https://github.com/VictorBravim/MetaHub.git
```

2. Navigate to the project directory:

```
cd MetaHub
```

3. Install the dependencies:

```
npm install
```

## 🛠️ Project Rules

- FireStore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /users/{userId}/followers/{followerId} {
      allow write: if request.auth != null && request.auth.uid != null && request.auth.uid == followerId;
    }

    match /posts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

- Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /postImages/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /profileImages/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📄 License

- This project is licensed under the [MIT License](LICENSE).
