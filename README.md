# 🚨 On-Call Schedule Manager

A modern, feature-rich on-call scheduling application with team collaboration, Firebase real-time sync, and intelligent scheduling algorithms. Built with Next.js, TypeScript, and Firebase.

[🇹🇷 Türkçe README](#tr)

---

## ✨ Features

### 🔐 **Authentication & Teams**
- **Google Sign-In**: Secure authentication via Firebase
- **Team Management**: Create and join teams with invite codes
- **Role-Based Access**: Admin and member roles with different permissions
- **Team Members**: View all team members with roles
- **Activity Log**: Track all team activities in real-time

### 📅 **Advanced Scheduling**
- **Monthly Calendar View**: View entire month at a glance
- **Primary & Secondary On-Call**: Assign both primary and backup personnel
- **Multiple Strategies**: 5 different auto-assignment algorithms
  - Balanced (fair distribution by weight)
  - Consecutive (weekly rotations)
  - Round-Robin (simple rotation)
  - Random (randomized assignment)
  - Minimize Weekends (reduce weekend load)
- **Weight System**: Configurable weights for weekdays, weekends, and holidays
- **Per-Month Settings**: Different weight configurations for each month
- **Month Locking**: Lock months to prevent accidental edits

### 🚫 **Unavailability Management**
- **Mark Unavailable**: Users can mark days they're unavailable
- **Optional Reasons**: Add context for unavailability
- **Smart Scheduling**: Auto-scheduling respects unavailability
- **Visual Indicators**: See who's unavailable at a glance

### 💬 **Collaboration Features**
- **Slack-Style Comments**: Threaded discussions for each day
- **Markdown Support**: Rich text with code blocks and links
- **User Attribution**: See who wrote what and when
- **Edit & Delete**: Manage your own comments

### 📚 **Knowledge Management**
- **Environment Info**: Store critical on-call resources
- **Categories & Tags**: Organize information efficiently
- **Priority Levels**: Mark critical vs. normal resources
- **Secret Reveal**: Hide sensitive information until needed
- **Search & Filter**: Quickly find what you need

### 📊 **Statistics & Analytics**
- **Real-Time Load Distribution**: See who's carrying what load
- **Primary vs. Secondary**: Track both assignment types
- **Visual Progress Bars**: Colorful, easy-to-read charts
- **Comparison**: Above/below average indicators

### 🎨 **Modern UI/UX**
- **Dark/Light Mode**: Switch themes instantly
- **Vercel-Inspired Design**: Clean, minimalist aesthetic
- **Responsive**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Professional transitions and effects

### ☁️ **Real-Time Sync**
- **Firebase Firestore**: Cloud-based data storage
- **Live Updates**: Changes sync across all devices instantly
- **Offline Support**: Works offline with local cache
- **Activity Logging**: Complete audit trail

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account (free tier works!)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/oncall-app.git
cd oncall-app
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Set up Firebase**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Google Authentication
   - Create a Firestore database
   - Copy your Firebase config

4. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. **Set up Firestore Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               request.auth.uid in resource.data.members;
    }
    
    match /activityLogs/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

6. **Run the development server**:
```bash
npm run dev
# or
yarn dev
```

7. **Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide

### 1. **Sign In**
- Click "Sign in with Google"
- Authorize the application

### 2. **Create or Join a Team**
- **Create Team**: Enter a team name and click "Create Team"
- **Join Team**: Enter an invite code and click "Join Team"

### 3. **Add Users**
- Go to the "Users" tab
- Add team members to the on-call roster
- Assign colors to each user for easy identification

### 4. **Generate Schedule**
- Go to the "Calendar" tab
- Click "Auto Assign" button
- Select your preferred strategy
- Adjust weight settings if needed

### 5. **Manual Adjustments**
- Click on any day to assign primary on-call
- Click "Backup" button to assign secondary on-call
- Changes save automatically

### 6. **Mark Unavailability**
- Click the 🚫 button on any day
- Add an optional reason
- System will avoid assigning you on those days

### 7. **Add Comments**
- Click the 💬 button on any day
- Add notes, handoff information, or incidents
- Use Markdown for rich formatting

### 8. **Manage Environment Info**
- Click the "📚" button (bottom right)
- Add critical resources, runbooks, or documentation
- Organize with categories and tags

