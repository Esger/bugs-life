export class Agent {

	constructor(worldWidth, worldHeight, lifeWorkerService, id) {
		this.id = id;
		this._worldWidth = worldWidth;
		this._worldHeight = worldHeight;
		this._lifeWorkerService = lifeWorkerService;
		this._goldenRatio = 1.618;
		this._TAU = 2 * Math.PI;
		this.steps = 0;
		this.maxSteps = 10000;
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
		this.sensingDistance = this.radius * this._goldenRatio;
		this.turnAmount = 5;
		this._agentImages = {
			'male': [$('.bug_0')[0], $('.bug-0')[0]],
			'female': [$('.bug_1')[0], $('.bug-1')[0]]
		}
		this._stepEnergy = _ => Math.round(Math.sqrt(this.radius) / 2);
		this._xWrap = x => (x + this._worldWidth) % this._worldWidth;
		this._yWrap = y => (y + this._worldHeight) % this._worldHeight;

		this.setWorldSize = (width, height) => {
			this._worldWidth = Math.round(width);
			this._worldHeight = Math.round(height);
		};

		this._updateProperties = _ => {
			this.steps++;
			// Surface = pi * r^2
			// r^2 = Surface / pi
			// r = Math.sqrt(Surface / pi)
			this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, Math.round(Math.sqrt(this._fat / Math.PI))));
			this.sensingDistance = this.radius * this._goldenRatio;
			const originalAdult = this.adult;
			this.adult = (this.radius > this._adultRadius) * 1;
			if (this.adult == this.originalAdult) return;
			this.image = this._agentImages[this.gender][this.adult];
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
			this.angle += (this.turnAmount * foodAngleNudge * Math.PI / 180);
			this.angle = (this.angle + this._TAU) % this._TAU;
			this._setQuadrant();
		}

		this._eat = _ => {
			const cellsInBox = this._lifeWorkerService.getBoxCells(this.x, this.y, this.radius);
			const cellsEaten = cellsInBox.filter(cell => this._cellIsCovered(cell));
			this._fat += cellsEaten.length;
			this._lifeWorkerService.eatCells(this.x, this.y, this.radius);
		};

		this._cellIsCovered = cell => (Math.pow(cell[0] - this.x, 2) + Math.pow(cell[1] - this.y, 2)) < Math.pow(this.radius, 2);

		// const quadrants = ['right', 'rightDown', 'down', 'leftDown', 'left', 'leftUp', 'up', 'upRight'];
		this._setQuadrant = _ => {
			const tolerance = 1e-2; // choose a suitable tolerance
			const angle = this.angle;
			switch (true) {
				case angle < tolerance:
					this._direction = 'right';
					break;
				case angle < .5 * Math.PI - tolerance:
					this._direction = 'rightDown';
					break;
				case angle < .5 * Math.PI + tolerance:
					this._direction = 'down';
					break;
				case angle < Math.PI - tolerance:
					this._direction = 'leftDown';
					break;
				case angle < Math.PI + tolerance:
					this._direction = 'left';
					break;
				case angle < 1.5 * Math.PI - tolerance:
					this._direction = 'leftUp';
					break;
				case angle < 1.5 * Math.PI + tolerance:
					this._direction = 'up';
					break;
				case angle < 2 * Math.PI - tolerance:
					this._direction = 'rightUp';
					break;
				default:
					this._direction = undefined;
					break;
			}
		}

		this._axis = x => {
			const a = Math.tan(this.angle);
			const y = a * (x - this.x) + this.y;
			return y;
		}

		this._leftOfAxis = cell => {
			switch (this._direction) {
				case 'right':
					return cell[1] < this.y;
				case 'rightDown':
					return cell[1] < this._axis(cell[0]);
				case 'down':
					return cell[0] > this.x;
				case 'leftDown':
					return cell[1] > this._axis(cell[0]);
				case 'left':
					return cell[1] > this.y;
				case 'leftUp':
					return cell[1] > this._axis(cell[0]);
				case 'up':
					return cell[0] < this.x;
				case 'rightUp':
					return cell[1] < this._axis(cell[0]);
			}
		};

		this._perpendicularAxis = x => {
			const a = Math.tan(this.angle - (Math.PI / 2));
			const y = a * (x - this.x) + this.y;
			return y;
		}

		this._aheadPerpendicularAxis = cell => {
			switch (this._direction) {
				case 'right':
					return cell[0] > this.x;
				case 'rightDown':
					return cell[1] > this._perpendicularAxis(cell[0]);
				case 'down':
					return cell[1] > this.y;
				case 'leftDown':
					return cell[1] > this._perpendicularAxis(cell[0]);
				case 'left':
					return cell[0] < this.x;
				case 'leftUp':
					return cell[1] < this._perpendicularAxis(cell[0]);
				case 'up':
					return cell[1] < this.y;
				case 'rightUp':
					return cell[1] < this._perpendicularAxis(cell[0]);
			}
		};

		this._senseFood = _ => {
			const cellsAround = this._lifeWorkerService.getBoxCells(this.x, this.y, this.sensingDistance);
			const cellsAhead = cellsAround?.filter(cell => this._aheadPerpendicularAxis(cell));
			if (!cellsAhead?.length) return 0;

			const leftCells = cellsAhead?.filter(cell => this._leftOfAxis(cell));
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
