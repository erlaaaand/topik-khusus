# NestJS Redis Caching Implementation 🚀

Proyek ini adalah implementasi fitur **Caching** menggunakan **Redis** pada *framework* **NestJS**. Proyek ini dibangun dengan menerapkan pedoman *Strict TypeScript* (tanpa `any` dan *non-null assertion*) serta dilengkapi dengan antarmuka dokumentasi interaktif menggunakan **Swagger (OpenAPI)**.

**Tugas Topik Khusus - Semester 6**
**Oleh:** Erland Agsya Agustian (NIM: 2311083007)
**Institusi:** Politeknik Negeri Padang

---

## 🛠️ Tech Stack

- **Backend Framework:** [NestJS](https://nestjs.com/) (v10+)
- **In-Memory Data Structure Store:** [Redis](https://redis.io/)
- **Language:** TypeScript (Strict Mode)
- **API Documentation:** Swagger / OpenAPI (`@nestjs/swagger`)
- **Cache Manager:** `@nestjs/cache-manager` & `cache-manager-redis-yet`

---

## 🏗️ Arsitektur & Alur Kerja (Caching Flow)

Proyek ini menggunakan pola **Cache-Aside Pattern**. Alur kerjanya pada *endpoint* `GET /users` adalah sebagai berikut:

1. **Client Request:** Klien meminta data *users*.
2. **Cache Check (Redis):** Sistem memeriksa apakah data `users:all` tersedia di dalam memori Redis.
3. **Cache Hit (Data Ditemukan):** Jika ada, sistem langsung mengembalikan data dari memori Redis dalam hitungan milidetik (**Sangat Cepat**).
4. **Cache Miss (Data Tidak Ada):** Jika tidak ada, sistem akan mengambil data dari *Database* (disimulasikan dengan *delay* 3 detik untuk meniru *query* berat).
5. **Cache Set:** Setelah data didapat dari *Database*, sistem menyimpannya ke dalam Redis dengan masa berlaku (TTL) selama 60 detik sebelum dikembalikan ke klien.
6. **Cache Invalidation:** Jika ada *request* `POST /users` (penambahan data baru), kunci `users:all` di Redis akan dihapus agar *request* selanjutnya mengambil data yang paling mutakhir.

---

## 📂 Struktur Folder

Proyek ini diatur menggunakan pendekatan *Feature Module* agar bersih dan mudah dipelihara:

```text
src/
├── app.module.ts              # Entry point module (Global Cache Registration)
├── main.ts                    # Bootstrap application & Swagger setup
├── common/
│   └── interfaces/
│       └── user.interface.ts  # Strict Type Definitions
└── users/
    ├── dto/
    │   └── create-user.dto.ts # Data Transfer Object (dengan Swagger Decorators)
    ├── users.module.ts        # Module fitur Users
    ├── users.controller.ts    # Routing & HTTP Method Definitions
    └── users.service.ts       # Business Logic & Redis Cache Implementation

```

---

## 💻 Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan perangkat Anda telah terinstal:

* **Node.js** (versi 18 atau terbaru)
* **Redis Server** berjalan di port default `6379`.

*(Bagi pengguna Windows, Redis dapat dijalankan menggunakan Docker, WSL (Ubuntu), atau menginstal Memurai).*

**Cara cepat menjalankan Redis via Docker:**

```bash
docker run -d --name my-redis -p 6379:6379 redis

```

---

## 🚀 Instalasi & Cara Menjalankan

1. **Clone repositori ini atau masuk ke direktori proyek:**
```bash
cd redis-implementation

```


2. **Instal semua dependensi:**
```bash
npm install

```


3. **Jalankan aplikasi di mode pengembangan (Development):**
```bash
npm run start:dev

```



Aplikasi akan berjalan secara lokal pada `http://localhost:3000`.

---

## 📖 API Documentation & Testing (Swagger UI)

Proyek ini telah dilengkapi dengan Swagger UI untuk memudahkan pengujian CRUD tanpa memerlukan aplikasi pihak ketiga.

Buka browser dan akses URL berikut:
👉 **[http://localhost:3000/api](https://www.google.com/search?q=http://localhost:3000/api)**

### Panduan Demonstrasi Performa Redis:

1. Buka halaman Swagger UI.
2. Buka *endpoint* `GET /users`, klik tombol **Try it out** lalu **Execute**.
3. **Percobaan Pertama:** Perhatikan waktu respons (*Server response time*). Waktu akan menunjukkan angka di atas 3000 ms (karena mengambil dari proses Database utama yang berat).
4. **Percobaan Kedua:** Klik **Execute** sekali lagi dalam rentang waktu kurang dari 60 detik. Perhatikan waktu respons akan turun drastis (hanya sekitar 5 - 15 ms) karena data langsung disajikan dari memori Redis!

```

Sudah jauh lebih rapi sekarang! Apakah kamu ingin saya bantu menyiapkan perintah `.gitignore` juga sebelum *project* ini kamu *push* ke GitHub?

```