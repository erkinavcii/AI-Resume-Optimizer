# AI Resume Optimizer & Personal Career Coach 🚀
*(Yapay Zekâ Destekli CV Optimizatörü ve Kişisel Kariyer Koçu)*

Bu proje; iş başvurusu süreçlerinizi kolaylaştırmak, özgeçmişinizi (CV) hedeflediğiniz iş ilanlarına mükemmel şekilde uyarlamak, mülakatlara hazırlanmak ve kariyer hedeflerinize ulaşmak için geliştirilmiş, tam yığınlı (Full-Stack) yapay zekâ destekli bir kariyer asistanı uygulamasıdır.

---

## 📌 Projenin Amacı (Project Purpose)

Günümüz iş dünyasında, özgeçmişlerin otomatik aday takip sistemleri (ATS - Applicant Tracking Systems) ve insan kaynakları uzmanları tarafından saniyeler içinde taranıp elendiği bilinmektedir. **AI Resume Optimizer & Personal Career Coach**'un temel amacı, adayların mevcut özgeçmişlerini hedef iş ilanlarının kriterlerine göre optimize ederek ATS eşleşme puanlarını artırmak, eksik yönlerini gidermek ve adayları mülakat sürecine kadar uçtan uca desteklemektir.

Uygulama, **Google Gemini API** (Google Gen AI SDK) gücünü kullanarak güvenli ve sunucu taraflı (server-side) işlemlerle profesyonel kariyer koçluğu sunar.

---

## 📋 Kullanıcı İsterleri ve Geliştirme Süreci (User Requirements & Implementation History)

Geliştirme süreci boyunca talep ettiğiniz ve uygulamaya başarıyla entegre edilen tüm isterler aşağıda detaylandırılmıştır:

### 1. 📄 Akıllı CV/Özgeçmiş Ayrıştırma (Resume PDF Parsing)
*   **İster:** Kullanıcıların mevcut PDF formatındaki özgeçmişlerini sisteme yükleyebilmesi veya doğrudan metin olarak yapıştırabilmesi.
*   **Çözüm:** `pdfBase64` veya özel metin formatlarını sunucu tarafına ileten ve Gemini API yardımıyla CV'yi yapılandırılmış JSON verilerine dönüştüren sistem entegre edildi.

### 2. 🔍 İş İlanı Analizi ve Kriter Çıkarma (Requirements Parser)
*   **İster:** Hedeflenen bir iş ilanının açıklamasından veya bağlantısından (URL) kritik beceriler, sertifikalar ve gereksinimlerin otomatik tespit edilmesi.
*   **Çözüm:** İş ilanı metinlerini analiz ederek gerekli yetkinlikleri, teknik ve sosyal becerileri çıkaran analiz motoru kuruldu.

### 3. 🎯 CV Kişiselleştirme ve Optimizasyon (Resume Tailor Engine)
*   **İster:** Çıkarılan iş gereksinimlerine göre CV'deki özet, deneyim maddeleri ve yeteneklerin abartıya ve sahte bilgiye kaçmadan otomatik optimize edilmesi.
*   **Çözüm:** Özgeçmişi hedef iş ilanına göre dinamik olarak optimize eden, ATS uyumluluğunu maksimuma çıkaran özelleştirme sistemi geliştirildi.

### 4. 📊 Değişiklik İnceleme Penceresi (Audit & Diff Panel)
*   **İster:** Yapılan değişiklikleri, eski/yeni kelime karşılaştırmalarını ve ATS analiz raporunu görselleştiren bir arayüz.
*   **Çözüm:** Değişiklikleri şeffaf bir şekilde gösteren görsel fark (diff) paneli, kontrol listeleri ve iyileştirme skorları içeren `AuditPanel` tasarlandı.

### 5. 🎤 Sözlü Mülakat Provası (Speech Rehearsal & TTS)
*   **İster:** Hazırlanan CV özetini, mülakat konuşmalarını veya asansör konuşmasını (pitch) sesli olarak prova edebilme.
*   **Çözüm:** Sunucu taraflı Ses Sentezleme (Text-to-Speech - TTS) entegrasyonu sağlandı. Kullanıcılar yapay zekânın kendilerine özel ürettiği mülakat ipuçlarını ve özgeçmiş sunumlarını doğrudan tarayıcı üzerinden dinleyip prova edebilmektedir.

