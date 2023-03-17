import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Agent } from 'resources/components/agent.js';
import { LifeWorkerService } from 'resources/services/life-worker-service';
import { AgentsDataService } from 'resources/services/agents-data-service';

@inject(EventAggregator, Agent, LifeWorkerService, AgentsDataService)
export class AgentsCustomElement {
	@bindable worldWidth;
	@bindable worldHeight;

	constructor(eventAggregator, agent, lifeWorkerService, agentsDataService) {
		this._eventAggregator = eventAggregator;
		this._lifeWorkerService = lifeWorkerService;
		this._agentsDataService = agentsDataService;
		this._agents = [];
		this._agent = agent;
	}

	bind() {
	}

	attached() {
		console.log(this.worldWidth, this.worldHeight);

		setTimeout(() => {
			this._addAgent();
			this._addListeners();
		});
	}

	_addAgent() {
		const agent = this._agent.createAgent(this.worldWidth, this.worldHeight);
		this._agents.push(agent);
		this._agentsDataService.setAgents(this._agents);
	}

	_addListeners() {
		this._eventAggregator.subscribe('cellsReady', _ => {
			this._stepAgents();
		});
	}

	_stepAgents() {
		const food = this._lifeWorkerService.getCells();
		this._agents.forEach(agent => {
			agent.step(food);
		});
		this._eventAggregator.publish('agentsReady');
	}
}
