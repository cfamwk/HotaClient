const net = require("net")

const GAME_SERVER_IP = "5.252.35.46"
const GAME_SERVER_PORT = 6846

const NETCLIENT_HARDDISC_VENDOR = "netclient_vendor"
const NETCLIENT_HARDDISC_SERIAL = "netclient_serial"
const NETCLIENT_HARDDISC_PRODUCT_ID = "netclient_pid"
const NETCLIENT_IS_RUSSIAN = false
const NETCLIENT_CLIENT_VERSION = 0x4c546d
const NETCLIENT_MAC_ADDRESS = 0xcafecafecafecafen

//
// NetClient
//

class NetClient {
	
	// Constructor
	constructor(socket = net.Socket()) {
		this.socket = socket
		this.listeners = []
		this.data = Buffer.alloc(0)
	}

	// Creates an event listener
	on(eventName, callback) {
		this.listeners.push({"eventName":eventName, "callback":callback})
	}
	
	// Fires an event
	fire(eventName, ...args) {
		for(let listener of this.listeners) {
			if(eventName = listener.eventName) {
				listener.callback(...args)
			}
		}
	}
	
	// Establishes connection to the game server
	connect() {
		this.socket.connect(GAME_SERVER_PORT, GAME_SERVER_IP, () => this.fire("connected"))
		this.socket.on("data", (data) => this.processChunk(data))
		this.socket.on("close", () => this.fire("close"))
	}
	
