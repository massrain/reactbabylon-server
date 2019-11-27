"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const colyseus_1 = require("colyseus");
const schema_1 = require("@colyseus/schema");
//#region PLAYERSTATE
class Position extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}
__decorate([
    schema_1.type("number")
], Position.prototype, "x", void 0);
__decorate([
    schema_1.type("number")
], Position.prototype, "y", void 0);
__decorate([
    schema_1.type("number")
], Position.prototype, "z", void 0);
exports.Position = Position;
class Player extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.position = new Position();
    }
}
__decorate([
    schema_1.type("string")
], Player.prototype, "name", void 0);
__decorate([
    schema_1.type("string")
], Player.prototype, "color", void 0);
__decorate([
    schema_1.type(Position)
], Player.prototype, "position", void 0);
exports.Player = Player;
class State extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
    }
    createPlayer(id) {
        const player = new Player();
        player.name = `Player ${Math.floor(Math.random() * 101)}`;
        player.color = getRandomHexColor();
        player.position.x = Math.floor(Math.random() * 10);
        player.position.y = 1;
        player.position.z = Math.floor(Math.random() * 8);
        this.players[id] = player;
        console.log("Players array now = " + JSON.stringify(this.players));
    }
    removePlayer(id) {
        delete this.players[id];
    }
    movePlayer(id, data) {
        const player = this.players[id];
        player.position.x = data.x;
        player.position.y = data.y;
        player.position.z = data.z;
    }
    setPlayerUsername(id, data) {
        let player = this.players[id];
        player.name = data;
    }
}
__decorate([
    schema_1.type({ map: Player })
], State.prototype, "players", void 0);
exports.State = State;
//#endregion
class GameRoom extends colyseus_1.Room {
    onCreate(options) {
        console.log("Game Room created!", options);
        this.setState(new State());
    }
    onJoin(client, options) {
        console.log("Player Joined = ", client.sessionId);
        this.state.createPlayer(client.sessionId);
    }
    onMessage(client, message) {
        console.log("Game Room received message from", client.sessionId);
        const [event, data] = message;
        if (event === "movement") {
            this.state.movePlayer(client.sessionId, data);
        }
        else if (event === "username") {
            this.state.setPlayerUsername(client.sessionId, data);
        }
        //console.log("Game Room received message from", client.sessionId, ":", message);
    }
    onLeave(client, consented) {
        console.log("Player Left = ", client.sessionId);
        this.state.removePlayer(client.sessionId);
    }
    onDispose() {
        console.log("Game Room disposed.");
    }
}
exports.GameRoom = GameRoom;
function getRandomHexColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
exports.getRandomHexColor = getRandomHexColor;
