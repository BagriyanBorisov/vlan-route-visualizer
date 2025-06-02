# VLAN Route Visualizer API Documentation

This API provides comprehensive REST functionality for managing network switches and VLANs in your network infrastructure.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Include authentication headers as needed (implementation depends on your auth setup).

---

## Switch Management

### Get All Switches
```http
GET /switches
```

**Response:**
```json
[
  {
    "id": 1,
    "hostname": "sw-core-01",
    "ipAddress": "192.168.1.10",
    "model": "Cisco Catalyst 9300",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
]
```

### Get Switch by ID
```http
GET /switches/{id}
```

**Response:**
```json
{
  "id": 1,
  "hostname": "sw-core-01",
  "ipAddress": "192.168.1.10",
  "model": "Cisco Catalyst 9300",
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

### Get VLANs Associated with a Switch
```http
GET /switches/{id}/vlans
```

**Response:**
```json
{
  "switch": {
    "id": 1,
    "hostname": "sw-core-01",
    "ipAddress": "192.168.1.10",
    "model": "Cisco Catalyst 9300"
  },
  "vlans": [
    {
      "id": 1,
      "name": "Management",
      "vlanId": "10",
      "port": "Gi1/0/1",
      "vlan_switch_id": 1
    }
  ]
}
```

### Create New Switch
```http
POST /switches
```

**Request Body:**
```json
{
  "hostname": "sw-access-01",
  "ipAddress": "192.168.1.30",
  "model": "Cisco Catalyst 9100"
}
```

**Response:**
```json
{
  "id": 4,
  "hostname": "sw-access-01",
  "ipAddress": "192.168.1.30",
  "model": "Cisco Catalyst 9100",
  "created_at": "2024-01-01T12:30:00.000Z",
  "updated_at": "2024-01-01T12:30:00.000Z"
}
```

### Create Multiple Switches (Bulk)
```http
POST /switches/bulk
```

**Request Body:**
```json
{
  "switches": [
    {
      "hostname": "sw-access-02",
      "ipAddress": "192.168.1.31",
      "model": "Cisco Catalyst 9100"
    },
    {
      "hostname": "sw-access-03",
      "ipAddress": "192.168.1.32",
      "model": "Cisco Catalyst 9100"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Bulk operation completed",
  "created": 2,
  "total": 2,
  "switches": [
    {
      "id": 5,
      "hostname": "sw-access-02",
      "ipAddress": "192.168.1.31",
      "model": "Cisco Catalyst 9100"
    },
    {
      "id": 6,
      "hostname": "sw-access-03",
      "ipAddress": "192.168.1.32",
      "model": "Cisco Catalyst 9100"
    }
  ]
}
```

### Update Switch
```http
PUT /switches/{id}
```

**Request Body:**
```json
{
  "hostname": "sw-core-01-updated",
  "ipAddress": "192.168.1.11",
  "model": "Cisco Catalyst 9300X"
}
```

### Delete Switch
```http
DELETE /switches/{id}
```

**Response:**
```json
{
  "message": "Switch deleted successfully"
}
```

### Delete Multiple Switches (Bulk)
```http
DELETE /switches
```

**Request Body:**
```json
{
  "switchIds": [4, 5, 6]
}
```

**Response:**
```json
{
  "message": "Bulk delete completed",
  "requested": 3,
  "deleted": 3
}
```

---

## VLAN Management

### Get All VLANs
```http
GET /vlans
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Management",
    "vlanId": "10",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
]
```

### Get VLAN by ID
```http
GET /vlans/{id}
```

### Get Switches Associated with a VLAN
```http
GET /vlans/{id}/switches
```

**Response:**
```json
{
  "vlan": {
    "id": 1,
    "name": "Management",
    "vlanId": "10"
  },
  "switches": [
    {
      "id": 1,
      "hostname": "sw-core-01",
      "ipAddress": "192.168.1.10",
      "model": "Cisco Catalyst 9300",
      "port": "Gi1/0/1",
      "vlan_switch_id": 1
    }
  ]
}
```

### Create New VLAN
```http
POST /vlans
```

**Request Body:**
```json
{
  "name": "Servers",
  "vlanId": "20"
}
```

### Create Multiple VLANs (Bulk)
```http
POST /vlans/bulk
```

**Request Body:**
```json
{
  "vlans": [
    {
      "name": "Workstations",
      "vlanId": "30"
    },
    {
      "name": "Guest",
      "vlanId": "40"
    }
  ]
}
```

### Update VLAN
```http
PUT /vlans/{id}
```

**Request Body:**
```json
{
  "name": "Updated VLAN Name",
  "vlanId": "25"
}
```

### Delete VLAN
```http
DELETE /vlans/{id}
```

### Delete Multiple VLANs (Bulk)
```http
DELETE /vlans
```

**Request Body:**
```json
{
  "vlanIds": [3, 4, 5]
}
```

### Get VLAN Route Visualization
```http
GET /vlans/{id}/route
```

**Response:**
```json
[
  {
    "data": {
      "id": "switch-1",
      "label": "sw-core-01",
      "hostname": "sw-core-01",
      "ipAddress": "192.168.1.10",
      "model": "Cisco Catalyst 9300",
      "port": "Gi1/0/1"
    }
  },
  {
    "data": {
      "id": "edge-1-2",
      "source": "switch-1",
      "target": "switch-2",
      "label": "VLAN 10"
    }
  }
]
```

---

## VLAN-Switch Association Management

### Add Switch to VLAN
```http
POST /vlans/{vlanId}/switches/{switchId}
```

**Request Body:**
```json
{
  "port": "Gi1/0/24"
}
```

**Response:**
```json
{
  "message": "Switch added to VLAN successfully",
  "vlanSwitchId": 15
}
```

### Update Switch Port in VLAN
```http
PUT /vlans/{vlanId}/switches/{switchId}
```

**Request Body:**
```json
{
  "port": "Gi1/0/25"
}
```

### Remove Switch from VLAN
```http
DELETE /vlans/{vlanId}/switches/{switchId}
```

### Add Multiple Switches to VLAN (Bulk)
```http
POST /vlans/{vlanId}/switches/bulk
```

**Request Body:**
```json
{
  "switches": [
    {
      "switchId": 4,
      "port": "Gi1/0/1"
    },
    {
      "switchId": 5,
      "port": "Gi1/0/2"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Bulk add switches to VLAN completed",
  "vlanId": 1,
  "added": 2,
  "total": 2,
  "switches": [
    {
      "vlanSwitchId": 16,
      "switchId": 4,
      "port": "Gi1/0/1"
    },
    {
      "vlanSwitchId": 17,
      "switchId": 5,
      "port": "Gi1/0/2"
    }
  ]
}
```

### Remove Multiple Switches from VLAN (Bulk)
```http
DELETE /vlans/{vlanId}/switches/bulk
```

**Request Body:**
```json
{
  "switchIds": [4, 5, 6]
}
```

**Response:**
```json
{
  "message": "Bulk remove switches from VLAN completed",
  "vlanId": 1,
  "requested": 3,
  "removed": 3
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "msg": "Hostname is required",
      "param": "hostname",
      "location": "body"
    }
  ]
}
```

### Not Found (404)
```json
{
  "error": "Switch not found"
}
```

### Conflict (409)
```json
{
  "error": "Switch with this hostname or IP address already exists"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

---

## Health Check

### API Health Status
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "VLAN Route Visualizer API",
  "version": "1.0.0"
}
```

---

## Common Use Cases

### Setting VLANs in Switches
1. **Single Assignment**: Use `POST /vlans/{vlanId}/switches/{switchId}` to assign a switch to a VLAN
2. **Bulk Assignment**: Use `POST /vlans/{vlanId}/switches/bulk` to assign multiple switches at once
3. **Update Port**: Use `PUT /vlans/{vlanId}/switches/{switchId}` to change the port assignment

### Managing Network Infrastructure
1. **Bulk Switch Creation**: Use `POST /switches/bulk` to add multiple switches at once
2. **View Switch Configuration**: Use `GET /switches/{id}/vlans` to see all VLANs on a switch
3. **View VLAN Configuration**: Use `GET /vlans/{id}/switches` to see all switches in a VLAN
4. **Network Cleanup**: Use bulk delete operations to remove multiple resources

### Visualization and Monitoring
1. **Route Visualization**: Use `GET /vlans/{id}/route` to get network topology data
2. **Health Monitoring**: Use `GET /health` to check API status

This comprehensive REST API provides all the functionality needed to manage network switches, VLANs, and their associations with full CRUD operations and bulk management capabilities. 