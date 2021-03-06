﻿document.write('<script src="https://d1fxtkz8shb9d2.cloudfront.net/sockjs-0.3.js"></script>');
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.sockjs = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.sockjs.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;
	
	var isSupported = (typeof WebSocket !== "undefined");

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		this.sjs = null;
		this.messageText = "";
		this.errorMsg = "";
		this.protocol = "";
	};
	
	instanceProto.saveToJSON = function ()
	{
		return { "messageText": this.messageText, "errorMsg": this.errorMsg };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.messageText = o["messageText"];
		this.errorMsg = o["errorMsg"];
	};
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnOpened = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnClosed = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnError = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnMessage = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsOpen = function ()
	{
		return this.sjs && this.sjs.readyState === 1 /* OPEN */;
	};
	
	Cnds.prototype.IsConnecting = function ()
	{
		return this.sjs && this.sjs.readyState === 0 /* CONNECTING */;
	};
	
	Cnds.prototype.IsSupported = function ()
	{
		return isSupported;
	};
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.Connect = function (url_, requireProtocol_)
	{
		if (!isSupported)
			return;
		
		// Close existing connection if any
		if (this.sjs)
			this.sjs.close();
			
		var self = this;
			
		//this.sjs = new SockJS(url_, requireProtocol_ === "" ? undefined : requireProtocol_);

		
		//var protocols = ['Websocket','xdr-streaming', 'xhr-streaming', 'xdr-polling', 'xhr-polling', 'iframe-eventsource'];
		var protocols = requireProtocol_.replace(/\s/g, "")
		protocols = protocols.split(",");
		console.log(protocols);
		
        var opts = {protocols_whitelist: protocols 
					,	debug: true 
					,	jsessionid: false};

		this.sjs = new SockJS(url_,null, opts);
		
		this.sjs.binaryType = "arraybuffer";
		this.sjs.onopen = function() {
			
			self.protocol = self.sjs.protocol;
			self.runtime.trigger(cr.plugins_.sockjs.prototype.cnds.OnOpened, self);
			
			// Check required protocol is supported if any
			/////
			/////TO DO: check this
			/*
			if (requireProtocol_.length && self.sjs.protocol.indexOf(requireProtocol_) === -1)
			{
				self.errorMsg = "WebSocket required protocol '" + requireProtocol_ + "' not supported by server";
				self.runtime.trigger(cr.plugins_.sockjs.prototype.cnds.OnError, self);
			}
			else {
			
			    self.protocol = self.sjs.protocol;
				self.runtime.trigger(cr.plugins_.sockjs.prototype.cnds.OnOpened, self);
				//console.log("[protocol] " + self.sjs.protocol);
				};
			*/	
		};
		this.sjs.onerror = function (err_) {
			self.errorMsg = err_ || "";
			self.runtime.trigger(cr.plugins_.sockjs.prototype.cnds.OnError, self);
		};
		this.sjs.onclose = function () {
			self.runtime.trigger(cr.plugins_.sockjs.prototype.cnds.OnClosed, self);
		};
		this.sjs.onmessage = function (msg_) {
			self.messageText = msg_.data || "";
			self.runtime.trigger(cr.plugins_.sockjs.prototype.cnds.OnMessage, self);
		};
	};
	
	Acts.prototype.Close = function ()
	{
		if (this.sjs)
			this.sjs.close();
	};
	
	Acts.prototype.Send = function (msg_)
	{
		if (!this.sjs || this.sjs.readyState !== 1 /* OPEN */)
			return;
			
		this.sjs.send(msg_);
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.MessageText = function (ret)
	{
		ret.set_string(this.messageText);
	};
	
	Exps.prototype.ErrorMsg = function (ret)
	{
		ret.set_string(this.errorMsg);
	};	
	Exps.prototype.Protocol = function (ret)
	{
		ret.set_string(this.protocol);
	};	
	
	pluginProto.exps = new Exps();

}());