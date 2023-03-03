import {
    inject
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class StatsCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.speed = 0;
        this.cellCount = 0;
        this.generations = 0;
    }

    addListeners() {
        this.ea.subscribe('stats', response => {
            this.cellCount = response.cellCount;
            this.generations = response.generations;
            this.speed = response.speed;
        });
    }

    attached() {
        this.addListeners();
    }

}