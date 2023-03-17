export class Agent {

	constructor(worldWidth, worldHeight) {
		this._worldWidth = worldWidth;
		this._worldHeight = worldHeight;
		this._goldenRatio = 1.618;
		this.minRadius = 15;
		this.maxRadius = 15;
		this._adultRadius = this._maxRadius / this._goldenRatio;

		this.angle = 0;
		this.x = 50;
		this.y = 20;
		this.radius = 15;
		this.gender = 'male';
		this.pregnant = false;
		this.sensingDistance = 30;
		this.turnAmount = 2;
		this._agentImages = {
			'male': [$('.bug_0')[0], $('.bug-0')[0]],
			'female': [$('.bug_1')[0], $('.bug-1')[0]]
		}
		this.adult = _ => (this.radius > this._adultRadius) * 1;
		this.image = _ => this._agentImages[this.gender][this.adult()];
		this._xWrap = x => (x + this._worldWidth) % this._worldWidth;
		this._yWrap = y => (y + this._worldHeight) % this._worldHeight;
		this.setWorldSize = (width, height) => {
			this._worldWidth = width;
			this._worldHeight = height;
		};
		this.step = lifeCells => {
			const dy = Math.sin(this.angle);
			const dx = Math.cos(this.angle);
			this.x = this._xWrap(this.x + dx);
			this.y = this._yWrap(this.y + dy);
			const angleNudge = this._senseFood(lifeCells, this.x, this.y, this.angle, this.sensingDistance);
			this.angle += this.turnAmount * angleNudge * Math.PI / 360;
		}

		this._senseFood = (lifeCells, delta) => {
			const surroundingCells = this._getSurrounding(lifeCells, delta);
			const axis = x => {
				const a = Math.tan(this.angle);
				return a * (x - this.x) + this.y;
			};
			const leftCells = surroundingCells?.filter(cell => cell[1] > axis(cell[0]));
			const lessCellsOnLeft = leftCells?.length < surroundingCells?.length / 2
			const angleIncrement = [1, -1][lessCellsOnLeft * 1];
			return angleIncrement;
		}

		this._getSurrounding = (lifeCells, delta) => {
			const minX = this.x - delta;
			const maxX = this.x + delta;
			const minY = this.y - delta;
			const maxY = this.y + delta;
			// TODO: sneller mogelijk omdat cellen gesorteerd zijn op y, x
			// dubbel loopje snel tot minY, stoppen na maxY
			// nog rekening houden met cellen aan de andere kant
			const surroundingCells = lifeCells.filter(cell => {
				const withinDelta =
					((cell[1] > minY || cell[1] > minY + this._worldHeight) &&
						(cell[1] < maxY || cell[1] < maxY - this._worldHeight) &&
						(cell[0] > minX || cell[0] > minX + this._worldWidth) &&
						(cell[0] < maxX || cell[0] < maxX - this._worldWidth));
				return withinDelta;
			});
			return surroundingCells;
		}
	}

	createAgent(worldWidth, worldHeight) {
		const newAgent = new Agent(worldWidth, worldHeight);
		return newAgent;
	}

}