	// Sends a login message to the server
	login(username, password) {
		let message = Buffer.alloc(0xfd)
			
		// Write message size
		message.writeUInt16LE(0xfd, 0)
				
		// Write message id
		message.writeUInt16LE(0x83, 2)

		// Write the username part of the message
		let rKey = 75
		
		let unameKey = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x9c, 0x19,0x00, 0x90, 0x97, 0x48, 0x05, 0x01, 0x00, 0x00, 0x00])

		username = Buffer.from(username)
		
		for(let i = username.length - 1; i >= 0; i--) {
			rKey = username[i] ^ rKey
			unameKey[i] = rKey + (i % 7 + 35)
		}
		
		unameKey[username.length] = 0

		unameKey.copy(message, 4)
		
		// Write the password part of the message
		let pwordKey = Buffer.from([0xf0, 0x9a, 0x19, 0x00, 0xc9, 0x6a, 0xb5, 0x64, 0x04, 0xcd, 0x20, 0x00, 0xf0, 0x9a, 0x19, 0x00, 
								    0xc9, 0x6a, 0xb5, 0x64, 0x04, 0xcd, 0x20, 0x05, 0x01, 0x00, 0x00])
		
		password = Buffer.from(password)

		for(let i = password.length - 1; i >= 0; i--) {
			rKey = password[i] ^ rKey
			pwordKey[i] = rKey + (i % 7 + 35)
		}		
		
		pwordKey[password.length] = 0
		
		pwordKey.copy(message, 21)
						
		// Write the harddisc ID part of the message
		let discKey = Buffer.from([0x45, 0x4e, 0x44, 0x5a, 0x49, 0x56, 0x20, 0x4d, 0x45, 0x4e, 0x56, 0x5f, 0x39, 0x39, 0x39, 0x39, 
								   0x45, 0x4e, 0x44, 0x5a, 0x49, 0x56, 0x20, 0x45, 0x52, 0x49, 0x47, 0x46, 0x5a, 0x4f, 0x20, 0x4d, 
								   0x45, 0x4e, 0x56, 0x20, 0x57, 0x52, 0x48, 0x50, 0x00, 0x58, 0x9b, 0x19, 0x00, 0xa0, 0x1e, 0xd7, 
								   0x05, 0xd8, 0xcc, 0x20, 0x05, 0x34, 0x9b, 0x19, 0x00, 0xc9, 0x6a, 0xb5, 0x64, 0x54, 0xe7, 0x1a, 
								   0x05, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3c, 0x9b, 0x19, 0x00, 0x24, 0x9c, 0x19, 
								   0x00, 0x04, 0x9c, 0x19, 0x00, 0xd4, 0xad, 0xb5, 0x64, 0x00, 0x00, 0x00, 0x00, 0x10, 0x3b, 0xe4, 
								   0x04, 0x10, 0x3b, 0xe4, 0x04, 0x54, 0xe7, 0x1a, 0x05, 0x58, 0xe7, 0x1a, 0x05, 0xc4, 0x9b, 0x19, 
								   0x00, 0x6d, 0x0d, 0x61, 0x05, 0x28, 0xe7, 0x1a, 0x05, 0x24, 0x9c, 0x19, 0x00, 0x04, 0x9c, 0x19, 
								   0x00, 0xc4, 0x9b, 0x19, 0x00, 0x68, 0x9b, 0x19, 0x00, 0x30, 0x85, 0x48, 0x05, 0x00, 0x00, 0x00, 
								   0x00, 0x0d, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x82, 0xe5, 0x61, 0x03, 0x94, 0x9b, 0x19, 
								   0x00, 0xa0, 0x9b, 0x19, 0x00, 0xc9, 0x6a, 0xb5, 0x64, 0x74, 0xfa, 0x20, 0x05, 0x01, 0x00, 0x00, 
								   0x00, 0x00, 0x00, 0x00, 0x00, 0xa8, 0x9b, 0x19, 0x00, 0x24, 0x9c, 0x19, 0x00, 0x04, 0x9c, 0x19])
		
		let discKeyBase = NETCLIENT_HARDDISC_SERIAL + NETCLIENT_HARDDISC_VENDOR + NETCLIENT_HARDDISC_PRODUCT_ID

		discKeyBase = discKeyBase.toUpperCase()
		
		discKeyBase = Buffer.from(discKeyBase)
		
		for(let i = 0; i < discKeyBase.length; i++) {
			let discKeyByte = discKeyBase[i]
			
			if(discKeyByte >= 0x30 && discKeyByte <= 0x39) {
				discKeyByte = 0x69 - discKeyByte
			}
						
			if(discKeyByte >= 0x41 && discKeyByte <= 0x5a) {
				discKeyByte = 0x9b - discKeyByte
			}
			
			discKey[i] = discKeyByte
		}
		
		discKey.copy(message, 48)
	 
		message.writeUInt8(NETCLIENT_IS_RUSSIAN, 240)

		message.writeUInt32LE(NETCLIENT_CLIENT_VERSION, 241)
		
		message.writeBigUInt64BE(NETCLIENT_MAC_ADDRESS, 245)
		
		this.socket.write(message)
	}
	
	// Translates a buffer containing a game packet to a game event object
	translatePacket(packet) {
		let gameEvent = new Object()
		
		switch(packet.type)
		{
			case 51:
				gameEvent.name = "player_entered_lobby";
				gameEvent.playerId = this.data.readUInt32LE(8)
				gameEvent.playerRating = this.data.readUInt32LE(12)
				gameEvent.playerName = this.data.toString("utf8", 20).split("\0").shift()
				break
				
			case 54:
				gameEvent.name = "player_state_changed";
				gameEvent.playerId = this.data.readUInt32LE(4)
				gameEvent.playerState = this.data.readUInt8(8)
				break
			
			case 56:
				gameEvent.name = "player_hosted_game";
				gameEvent.playerId = this.data.readUInt32LE(4)
				gameEvent.gameName = this.data.toString("utf8", 12).split("\0").shift() 
				break
			
			case 57:
				gameEvent.name = "player_entered_game";
				gameEvent.hostPlayerId = this.data.readUInt32LE(4)
				gameEvent.otherPlayerId = this.data.readUInt32LE(12)
				break
						
			case 70:
				gameEvent.name = "player_chat_message";
				gameEvent.playerName = this.data.toString("utf8", 32).split("\0").shift()
				gameEvent.text = this.data.toString("utf8", 49).split("\0").shift()
				break
			
			case 71: //lobby_special_gameEvent
			
				break;
			
			default:
				gameEvent.name = "unknown"
				break
		}
		
		return gameEvent;
	}
	
	// Processes a buffer from the game server
	processChunk(chunk) {
		// Append the chunk to the packet buffer
		this.data = Buffer.concat([this.data, chunk])

		// Extract all messages from the buffer
		while(this.data.length > 0)
		{
			// Atleast 4 bytes is required to read type and size
			if(this.data.length < 2) {
				return
			}
			
			let packetSize = this.data.readUInt16LE(0)

			// If the packet has only been partially received wait for the next byte chunk
			if(this.data.length < packetSize) {
				return
			}
			
			// Extract the packet
			let packet = new Object()
			packet.size = packetSize
			packet.type = this.data.readUInt16LE(2)
			packet.bytes = this.data.slice(0, packetSize).toString('hex').match(/../g).join(' ')
			
			this.fire("packet", packet);

			this.fire("gameEvent", this.translatePacket(packet));

			// Remove the message from the buffer
			this.data = this.data.slice(packetSize)
		}
	}
}

exports.NetClient = NetClient