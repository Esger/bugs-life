import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class LifeWorkerService {

    constructor(eventAggregator) {
        this.ea = eventAggregator;

        this._buffer = [];
        this._fillSlotIndex = 0;
        this._getSlotIndex = 0;
        this._maxIndex = 9;
    }

    get cells() {
        return this._buffer;
    }

    init(w, h, liferules) {
        this.wrkr = new Worker('./assets/life-worker.js');
        this._buffer = [];
        this.wrkr.onmessage = (e) => {
            this._buffer = e.data.cells || [];
            this.ea.publish('dataReady');
        };
        let workerData = {
            message: 'initialize',
            w: w,
            h: h,
            liferules: liferules
        };
        this.wrkr.postMessage(workerData);
    }

    resize(w, h) {
        let inArea = cell => {
            return (cell[0] <= w) && (cell[1] <= h);
        };
        this._buffer = this._buffer.filter(inArea);
        let workerData = {
            message: 'setSize',
            w: w,
            h: h
        };
        this.wrkr.postMessage(workerData);
    }

    clear() {
        // this._buffer = [];
        let workerData = {
            message: 'clear',
        };
        this.wrkr.postMessage(workerData);
    }

    fillRandom() {
        let workerData = {
            message: 'fillRandom',
        };
        this.wrkr.postMessage(workerData);
    }

    changeRules(rules) {
        let workerData = {
            message: 'rules',
            rules: rules
        };
        this.wrkr.postMessage(workerData);
    }

    addCell(xy) {
        let cells = this._buffer;
        if (xy) {
            cells.push(xy);
        }
        let workerData = {
            message: 'setCells',
            cells: cells
        };
        this.wrkr.postMessage(workerData);
    }

    getGeneration() {
        let workerData = {
            message: 'step'
        };
        this.wrkr.postMessage(workerData);
    }

}
