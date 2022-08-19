import Phaser from 'phaser';
import { io } from 'socket.io-client';
import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';

class MainScene extends Phaser.Scene {
	private player;
	private otherPlayers;
	private cursors;
	private socket;

	constructor() {
		super('MainScene');
	}

	preload() {
		this.load.image('player', 'picovina.png');
	}

	create() {
		this.otherPlayers = this.physics.add.group();
		this.cursors = this.input.keyboard.createCursorKeys();

		this.socket = io('http://localhost:3000');

		this.socket.on('currentPlayers', (players) => {
			console.log('current players');
			console.log(players);

			Object.keys(players).forEach((player) => {
				if (players[player].id === this.socket.id) {
					this.addPlayer(players[player]);
				} else {
					this.addOtherPlayers(players[player]);
				}
			});
		});

		this.socket.on('newPlayer', (player) => {
			this.addOtherPlayers(player);
		});

		this.socket.on('userDisconnect', (playerId) => {
			this.otherPlayers.getChildren().forEach((child) => {
				if (child.id === playerId) {
					child.destroy();
				}
			});
		});
	}
	update() {
		if (this.player) {
			if (this.cursors.left.isDown) {
				this.player.setAngularVelocity(-150);
			} else if (this.cursors.right.isDown) {
				this.player.setAngularVelocity(150);
			} else {
				this.player.setAngularVelocity(0);
			}

			if (this.cursors.up.isDown) {
				this.physics.velocityFromRotation(this.player.rotation + 1.5, 100, this.player.body.acceleration);
			} else {
				this.player.setAcceleration(0);
			}

			this.physics.world.wrap(this.player, 5);
		}
	}

	addPlayer(player: { x: number; y: number }) {
		console.log('added');

		this.player = this.physics.add.image(player.x, player.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
		this.player.setDrag(100);
		this.player.setAngularDrag(100);
		this.player.setMaxVelocity(200);
	}

	addOtherPlayers(player: { x: number; y: number; id: string }) {
		const otherPlayer = this.add.sprite(player.x, player.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
		Reflect.set(otherPlayer, 'id', player.id);
		this.otherPlayers.add(otherPlayer);
	}
}

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'phaser-example',
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: { y: 0 },
		},
	},
	backgroundColor: '#123456',
	scene: [MainScene],
	plugins: {
		scene: [
			{
				plugin: PhaserMatterCollisionPlugin,
				key: 'matterCollision',
				mapping: 'matterCollision',
			},
		],
	},
};

new Phaser.Game(config);
