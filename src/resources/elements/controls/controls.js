import {
	inject
} from 'aurelia-framework';
import {
	EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class ControlsCustomElement {

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this.clearPulsor = false;
		this.timeOut = 0;
		this.addListeners();
	}

	clear() {
		this._eventAggregator.publish('clear');
		this.clearPulsor = false;
	}

	stop() {
		this._eventAggregator.publish('stop');
	}

	step() {
		this._eventAggregator.publish('step');
	}

	start() {
		this._eventAggregator.publish('start');
	}

	fillRandom() {
		this._eventAggregator.publish('fillRandom');
	}

	setTimeoutInterval() {
		this._eventAggregator.publish('timeoutInterval', this.timeOut);
	}

	addListeners() {
		this._eventAggregator.subscribe('cellSize', response => {
			this.clearPulsor = true;
		});
	}

}
