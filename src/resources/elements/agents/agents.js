import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Agent } from "components/agent.js"
import { CanvasService } from "services/canvas-service";

@inject(EventAggregator, Agent, CanvasService)
export class AgentsCustomElement {
	_agents = [];

	constructor(eventAggregator, agent, canvasService) {
		this._eventAggregator = eventAggregator;
		this._agent = agent;
		this._canvasService = canvasService;
		this._addAgent();
		this._addListeners();
	}

	attached() {
		this._eventAggregator.publish('loadImages');
		this._agent.setImages();
	}

	_addAgent() {
		const agent = this._agent.randomAgent();
		this._agents.push(agent);
		console.log(this._agents);
	}

	_addListeners() {
		// this._eventAggregator.subscribeOnce('dataReady', _ => this.drawAgents);
		this._eventAggregator.subscribe('step', () => {
			this.drawAgents();
		});
	};

	// Draw the bugs
	drawAgents() {
		this._canvasService.pushAgents(this._agents);
	}
}
