


# Pushtak-Bhandar – Full Stack Web Application

This repository contains a **full-stack web application** with:

- **Backend** → ASP.NET Core 8 Web API with Entity Framework Core (C#)  
- **Frontend** → React.js (JavaScript, Create React App)

---

##  Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)  
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or any EF Core-supported DB  
- [Node.js (LTS)](https://nodejs.org/) + npm  
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)  

---

##  Backend Setup (ASP.NET Core API)

### 1. Navigate to backend folder
```bash
cd ADGroupCW
````

### 2. Configure Database

Update the connection string in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=ADGroupCW;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### 3. Apply Migrations

```bash
dotnet ef database update
```

### 4. Run the API

```bash
dotnet run
```

API will be available at:

* `https://localhost:5001`
* `http://localhost:5000`

Swagger UI: `https://localhost:5001/swagger`

---

##  Frontend Setup (React App)

### 1. Navigate to frontend folder

```bash
cd Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the React app

```bash
npm start
```

Frontend will start at:
`http://localhost:3000`

---

## 🔗 Connecting Frontend & Backend

* The React frontend makes API calls to the ASP.NET Core backend.
* Update `src/api/` configuration (e.g., `baseURL`) to point to:

  * `http://localhost:5000` (HTTP)
  * `https://localhost:5001` (HTTPS)

---

##  Testing

### Backend

```bash
dotnet test
```

### Frontend

```bash
npm test
```

---

##  Useful Commands

### Backend

```bash
dotnet restore
dotnet build
dotnet run
dotnet ef migrations add <Name>
dotnet ef database update
```

### Frontend

```bash
npm install
npm start
npm run build
npm test
```

---



