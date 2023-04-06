var conway = {
	gogogo: null,
	cellsAlive: 0, // Number of cells alive
	fillRatio: 0.2, // Percentage of available cells that will be set alive initially (20)
	liferules: [],
	eatenAreas: [],
	numberCells: 0, // Number of available cells
	spaceHeight: 0,
	spaceWidth: 0,
	startnumberLivecells: 0,
	lifeSteps: 0, // Number of iterations / steps done

	fillZero: function () {
		const cellCount = conway.spaceWidth * conway.spaceHeight;
		const flatCells = [];
		let y = 0;
		for (; y < cellCount; y += 1) {
			flatCells.push(0);
		}
		return flatCells;
	},

	init: function (w, h, liferules) {
		conway.setSize(w, h);
		conway.liferules = liferules;
		conway.neighbours = conway.fillZero();
	},

	setSize: function (w, h) {
		conway.spaceWidth = w;
		conway.spaceHeight = h;
		conway.numberCells = conway.spaceWidth * conway.spaceHeight;
		conway.startnumberLivecells = conway.numberCells * conway.fillRatio;
		conway.cellsAlive = conway.startnumberLivecells;
	},

	fillRandom: function () {
		const cells = [];
		let y = 0;
		for (; y < conway.spaceHeight; y += 1) {
			let x = 0;
			for (; x < conway.spaceWidth; x += 1) {
				if (Math.random() < conway.fillRatio) {
					cells.push([x, y]);
				}
			}
		}
		conway.liveCells = cells;
	},

	setCells: function (cells) {
		conway.liveCells = cells;
	},

	storeEatenArea: function (area) {
		conway.eatenAreas.push(area);
	},

	outsideEatenAreas: function (x, y) {
		const insideEatenAreas = conway.eatenAreas.some(function (area) {
			const inArea = Math.pow(x - area.x, 2) + Math.pow(y - area.y, 2) < Math.pow(area.radius, 2);
			return inArea;
		})
		return !insideEatenAreas;
	},

	zeroNeighbours: function () {
		const count = conway.numberCells;

		let i = 0;
		for (; i < count; i += 1) {
			conway.neighbours[i] = 0;
		}
	},

	// Tell neighbours around livecells they have a neighbour
	updateNeighbours: function () {
		const count = conway.liveCells.length;
		const maxNeighbour = 2;
		const rowLength = conway.spaceWidth;
		const cellCount = conway.numberCells;

		let i = 0;
		for (; i < count; i += 1) {
			const thisx = conway.liveCells[i][0];
			const thisy = conway.liveCells[i][1];
			let dy = -rowLength;
			for (; dy <= rowLength; dy += rowLength) {
				const yEff = thisy * rowLength + dy;
				let dx = -1;
				for (; dx < maxNeighbour; dx += 1) {
					conway.neighbours[(yEff + thisx + dx + cellCount) % cellCount] += 1;
				}
			}
			conway.neighbours[thisy * rowLength + thisx] += 9;
		}
	},

	// Evaluate neighbourscounts for new livecells
	evaluateNeighbours: function () {
		const count = conway.numberCells;
		const rowLength = conway.spaceWidth;
		conway.liveCells = [];

		let i = 0;
		for (; i < count; i += 1) {
			if (conway.liferules[conway.neighbours[i]]) {
				const y = Math.floor(i / rowLength);
				const x = i % rowLength;
				if (conway.outsideEatenAreas(x, y))
					conway.liveCells.push([x, y]);
			}
		}

	},

	sendScreen: function (message) {
		const workerData = {
			message: message,
			cells: conway.liveCells
		};
		postMessage(workerData);
	},

	step: function () {
		conway.zeroNeighbours();
		conway.updateNeighbours();
		conway.evaluateNeighbours();
		conway.eatenAreas = [];
		conway.sendScreen('generation');
		conway.lifeSteps += 1;
	}

};

onmessage = function (e) {
	if (e && e.data && e.data.message) {
		const message = e.data.message;
		const data = e.data;
		switch (message) {
			case 'initialize':
				conway.init(data.w, data.h, data.liferules);
				break;
			case 'setSize':
				conway.setSize(data.w, data.h);
				conway.sendScreen('setSize');
				break;
			case 'fillRandom':
				conway.fillRandom();
				conway.sendScreen('fillRandom');
				break;
			case 'setCells':
				conway.setCells(data.cells);
				conway.sendScreen('setCells');
				break;
			case 'killCells':
				conway.storeEatenArea(data);
				break;
			case 'step':
				conway.step();
				break;
			case 'rules':
				conway.liferules = data.rules;
				break;
			case 'clear':
				conway.liveCells = [];
				conway.neighbours = conway.fillZero();
				conway.sendScreen('clear');
				break;
			default:
		}
	}
};
