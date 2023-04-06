import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { LifeWorkerService } from 'resources/services/life-worker-service';
import { AgentsDataService } from 'resources/services/agents-data-service';
@inject(Element, EventAggregator, LifeWorkerService, AgentsDataService)
export class CanvasCustomElement {
	@bindable cells;
	@bindable cellSize;

	// TODO make a worker service for drawing

	constructor(element, eventAggregator, lifeWorkerService, agentsDataService) {
		this._element = element;
		this._eventAggregator = eventAggregator;
		this._lifeWorkerService = lifeWorkerService;
		this._agentsDataService = agentsDataService;
		this._grid = false;
		this._trails = true;
		this._showData = false;
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
		this._agents && this._drawAgents();
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
		this._agents?.forEach(agent => {
			const ctx = this._ctxOffscreen;
			// 32 -> 10 - 40
			const scale = agent.radius / 16;
			ctx.save();
			ctx.translate(agent.x * this.cellSize, agent.y * this.cellSize);
			ctx.rotate(agent.angle);
			ctx.scale(scale, scale);
			// ctx.globalAlpha = 0.1;
			ctx.drawImage(agent.image, - 16, - 16);
			if (this._showData) {
				// foodSensingDistance
				ctx.strokeStyle = "rgba(221,221,51,.7)";
				ctx.lineWidth = '1';
				ctx.beginPath();
				ctx.arc(0, 0, agent.foodSensingDistance, -Math.PI / 2, Math.PI / 2);
				// const progressRadius = Math.max(agent.radius - 2.5, 1);
				// const bugRear = 3 * Math.PI / 2;
				// const progress = (1 - agent.steps / agent.maxSteps) * Math.PI / 2;
				// const startAngle = bugRear - progress;
				// const endAngle = bugRear + progress;
				// ctx.fillStyle = "crimson";
				// ctx.fillRect(0, 0, 40, 60);
				// ctx.strokeStyle = "rgba(0,255,0,.7)";
				// ctx.arc(0, 0, progressRadius, startAngle, endAngle);
				ctx.stroke();
				ctx.fillStyle = "rgb(255,255,255)";
				ctx.rotate(-Math.PI / 2);
				ctx.fillText(agent.id, -12, -1);
			}
			ctx.restore();
		});

		this._ctx.drawImage(this._offScreenCanvas, 0, 0, this._element.width, this._element.height);
	}

	_addListeners() {
		this._eventAggregator.subscribe('cellsReady', _ => {
			this._redraw();
		});
		this._eventAggregator.subscribe('agentsReady', _ => {
			this._agents = this._agentsDataService.getAgents();
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
		this._eventAggregator.subscribe('toggleData', showData => this._showData = showData);
		this._eventAggregator.subscribe('toggleTrails', () => {
			this._trails = !this._trails;
			this._opacity = 1 - this._trails * 0.9;
		});
	}

}
