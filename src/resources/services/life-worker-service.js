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
		const boxCells = this._buffer.filter(cell => this._withinBox(cell[0], cell[1], x, y, distance));
		return boxCells;
	}

	eatCells(x, y, radius) {
		const workerData = {
			message: 'killCells',
			x: Math.round(x),
			y: Math.round(y),
			radius: radius
		}
		this._lifeWorker.postMessage(workerData);
	}

	init(w, h, liferules) {
		this._buffer = [];
		this._lifeWorker.onmessage = (e) => {
			this._buffer = e.data.cells || [];
			this.ea.publish('cellsReady');
		};
		const workerData = {
			message: 'initialize',
			w: w,
			h: h,
			liferules: liferules
		};
		this._worldWidth = w;
		this._worldHeight = h;
		this._lifeWorker.postMessage(workerData);
	}

	resize(w, h) {
		const inArea = cell => {
			return (cell[0] <= w) && (cell[1] <= h);
		};
		this._buffer = this._buffer.filter(inArea);
		const workerData = {
			message: 'setSize',
			w: w,
			h: h
		};
		this._worldWidth = w;
		this._worldHeight = h;
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

	getGeneration() {
		const workerData = {
			message: 'step'
		};
		this._lifeWorker.postMessage(workerData);
	}

}
