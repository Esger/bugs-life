import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { LifeWorkerService } from 'resources/services/life-worker-service';
import { CanvasService } from 'resources/services/canvas-service';

@inject(EventAggregator, LifeWorkerService, CanvasService)
export class LifeCustomElement {

	statusUpdateHandle = null;

	// TODO try this https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/

	constructor(eventAggregator, lifeWorkerService, canvasService) {
		this._eventAggregator = eventAggregator;
		this._canvasService = canvasService;
		this._lifeWorkerService = lifeWorkerService;
		this.cellSize = 2;
		this.cellsAlive = 0;
		this.liferules = [];
		this.speedInterval = 0;
		this.trails = true;
		this.running = false;
		this.cellCounts = [];
		this.lastMean = 0;
		this.stableCountDown = 20;
		this.grid = false;
		this.before = performance.now();
		this.now = performance.now();
		this.deltaTime = this.now - this.before;
		this.lifeSteps = 0;
		this.prevSteps = 0;
	}

	attached() {
		this._addListeners();
		this._eventAggregator.publish('canvasReady', this.canvas);
	}

	showStats() {
		this.before = this.now;
		this.now = performance.now();
		this.deltaTime = this.now - this.before;
		const steps = this.lifeSteps - this.prevSteps;
		this.prevSteps = this.lifeSteps;
		if (this.deltaTime <= 0) return;

		const speed = Math.floor(1000 * steps / this.deltaTime);
		this._eventAggregator.publish('stats', {
			cellCount: this.cellsAlive,
			generations: this.lifeSteps,
			speed: speed
		});
	}

	get meanOver100Gens() {
		this.cellCounts.push(this.cellsAlive);
		this.cellCounts = this.cellCounts.slice(-100);
		const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
		return average(this.cellCounts);
	}

	get stable() {
		if (Math.abs(this.meanOver100Gens - this.cellsAlive) < 7) {
			this.stableCountDown -= 1;
		} else {
			this.stableCountDown = 20;
		}
		return this.stableCountDown <= 0;
	}

	_animateStep(checkStable) {
		this._drawCells(true);
		if (this.running && (!this.stable && checkStable || !checkStable)) {
			setTimeout(_ => { this._animateStep(checkStable); }, this.speedInterval);
		} else {
			this.stop();
		}
	}

	_drawCells(generate) {
		if (generate) this._lifeWorkerService.getGeneration();
		const cells = this._lifeWorkerService.cells;
		this.cellsAlive = cells.length;
		this.lifeSteps += 1;
		this._canvasService.drawCells(cells);
	}

	_initLife() {
		this.canvas = document.getElementById('life');
		this.canvasWidth = this.canvas.width;
		this.canvasHeight = this.canvas.height;
		this._setSpaceSize();
		this.resetSteps();
		this._lifeWorkerService.init(this.spaceWidth, this.spaceHeight, this.liferules);
		this._subscribeOnFirstData();
		this._lifeWorkerService.fillRandom();
	}

	_setSpaceSize() {
		this.spaceWidth = Math.floor(this.canvasWidth / this.cellSize);
		this.spaceHeight = Math.floor(this.canvasHeight / this.cellSize);
	}

	resetSteps() {
		this.lifeSteps = 0; // Number of iterations / steps done
		this.prevSteps = 0;
	}

	slowDown() {
		this.speedWas = this.speedInterval;
		this.speedInterval = 500;
	}

	fullSpeed() {
		this.speedInterval = this.speedWas;
	}

	clear() {
		this.stop();
		this.resetSteps();
		this._lifeWorkerService.clear();
	}

	stop() {
		this.running = false;
		if (!this.statusUpdateHandle) return;

		setTimeout(() => {
			clearInterval(this.statusUpdateHandle);
			this.statusUpdateHandle = null;
		}, 333);
	}

	start() {
		this.running = true;
		this._animateStep(false);
		this.statusUpdateHandle = setInterval(() => { this.showStats(); }, 500);
	}

	startNstop() {
		this.running = true;
		this._animateStep(true); // true checks for stable life
		this.statusUpdateHandle = setInterval(() => { this.showStats(); }, 500);
	}

	_subscribeOnFirstData() {
		this._eventAggregator.subscribeOnce('dataReady', () => {
			this._drawCells();
		});
	}

	addCell(event) {
		const mouseX = (event.offsetX) ? event.offsetX : (event.pageX - this.offsetLeft);
		const realX = Math.floor(mouseX / this.cellSize);
		const mouseY = (event.offsetY) ? event.offsetY : (event.pageY - this.offsetTop);
		const realY = Math.floor(mouseY / this.cellSize);
		this._canvasService.addCell(realX, realY);
		this._subscribeOnFirstData();
		this._lifeWorkerService.addCell([realX, realY]);
	}

	_addListeners() {
		this._eventAggregator.subscribe('clear', () => {
			this.clear();
			this._subscribeOnFirstData();
		});
		this._eventAggregator.subscribe('stop', () => {
			this.stop();
		});
		this._eventAggregator.subscribe('start', () => {
			this.start();
		});
		this._eventAggregator.subscribe('startNstop', () => {
			this.startNstop();
		});
		this._eventAggregator.subscribe('step', () => {
			this._lifeWorkerService.getGeneration();
			this._subscribeOnFirstData();
		});
		this._eventAggregator.subscribe('fillRandom', () => {
			this._lifeWorkerService.fillRandom();
			this._subscribeOnFirstData();
		});
		this._eventAggregator.subscribe('timeoutInterval', response => {
			this.speedInterval = response;
		});
		this._eventAggregator.subscribe('cellSize', response => {
			this.cellSize = response;
			this._setSpaceSize();
			this._lifeWorkerService.resize(this.spaceWidth, this.spaceHeight);
			this._subscribeOnFirstData();
		});
		this._eventAggregator.subscribe('lifeRules', response => {
			this.liferules = response.liferules;
			if (response.init) {
				this._initLife();
			} else {
				this._lifeWorkerService.changeRules(this.liferules);
			}
		});
	}

}
