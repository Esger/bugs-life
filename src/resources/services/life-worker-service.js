import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class LifeWorkerService {

	constructor(eventAggregator) {
		this.ea = eventAggregator;
		this.wrkr = new Worker('./assets/life-worker.js');

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

	init(w, h, liferules) {
		this._buffer = [];
		this.wrkr.onmessage = (e) => {
			this._buffer = e.data.cells || [];
			this.ea.publish('cellsReady');
		};
		const workerData = {
			message: 'initialize',
			w: w,
			h: h,
			liferules: liferules
		};
		this.wrkr.postMessage(workerData);
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
		this.wrkr.postMessage(workerData);
	}

	clear() {
		// this._buffer = [];
		const workerData = {
			message: 'clear',
		};
		this.wrkr.postMessage(workerData);
	}

	fillRandom() {
		const workerData = {
			message: 'fillRandom',
		};
		this.wrkr.postMessage(workerData);
	}

	changeRules(rules) {
		const workerData = {
			message: 'rules',
			rules: rules
		};
		this.wrkr.postMessage(workerData);
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
		this.wrkr.postMessage(workerData);
	}

	getGeneration() {
		const workerData = {
			message: 'step'
		};
		this.wrkr.postMessage(workerData);
	}

}
