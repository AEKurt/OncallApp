# Firebase Setup Guide

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `oncall-schedule-app`
4. Enable Google Analytics (optional)
5. Create project

## 🔐 Step 2: Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get started"
3. Enable **Google** sign-in provider
4. Add your email to authorized domains

## 📊 Step 3: Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click "Create database"
3. Choose **Production mode** (we'll add rules later)
4. Select location (closest to your users)

## 🔒 Step 4: Firestore Security Rules

Replace the default rules with:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Team documents
    match /teams/{teamId} {
      // Allow read if user is a member
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.members;
      
      // Allow write if user is a member (for updates like leaving team, schedule changes)
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.members;
      
      // Allow create for authenticated users (creating new teams)
      allow create: if request.auth != null;
      
      // Allow delete ONLY for team creator
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.createdBy;
      
      // Activity subcollection
      match /activity/{activityId} {
        // Members can read activity logs
        allow read: if request.auth != null && 
                       request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        // Members can create activity logs
        allow create: if request.auth != null && 
                         request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        // Allow delete for team creator (when team is deleted)
        allow delete: if request.auth != null;
      }
    }
    
    // User documents (optional - for future use)
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == userId;
    }
  }
}
\`\`\`

**Important Notes:**
- Members can update team documents (needed for leaving team, updating schedule)
- Activity logs are accessible to all team members
- **Teams can ONLY be deleted by their creator** (createdBy field)
- Activity logs can be deleted (for cleanup when team is deleted)
- Only authenticated users can create teams

## 🔑 Step 5: Get Firebase Config

1. Go to **Project Settings** (⚙️ icon)
2. Scroll to "Your apps"
3. Click **Web app** (</> icon)
4. Register app with nickname: `oncall-web`
5. Copy the config values

## 📝 Step 6: Add Environment Variables

Create `.env.local` in project root:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
\`\`\`

## 🚀 Step 7: Deploy to Vercel

Add the same environment variables in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add all 6 Firebase variables
5. Redeploy

## ✅ Done!

Your app is now ready with:
- ✅ Google Authentication
- ✅ Real-time Firestore sync
- ✅ Multi-user collaboration
- ✅ Secure access control

## 📊 Database Structure

\`\`\`
/teams/{teamId}
  - name: string
  - createdBy: userId
  - createdAt: timestamp
  - members: [userId1, userId2, ...]
  - teamMembers: TeamMember[]
  - users: User[]
  - schedule: Schedule
  - notes: DayNotes
  - settings: WeightSettings
  
  /activity/{activityId} (subcollection)
    - userId: string
    - userName: string
    - action: string
    - details: string
    - timestamp: ISO string

/users/{userId} (optional)
  - email: string
  - displayName: string
  - photoURL: string
  - teams: [teamId1, teamId2, ...]
\`\`\`

## 🔥 Free Tier Limits

Firebase Free (Spark) Plan:
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 1GB storage
- ✅ Unlimited real-time connections

**More than enough for small teams!** 🎉

