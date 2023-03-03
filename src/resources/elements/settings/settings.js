import {
    inject
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class SettingsCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.liferules = [];
        this.selectedPreset = 6;
        this.presets = [
            { rule: undefined, name: '' },
            { rule: "125/36", name: "2&times;2" },
            { rule: "34/34", name: "34 Life" },
            { rule: "1358/357", name: "Amoeba" },
            { rule: "4567/345", name: "Assimilation" },
            { rule: "235678/378", name: "Coagulations" },
            { rule: "23/3", name: "Conway&rsquo;s Life" },
            { rule: "45678/3", name: "Coral" },
            { rule: "34678/3678", name: "Day &amp; Night" },
            { rule: "5678/35678", name: "Diamoeba" },
            { rule: "012345678/3", name: "Flakes" },
            { rule: "1/1", name: "Gnarl" },
            { rule: "23/36", name: "High Life" },
            // { rule: "34678/0123478/2", name: "Inverse Life" }, 
            { rule: "5/345", name: "Long Life" },
            { rule: "12345/3", name: "Maze" },
            { rule: "1234/3", name: "Mazectric" },
            { rule: "245/368", name: "Move" },
            { rule: "238/357", name: "Pseudo Life" },
            { rule: "1357/1357", name: "Replicator" },
            { rule: "/2", name: "Seeds" },
            { rule: "/234", name: "Serviettes" },
            { rule: "235678/3678", name: "Stains" },
            { rule: "2345/45678", name: "Walled Cities" },
            { rule: "1/12", name: "Sierpinski" }
        ];
        this.grid = false;
        this.trails = true;
        this.cellSizeExp = 1;
        this.minCellSize = 0;
        this.maxCellSize = 5;
        this.setPreset();
    }

    get cellSize() {
        return Math.pow(2, this.cellSizeExp);
    }

    toggleTrails() {
        this.ea.publish('toggleTrails', this.trails);
    }

    toggleGrid() {
        this.ea.publish('toggleGrid', this.grid);
    }

    setCellSize() {
        this.ea.publish('cellSize', this.cellSize);
    }

    setPreset() {
        if (this.selectedPreset > 0) {
            let rulesSet = this.presets[this.selectedPreset].rule.split('/');
            let stayRulesString = rulesSet[0];
            let newRulesString = rulesSet[1];
            let newRules = [];
            let i = 0;
            for (let i = 0; i < 9; i++) {
                newRules[i] = newRulesString.includes(i);
                newRules[i + 10] = stayRulesString.includes(i);
            }
            this.liferules = newRules;
            this.publishRules(false);
        }
    }

    publishRules(init) {
        this.ea.publish('lifeRules', {
            liferules: this.liferules,
            init: init
        });
    }

    compareToPresets() {
        let newRules = this.liferules.slice(0, 9);
        let stayRules = this.liferules.slice(10, 19);
        let trueIndexesString = (rule, index) => {
            return rule ? index : '';
        };
        let stayRulesString = stayRules.map(trueIndexesString).join('');
        let newRulesString = newRules.map(trueIndexesString).join('');
        let rulesString = stayRulesString + '/' + newRulesString;
        let findRulesString = preset => { return preset.rule == rulesString; };
        let index = this.presets.findIndex(findRulesString);
        this.selectedPreset = (index > -1) ? index : undefined;
    }

    setRules(i) {
        this.liferules[i] = !this.liferules[i];
        this.compareToPresets();
        this.publishRules(false);
    }

    attached() {
        this.publishRules(true);
    }
}