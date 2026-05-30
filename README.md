# NestJS Redis Caching, RabbitMQ Messaging, MongoDB & Orders Module 🚀

Proyek ini adalah implementasi fitur **Caching** menggunakan **Redis**, **Messaging** menggunakan **RabbitMQ**, **Persistensi Data** menggunakan **MongoDB**, serta dua modul yang saling berinteraksi: **Users** dan **Orders**. Dibangun dengan *Strict TypeScript* dan dilengkapi dokumentasi interaktif **Swagger (OpenAPI)**.

**Tugas Topik Khusus - Semester 6**
**Oleh:** Erland Agsya Agustian (NIM: 2311083007)
**Institusi:** Politeknik Negeri Padang

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| Backend Framework | [NestJS](https://nestjs.com/) (v10+) |
| Database | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) (`@nestjs/mongoose`) |
| In-Memory Cache | [Redis](https://redis.io/) (`@nestjs/cache-manager`, `cache-manager-redis-yet`) |
| Message Broker | [RabbitMQ](https://www.rabbitmq.com/) (`@nestjs/microservices`, Transport: RMQ) |
| Language | TypeScript (Strict Mode) |
| API Documentation | Swagger / OpenAPI (`@nestjs/swagger`) v2.0 |

---

## 🏗️ Arsitektur & Alur Kerja

### Gambaran Besar Sistem

```
Client HTTP
     │
     ├──► [UsersController]          ├──► [OrdersController]
     │           │                   │           │
     │    [UsersService]             │    [OrdersService]
     │      │    │    │              │      │    │    │    │
     │   MongoDB Redis RabbitMQ      │   MongoDB Redis RabbitMQ
     │                │              │                │
     │           [user_queue]        │           [user_queue]
     │                │              │                │
     │    [UsersConsumer]            │    [OrdersConsumer]
     │    (log event)                │    (log event)
     │                               │
     └── OrdersService memanggil UsersService.existsById()
         untuk memvalidasi userId sebelum order dibuat
```

### Interaksi Antar Module

`OrdersModule` mengimpor `UsersModule` dan menggunakan `UsersService` untuk memvalidasi bahwa `userId` pada setiap pesanan baru benar-benar ada di database. Jika user tidak ditemukan, order ditolak dengan `400 Bad Request`.

### Caching Flow (Cache-Aside Pattern)

| Cache Key | TTL | Di-invalidate Saat |
|---|---|---|
| `users:all` | 60 detik | `POST /users` |
| `users:{id}` | 60 detik | — |
| `orders:user:{userId}` | 60 detik | `POST /orders`, `PATCH /orders/:id/status` |
| `orders:{id}` | 60 detik | `PATCH /orders/:id/status` |

### Event RabbitMQ

| Event Pattern | Dipublikasikan Saat | Dikonsumsi Oleh |
|---|---|---|
| `user.created` | `POST /users` berhasil | `UsersConsumer` |
| `order.created` | `POST /orders` berhasil | `OrdersConsumer` |
| `order.status_updated` | `PATCH /orders/:id/status` berhasil | `OrdersConsumer` |

---

## 📂 Struktur Folder

```text
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── constants/
│   │   └── queue.constants.ts         # Nama queue & event patterns (users + orders)
│   └── interfaces/
│       ├── user.interface.ts
│       └── order.interface.ts          # ✨ NEW
├── config/
│   ├── mongodb.config.ts
│   ├── rabbitmq.config.ts
│   └── redis.config.ts
├── messaging/
│   ├── messaging.module.ts
│   └── messaging.service.ts
└── modules/
    ├── users/
    │   ├── consumers/users.consumer.ts
    │   ├── controllers/users.controller.ts
    │   ├── dto/create-user.dto.ts
    │   ├── schemas/user.schema.ts
    │   ├── services/users.service.ts
    │   └── users.module.ts
    └── orders/                          # ✨ NEW
        ├── consumers/orders.consumer.ts
        ├── controllers/orders.controller.ts
        ├── dto/
        │   ├── create-order.dto.ts
        │   └── update-order-status.dto.ts
        ├── schemas/order.schema.ts
        ├── services/orders.service.ts
        └── orders.module.ts
```

---

## 💻 Prasyarat

| Layanan | Port Default | Docker Command |
|---|---|---|
| MongoDB | `27017` | `docker run -d --name my-mongo -p 27017:27017 mongo` |
| Redis | `6379` | `docker run -d --name my-redis -p 6379:6379 redis` |
| RabbitMQ | `5672` / `15672` | `docker run -d --name my-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management` |

> RabbitMQ Management UI: `http://localhost:15672` (default: guest/guest)

**Atau gunakan Docker Compose:**

```yaml
services:
  mongodb:
    image: mongo
    ports:
      - "27017:27017"
  redis:
    image: redis
    ports:
      - "6379:6379"
  rabbitmq:
    image: rabbitmq:management
    ports:
      - "5672:5672"
      - "15672:15672"
```

```bash
docker compose up -d
```

---

## 📦 Instalasi

```bash
npm install
# Dependensi MongoDB (jika belum)
npm install @nestjs/mongoose mongoose
```

---

## 🚀 Menjalankan Aplikasi

```bash
npm run start:dev
```

Log startup yang muncul:
```
Aplikasi berjalan di: http://localhost:3000
Swagger UI tersedia di: http://localhost:3000/api
RabbitMQ Microservice terhubung
MongoDB terhubung
```

---

## 📖 API Endpoints

Akses Swagger UI: 👉 **[http://localhost:3000/api](http://localhost:3000/api)**

### Users

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/users` | Buat user baru → simpan MongoDB, invalidate cache, emit event |
| `GET` | `/users` | Ambil semua users → Redis atau MongoDB |
| `GET` | `/users/:id` | Ambil satu user → Redis atau MongoDB |

### Orders

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/orders` | Buat order baru → validasi userId via UsersService, simpan MongoDB, invalidate cache, emit event |
| `GET` | `/orders/user/:userId` | Ambil semua order milik user → Redis atau MongoDB |
| `GET` | `/orders/:id` | Ambil detail satu order → Redis atau MongoDB |
| `PATCH` | `/orders/:id/status` | Update status order → invalidate cache, emit event |

---

## 🧪 Panduan Demonstrasi

### Skenario Lengkap (Urut)

**1. Buat user:**
```json
POST /users
{ "name": "Erland Agsya", "email": "erland@example.com" }
```
Catat `id` dari response.

**2. Buat order untuk user tersebut:**
```json
POST /orders
{
  "userId": "<id dari langkah 1>",
  "items": [
    { "productName": "Laptop Gaming", "quantity": 1, "price": 15000000 },
    { "productName": "Mouse Wireless", "quantity": 2, "price": 250000 }
  ]
}
```
Catat `id` order dari response.

**3. Cek Redis Cache — GET orders by user (dua kali):**
- Percobaan ke-1: data dari MongoDB, log menampilkan `[CACHE MISS]`
- Percobaan ke-2: data dari Redis, log menampilkan `[CACHE HIT]`

**4. Update status order:**
```json
PATCH /orders/<id>/status
{ "status": "processing" }
```
Perhatikan log: cache di-invalidate, event `order.status_updated` dikirim dan diterima consumer.

**5. Coba order dengan userId tidak valid:**
```json
POST /orders
{ "userId": "000000000000000000000000", "items": [...] }
```
Sistem mengembalikan `400 Bad Request` karena validasi antar-module gagal.

### Format Log Terminal

Setiap operasi menghasilkan log berformat:
```
[ClassName] [OPERASI] Keterangan detail
```

Contoh alur lengkap `POST /orders`:
```
[OrdersController]  [POST /orders] Request masuk — userId: 6849..., 2 item
[OrdersService]     [CREATE] Memulai pembuatan order untuk userId: 6849...
[OrdersService]     [CREATE] Memvalidasi keberadaan userId: 6849...
[UsersService]      [EXISTS] Memeriksa keberadaan user id: 6849...
[UsersService]      [EXISTS] User id: 6849... — ditemukan
[OrdersService]     [CREATE] Validasi user berhasil
[OrdersService]     [CREATE] Total amount dihitung: Rp 15.500.000 dari 2 item
[OrdersService]     [CREATE] Order berhasil disimpan ke MongoDB — orderId: 7abc...
[OrdersService]     [CACHE] Cache "orders:user:6849..." di-invalidate
[MessagingService]  [PUBLISH] Event "order.created" dikirim ke RabbitMQ
[MessagingService]  [PUBLISH] Event "order.created" berhasil di-emit
[OrdersConsumer]    [CONSUMER] Event "order.created" diterima dari RabbitMQ
[OrdersConsumer]    [CONSUMER] Order baru — id: 7abc... | userId: 6849... | 2 item | total: Rp 15.500.000
[OrdersController]  [POST /orders] Response dikirim — orderId: 7abc...
```