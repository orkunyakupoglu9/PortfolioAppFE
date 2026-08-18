# Portföy Paneli Frontend

[English](README.md) | [Türkçe](README.tr.md)

`../PortfolioAppBE` dizinindeki Spring Boot backend uygulaması için geliştirilmiş
Next.js App Router frontend projesidir. Canlı portföy varlıkları, portföy
grafikleri, backend tarafında sıralama, popüler hisseler, takip listesi yönetimi,
STOMP güncellemeleri, karanlık mod ve farklı ekran boyutlarına uyumlu düzenler
içerir.

## Sıralama ve filtreleme kararı

Bir sıralama seçeneği dışında sıralama ve filtreleme işlemleri şu anda frontend
tarafında yapılmaktadır. Büyük veri kümelerinde frontend'i uzun süre meşgul
etmemek ve performans kaybını önlemek için bu işlemlerin ideal olarak backend
tarafında yapılması gerekir. Bu projedeki veri kümesi küçük olduğu için iki
yaklaşım da örnek olarak kullanılmıştır.

## Güvenilirlik kararları

- Tarayıcı API istekleri 12 saniye sonra zaman aşımına uğrar.
- Next.js proxy, her backend işlemi için toplam 10 saniyelik süre tanır.
  Güvenli `GET`/`HEAD` istekleri; ağ hatalarında veya `408`, `425`, `429`, `502`,
  `503` ve `504` yanıtlarında bu süre içinde en fazla iki kez tekrar denenir.
- Veri değiştiren `POST`, `PUT` ve `DELETE` istekleri zaman aşımına tabidir ancak
  otomatik olarak tekrar denenmez. Backend şu anda kalıcı istek anahtarları veya
  bir `Idempotency-Key` sözleşmesi sunmamaktadır. Yalnızca frontend tarafından
  üretilen bir anahtar, özellikle backend değişikliği kaydedip yanıtı
  kaybolduğunda, işlemin yalnızca bir kez uygulanacağını garanti edemez. Bu
  nedenle başarısız veri değiştirme işlemleri kullanıcı tarafından açıkça tekrar
  edilir.
- STOMP bağlantıları 8 saniyelik bağlantı zaman aşımı kullanır, 5 saniye sonra
  yeniden bağlanır, bileşen kaldırıldığında abonelikten çıkar ve temizleme
  sonrasındaki geri çağrıları yok sayar.

## Servisleri ayrı ayrı yerel ortamda çalıştırma

Node.js 22, Yarn 1.22 ve `8080` portunda çalışan backend gereklidir.

```bash
# Terminal 1: backend
cd ../PortfolioAppBE
docker compose up --build app

# Terminal 2: frontend
cp .env.example .env.local
nvm use
yarn install
yarn dev
```

## Tüm servisleri tek bir Docker Compose komutuyla çalıştırma

Bu komut frontend, backend, PostgreSQL ve Redis servislerini birlikte başlatır:

```bash
docker compose up --build
```

> **Not:** `docker-compose.yml`, backend'i `../PortfolioAppBE` yolundan build
> ettiği için frontend ve backend repoları aynı ana dizin altında kardeş
> dizinler olarak bulunmalıdır.

```text
Projects/
├── PorfolioAppFE/
└── PortfolioAppBE/
```

Uygulamayı [http://localhost:3000](http://localhost:3000) adresinden
açabilirsiniz. Backend Swagger arayüzü
[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
adresindedir.

## Ortam değişkenleri

```dotenv
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws
```

Gerçek API veya WebSocket adresi değiştiğinde bu değerleri `.env.local`
dosyasında güncelleyin. `BACKEND_URL` yalnızca sunucu tarafında kullanılır.
`NEXT_PUBLIC_WEBSOCKET_URL` tarayıcıya açıktır ve `next build` sırasında build
çıktısına eklenir.

## Backend entegrasyonu

REST çağrıları `src/lib/portfolio-api.ts` dosyasında tanımlanır ve Next.js
tarafından `BACKEND_URL` adresine proxy edilir:

- `/api/portfolio` ve `/api/portfolio/{ticker}`
- `/api/market-data/{ticker}` ve `/api/market-data/{ticker}/history`
- `/api/watchlist` ve `/api/watchlist/{ticker}`

Sıralama işlemleri
`/api/portfolio?sortBy=MARKET_VALUE&direction=DESC` gibi backend sorgu
parametrelerini kullanır. Popüler hisse sembolleri frontend tarafında belirlenen
bir listedir; fiyat bilgileri canlı market-data API'sinden alınır.

Canlı portföy güncellemeleri STOMP kullanarak `ws://localhost:8080/ws` adresine
bağlanır ve `/topic/portfolio` kanalına abone olur.

## Kontroller

```bash
yarn typecheck
yarn lint
yarn test
yarn build
```

## Yapay zekâ kullanımı

`AGENTS.md` dosyası yerel ortamdaki backend servisini işaret etmektedir. Bu
sayede API ve WebSocket bağlantıları prompt içine hardcode edilmeden yapay zekâ
desteğiyle entegre edilmiştir. OpenAI Codex, projenin uygulanmasına ve
doğrulanmasına yardımcı olmak için kullanılmıştır.

## Ekran görüntüleri

<img width="800" height="510" alt="Ekran görüntüsü 2026-08-17 23:45:22" src="https://github.com/user-attachments/assets/a78472ad-497d-446b-8fd7-9ef957d86689" />
<img width="1632" height="462" alt="Ekran görüntüsü 2026-08-17 23:45:10" src="https://github.com/user-attachments/assets/e7e3624b-42d9-4101-b141-f18b8eeff2d7" />
<img width="1845" height="840" alt="Ekran görüntüsü 2026-08-17 23:44:51" src="https://github.com/user-attachments/assets/8765bd5a-941d-4ed8-a167-1599a79fa676" />
<img width="1845" height="840" alt="Ekran görüntüsü 2026-08-17 23:45:01" src="https://github.com/user-attachments/assets/7dc0fc3f-b729-4492-bfd0-35ff39f63735" />
