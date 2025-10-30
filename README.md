# 🚨 On-Call Schedule Uygulaması

Modern ve kullanıcı dostu bir nöbet çizelgesi yönetim uygulaması. Hafta içi ve hafta sonu ağırlıklarına göre adil yük dağılımı sağlar.

## ✨ Özellikler

- 📅 **Aylık Takvim Görünümü**: Tüm ayı tek bakışta görüntüleyin
- 👥 **Kullanıcı Yönetimi**: Kolay kullanıcı ekleme/çıkarma
- 🗑️ **Toplu Silme**: Tüm kullanıcıları tek tıkla silin
- 💾 **JSON Import/Export**: 
  - Kullanıcıları JSON formatında export/import edin
  - Tüm veriyi (kullanıcılar + schedule) yedekleyin ve geri yükleyin
- ⚖️ **Adil Yük Dağılımı**: Her kullanıcı eşit ağırlıkta yük alır
- 🎯 **Akıllı Algoritma**: 
  - Hafta içi günleri: 1.0x ağırlık
  - Hafta sonu günleri: 1.5x ağırlık
- 📊 **Detaylı İstatistikler**: Gerçek zamanlı yük dağılımı görselleştirmesi
- 💾 **Otomatik Kayıt**: LocalStorage ile veri kalıcılığı
- 🎨 **Modern UI**: Tailwind CSS ile şık ve responsive tasarım

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
```

3. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## 📖 Kullanım

### 1. Kullanıcı Ekleme
- "Kullanıcılar" sekmesine gidin
- İsim girip "Ekle" butonuna tıklayın
- İstediğiniz kadar kullanıcı ekleyebilirsiniz

### 2. Schedule Oluşturma
- "Takvim" sekmesine dönün
- "Otomatik Schedule Oluştur" butonuna tıklayın
- Algoritma otomatik olarak adil bir dağılım oluşturacaktır

### 3. Manuel Düzenleme
- Her günün altındaki açılır menüden istediğiniz kullanıcıyı seçebilirsiniz
- Değişiklikler otomatik olarak kaydedilir

### 4. İstatistikleri İnceleme
- Sağ taraftaki panelden her kullanıcının yük durumunu görebilirsiniz
- Ortalamaya göre kimin ne kadar yük aldığını takip edin

### 5. Veri Yedekleme
- **Export JSON**: Sadece kullanıcıları export edin
- **Tam Yedek Al**: Kullanıcıları VE schedule'ı birlikte yedekleyin
- **Yedeği Geri Yükle**: Tam yedeği geri yükleyin
- **Tümünü Sil**: Tüm kullanıcıları ve schedule'ı silin

### 6. JSON Dosya Formatı

**Kullanıcı Export Formatı:**
```json
{
  "users": [
    {
      "id": "1234567890",
      "name": "Ali Yılmaz",
      "totalWeight": 0
    }
  ],
  "exportDate": "2025-10-30T12:00:00.000Z",
  "version": "1.0"
}
```

**Tam Yedek Formatı:**
```json
{
  "users": [...],
  "schedule": {
    "2025-10-01": "user-id-1",
    "2025-10-02": "user-id-2"
  },
  "exportDate": "2025-10-30T12:00:00.000Z",
  "version": "1.0",
  "metadata": {
    "totalUsers": 4,
    "totalScheduledDays": 30
  }
}
```

## 🎯 Algoritma Detayları

Schedule algoritması şu prensiplerle çalışır:

1. **Ağırlık Sistemi**:
   - Pazartesi-Cuma: 1.0 puan
   - Cumartesi-Pazar: 1.5 puan

2. **Adil Dağılım**:
   - Her gün için en düşük toplam ağırlığa sahip kullanıcı seçilir
   - Bu sayede ay sonunda herkes yaklaşık eşit yük almış olur

3. **Esneklik**:
   - Otomatik oluşturulan schedule'ı manuel düzenleyebilirsiniz
   - Değişiklikler istatistiklere anında yansır

## 🛠️ Teknolojiler

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: Browser LocalStorage

## 📦 Proje Yapısı

```
oncall-app/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Ana sayfa
│   └── globals.css        # Global stiller
├── components/            # React bileşenleri
│   ├── Calendar.tsx       # Takvim görünümü
│   ├── UserManagement.tsx # Kullanıcı yönetimi
│   ├── Statistics.tsx     # İstatistikler
│   └── DataManagement.tsx # Veri yedekleme/geri yükleme
├── lib/                   # Utility fonksiyonlar
│   └── scheduler.ts       # Schedule algoritması
├── types/                 # TypeScript tipleri
│   └── index.ts          # Tip tanımları
└── package.json          # Bağımlılıklar
```

## 🎨 Ekran Görüntüleri

### Takvim Görünümü
- Tüm ayı görüntüleyin
- Her gün için nöbetçi atayın
- Hafta sonu günleri özel olarak işaretlenmiştir

### İstatistikler
- Gerçek zamanlı yük dağılımı
- Her kullanıcının toplam puanı
- Ortalamaya göre karşılaştırma

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 💡 İpuçları

- **Veri Kaybı**: Veriler localStorage'da saklanır, tarayıcı verileri temizlenirse silinir
- **Yedekleme**: Düzenli olarak "Tam Yedek Al" yapın! JSON dosyasını güvenli bir yerde saklayın
- **Import**: JSON dosyası import ederken mevcut tüm veriler silinir
- **Çoklu Ay**: Ok tuşları ile farklı ayları görüntüleyebilirsiniz
- **Adil Dağılım**: En adil dağılım için "Otomatik Schedule Oluştur" kullanın
- **Manuel Düzenleme**: Özel durumlar için manuel olarak günleri değiştirebilirsiniz
- **Toplu Silme**: "Tümünü Sil" butonu hem kullanıcıları hem schedule'ı temizler

## 🐛 Bilinen Sorunlar

Şu anda bilinen bir sorun bulunmamaktadır.

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

**Yapımcı**: AI + Human Collaboration 🤖❤️👨‍💻

# oncall-app
