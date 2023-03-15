import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { LifeWorkerService } from 'resources/services/life-worker-service';

@inject(Element, EventAggregator, LifeWorkerService)
export class CanvasCustomElement {
	@bindable cells;
	@bindable agents;
	@bindable cellSize;

	// TODO make a worker service for drawing

	constructor(element, eventAggregator, lifeWorkerService) {
		this._element = element;
		this._eventAggregator = eventAggregator;
		this._lifeWorkerService = lifeWorkerService;
		this._grid = false;
		this._trails = true;
		this._opacity = 1 - this._trails * 0.9;
	}

	attached() {
		setTimeout(_ => { // wait for canvas dimensions to be set in life.js
			this._initCanvas();
			this._addListeners();
		});
	}

	_offscreenCanvasIsSupported() {
		return typeof OffscreenCanvas !== "undefined"
	}

	_initCanvas() {
		this._ctx = this._element.getContext('2d');
		if (this._offscreenCanvasIsSupported()) {
			this._offScreenCanvas = new OffscreenCanvas(this._element.width, this._element.height);
		} else {
			this._offScreenCanvas = document.createElement('canvas');
			this._offScreenCanvas.width = this._element.width;
			this._offScreenCanvas.height = this._element.height;
		}
		this._ctxOffscreen = this._offScreenCanvas.getContext('2d');
	}

	_clearSpace() {
		this._ctxOffscreen.fillStyle = "rgba(255, 255, 255, 1)";
		this._ctxOffscreen.fillRect(0, 0, this._element.width, this._element.height);
		this._ctx.fillStyle = "rgba(255, 255, 255, 1)";
		this._ctx.fillRect(0, 0, this._element.width, this._element.height);
	}

	_redraw() {
		this._ctxOffscreen.fillStyle = "rgba(255, 255, 255, " + this._opacity + ")";
		this._ctxOffscreen.fillRect(0, 0, this._element.width, this._element.height);
		this._grid && this._drawgrid();
		this._drawcells();
		this.agents && this._drawAgents();
	}

	_drawcells() {
		this._ctxOffscreen.fillStyle = "rgba(128, 128, 0, 1)";
		const cells = this._lifeWorkerService.getCells();
		cells.forEach(cell => {
			this._ctxOffscreen.fillRect(cell[0] * this.cellSize, cell[1] * this.cellSize, this.cellSize, this.cellSize);
		})
		this._ctx.drawImage(this._offScreenCanvas, 0, 0, this._element.width, this._element.height);
	}

	_drawgrid() {
		const cellSize = Math.max(this.cellSize, 4);
		const maxX = this._element.width;
		const maxY = this._element.height;
		const step = cellSize * 2;
		this._ctxOffscreen.fillStyle = "rgba(128, 128, 128, 0.05)";
		let y = 0;
		let oddStep = 0;
		for (; y <= maxY; y += cellSize) {
			let x = oddStep;
			oddStep = (oddStep + cellSize) % step;
			for (; x <= maxX; x += step) {
				this._ctxOffscreen.fillRect(x, y, cellSize, cellSize);
			}
		}
		this._ctx.drawImage(this._offScreenCanvas, 0, 0, this._element.width, this._element.height);
	}

	_addCell(x, y) {
		this._ctx.fillStyle = "#d4d4d4";
		this._ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
	}

	_drawAgents() {
		this.agents?.forEach(agent => {
			const adult = (agent.adult() && !agent.pregnant) ? 1 : 0;
			const scale = Math.max(agent.radius, agent.minRadius) / 16;
			this._ctxOffscreen.save();
			this._ctxOffscreen.translate(agent.x * this.cellSize, agent.y * this.cellSize);
			this._ctxOffscreen.rotate(agent.angle);
			this._ctxOffscreen.scale(scale, scale);
			this._ctxOffscreen.drawImage(agent.image(), - 16, - 16);
			this._ctxOffscreen.restore();
		});
		this._ctx.drawImage(this._offScreenCanvas, 0, 0, this._element.width, this._element.height);

		// if (this.showData) {
		// 	let progressRadius = Math.max(bug.radius - 2.5, 1);
		// 	let bugRear = 3 * PI / 2;
		// 	let progress = (1 - bug.steps / bug.maxSteps) * PI / 2;
		// 	let startAngle = bugRear - progress;
		// 	let endAngle = bugRear + progress;
		// 	ctx.strokeStyle = "rgba(0,255,0,.7)";
		// 	ctx.lineWidth = '3';
		// 	ctx.beginPath();
		// 	ctx.arc(0, 0, progressRadius, startAngle, endAngle);
		// 	ctx.stroke();
		// 	ctx.fillStyle = "rgb(0,0,0)";
		// 	ctx.fillText(bug.id, - 6, - 2);
		// }
	}

	_addListeners() {
		this._eventAggregator.subscribe('cellsReady', _ => {
			this._redraw();
		});
		this._eventAggregator.subscribe('clear', _ => {
			setTimeout(_ => {
				this._clearSpace();
			});
		});
		this._eventAggregator.subscribe('addCell', data => {
			this._addCell(...data);
		});
		this._eventAggregator.subscribe('toggleGrid', _ => this._grid = !this._grid);
		this._eventAggregator.subscribe('toggleTrails', () => {
			this._trails = !this._trails;
			this._opacity = 1 - this._trails * 0.9;
		});
	}

}
