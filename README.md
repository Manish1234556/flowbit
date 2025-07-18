
## 📦 Quick-Start Instructions

### 1️⃣ Clone the Repository
```git clone <repository-url>
cd flowbit-slice/api
```

### 2️⃣ Install Dependencies
```
npm install
```

### 3️⃣ Setup Environment Variables
##### Create a .env file in the api folder (DO NOT commit it to git!):
```
PORT=4000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
WEBHOOK_SECRET=your-webhook-secret
```


### 4️⃣  Run the API Locally
```
npm start
```
##### The API will be available at: http://localhost:4000

### 🧩 n8n Workflow 
```
This project uses an n8n workflow to receive a webhook, send the payload to the Flowbit API `/webhook/ticket-done` endpoint, and return a success response.

📂 See `docs/n8n-webhook-flow.json` for the full export.
```
### 📡 Test Endpoints
##### Use Postman to test the API routes.
```
mongod
```

### 🔐 Login
```
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin2@logisticsco.com", "password": "password123"}'
```
#### ✅ Response: The login endpoint will return a JWT token. Copy it and use it in the Authorization header for the requests below.

### 📺 Get Screens
```
curl -X GET http://localhost:4000/api/me/screens \
  -H "Authorization: Bearer <TOKEN>"
```
### 🎟️ Get Tickets
```
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer <TOKEN>"
```
### ➕ Create Ticket
```
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"ticketId": "LC1"}'
```
### 📣 Trigger Webhook
```
curl -X POST http://localhost:4000/webhook/ticket-done \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "LC1", "secret": "<WEBHOOK_SECRET>"}'
```
### 🗺️ Architecture Diagram
```
+-------------------+       +-------------------+       +-------------------+
|    Client (e.g.,  |       |    Flowbit API    |       |    MongoDB        |
|    Postman, UI)   |       |    (Express)      |       |    (Database)     |
+-------------------+       +-------------------+       +-------------------+
| GET /api/me/screens| ----> | Routes:           |       |                   |
| GET /api/tickets   |       | - me.js           | ----> | - Users           |
| POST /api/tickets  |       | - tickets.js      |       | - Tickets         |
| POST /api/auth/login|      | - auth.js         |       |                   |
| POST /webhook/...  |      | Middleware:       |       |                   |
+-------------------+       | - authMiddleware  |       +-------------------+
                            | Config:           |
                            | - registry.json   |
                            +-------------------+
```