### 9. **Lock Months**
- Admins can lock completed months
- Prevents accidental changes to historical data
- Unlock when needed

### 10. **View Statistics**
- Click "Statistics" button
- See load distribution
- Compare primary vs. secondary assignments

---

## 🎯 Scheduling Algorithms

### 1. **Balanced (Default)**
- Fair distribution based on cumulative weight
- Considers weekday/weekend/holiday multipliers
- Best for: Most teams

### 2. **Consecutive**
- Users work consecutive days (e.g., weekly rotations)
- Configurable consecutive day count
- Best for: Weekly rotation schedules

### 3. **Round-Robin**
- Simple rotation, one day at a time
- Predictable pattern
- Best for: Small teams with equal availability

### 4. **Random**
- Randomized assignment with optional seed
- Unpredictable but fair over time
- Best for: Testing or when no pattern is preferred

### 5. **Minimize Weekends**
- Prioritizes fair weekend distribution
- Reduces weekend burden
- Best for: Teams wanting to balance weekend load

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Markdown**: react-markdown, remark-gfm

---

## 📦 Project Structure

```
oncall_app/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main application page
│   └── globals.css          # Global styles (Vercel theme)
├── components/              # React components
│   ├── Calendar.tsx         # Main calendar view
│   ├── UserManagement.tsx   # User roster management
│   ├── Statistics.tsx       # Load distribution stats
│   ├── Settings.tsx         # Weight & strategy settings
│   ├── TeamSelection.tsx    # Create/join teams
│   ├── TeamMembers.tsx      # Team member list
│   ├── ActivityLog.tsx      # Activity history
│   ├── LoginPage.tsx        # Google sign-in
│   ├── DayNotesThread.tsx   # Slack-style comments
│   ├── EnvironmentInfo.tsx  # Resource management
│   ├── ThemeToggle.tsx      # Dark/light mode switch
│   └── CustomDialogs.tsx    # Styled dialogs
├── contexts/                # React contexts
│   ├── AuthContext.tsx      # Authentication state
│   └── ThemeContext.tsx     # Theme state
├── hooks/                   # Custom React hooks
│   └── useTeamData.ts       # Firebase data management
├── lib/                     # Utility functions
│   ├── scheduler.ts         # Scheduling algorithms
│   └── firebase.ts          # Firebase configuration
├── types/                   # TypeScript definitions
│   └── index.ts            # Type definitions
└── package.json            # Dependencies
```

---

## 🎨 Theming

The app features a **Vercel-inspired design system**:

- **Pure black/white base** with subtle grays
- **Blue-cyan-purple gradients** for accents
- **Minimal borders** with hover effects
- **Smooth transitions** (0.15s cubic-bezier)
- **Clean typography** with system fonts

### Available CSS Utilities:
- `.vercel-gradient` - Beautiful gradient backgrounds
- `.vercel-gradient-text` - Gradient text effects
- `.vercel-card` - Clean card design with hover effects
- `.vercel-button` - Sleek button styling
- `.vercel-grid-bg` - Subtle grid background

---

## 🔐 Security

- **Authentication Required**: All features require Google sign-in
- **Team-Based Access**: Users can only access their teams
- **Role-Based Permissions**: Admins have additional controls
- **Firestore Security Rules**: Server-side access control
- **No Public Data**: All data is team-specific and private

---

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly UI elements
- Mobile-optimized dialogs
- Swipe gestures supported
- Works offline with service worker

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 💡 Tips & Best Practices

### For Admins:
- Lock completed months to prevent accidental changes
- Regenerate invite codes if they're compromised
- Use month-specific settings for holidays
- Review activity log regularly

### For Team Members:
- Mark unavailability as early as possible
- Add detailed comments for handoffs
- Keep environment info up to date
- Sync team members to user roster

### For Everyone:
- Use comments for incident documentation
- Add reasons when marking unavailable
- Check the calendar regularly
- Keep your profile information current

---

## 🐛 Known Issues

- None at the moment! 🎉

