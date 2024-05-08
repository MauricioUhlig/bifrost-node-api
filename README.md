# Bifrost API
Project developed in Node.js to turn a Linux server into a network bridge between machines that are not capable of communicating directly.

The strategy used is to create a socket connection that generates a tunnel, simulating a VPN. The great advantage of this project is the ability to expose a machine (or Tor network onion page) on the public IPv4 network because the server has tunnel configuration that replicates an IPv4 request to an Onion address on the Tor network.

## Prerequisites that need to be installed and/or configured on the Linux machine:
- Node.js
- Socat
- Tor
- SQLite 3
- Open HTTP ports