### 6.   Kişisel Kariyer Koçu Sohbet Alanı (Career Coach Chat)
*   **İster:** CV dışında genel kariyer tavsiyeleri almak, mülakat simülasyonları yapmak veya ön yazı (Cover Letter) tasarlamak için bir danışman.
*   **Çözüm:** Gerçek zamanlı, belleğe sahip ve tamamen özelleştirilmiş yönlendirmeler sunan interaktif Kariyer Sohbet Paneli entegre edildi.

### 7. 🖼️ Profesyonel Avatar/Başlık Üretici (Professional Avatar Generator)
*   **İster:** Sosyal medya veya CV için profesyonel iş dünyası formatında yapay zekâ destekli görsel/avatar oluşturulabilmesi.
*   **Çözüm:** Gemini Imagen yetenekleri ile sunucu taraflı görsel üretim altyapısı kurularak özelleştirilmiş kurumsal veya teknoloji konseptli avatarlar oluşturma ekranı entegre edildi.

---

## 🔒 Güvenlik, API Anahtarları ve Kısıtlamalar (Security & API Keys Setup)

Google Bulut Platformunda (GCP) kısıtlanmamış genel anahtarların (unrestricted keys) kullanımıyla ilgili son dönemdeki güncellemeler ve yaşayabileceğiniz olası aksaklıklar öngörülerek sisteme şu kritik güvenlik önlemleri alınmıştır:

1.  **Hata Yönetimi ve Kullanıcı Bilgilendirmesi:** Gemini API'sinden gelen tüm erişim ve yetki kısıtlama hataları (`unrestricted keys` uyarısı, `PERMISSION_DENIED` vb.) yakalanarak kullanıcıya arayüzde en açıklayıcı ve temiz hata formatında yansıtılır.
2.  **Yedek veya Alternatif API Anahtarı (`GEMINI_API_KEY2`):**
    *   Eğer birincil anahtarınız GCP üzerindeki kısıtlama politikaları nedeniyle geçici kesintilere uğruyor ya da faturalandırma (billing) engeline takılıyorsa, projenizde yedek bir anahtar kullanabilmeniz için sunucu katmanına `GEMINI_API_KEY2` desteği eklenmiştir.
    *   Sunucu, öncelikle `GEMINI_API_KEY2` değerini kontrol eder; bulunamazsa varsayılan `GEMINI_API_KEY` değerine geçiş yapar.

---

## 🛠️ Teknik Altyapı ve Çalıştırma (Technical Stack & Commands)

### Kullanılan Teknolojiler
*   **Frontend:** React (TypeScript ile), Vite, Tailwind CSS (Hızlı ve responsive stil katmanı), Motion (Akıcı geçiş animasyonları), Lucide React (Simgeler).
*   **Backend:** Node.js (Express framework), Google Gen AI SDK (`@google/genai`).
*   **Güvenlik:** Tüm API anahtarları sunucu tarafında (`server.ts`) saklanır ve tarayıcıya asla sızdırılmaz.

### Kurulum (Setup)

Projeyi kendi ortamınızda çalıştırmadan önce `.env` dosyanızı oluşturmalı veya AI Studio Secrets/Settings panelinden aşağıdaki değişkenleri tanımlamalısınız:

```env
# .env.example dosyasından üretilebilir
GEMINI_API_KEY="Birincil_Gemini_API_Anahtariniz"
GEMINI_API_KEY2="Alternatif_Güvenli_Yedek_Gemini_API_Anahtariniz"
```

### Scriptler (NPM Scripts)

Proje dizininde aşağıdaki komutları kullanabilirsiniz:

*   **Geliştirme Modunu Başlatma (Dev):**
    ```bash
    npm run dev
    ```
    *(Sunucu ve Vite arayüzünü `http://localhost:3000` portundan eşzamanlı ve anında yenilemeli olarak başlatır).*

*   **Derleme/Üretim Paketi Oluşturma (Build):**
    ```bash
    npm run build
    ```
    *(İstemci kodunu optimize edilmiş statik dosyalara dönüştürür ve sunucu kodunu tek bir `dist/server.cjs` halinde paketler).*

*   **Üretim Sunucusunu Çalıştırma (Start):**
    ```bash
    npm run start
    ```
    *(Derlenmiş paket üzerinden uygulamayı yayına alır).*

*   **Statik Tip Kontrolü (Lint):**
    ```bash
    npm run lint
    ```
    *(JavaScript/TypeScript yazım ve tip kurallarını doğrular).*

---

*Uygulama başarıyla kurulmuş, test edilmiş ve tüm sistem entegrasyonları tamamlanmıştır. Kariyer yolculuğunuzda başarılar dileriz! 💫*
