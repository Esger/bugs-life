export class Agent {

	constructor(worldWidth, worldHeight, lifeWorkerService) {
		this._worldWidth = worldWidth;
		this._worldHeight = worldHeight;
		this._lifeWorkerService = lifeWorkerService;
		this._goldenRatio = 1.618;
		this.minRadius = 5;
		this.maxRadius = 20;
		this._adultRadius = this._maxRadius / this._goldenRatio;

		this.angle = 0;
		this.x = Math.round(this._worldWidth / 2);
		this.y = Math.round(this._worldHeight / 2);
		this.radius = 10;
		// fat is serving as surface with implicit radius for the agents
		this._fat = Math.round(Math.PI * Math.pow(this.radius, 2));
		this._maxFat = 2 * Math.PI * this._maxRadius ^ 2
		this.gender = 'male';
		this.pregnant = false;
		this.sensingDistance = this.radius;
		this.turnAmount = 5;
		this._agentImages = {
			'male': [$('.bug_0')[0], $('.bug-0')[0]],
			'female': [$('.bug_1')[0], $('.bug-1')[0]]
		}
		this.adult = _ => (this.radius > this._adultRadius) * 1;
		this.image = _ => this._agentImages[this.gender][this.adult()];
		this._stepEnergy = _ => Math.round(Math.sqrt(this.radius) / 2);
		this._xWrap = x => (x + this._worldWidth) % this._worldWidth;
		this._yWrap = y => (y + this._worldHeight) % this._worldHeight;

		this.setWorldSize = (width, height) => {
			this._worldWidth = width;
			this._worldHeight = height;
		};

		this.step = _ => {
			this._eat();
			if (this._fat > 0) {
				this._fat -= this._stepEnergy();
				const dy = Math.sin(this.angle);
				const dx = Math.cos(this.angle);
				this.x = this._xWrap(this.x + dx);
				this.y = this._yWrap(this.y + dy);
			}
			const angleNudge = this._senseFood();
			this.angle += this.turnAmount * angleNudge * Math.PI / 360;
		}

		this._eat = _ => {
			const cellsInBox = this._lifeWorkerService.getBoxCells(this.x, this.y, Math.round(this.radius / 2));
			const cellsEaten = cellsInBox.filter(cell => this._cellIsCovered(cell));
			this._fat += cellsEaten.length;
			// Surface = pi * r^2
			// r^2 = Surface / pi
			// r = Math.sqrt(Surface / pi)
			this.radius = Math.min(this.maxRadius, Math.round(Math.sqrt(this._fat / Math.PI)));
			this._lifeWorkerService.eatCells(this.x, this.y, this.radius / 2);
		};
		this._cellIsCovered = cell => (Math.pow(cell[0] - this.x, 2) + Math.pow(cell[1] - this.y, 2)) < Math.pow(this.radius, 2);

		this._axis = x => {
			const a = Math.tan(this.angle);
			const y = a * (x - this.x) + this.y;
			return y;
		};

		this._senseFood = _ => {

			const cellsAhead = this._withinBoxAhead(this.x, this.y);
			if (!cellsAhead?.length) return 0;

			const leftCells = cellsAhead?.filter(cell => cell[1] > this._axis(cell[0]));
			const totalLeftCells = leftCells?.length ?? 0;
			const totalRightCells = cellsAhead?.length - totalLeftCells ?? 0;
			if (totalLeftCells == totalRightCells) return 0;

			const lessCellsOnLeft = totalLeftCells < totalRightCells;
			const angleIncrement = [1, -1][lessCellsOnLeft * 1];
			return angleIncrement;

		}

		this._withinBoxAhead = (x, y) => {
			// todo: wrapAround
			const xAhead = x + Math.sin(this.angle) * this.sensingDistance;
			const yAhead = y + Math.cos(this.angle) * this.sensingDistance;
			const CellsWithinSensingDistance = this._lifeWorkerService.getBoxCells(xAhead, yAhead, this.sensingDistance);
			return CellsWithinSensingDistance;
		}

		// TODO: sneller mogelijk omdat cellen gesorteerd zijn op y, x
		// dubbel loopje snel tot minY, stoppen na maxY
		// of binary search tree toepassen
		// kijken in cirkel ervóór
		// this._getSurrounding = (lif
	}

	createAgent(worldWidth, worldHeight, lifeWorkerService) {
		const newAgent = new Agent(worldWidth, worldHeight, lifeWorkerService);
		return newAgent;
	}

}
