# 🔥 Firebase Database Cleanup Guide

## ⚠️ SİLMEDEN ÖNCE OKUYIN!

### 📊 Mevcut Database Yapısı

```
/teams/{teamId}
  ├─ name: "Team Name"
  ├─ createdBy: "user_uid"
  ├─ createdAt: "2024-10-31T..."
  ├─ members: ["uid1", "uid2", ...]
  ├─ teamMembers: [
  │    { uid, email, displayName, photoURL, role, joinedAt },
  │    ...
  │  ]
  ├─ users: [
  │    { id, name, totalWeight, color },
  │    ...
  │  ]
  ├─ schedule: { "2024-10-31": "userId", ... }
  ├─ notes: { "2024-10-31": "note text", ... }
  ├─ settings: { weekdayWeight, weekendWeight, holidayWeight }
  └─ /activity/{activityId} (subcollection)
       ├─ userId
       ├─ userName
       ├─ action
       ├─ details
       └─ timestamp
```

---

## 🛡️ GÜVENLİ OLARAK NE SİLİNEBİLİR?

### ✅ **GÜVENLİ** - Silinebilir:

#### 1. Test Takımları
```
Özellikler:
- "test", "deneme" gibi isimler
- Tek üyeli takımlar
- Boş schedule'lar
- Activity log'u az
```
**Etki:** ❌ Üretim verilerini etkilemez

#### 2. Activity Logs (Subcollection)
```
/teams/{teamId}/activity/{activityId}
```
**Etki:** ⚠️ Sadece geçmiş aktivite kaydı kaybolur, uygulama çalışmaya devam eder

#### 3. Eski/Terk Edilmiş Takımlar
```
Özellikler:
- members array boş
- Son aktivite çok eski
- Schedule güncel değil
```
**Etki:** ❌ Kimse kullanmıyorsa problem olmaz

---

## ⛔ **TEHLİKELİ** - Dikkatli Silinmeli:

#### 1. Aktif Takımlar
```
Özellikler:
- 2+ üye var
- Schedule dolu
- Son aktivite yakın tarihli
```
**Etki:** 🔥 Kullanıcılar verilerini kaybeder!

#### 2. Members Array'i Manuel Düzenleme
```
Tehlike: 
- members = ["uid1"] ← Silinirse kullanıcı erişemez
- teamMembers eksik ← Rol bilgisi kaybolur
```
**Etki:** 🔥 Kullanıcılar takıma erişemez!

---

## 🔧 TUTARSIZLIKLARI DÜZELTME REHBERİ

### Sorun 1: `members` ve `teamMembers` uyumsuz

**Tespit:**
```javascript
members: ["uid1", "uid2", "uid3"]
teamMembers: [
  { uid: "uid1", ... },
  { uid: "uid2", ... }
  // uid3 eksik!
]
```

**Çözüm:**
1. **Otomatik:** Uygulama kendisi düzeltsin (önerilen)
2. **Manuel:** Firestore Console'da teamMembers'a eksik uid'yi ekle
3. **Silme:** Eğer uid3 artık yoksa, members'dan çıkar

### Sorun 2: Schedule'da olmayan kullanıcılar

**Tespit:**
```javascript
schedule: {
  "2024-10-31": "user_xyz"  // Bu user artık users array'inde yok!
}
```

**Çözüm:**
```javascript
// Console'da çalıştır (JavaScript)
const schedule = doc.data().schedule;
const users = doc.data().users;
const userIds = users.map(u => u.id);

const cleanSchedule = {};
Object.entries(schedule).forEach(([date, userId]) => {
  if (userIds.includes(userId)) {
    cleanSchedule[date] = userId;
  }
});

// Update
updateDoc(docRef, { schedule: cleanSchedule });
```

### Sorun 3: Duplicate members

**Tespit:**
```javascript
members: ["uid1", "uid1", "uid2"]  // uid1 duplicate!
```

**Çözüm:**
```javascript
// Console'da
const uniqueMembers = [...new Set(doc.data().members)];
updateDoc(docRef, { members: uniqueMembers });
```

---

## 🚀 TEMİZLEME ADIMLARI

### Adım 1: Yedek Al (ÇOK ÖNEMLİ!)

1. Firebase Console → Firestore Database
2. **Export** butonuna tıkla
3. `teams` collection'ını seç
4. Cloud Storage'a export et
5. İndirip bilgisayarına kaydet

**Alternatif:** Uygulama içinden Data Management → Export All

