export class Agent {

	constructor(worldWidth, worldHeight, lifeWorkerService, id) {
		this._id = id;
		this._worldWidth = worldWidth;
		this._worldHeight = worldHeight;
		this._lifeWorkerService = lifeWorkerService;
		this._goldenRatio = 1.618;
		this._TAU = 2 * Math.PI;
		this.minRadius = 5;
		this.maxRadius = 20;
		this._adultRadius = this.maxRadius / this._goldenRatio;
		this.depletion = 0;

		this.angle = 2 * Math.random(0) * Math.PI;
		this.x = Math.round(this._worldWidth / 2);
		this.y = Math.round(this._worldHeight / 2);
		this.radius = 10;
		// fat is serving as surface with implicit radius for the agents
		this._fat = Math.round(Math.PI * Math.pow(this.radius, 2));
		this.gender = 'male';
		this.pregnant = false;
		this.sensingDistance = this.radius * 2;
		this.turnAmount = 5;
		this._agentImages = {
			'male': [$('.bug_0')[0], $('.bug-0')[0]],
			'female': [$('.bug_1')[0], $('.bug-1')[0]]
		}
		this._stepEnergy = _ => Math.round(Math.sqrt(this.radius) / 2);
		this._xWrap = x => (x + this._worldWidth) % this._worldWidth;
		this._yWrap = y => (y + this._worldHeight) % this._worldHeight;

		this._updateProperties = _ => {
			// Surface = pi * r^2
			// r^2 = Surface / pi
			// r = Math.sqrt(Surface / pi)
			this.radius = Math.min(this.maxRadius, Math.round(Math.sqrt(this._fat / Math.PI)));
			this.sensingDistance = Math.max(20, this.radius * 2);
			const originalAdult = this.adult;
			this.adult = (this.radius > this._adultRadius) * 1;
			if (this.adult == this.originalAdult) return;
			this.image = this._agentImages[this.gender][this.adult];
		};

		this.setWorldSize = (width, height) => {
			this._worldWidth = width;
			this._worldHeight = height;
		};

		this.step = _ => {
			this._updateProperties();
			this._eat();
			if (this._fat > 0) {
				this._fat -= this._stepEnergy();
				const dy = Math.sin(this.angle);
				const dx = Math.cos(this.angle);
				this.x = this._xWrap(this.x + dx);
				this.y = this._yWrap(this.y + dy);
			} else {
				this.depletion += 1;
				(this.depletion == 100) && this._die();
			}
			const foodAngleNudge = this._senseFood() || this._goldenRatio / 10;
			this.angle += this.turnAmount * foodAngleNudge * Math.PI / 360;
			this._setVertical();
		}

		this._eat = _ => {
			const cellsInBox = this._lifeWorkerService.getBoxCells(this.x, this.y, Math.round(this.radius / 2));
			const cellsEaten = cellsInBox.filter(cell => this._cellIsCovered(cell));
			this._fat += cellsEaten.length;
			this._lifeWorkerService.eatCells(this.x, this.y, this.radius / 2);
		};

		this._cellIsCovered = cell => (Math.pow(cell[0] - this.x, 2) + Math.pow(cell[1] - this.y, 2)) < Math.pow(this.radius, 2);

		this._setVertical = _ => {
			const angle = this.angle;
			const tolerance = 1e-2; // choose a suitable tolerance
			if (Math.abs(angle - 0.5 * Math.PI) < tolerance) {
				this._vertical = -this._worldHeight;
			}
			if (Math.abs(angle - 1.5 * Math.PI) < tolerance) {
				this._vertical = this._worldHeight;
			}
			this._vertical = false;
		}

		this._axis = x => {
			if (!this._vertical) {
				const a = Math.tan(this.angle);
				const y = a * (x - this.x) + this.y;
				return y;
			}
			return this._vertical;
		};

		// this._axis = x => {
		// 	const a = Math.tan(this.angle);
		// 	const y = a * (x - this.x) + this.y;
		// 	return y;
		// };

		this._perpendicularAxis = x => {
			if (!this._vertical) {
				const a = Math.tan(this.angle - (Math.PI / 2));
				const y = a * (x - this.x) + this.y;
				return y;
			}
			return this._vertical;
		};

		this._senseFood = _ => {
			const cellsAround = this._lifeWorkerService.getBoxCells(this.x, this.y, this.sensingDistance);
			const cellsAhead = cellsAround?.filter(cell => cell[1] > this._perpendicularAxis(cell[0]));
			if (!cellsAhead?.length) return 0;

			const leftCells = cellsAhead?.filter(cell => cell[1] > this._axis(cell[0]));
			const leftCellCount = leftCells?.length ?? 0;
			const rightCellsCount = cellsAhead?.length - leftCellCount ?? 0;
			if (leftCellCount == rightCellsCount) return 0;

			const moreCellRight = leftCellCount < rightCellsCount;
			const angleIncrement = [-1, 1][moreCellRight * 1];
			return angleIncrement;
		}

		this._die = _ => {
			setTimeout(_ => {
				const xy = [Math.round(this.x), Math.round(this.y)];
				this._lifeWorkerService.addAcorn(xy);
			});
		}

		// TODO: sneller mogelijk omdat cellen gesorteerd zijn op y, x
		// dubbel loopje snel tot minY, stoppen na maxY
		// of binary search tree toepassen
	}

	createAgent(worldWidth, worldHeight, lifeWorkerService, id) {
		const newAgent = new Agent(worldWidth, worldHeight, lifeWorkerService, id);
		return newAgent;
	}

}
