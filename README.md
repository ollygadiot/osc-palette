# DragonFrame OSC Visualization Bridge

A web-based visualization system that connects to DragonFrame via OSC (Open Sound Control) and displays motion control data with interactive animations.


## Overview

This project creates a bridge between DragonFrame (a professional stop-motion animation software) and a web browser, allowing real-time visualization of motion control data. It consists of:

1. A Node.js server that receives OSC messages from DragonFrame
2. A WebSocket connection that forwards these messages to the browser
3. A web interface with dynamic animations that respond to the motion control axis values

The visualization shows a series of rotating colored rectangles that animate based on the position of motion control axes (particularly AX1).

## Features

- Real-time connection to DragonFrame via OSC
- WebSocket-based communication between server and client
- Dynamic visualization of motion control data
- Support for multiple axes
- Manual control slider for testing and demonstrations
- Auto-reconnection if the connection is lost
- Clean, modern UI with GSAP animations

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [DragonFrame](https://www.dragonframe.com/) with OSC output enabled

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/ollygadiot/df-osc.git
   cd df-osc
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Configure DragonFrame:
   - Open DragonFrame
   - Go to Preferences > Advanced
   - Enable "Send OSC" and set the port to 7000 (default)
   - Set the OSC destination to 127.0.0.1

## Usage

1. Start the server:
   ```
   cd server
   npm start
   ```

2. Open the client in your web browser:
   - Open `client/index.html` in your browser

3. The web interface will connect to the server and display "Connected to DragonFrame bridge" when ready.

4. Move the motion control axes in DragonFrame to see the visualization respond, or use the manual slider for testing.

## Configuration

- **OSC Port**: By default, the server listens on port 7000 for DragonFrame OSC messages. You can modify this in `server.js`.
- **WebSocket Port**: The WebSocket server runs on port 9099. You can modify this in `server.js` and `client.js`.

## How It Works

1. DragonFrame sends OSC messages to the Node.js server when motion control axes are moved.
2. The server forwards these messages via WebSocket to the connected web clients.
3. The client JavaScript processes these messages and updates the visualization accordingly.
4. For AX1 specifically, the normalized value (0-1) controls how many of the 12 colored rectangles are displayed.

## Project Structure

```
df-osc/
├── client/
│   ├── index.html      # Web client UI
│   └── client.js       # Client-side JavaScript
└── server/
    ├── package.json    # Node.js dependencies
    └── server.js       # OSC/WebSocket server
```

## Development

- The client visualization uses GSAP for smooth animations
- The server uses node-osc for OSC communication and ws for WebSocket

## License

[ISC License](LICENSE)

## Author

Olly Gadiot