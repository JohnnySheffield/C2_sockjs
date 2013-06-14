Sockjs-client plugin for Construct 2
====================================

Exposing sockjs-client to C2 users


SockJS-client
=============

SockJS is a browser JavaScript library that provides a WebSocket-like
object. SockJS gives you a coherent, cross-browser, Javascript API
which creates a low latency, full duplex, cross-domain communication
channel between the browser and the web server.

Under the hood SockJS tries to use native WebSockets first. If that
fails it can use a variety of browser-specific transport protocols and
presents them through WebSocket-like abstractions.

SockJS is intended to work for all modern browsers and in environments
which don't support WebSocket protcol, for example behind restrictive
corporate proxies.

SockJS-client does require a server counterpart:

 * [SockJS-node](https://github.com/sockjs/sockjs-node) is a SockJS
   server for Node.js.
