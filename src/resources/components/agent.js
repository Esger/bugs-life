export class Agent {

	_goldenRatio = 1.618;
	_minRadius = 0;
	_maxRadius = 15;
	_adultRadius = this._maxRadius / this._goldenRatio;

	randomAgent() {
		self = this;
		const newAgentObject = _ => {
			return {
				angle: 0,
				x: 50, y: 20,
				radius: 0,
				gender: 'male',
				pregnant: false,
				sensingDistance: 15,
				turnAmount: 2
			}
		};

		const newAgent = newAgentObject();
		newAgent.adult = _ => (newAgent.radius > self._adultRadius) * 1;
		newAgent.image = _ => self._bugImages[newAgent.gender][newAgent.adult()];
		newAgent.step = lifeCells => {
			const angleNudge = self._senseFood(lifeCells, newAgent.x, newAgent.y, newAgent.angle, newAgent.sensingDistance);
			const dy = Math.sin(newAgent.angle);
			const dx = Math.cos(newAgent.angle);
			newAgent.x = this._xWrap(newAgent.x + dx);
			newAgent.y = this._yWrap(newAgent.y + dy);
			newAgent.angle += newAgent.turnAmount * angleNudge * Math.PI / 360;
		}
		newAgent.setWorldSize = this._setWorldSize;

		return newAgent;
	}

	_senseFood(lifeCells, agentX, agentY, angle, delta) {
		const surroundingCells = self._getSurrounding(lifeCells, agentX, agentY, delta);
		const axis = x => {
			const a = Math.tan(angle);
			return a * (x - agentX) + agentY;
		};
		const leftCells = surroundingCells?.filter(cell => cell[1] > axis(cell[0]));
		const lessCellsOnLeft = leftCells?.length < surroundingCells?.length / 2
		const angleIncrement = [1, -1][lessCellsOnLeft * 1];
		return angleIncrement;
	}

	_getSurrounding(lifeCells, x, y, delta) {
		const minX = x - delta;
		const maxX = x + delta;
		const minY = y - delta;
		const maxY = y + delta;
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

	_xWrap(x) {
		return (x + this._worldWidth) % this._worldWidth;
	}

	_yWrap(y) {
		return (y + this._worldHeight) % this._worldHeight;
	}

	setImages(bugImages) {
		this._bugImages = bugImages;
	}

	_setWorldSize(width, height) {
		this._worldWidth = width;
		this._worldHeight = height;
	}

}
