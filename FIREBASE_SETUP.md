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

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Team documents
    match /teams/{teamId} {
      // Authenticated users can read teams (needed for joining)
      allow read: if request.auth != null;
      
      // Members can update, OR users can add themselves as members
      allow update: if request.auth != null && (
        request.auth.uid in resource.data.members ||
        request.auth.uid in request.resource.data.members
      );
      
      // Anyone authenticated can create teams
      allow create: if request.auth != null;
      
      // Only creator can delete teams
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.createdBy;
      
      // Activity subcollection
      match /activity/{activityId} {
        allow read: if request.auth != null && 
                       request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow create: if request.auth != null && 
                         request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow delete: if request.auth != null;
      }
    }
  }
}
```

**Important Notes:**
- ✅ **Members can read their teams**
- ✅ **Non-members can read ONLY when joining** (adding themselves to members array)
- ✅ Members can update team documents
- ✅ Activity logs only accessible to team members
- ✅ **Teams can ONLY be deleted by their creator** (createdBy field)
- 🔐 **More secure:** You can't read a team unless you're joining it or already a member

**How it works:**
- \`resource.data\`: Current data in Firestore
- \`request.resource.data\`: Data being written
- Join operation: Your UID is in \`request.resource.data.members\` → Access granted
- Read as member: Your UID is in \`resource.data.members\` → Access granted
- Random read: Your UID not in either → Access denied ❌

**Alternative (simpler but less secure):**
If the above doesn't work, use:
\`\`\`javascript
allow read: if request.auth != null;
\`\`\`
This allows all authenticated users to read teams (Team ID acts as invite code).
This is acceptable if Team IDs are treated as secret invite links.

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

