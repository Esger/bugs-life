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
		this.stopPulsor = false;
		this.startPulsor = true;
		this.randomPulsor = false;
		this.timeOut = 0;
	}

	clear() {
		this._eventAggregator.publish('clear');
		this.clearPulsor = false;
		this.stopPulsor = false;
		this.randomPulsor = true;
	}

	stop() {
		this._eventAggregator.publish('stop');
		this.stopPulsor = false;
		this.clearPulsor = true;
	}

	step() {
		this._eventAggregator.publish('step');
	}

	start() {
		this._eventAggregator.publish('start');
		this.startPulsor = false;
		this.stopPulsor = true;
	}

	fillRandom() {
		this._eventAggregator.publish('fillRandom');
		this.randomPulsor = false;
		this.startPulsor = true;
	}

	setTimeoutInterval() {
		this._eventAggregator.publish('timeoutInterval', this.timeOut);
	}
}