### Adım 2: Temizlenecekleri Belirle

**Test Takımları:**
```
1. Firestore Console → teams collection
2. Filtrele:
   - members.length = 1 (tek kişilik)
   - name contains "test"
   - createdAt < (1 hafta öncesi)
```

### Adım 3: Güvenli Silme

**Önce Test Et:**
```
1. Bir test takımını sil
2. Uygulamayı kontrol et
3. Hata yoksa devam et
```

**Toplu Silme:**
```javascript
// Firebase Console → Query
// Sakın üretim verilerini silme!
const query = collection(db, 'teams')
  .where('name', '>=', 'test')
  .where('name', '<=', 'test\uf8ff');

// Her birini tek tek kontrol et ve sil
```

### Adım 4: Activity Logs Temizle (Opsiyonel)

Activity logs sadece history için, silinebilir:
```
/teams/{teamId}/activity
```

**Etki:** Sadece geçmiş kayıtlar gider, uygulama etkilenmez

---

## 🔍 TUTARSIZLIK KONTROL SCRIPT'İ

```javascript
// Firebase Console → Query sekmesinde çalıştır

async function checkTeamConsistency(teamId) {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  const data = teamDoc.data();
  
  console.log(`\n=== Checking Team: ${data.name} ===`);
  
  // 1. Members vs TeamMembers check
  const membersSet = new Set(data.members || []);
  const teamMembersUids = (data.teamMembers || []).map(m => m.uid);
  const teamMembersSet = new Set(teamMembersUids);
  
  console.log('Members count:', membersSet.size);
  console.log('TeamMembers count:', teamMembersSet.size);
  
  if (membersSet.size !== teamMembersSet.size) {
    console.warn('⚠️ MISMATCH: members and teamMembers count different!');
  }
  
  // 2. Schedule users check
  const userIds = (data.users || []).map(u => u.id);
  const scheduleUserIds = Object.values(data.schedule || {});
  const invalidScheduleUsers = scheduleUserIds.filter(uid => !userIds.includes(uid));
  
  if (invalidScheduleUsers.length > 0) {
    console.warn('⚠️ INVALID SCHEDULE USERS:', invalidScheduleUsers);
  }
  
  // 3. Creator check
  if (!membersSet.has(data.createdBy)) {
    console.warn('⚠️ CREATOR NOT IN MEMBERS!');
  }
  
  console.log('✅ Check complete\n');
}

// Kullanım:
checkTeamConsistency('team_xxxxx');
```

---

## 💡 ÖNERİLER

### 🟢 **YAPILMASI GEREKENLER:**

1. ✅ **Yedek al** (mutlaka!)
2. ✅ Test takımlarını sil (güvenli)
3. ✅ Eski activity logs'u sil (performans için)
4. ✅ Duplicate members'ları temizle
5. ✅ Schedule'da olmayan user'ları temizle

### 🔴 **YAPILMAMASI GEREKENLER:**

1. ❌ Aktif takımları silme
2. ❌ Üretim `members` array'ini manuel düzenleme
3. ❌ Yedek almadan toplu silme
4. ❌ Tüm collection'ı silme
5. ❌ `createdBy` field'ını değiştirme

---

## 🆘 SORUN ÇIKARSA:

### Plan A: Yedekten Geri Yükle
```
1. Firebase Console → Import
2. Önceki export'u seç
3. Restore et
```

### Plan B: Uygulama Tarafında Düzelt
```
Uygulama zaten şunları handle ediyor:
- Eksik teamMembers → Kullanıcı yeniden join olabilir
- Boş schedule → Yeni schedule oluşturulabilir
- Eksik settings → DEFAULT_WEIGHTS kullanılır
```

---

## 📞 SORUN VARSA:

Eğer silmeden önce emin değilsen:
1. Yedek al
2. Bir test takımıyla dene
3. Sorun yoksa devam et

**Unutma:** Firebase'de "soft delete" yok, silinen veri gerçekten gider!

---

## ✅ ÖZET:

| Ne Silinecek | Güvenli mi? | Etki |
|--------------|-------------|------|
| Test takımları | ✅ Evet | Yok |
| Activity logs | ✅ Evet | Sadece history |
| Eski takımlar | ⚠️ Dikkatli | Kullanıcı kaybı |
| Aktif takımlar | ❌ Hayır | Veri kaybı |
| members array | ❌ Hayır | Erişim kaybı |

**En Güvenli Yöntem:** Uygulamayı kullan, Firebase Console'dan doğrudan silme!

