# On-Call Schedule App

Ücretsiz yükleme ve kullanma talimatları.

## 🚀 Vercel ile Deploy

### Adım 1: Vercel Hesabı Oluştur
1. [vercel.com](https://vercel.com) adresine git
2. GitHub ile giriş yap (ücretsiz)

### Adım 2: Projeyi GitHub'a Yükle
```bash
# Git repository oluştur
git init
git add .
git commit -m "Initial commit"

# GitHub'a push et
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Adım 3: Vercel'e Deploy Et
1. Vercel dashboard'a git
2. "Import Project" butonuna tıkla
3. GitHub repository'ni seç
4. "Deploy" butonuna tıkla
5. **Bitti!** 🎉

Deploy sonrası otomatik URL alacaksınız:
- `https://your-project-name.vercel.app`

### Özel Domain Eklemek (İsteğe Bağlı)
1. Vercel dashboard'da projeyi aç
2. "Settings" → "Domains"
3. Domain'ini ekle
4. DNS ayarlarını güncelle

---

## 🌐 Netlify ile Deploy (Alternatif)

### CLI ile Deploy
```bash
# Netlify CLI kur
npm install -g netlify-cli

# Build et
npm run build

# Deploy et
netlify deploy --prod
```

### GitHub ile Otomatik Deploy
1. [netlify.com](https://netlify.com) hesabı aç
2. "New site from Git" seç
3. GitHub repo'nu bağla
4. Build ayarları:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Deploy et

---

## ⚙️ Gerekli Ayarlar

### Environment Variables
Eğer gelecekte API key vs. eklersen, Vercel/Netlify'da:
1. Settings → Environment Variables
2. Değişkenleri ekle

### Build Komutları
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

---

## 📊 Ücretsiz Limitler

### Vercel (Hobby Plan)
- ✅ Sınırsız deployment
- ✅ 100 GB bandwidth/ay
- ✅ Serverless functions
- ✅ Otomatik HTTPS
- ✅ Custom domain

### Netlify (Free Plan)
- ✅ 100 GB bandwidth/ay
- ✅ 300 build minutes/ay
- ✅ Otomatik deploy

### Cloudflare Pages
- ✅ Sınırsız bandwidth
- ✅ Sınırsız requests
- ✅ Hızlı global CDN

---

## 🔧 Deploy Öncesi Kontrol

```bash
# Local'de test et
npm run build
npm run start

# Hata yoksa deploy'a hazırsın!
```

---

## 💡 Pro İpuçları

1. **GitHub Integration:** Her push'da otomatik deploy
2. **Preview Deployments:** Her PR için önizleme
3. **Analytics:** Vercel Analytics ekle (ücretsiz)
4. **Edge Functions:** Serverless fonksiyonlar kullan
5. **Custom Domain:** Ücretsiz SSL ile

---

## 🆘 Sorun Giderme

### Build Hatası
```bash
# Local'de build dene
npm run build

# Dependencies kontrol et
npm install
```

### Deploy Hatası
- Node.js versiyonunu kontrol et (18+)
- Package.json'da "engines" ekle
- Build log'larını incele

---

## 📱 Sonuç

En kolay yol:
1. GitHub'a push et
2. Vercel'e bağla
3. **Deploy!** 🚀

**Tahmini süre:** 5 dakika
**Maliyet:** ₺0 (Ücretsiz!)

