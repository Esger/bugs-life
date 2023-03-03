var conway = {
    gogogo: null,
    cellsAlive: 0, // Number of cells alive
    fillRatio: 0.2, // Percentage of available cells that will be set alive initially (20)
    liferules: [],
    numberCells: 0, // Number of available cells
    spaceHeight: 0,
    spaceWidth: 0,
    startnumberLivecells: 0,
    lifeSteps: 0, // Number of iterations / steps done

    fillZero: function () {
        const cellCount = conway.spaceWidth * conway.spaceHeight;
        let flatCells = [];
        let y = 0;
        for (; y < cellCount; y += 1) {
            flatCells.push(0);
        }
        return flatCells;
    },

    init: function (w, h, liferules) {
        conway.setSize(w, h);
        conway.liferules = liferules;
        conway.neighbours = conway.fillZero();
    },

    setSize: function (w, h) {
        conway.spaceWidth = w;
        conway.spaceHeight = h;
        conway.numberCells = conway.spaceWidth * conway.spaceHeight;
        conway.startnumberLivecells = conway.numberCells * conway.fillRatio;
        conway.cellsAlive = conway.startnumberLivecells;
    },

    fillRandom: function () {
        let cells = [];
        let y = 0;
        for (; y < conway.spaceHeight; y += 1) {
            let x = 0;
            for (; x < conway.spaceWidth; x += 1) {
                if (Math.random() < conway.fillRatio) {
                    cells.push([x, y]);
                }
            }
        }
        return cells;
    },

    setCells: function (cells) {
        conway.liveCells = cells;
    },

    zeroNeighbours: function () {
        const count = conway.numberCells;

        let i = 0;
        for (; i < count; i += 1) {
            conway.neighbours[i] = 0;
        }
    },

    // Tell neighbours around livecells they have a neighbour
    updateNeighbours: function () {
        const count = conway.liveCells.length;
        const maxNeighbour = 2;
        const rowLength = conway.spaceWidth;
        const cellCount = conway.numberCells;

        let i = 0;
        for (; i < count; i += 1) {
            let thisx = conway.liveCells[i][0];
            let thisy = conway.liveCells[i][1];
            let dy = -rowLength;
            for (; dy <= rowLength; dy += rowLength) {
                let yEff = thisy * rowLength + dy;
                let dx = -1;
                for (; dx < maxNeighbour; dx += 1) {
                    conway.neighbours[(yEff + thisx + dx + cellCount) % cellCount] += 1;
                }
            }
            conway.neighbours[thisy * rowLength + thisx] += 9;
        }
    },

    // Evaluate neighbourscounts for new livecells
    evalNeighbours: function () {
        const count = conway.numberCells;
        const rowLength = conway.spaceWidth;
        conway.liveCells = [];

        let i = 0;
        for (; i < count; i += 1) {
            if (conway.liferules[conway.neighbours[i]]) {
                let y = Math.floor(i / rowLength);
                let x = i % rowLength;
                // let x = i - (y * rowLength);
                conway.liveCells.push([x, y]);
            }
        }
    },

    sendScreen: function (message) {
        let workerData = {
            message: message,
            cells: conway.liveCells
        };
        postMessage(workerData);
    },

    step: function () {
        conway.zeroNeighbours();
        conway.updateNeighbours();
        conway.evalNeighbours();
        conway.sendScreen('generation');
        conway.lifeSteps += 1;
    }

};

onmessage = function (e) {
    if (e && e.data && e.data.message) {
        let message = e.data.message;
        let data = e.data;
        switch (message) {
            case 'initialize':
                conway.init(data.w, data.h, data.liferules);
                break;
            case 'setSize':
                conway.setSize(data.w, data.h);
                conway.sendScreen('setSize');
                break;
            case 'addCell':
                conway.addCell(data.cell);
                conway.sendScreen('addCell');
                break;
            case 'fillRandom':
                conway.liveCells = conway.fillRandom();
                conway.sendScreen('fillRandom');
                break;
            case 'setCells':
                conway.setCells(data.cells);
                conway.sendScreen('setCells');
                break;
            case 'step':
                conway.step();
                break;
            case 'rules':
                conway.liferules = data.rules;
                break;
            case 'clear':
                conway.liveCells = [];
                conway.neighbours = conway.fillZero();
                conway.sendScreen('clear');
                break;
            default:
        }
    }
};