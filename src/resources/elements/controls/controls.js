import {
    inject
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class ControlsCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.startPulsor = true;
        this.clearPulsor = false;
        this.timeOut = 0;
        this.addListeners();
    }

    clear() {
        this.ea.publish('clear');
        this.clearPulsor = false;
        this.startPulsor = true;
    }

    stop() {
        this.ea.publish('stop');
    }

    step() {
        this.ea.publish('step');
        this.startPulsor = false;
    }

    start() {
        this.ea.publish('start');
        this.startPulsor = false;
    }

    startNstop() {
        this.ea.publish('startNstop');
        this.startPulsor = false;
    }

    fillRandom() {
        this.ea.publish('fillRandom');
    }

    setTimeoutInterval() {
        this.ea.publish('timeoutInterval', this.timeOut);
    }

    addListeners() {
        this.ea.subscribe('cellSize', response => {
            this.clearPulsor = true;
        });
    }

}