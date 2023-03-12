import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { LifeWorkerService } from 'resources/services/life-worker-service';

@inject(EventAggregator, LifeWorkerService)
export class LifeCustomElement {

	statusUpdateHandle = null;
	cells = null;
	canvasWidth = 750;
	canvasHeight = 464;
	spaceWidth = 750;
	spaceHeight = 464;

	constructor(eventAggregator, lifeWorkerService) {
		this._eventAggregator = eventAggregator;
		this._lifeWorkerService = lifeWorkerService;
		this.cellSize = 2;
		this._cellsAlive = 0;
		this._liferules = [];
		this._speedInterval = 0;
		this._running = false;
		this._cellCounts = [];
		this._stableCountDown = 20;
		this._before = performance.now();
		this._now = performance.now();
		this._before = this._now;
		this._lifeSteps = 0;
		this._prevSteps = 0;
	}

	attached() {
		this._addListeners();
	}

	_showStats() {
		this._now = performance.now();
		this.deltaTime = this._now - this._before;
		const steps = this._lifeSteps - this._prevSteps;
		this._prevSteps = this._lifeSteps;
		if (this.deltaTime <= 0) return;

		const speed = Math.floor(1000 * steps / this.deltaTime);
		this._before = this._now;
		const cellsAlive = this._lifeWorkerService.getCellCount();
		this._eventAggregator.publish('stats', {
			cellCount: cellsAlive,
			generations: this._lifeSteps,
			speed: speed
		});
	}

	_getMeanOver100Gens() {
		this._cellCounts.push(this._cellsAlive);
		this._cellCounts = this._cellCounts.slice(-100);
		const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
		return average(this._cellCounts);
	}

	_getStable() {
		if (Math.abs(this._getMeanOver100Gens() - this._cellsAlive) < 7) {
			this._stableCountDown -= 1;
		} else {
			this._stableCountDown = 20;
		}
		return this._stableCountDown <= 0;
	}

	_animateStep(checkStable) {
		// It seems like calling this multiple times, speeds up everything even more.
		this._getCells(true);
		if (this._running && (!this._getStable() && checkStable || !checkStable)) {
			setTimeout(_ => { this._animateStep(checkStable); }, this._speedInterval);
		} else {
			this._stop();
		}
	}

	_getCells(generate) {
		if (generate) this._lifeWorkerService.getGeneration();
		this._lifeSteps += 1;
	}

	_initLife() {
		this._resetSteps();
		this.canvas = document.getElementById('life');
		this._setSpaceSize();
		this._lifeWorkerService.init(this.spaceWidth, this.spaceHeight, this._liferules);
		this._lifeWorkerService.fillRandom();
	}

	_setSpaceSize() {
		this.spaceWidth = Math.floor(this.canvasWidth / this.cellSize);
		this.spaceHeight = Math.floor(this.canvasHeight / this.cellSize);
	}

	_resetSteps() {
		this._lifeSteps = 0; // Number of iterations / steps done
		this._prevSteps = 0;
	}

	_clear() {
		this._stop();
		this._resetSteps();
		this._lifeWorkerService.clear();
	}

	_stop() {
		this._running = false;
		if (!this.statusUpdateHandle) return;

		setTimeout(() => {
			clearInterval(this.statusUpdateHandle);
			this.statusUpdateHandle = null;
		}, 333);
	}

	_start() {
		this._running = true;
		this._animateStep(false);
		this.statusUpdateHandle = setInterval(() => { this._showStats(); }, 500);
	}

	_startNstop() {
		this._running = true;
		this._animateStep(true); // true checks for stable life
		this.statusUpdateHandle = setInterval(() => { this._showStats(); }, 500);
	}

	addCell(event) {
		const mouseX = (event.offsetX) ? event.offsetX : (event.pageX - this.offsetLeft);
		const realX = Math.floor(mouseX / this.cellSize);
		const mouseY = (event.offsetY) ? event.offsetY : (event.pageY - this.offsetTop);
		const realY = Math.floor(mouseY / this.cellSize);
		this._eventAggregator.publish('addCell', [realX, realY]);
		this._lifeWorkerService.addCell([realX, realY]);
	}

	slowDown() {
		this.speedWas = this._speedInterval;
		this._speedInterval = 500;
	}

	fullSpeed() {
		this._speedInterval = this.speedWas;
	}

	_addListeners() {
		this._eventAggregator.subscribe('clear', () => {
			this._clear();
			setTimeout(_ => {
				this._showStats();
			}, 200);
		});
		this._eventAggregator.subscribe('stop', () => {
			this._stop();
		});
		this._eventAggregator.subscribe('start', () => {
			this._start();
		});
		this._eventAggregator.subscribe('startNstop', () => {
			this._startNstop();
		});
		this._eventAggregator.subscribe('step', () => {
			this._lifeWorkerService.getGeneration();
		});
		this._eventAggregator.subscribe('fillRandom', () => {
			this._lifeWorkerService.fillRandom();
			this._resetSteps();
			setTimeout(_ => {
				this._showStats();
			}, 200);
		});
		this._eventAggregator.subscribe('timeoutInterval', response => {
			this._speedInterval = response;
		});
		this._eventAggregator.subscribe('cellSize', response => {
			this.cellSize = response;
			this._setSpaceSize();
			this._lifeWorkerService.resize(this.spaceWidth, this.spaceHeight);
		});
		this._eventAggregator.subscribe('lifeRules', response => {
			this._liferules = response.liferules;
			if (response.init) {
				this._initLife();
			} else {
				this._lifeWorkerService.changeRules(this._liferules);
			}
		});
	}

}
