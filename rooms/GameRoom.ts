import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

//#region PLAYERSTATE
export class Position extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
}

export class Player extends Schema {
  @type("string") name: string | undefined;
  @type("string") color: string | undefined;
  @type(Position) position = new Position();
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  createPlayer(id: string) {
    const player = new Player();
    player.name = `Player ${Math.floor(Math.random() * 101)}`;
    player.color = getRandomHexColor();
    player.position.x = Math.floor(Math.random() * 10);
    player.position.y = 1;
    player.position.z = Math.floor(Math.random() * 8);

    this.players[id] = player;
    console.log("Players array now = " + JSON.stringify(this.players));
  }
  removePlayer(id: string) {
    delete this.players[id];
  }
  movePlayer(id: string, data: any) {
    const player: Player = this.players[id];
    player.position.x = data.x;
    player.position.y = data.y;
    player.position.z = data.z;
  }
  setPlayerUsername(id: string, data: string) {
    let player: Player = this.players[id];
    player.name = data;
  }
}
//#endregion

export class GameRoom extends Room {
  onCreate(options: any) {
    console.log("Game Room created!", options);
    this.setState(new State());
  }

  onJoin(client: Client, options: any) {
    console.log("Player Joined = ", client.sessionId);
    this.state.createPlayer(client.sessionId);
  }

  onMessage(client: Client, message: any) {
    console.log("Game Room received message from", client.sessionId);
    const [event, data] = message;
    if (event === "movement") {
      this.state.movePlayer(client.sessionId, data);
    } else if (event === "username") {
      this.state.setPlayerUsername(client.sessionId, data);
    }
    //console.log("Game Room received message from", client.sessionId, ":", message);
  }

  onLeave(client: Client, consented: boolean) {
    console.log("Player Left = ", client.sessionId);
    this.state.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log("Game Room disposed.");
  }
}

export function getRandomHexColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
