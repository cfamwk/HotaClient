# HotaClient

This is a HOTA bot written in NodeJS.

Example usage:
```javascript
const hota = require('./hota/netclient')

var nc = new hota.NetClient();

nc.on("gameEvent", function(gameEvent) {
	if(gameEvent.name == 'player_entered_lobby') {
		console.log(`${gameEvent.playerName} (${gameEvent.playerRating}) logged in`);
	}
});

nc.connect();

nc.login("YourUsername", "YourPassword");
```

Output:

```
...
WhyDeYYuSWhy (0) logged in
Bodnar1505 (10) logged in
Ratzion (118) logged in
Ozerki (210) logged in
...
```
