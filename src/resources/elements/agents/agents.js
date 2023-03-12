import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Agent } from "resources/components/agent.js"
import { LifeWorkerService } from 'resources/services/life-worker-service';

@inject(EventAggregator, Agent, LifeWorkerService)
export class AgentsCustomElement {
	@bindable food;
	@bindable worldWidth;
	@bindable worldHeight;
	agents = [];

	constructor(eventAggregator, agent, lifeWorkerService) {
		this._eventAggregator = eventAggregator;
		this._lifeWorkerService = lifeWorkerService;
		this._agent = agent;
		this._addAgent();
		this._addListeners();
	}

	attached() {
		this._cellSizeSubscription = this._eventAggregator.subscribe('cellSize', _ => {
			this.agents.forEach(agent => agent.setWorldSize(this.worldWidth, this.worldHeight));
		});
		this._agentImages = {
			'male': [$('.bug_0')[0], $('.bug-0')[0]],
			'female': [$('.bug_1')[0], $('.bug-1')[0]]
		}
	}

	_addAgent() {
		const agent = this._agent.randomAgent();
		agent => agent.setImages(this._agentImages);
		this.agents.push(agent);
	}

	_addListeners() {
		this._eventAggregator.subscribe('cellsReady', _ => {
			this._stepAgents();
		});
	}

	_stepAgents() {
		this.agents.forEach(agent => {
			agent.step(this.food);
		});
		this._eventAggregator.publish('agentsReady');
	}
}
