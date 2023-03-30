import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class LifeWorkerService {

	constructor(eventAggregator) {
		this.ea = eventAggregator;
		this._lifeWorker = new Worker('./assets/life-worker.js');

		this._buffer = [];
		this._fillSlotIndex = 0;
		this._getSlotIndex = 0;
		this._maxIndex = 9;
	}

	getCells() {
		return this._buffer;
	}

	getCellCount() {
		return this._buffer.length;
	}

	_withinBox(cellX, cellY, x, y, distance) {
		const minX = x - distance;
		const maxX = x + distance;
		const minY = y - distance;
		const maxY = y + distance;
		const withinBox = (
			(cellX > minX) &&
			(cellX < maxX) &&
			(cellY > minY) &&
			(cellY < maxY)
		);
		// const onOppositeSide = (
		// 	(cellX + this._worldWidth > minX) &&
		// 	(cellX - this._worldWidth < maxX) &&
		// 	(cellY + this._worldHeight > minY) &&
		// 	(cellY - this._worldWidth < maxY));
		return withinBox;
	}

	getBoxCells(x, y, distance) {
		const realDistance = Math.round(distance / this._cellSize);
		const boxCells = this._buffer.filter(cell => this._withinBox(cell[0], cell[1], x, y, distance));
		return boxCells;
	}

	eatCells(x, y, radius) {
		const workerData = {
			message: 'killCells',
			x: Math.round(x),
			y: Math.round(y),
			radius: radius / this._cellSize
		}
		this._lifeWorker.postMessage(workerData);
	}

	init(width, height, liferules, cellSize) {
		this._buffer = [];
		this._lifeWorker.onmessage = (e) => {
			this._buffer = e.data.cells || [];
			this.ea.publish('cellsReady');
		};
		const workerData = {
			message: 'initialize',
			w: width,
			h: height,
			liferules: liferules
		};
		this._worldWidth = width;
		this._worldHeight = height;
		this._cellSize = cellSize;
		this._lifeWorker.postMessage(workerData);
	}

	resize(width, height, cellSize) {
		const inArea = cell => {
			return (cell[0] <= width) && (cell[1] <= height);
		};
		this._buffer = this._buffer.filter(inArea);
		const workerData = {
			message: 'setSize',
			w: width,
			h: height
		};
		this._worldWidth = width;
		this._worldHeight = height;
		this._cellSize = cellSize;
		this._lifeWorker.postMessage(workerData);
	}

	clear() {
		// this._buffer = [];
		const workerData = {
			message: 'clear',
		};
		this._lifeWorker.postMessage(workerData);
	}

	fillRandom() {
		const workerData = {
			message: 'fillRandom',
		};
		this._lifeWorker.postMessage(workerData);
	}

	changeRules(rules) {
		const workerData = {
			message: 'rules',
			rules: rules
		};
		this._lifeWorker.postMessage(workerData);
	}

	addCell(xy) {
		const cells = this._buffer;
		if (xy) {
			cells.push(xy);
		}
		const workerData = {
			message: 'setCells',
			cells: cells
		};
		this._lifeWorker.postMessage(workerData);
	}

	addCells(cells) {
		if (cells.length) {
			this._buffer.push(...cells);
			const workerData = {
				message: 'setCells',
				cells: this._buffer
			};
			this._lifeWorker.postMessage(workerData);
		}
	}

	_convertRle2Cells(rle, offsetX = 0, offsetY = 0) {
		const cells = [];
		const instructions = rle.split('');
		let x = 0, y = 0, repetitions = 1;
		instructions.forEach(instruction => {
			switch (true) {
				case !isNaN(instruction): // repeat instruction
					repetitions = parseInt(instruction, 10);
					break;
				case instruction == 'b': // dead cell (Burried :)
					x += repetitions;
					repetitions = 1;
					break;
				case instruction == 'o': // live cell
					for (let count = 0; count < repetitions; count++) {
						cells.push([x + offsetX, y + offsetY]);
						x++;
					}
					repetitions = 1;
					break;
				case instruction == '$': // end of line
					y++; x = 0;
					break;
				default: // instruction == '!' end of pattern
					break;
			}
		});
		return cells;
	}

	addAcorn(xy) {
		// #N Acorn
		// #O Charles Corderman
		// #C A methuselah with lifespan 5206.
		// #C www.conwaylife.com / wiki / index.php ? title = Acorn
		// x = 7, y = 3, rule = B3 / S23
		const rle = 'bo5b$3bo3b$2o2b3o!';
		const cells = this._convertRle2Cells(rle, xy[0], xy[1]);
		this.addCells(cells);
	}

	getGeneration() {
		const workerData = {
			message: 'step'
		};
		this._lifeWorker.postMessage(workerData);
	}

}
