# AI Resume Optimizer & Personal Career Coach 🚀
*(Yapay Zekâ Destekli CV Optimizasyonu ve Akıllı Kariyer Asistanı)*

Bu proje; iş başvurusu süreçlerini hızlandırmak, adayların mevcut özgeçmişlerini hedef iş ilanlarına en ideal şekilde uyarlamak, mülakatlara hazırlanmak ve kariyer planlaması yapmak üzere sıfırdan tasarlayıp geliştirdiğim **üretim kalitesinde (production-ready)**, tam yığınlı (Full-Stack) yapay zekâ platformudur.

---

## 📌 Mimari Vizyon ve Çözülen Problemler (Architectural Vision)

Modern iş alımlarında adaylar, otomatik takip sistemleri (**ATS - Applicant Tracking Systems**) ve hızlı ön eleme süreçleri nedeniyle fark edilmekte zorlanmaktadır. Projenin ana hedefi, adayların gerçek yetkinliklerini abartıdan uzak tutarak, hedeflenen rollerin "diliyle" ifade edebilen güvenli bir asistan sunmaktır.

Portföyümün kalitesini ve teknik olgunluğunu yansıtacak şekilde kurguladığım mimari detaylar:

### 1. 🔒 Güvenlik & Sıfır İstemci Sızıntısı (Zero-Client Key Leakage)
*   Tüm API anahtarları, hassas konfigürasyonlar ve harici servis çağrıları sunucu katmanında (`server.ts`) izole edilmiştir.
*   Tarayıcı tarafına (client-side) hiçbir şekilde API key veya gizli değişken sızdırılmaz.

### 2. 🛡️ SSRF Koruması (SSRF Shielding)
*   Kullanıcıların hedef iş ilanlarını analiz edebilmesi için sunulan link tarama (`/api/parse-job-posting`) servisinde, sunucunun yerel ağlara veya bulut metadata servislerine erişmesini engelleyen özel **SSRF Filtreleme** algoritması geliştirilmiştir.
*   Giriş yapılan URL'lerin şeması (yalnızca `http`/`https`), localhost IP'leri (`127.0.0.1`, `0.0.0.0`, `::1`), RFC 1918 özel ağ aralıkları (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), ve link-local bulut metadata adresleri (`169.254.169.254`) regex ve octet kontrol mekanizmalarıyla engellenir.

### 3. 🚦 Akıllı Hız Sınırlandırıcı Mekanizması (In-Memory Rate-Limiter)
*   Sistemi kötü amaçlı döngülerden, bütçe tüketim risklerinden ve DoS (Denial of Service) girişimlerinden korumak amacıyla sunucu tarafında IP tabanlı **Zaman-Pencereli Hız Sınırlandırıcı** entegre edilmiştir.
*   Her API fonksiyonuna özel limitler (Örn: Ağır yapay zekâ görselleri için dakikada 3 istek, chat servisleri için dakikada 20 istek gibi) belirlenmiştir.

### 4. 📦 Katmanlı Payload Sınırlandırması (DoS Protection)
*   Uygulamadaki tüm JSON gövde (body) limitleri varsayılan olarak güvenli `2mb` eşiğine çekilmiştir.
*   Base64 PDF yükleme gereksinimi duyan `/api/parse-resume-pdf` rotası, rotalar seviyesinde izole edilerek sadece bu endpoint için kontrollü `15mb` limiti etkin kılınmıştır.

### 5. 🎯 Merkezi Model Konfigürasyonu (Model Registry Pattern)
*   Gemini API'sindeki model deprecation veya versiyon güncellemelerinde kod genelinde oluşabilecek kırılmaları önlemek adına, tüm yapay zekâ model atamaları sunucu tarafında tek bir `MODEL_CONFIG` nesnesinde merkezileştirilmiştir.

---

## 🧠 Sektörel Yetenekler ve Teknolojik Çözümler

Platform akıcı bir kullanıcı deneyimi sunabilmek adına modüler mikro-etkileşimlerle donatılmıştır:

*   **Akıllı CV Ayrıştırma:** Google Gen AI SDK yardımıyla, yüklenen PDF dosyalarındaki yapılandırılmamış verileri anlamsal olarak analiz eder ve kusursuz bir JSON şemasına dönüştürür.
*   **İş İlanı Analizörü:** Hedef iş tanımındaki teknik kelimeleri, yetkinlikleri ve beklenen sorumlulukları süzerek dinamik bir gereksinim profili çıkarır.
*   **Dinamik CV Optimizasyon Motoru:** Adayın gerçek tecrübe geçmişini bozmadan, iş profilindeki anahtar kelimeler ve beklentilerle ATS uyumlu olacak şekilde yeniden dilde harmanlar.
*   **İnteraktif Değişiklik Paneli (Audit Panel):** Önerilen biçimlendirmeleri ve kelime değişikliklerini eski/yeni haliyle yan yana gösteren (inline diff) ve ATS skor raporunu sunan kullanıcı dostu takip ekranı sunar.
*   **Sesli Mülakat Provası (TTS):** Optimize edilen CV özetlerini veya mülakat esnasında kullanılacak "asansör konuşmalarını" (elevator pitch) sunucu tarafında ses dosyası haline getirerek tarayıcı üzerinden mülakat provası yapılmasına olanak tanır.
*   **Birebir Kariyer Koçu Sohbeti:** Gelişmiş hafıza bağlamına sahip sohbet arayüzü sayesinde adaya özel hazırlanan akıllı mülakat simülasyonları ve kariyer danışmanlığı yürütülür.
*   **Kurumsal Avatar Tasarımcısı:** Sektörel formatlara (Corporate, Creative, Technical) göre profesyonel kalitede kişiselleştirilmiş LinkedIn veya özgeçmiş avatarları oluşturur.

---

## 🛠️ Teknik Altyapı ve Kurulum (Technical Stack & Setup)

### Teknolojik Tercihler
*   **Frontend:** React (TypeScript), Vite, Tailwind CSS, Motion (Akıcı mikro-etkileşim animasyonları), Lucide React.
*   **Backend:** Node.js, Express, Google Gen AI SDK (`@google/genai`).

### Yerel Kurulum Adımları

1.  Proje ana dizininde bir `.env` dosyası oluşturun:
    ```env
    # Gemini API anahtarlarınızı buraya ekleyin
    GEMINI_API_KEY="Birincil_API_Anahtarınız"
    GEMINI_API_KEY2="Alternatif_Yedek_API_Anahtarınız"
    ```

2.  Projeyi çalıştırmak için aşağıdaki NPM scriptlerini kullanabilirsiniz:

    *   **Geliştirme Sunucusu (Dev):**
        ```bash
        npm run dev
        ```
        *(Sunucuyu ve Vite arayüzünü localhost:3000 portu üzerinden senkronize bir biçimde başlatır).*

    *   **Üretim Derlemesi (Build):**
        ```bash
        npm run build
        ```
        *(Sistem kodunu optimize eder ve Node sunucusunu dist/server.cjs olarak paketler).*

    *   **Canlı Ortam Başlatma (Start):**
        ```bash
        npm run start
        ```
        *(Express sunucusunu yayına alır).*

    *   **Hataları Giderme & Tip Kontrolü (Lint):**
        ```bash
        npm run lint
        ```
        *(TypeScript yazım ve tip kurallarını kontrol eder).*

---
*Bu proje, modern yazılım mimarisi, uç nokta güvenliği ve ileri düzey yapay zekâ entegrasyonu prensipleri göz önünde bulundurularak hayata geçirilmiştir. Kariyer yolculuğunuz mükemmel bir özgeçmiş ile başlar!* 🍀
