import {
	inject
} from 'aurelia-framework';
import {
	EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class StatsCustomElement {

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this.speed = 0;
		this.cellCount = 0;
		this.generations = 0;
		this.agentsCount = 0;
	}

	addListeners() {
		this._eventAggregator.subscribe('lifeStats', response => {
			this.cellCount = response.cellCount;
			this.generations = response.generations;
			this.speed = response.speed;
		});
		this._eventAggregator.subscribe('agentsReady', agentsCount => {
			this.agentsCount = agentsCount;
		});
	}

	attached() {
		this.addListeners();
	}

}
