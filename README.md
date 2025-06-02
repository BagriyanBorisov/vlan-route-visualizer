# VLAN-Route Visualizer

A web application to visualize VLAN routes through network switches and uplinks.

## Features

- **Switch Management**: Register and manage network switches.
- **VLAN Management**: Create and assign VLANs to switches.
- **Route Visualization**: Visualize VLAN routes using Cytoscape.js.
- **Authentication**: JWT-based login for admins.

## Tech Stack

- **Frontend**: React (Vite) + Cytoscape.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: SQLite (development) with potential for PostgreSQL/MySQL

## Setup

### Frontend

1. Clone the repository.
2. Navigate to the project directory:
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
   npm install
   ```
3. Run the application:
   ```bash
   npm start
   ```

## Usage

- Open `http://localhost:5174` in your browser (or the port shown in terminal).
- Log in (if authentication is enabled).
- Manage switches and VLANs.
- Visualize VLAN routes by selecting a VLAN from the dropdown.

## API Documentation

See `API_DOCUMENTATION.md` for detailed API endpoints and usage examples.

## License

MIT 