# VLAN-Route Visualizer

A web application to visualize VLAN routes through network switches and uplinks.

## Features

- **Switch Management**: Register and manage network switches.
- **VLAN Management**: Create and assign VLANs to switches.
- **Route Visualization**: Visualize VLAN routes using Cytoscape.js.
- **Authentication**: JWT-based login for admins.

## Tech Stack

- **Frontend**: React (Vite) + Cytoscape.js
- **Backend**: ASP.NET Core Web API (.NET 8)
- **Database**: PostgreSQL or SQL Server via Entity Framework Core

## Setup

### Frontend

1. Clone the repository.
2. Navigate to the frontend directory:
   ```bash
   cd vlan-route-visualizer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   dotnet restore
   ```
3. Run the application:
   ```bash
   dotnet run
   ```

## Usage

- Open `http://localhost:3000` in your browser.
- Log in (if authentication is enabled).
- Manage switches and VLANs.
- Visualize VLAN routes by selecting a VLAN from the dropdown.

## License

MIT 