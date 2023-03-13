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
			{ id: 0, rule: undefined, name: '' },
			{ id: 1, rule: "125/36", name: "2&times;2" },
			{ id: 2, rule: "34/34", name: "34 Life" },
			{ id: 3, rule: "1358/357", name: "Amoeba" },
			{ id: 4, rule: "4567/345", name: "Assimilation" },
			{ id: 5, rule: "235678/378", name: "Coagulations" },
			{ id: 6, rule: "23/3", name: "Conway&rsquo;s Life" },
			{ id: 7, rule: "45678/3", name: "Coral" },
			{ id: 8, rule: "34678/3678", name: "Day &amp; Night" },
			{ id: 9, rule: "5678/35678", name: "Diamoeba" },
			{ id: 10, rule: "012345678/3", name: "Flakes" },
			{ id: 11, rule: "1/1", name: "Gnarl" },
			{ id: 12, rule: "23/36", name: "High Life" },
			{ id: 13, rule: "5/345", name: "Long Life" },
			{ id: 14, rule: "12345/3", name: "Maze" },
			{ id: 15, rule: "1234/3", name: "Mazectric" },
			{ id: 16, rule: "245/368", name: "Move" },
			{ id: 17, rule: "238/357", name: "Pseudo Life" },
			{ id: 18, rule: "1357/1357", name: "Replicator" },
			{ id: 19, rule: "/2", name: "Seeds" },
			{ id: 20, rule: "/234", name: "Serviettes" },
			{ id: 21, rule: "235678/3678", name: "Stains" },
			{ id: 22, rule: "2345/45678", name: "Walled Cities" },
			{ id: 23, rule: "1/12", name: "Sierpinski" }
			// { id: 1, rule: "34678/0123478/2", name: "Inverse Life" }, 
		];
		this.grid = false;
		this.trails = true;
		this.cellSize = 2;
		this.cellSizeExp = 1;
		this.minCellSize = -1;
		this.maxCellSize = 5;
		this.setPreset();
	}

	toggleTrails() {
		this.ea.publish('toggleTrails', this.trails);
	}

	toggleGrid() {
		this.ea.publish('toggleGrid', this.grid);
	}

	setCellSize() {
		this.cellSize = Math.pow(2, this.cellSizeExp);
		this.ea.publish('cellSize', this.cellSize);
	}

	setPreset() {
		if (this.selectedPreset > 0) {
			const rulesSet = this.presets[this.selectedPreset].rule.split('/');
			const stayRulesString = rulesSet[0];
			const newRulesString = rulesSet[1];
			const newRules = [];
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
		const newRules = this.liferules.slice(0, 9);
		const stayRules = this.liferules.slice(10, 19);
		const trueIndexesString = (rule, index) => {
			return rule ? index : '';
		};
		const stayRulesString = stayRules.map(trueIndexesString).join('');
		const newRulesString = newRules.map(trueIndexesString).join('');
		const rulesString = stayRulesString + '/' + newRulesString;
		const findRulesString = preset => preset.rule == rulesString;
		const index = this.presets.findIndex(findRulesString);
		this.selectedPreset = (index > -1) ? index : undefined;
	}

	setRules(i) {
		this.liferules[i] = !this.liferules[i];
		this.compareToPresets();
		this.publishRules(false);
	}

	attached() {
		this.publishRules(true);
		this.setCellSize();
	}
}