Found a bug? [Open an issue](https://github.com/yourusername/oncall-app/issues)

---

## 📄 License

This project is licensed under the MIT License.

---

## 📧 Contact

Questions? Issues? Feature requests?
- Open an issue on GitHub
- Check existing issues first

---

<div id="tr"></div>

# 🇹🇷 Türkçe Dökümantasyon

## 🚨 Nöbet Çizelgesi Yöneticisi

Firebase gerçek zamanlı senkronizasyon, takım işbirliği ve akıllı zamanlama algoritmaları ile modern, özellik zengin bir nöbet çizelgesi uygulaması.

## ✨ Özellikler

### 🔐 **Kimlik Doğrulama & Takımlar**
- **Google ile Giriş**: Firebase üzerinden güvenli kimlik doğrulama
- **Takım Yönetimi**: Davet kodları ile takım oluştur ve katıl
- **Rol Tabanlı Erişim**: Farklı yetkilerle admin ve üye rolleri
- **Takım Üyeleri**: Tüm takım üyelerini rollerle görüntüle
- **Aktivite Günlüğü**: Tüm takım aktivitelerini gerçek zamanlı takip et

### 📅 **Gelişmiş Zamanlama**
- **Aylık Takvim Görünümü**: Tüm ayı tek bakışta görüntüle
- **Ana & Yedek Nöbetçi**: Hem ana hem yedek personel ata
- **Çoklu Stratejiler**: 5 farklı otomatik atama algoritması
  - Dengeli (ağırlığa göre adil dağılım)
  - Ardışık (haftalık rotasyonlar)
  - Sıralı (basit rotasyon)
  - Rastgele (randomize atama)
  - Hafta Sonu Minimizasyonu (hafta sonu yükünü azalt)
- **Ağırlık Sistemi**: Hafta içi, hafta sonu ve tatiller için ayarlanabilir ağırlıklar
- **Aylık Ayarlar**: Her ay için farklı ağırlık konfigürasyonları
- **Ay Kilitleme**: Kazara düzenlemeleri önlemek için ayları kilitle

### 🚫 **Müsaitlik Yönetimi**
- **Müsait Değil İşaretle**: Kullanıcılar müsait olmadıkları günleri işaretleyebilir
- **İsteğe Bağlı Nedenler**: Müsait olmama için bağlam ekle
- **Akıllı Zamanlama**: Otomatik zamanlama müsaitliği dikkate alır
- **Görsel İndikatörler**: Kimin müsait olmadığını bir bakışta gör

### 💬 **İşbirliği Özellikleri**
- **Slack Tarzı Yorumlar**: Her gün için zincirleme tartışmalar
- **Markdown Desteği**: Kod blokları ve linklerle zengin metin
- **Kullanıcı Atıfı**: Kimin ne yazdığını ve ne zaman yazdığını gör
- **Düzenle & Sil**: Kendi yorumlarını yönet

### 📚 **Bilgi Yönetimi**
- **Ortam Bilgisi**: Kritik nöbet kaynaklarını sakla
- **Kategoriler & Etiketler**: Bilgiyi verimli organize et
- **Öncelik Seviyeleri**: Kritik ve normal kaynakları işaretle
- **Gizli Göster**: Hassas bilgiyi gerekene kadar gizle
- **Ara & Filtrele**: İhtiyacını hızlıca bul

### 📊 **İstatistikler & Analizler**
- **Gerçek Zamanlı Yük Dağılımı**: Kimin ne yük taşıdığını gör
- **Ana vs. Yedek**: Her iki atama türünü de takip et
- **Görsel İlerleme Çubukları**: Renkli, kolay okunur grafikler
- **Karşılaştırma**: Ortalamanın üstü/altı göstergeleri

### 🎨 **Modern UI/UX**
- **Karanlık/Açık Mod**: Temaları anında değiştir
- **Vercel-İlhamlı Tasarım**: Temiz, minimalist estetik
- **Responsive**: Masaüstü, tablet ve mobilde çalışır
- **Pürüzsüz Animasyonlar**: Profesyonel geçişler ve efektler

### ☁️ **Gerçek Zamanlı Senkronizasyon**
- **Firebase Firestore**: Bulut tabanlı veri depolama
- **Canlı Güncellemeler**: Değişiklikler tüm cihazlarda anında senkronize olur
- **Çevrimdışı Destek**: Yerel önbellek ile çevrimdışı çalışır
- **Aktivite Günlüğü**: Tam denetim izi

---

**Yapımcı**: AI + Human Collaboration 🤖❤️👨‍💻

**Teknolojiler**: Next.js 14 · TypeScript · Firebase · Tailwind CSS

---

⭐ Bu projeyi beğendiyseniz bir yıldız bırakmayı unutmayın!
