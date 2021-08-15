const hota = require("./hota/netclient")

var nc = new hota.NetClient();

nc.on("gameEvent", function(gameEvent) {
	console.log(gameEvent);
});

nc.connect();

nc.login("YourUsername", "YourPassword");
