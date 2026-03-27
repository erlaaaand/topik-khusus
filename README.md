# NestJS Redis Caching & RabbitMQ Messaging Implementation 🚀

Proyek ini adalah implementasi fitur **Caching** menggunakan **Redis** dan **Messaging** menggunakan **RabbitMQ** pada *framework* **NestJS**. Proyek ini dibangun dengan menerapkan pedoman *Strict TypeScript* (tanpa `any` dan *non-null assertion*) serta dilengkapi dengan antarmuka dokumentasi interaktif menggunakan **Swagger (OpenAPI)**.

**Tugas Topik Khusus - Semester 6**
**Oleh:** Erland Agsya Agustian (NIM: 2311083007)
**Institusi:** Politeknik Negeri Padang

---

## 🛠️ Tech Stack

- **Backend Framework:** [NestJS](https://nestjs.com/) (v10+)
- **In-Memory Data Structure Store:** [Redis](https://redis.io/)
- **Message Broker:** [RabbitMQ](https://www.rabbitmq.com/)
- **Language:** TypeScript (Strict Mode)
- **API Documentation:** Swagger / OpenAPI (`@nestjs/swagger`) v2.0
- **Cache Manager:** `@nestjs/cache-manager` & `cache-manager-redis-yet`
- **Microservices:** `@nestjs/microservices` (Transport: RMQ)

---

## 🏗️ Arsitektur & Alur Kerja

### Caching Flow (Cache-Aside Pattern)

Alur kerja pada *endpoint* `GET /users` adalah sebagai berikut:

1. **Client Request:** Klien meminta data *users*.
2. **Cache Check (Redis):** Sistem memeriksa apakah data `users:all` tersedia di dalam memori Redis.
3. **Cache Hit (Data Ditemukan):** Jika ada, sistem langsung mengembalikan data dari memori Redis dalam hitungan milidetik (**Sangat Cepat**).
4. **Cache Miss (Data Tidak Ada):** Jika tidak ada, sistem akan mengambil data dari *Database* (disimulasikan dengan *delay* 3 detik untuk meniru *query* berat).
5. **Cache Set:** Setelah data didapat dari *Database*, sistem menyimpannya ke dalam Redis dengan masa berlaku (TTL) selama 60 detik sebelum dikembalikan ke klien.
6. **Cache Invalidation:** Jika ada *request* `POST /users` (penambahan data baru), kunci `users:all` di Redis akan dihapus agar *request* selanjutnya mengambil data yang paling mutakhir.

### Messaging Flow (RabbitMQ)

Alur kerja event messaging menggunakan RabbitMQ:

1. **User Created:** Setiap kali `POST /users` dipanggil dan user berhasil dibuat, `UsersService` mempublikasikan event `user.created` ke antrian `user_queue` melalui `MessagingService`.
2. **Event Published:** `MessagingService` mengirimkan payload berisi `userId`, `name`, `email`, dan `timestamp` ke RabbitMQ.
3. **Event Consumed:** `UsersConsumer` (microservice listener) menerima event `user.created` dari antrian dan mencatatnya ke dalam log aplikasi.

---

## 📂 Struktur Folder

Proyek ini diatur menggunakan pendekatan *Feature Module* agar bersih dan mudah dipelihara:

```text
src/
├── app.module.ts                        # Entry point module (Global Cache Registration)
├── main.ts                              # Bootstrap application, Swagger & RabbitMQ Microservice setup
├── common/
│   ├── constants/
│   │   └── queue.constants.ts           # Konstanta nama queue, event pattern, dan service token
│   └── interfaces/
│       └── user.interface.ts            # Strict Type Definitions
├── config/
│   ├── rabbitmq.config.ts               # Konfigurasi koneksi RabbitMQ
│   └── redis.config.ts                  # Konfigurasi koneksi Redis
├── messaging/
│   ├── messaging.module.ts              # Module RabbitMQ Client
│   └── messaging.service.ts            # Service untuk mempublikasikan event ke RabbitMQ
└── modules/
    └── users/
        ├── consumers/
        │   └── users.consumer.ts        # Microservice listener untuk event RabbitMQ
        ├── controllers/
        │   └── users.controller.ts      # Routing & HTTP Method Definitions
        ├── dto/
        │   └── create-user.dto.ts       # Data Transfer Object (dengan Swagger Decorators)
        ├── services/
        │   └── users.service.ts         # Business Logic, Redis Cache & RabbitMQ Event
        └── users.module.ts              # Module fitur Users
```

---

## 💻 Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan perangkat Anda telah terinstal:

* **Node.js** (versi 18 atau terbaru)
* **Redis Server** berjalan di port default `6379`.
* **RabbitMQ Server** berjalan di port default `5672`.

*(Bagi pengguna Windows, Redis dan RabbitMQ dapat dijalankan menggunakan Docker atau WSL (Ubuntu).)*

**Cara cepat menjalankan Redis via Docker:**

```bash
docker run -d --name my-redis -p 6379:6379 redis
```

**Cara cepat menjalankan RabbitMQ via Docker:**

```bash
docker run -d --name my-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

> RabbitMQ Management UI tersedia di `http://localhost:15672` (default: guest/guest)

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

Saat aplikasi berjalan, log berikut akan muncul di terminal:
```
Aplikasi berjalan di: http://localhost:3000
Swagger UI tersedia di: http://localhost:3000/api
RabbitMQ Microservice terhubung
```

---

## 📖 API Documentation & Testing (Swagger UI)

Proyek ini telah dilengkapi dengan Swagger UI (v2.0) untuk memudahkan pengujian CRUD tanpa memerlukan aplikasi pihak ketiga.

Buka browser dan akses URL berikut:
👉 **[http://localhost:3000/api](http://localhost:3000/api)**

### Endpoint yang Tersedia

| Method | Endpoint     | Deskripsi                                          |
|--------|--------------|----------------------------------------------------|
| POST   | `/users`     | Membuat user baru & mempublikasikan event RabbitMQ |
| GET    | `/users`     | Mengambil semua data user (demonstrasi Redis Cache) |
| GET    | `/users/:id` | Mengambil satu data user berdasarkan ID            |

### Panduan Demonstrasi Performa Redis:

1. Buka halaman Swagger UI.
2. Buka *endpoint* `GET /users`, klik tombol **Try it out** lalu **Execute**.
3. **Percobaan Pertama:** Perhatikan waktu respons (*Server response time*). Waktu akan menunjukkan angka di atas 3000 ms (karena mengambil dari proses Database utama yang berat).
4. **Percobaan Kedua:** Klik **Execute** sekali lagi dalam rentang waktu kurang dari 60 detik. Perhatikan waktu respons akan turun drastis (hanya sekitar 5–15 ms) karena data langsung disajikan dari memori Redis!

### Panduan Demonstrasi RabbitMQ Messaging:

1. Panggil `POST /users` dengan mengisi `name` dan `email` pada Swagger UI.
2. Perhatikan log di terminal aplikasi — event `user.created` akan dipublikasikan dan dikonsumsi oleh `UsersConsumer`, dengan output seperti:
   ```
   [RabbitMQ] Event diterima - User Created: Erland Agsya (erland@example.com) | ID: 1718000000000
   ```