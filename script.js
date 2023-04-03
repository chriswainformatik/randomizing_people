var names = [
    {id : 0, value: 'one', shufflePos: 0, groupNumber: 0},
    {id : 1, value: 'two', shufflePos: 1, groupNumber: 0},
    {id : 2, value: 'three', shufflePos: 2, groupNumber: 0},
    {id : 3, value: 'four', shufflePos: 3, groupNumber: 0},
    {id : 4, value: 'five', shufflePos: 4, groupNumber: 0},
    {id : 5, value: 'six', shufflePos: 5, groupNumber: 0},
    {id : 6, value: 'seven', shufflePos: 6, groupNumber: 0}
];
//names = []
var namesContainer = document.getElementById('container-names');
regenerateCards()

/**
 * Removes all name cards and regenrates them using names list.
 */
function regenerateCards() {
    namesContainer.replaceChildren();
    names.forEach(n => {
        var div = document.createElement('div');
        div.classList.add('card');
        div.classList.add('p-2');
        div.id = 'card-' + n.id;
        div.dataset.id = n.id;
        div.dataset.name = n.value;
        div.dataset.shufflePos = n.shufflePos;
        div.innerHTML = n.value;
        namesContainer.append(div);
    });
}

// create the modal for entering names manually and setup the show modal button
const enterNamesModal = new bootstrap.Modal(document.getElementById('modal-enter-names'), {});
document.getElementById('btn-enter-names').addEventListener('click', () => {
    enterNamesModal.show();
});


var fileContents;
const setupCSVModal = new bootstrap.Modal(document.getElementById('modal-setup-csv'), {});

/**
 * Load button event listener
 */
document.getElementById('btn-load-file').addEventListener('click', () => {
    reset();
    var file = document.getElementById('formFile').files[0]
    Papa.parse(file, {
        complete: function(results) {
            fileContents = results;
            /*
            names = []
            for (var i = 0; i < results.data.length; i++) {
                names.push({
                    id : i,
                    value : results.data[i][0]
                })
            }
            */
            showCSVContents(results);
            setupCSVModal.show();
        }
    });
});

document.getElementById('modal-setup-csv-save').addEventListener('click', () => {
    names = [];
    var colsToUse = (function(){
        var result = []
        Array.from(document.getElementsByClassName('setup-csv-cols-check')).forEach(element => {
            if (element.checked == true)
                result.push(parseInt(element.dataset.id));
        });
        return result;
    }());
    for (var i = 0; i < fileContents.data.length; i++) {
        var nameToUse = '';
        colsToUse.forEach(element => {
            nameToUse += ' ' + fileContents.data[i][element];
        });
        names.push({
            id: i,
            value: nameToUse,
            shufflePos: i,
            groupNumber: 0,
        })
    }
    setupCSVModal.hide();
    regenerateCards();
});

function showCSVContents(results) {
    var lines = [];
    var  numCols = results.data[0].length;
    var theadTr = document.getElementById('setup-csv-thead-tr');
    for (var i = 0; i < numCols; i++) {
        var th = document.createElement('th');
        th.scop = 'col';
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = '';
        checkbox.id = 'setup-csv-col-' + i + '-check';
        checkbox.dataset.id = i;
        checkbox.classList.add('setup-csv-cols-check');
        checkbox.checked = 'true';
        th.append(checkbox);
        theadTr.append(th);
    }
    var tbody = document.getElementById('setup-csv-tbody');
    for (var j = 0; j < 4; j++) {
        var tr = document.createElement('tr');
        for (var i = 0; i < numCols; i++) {
            var td = document.createElement('td');
            td.innerHTML = results.data[j][i];
            tr.append(td);
       }
       tbody.append(tr);
    }
    var tr = document.createElement('tr');
    for (var i = 0; i < numCols; i++) {
        var td = document.createElement('td');
        td.innerHTML = '...';
        tr.append(td);
    }
    tbody.append(tr);
}

var animations = [];
var groupYPos = 0;

/**
 * Randomize button event listener
 */
document.getElementById('btn-randomize').addEventListener('click', () => {
    // hide randomize button and show reset button
    document.getElementById('btn-randomize').classList.add('d-none');
    document.getElementById('btn-reset').classList.remove('d-none');

    shuffleElements();

    showAnimation();
});


function shuffleElements() {
    // Fisher-Yates algorithm on names list
    for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = names[i];
        names[i] = names[j];
        names[j] = temp;
        names[i].shufflePos = i;
        names[j].shufflePos = j;
    }
    var groupSize = document.getElementById('input-groupsize').value;
    var groupSizeTmp = 0;
    var yPos = 0;
    for (var i = 0; i < names.length; i++) {
        var domElement = document.getElementById('card-'+names[i].id);
        domElement.dataset.shufflePos = names[i].shufflePos;
        domElement.dataset.yPos = yPos;
        groupSizeTmp++;
        if (groupSizeTmp == groupSize) {
            yPos += 50;
            groupSizeTmp = 0;
        }
    }
}


function showAnimation() {
    var groupSize = document.getElementById('input-groupsize').value;
    var myDelay = 0;
    var groupSizeTmp = 0;
    var elementId = 0;
    var groupNumber = 0;
    names.forEach(el => {
        var domElement = document.getElementById('card-'+el.id);
        domElement.dataset.groupNumber = groupNumber;
        el.groupNumber = groupNumber;
        animations[elementId++] = anime({
            targets: '#card-'+el.id,
            duration: 100,
            delay: myDelay,
            translateX: 250,
            translateY: (domElement.dataset.shufflePos - domElement.dataset.id) * domElement.offsetHeight + groupNumber*25,
            easing: 'easeInOutSine',
            autoplay: false
        });
        myDelay += 100;
        groupSizeTmp++;
        if (groupSizeTmp == groupSize) {
            groupNumber++;
            groupSizeTmp = 0;
        }
    });
    for (var i = 0; i < animations.length; i++) {
        animations[i].play();

        // TODO: correct this
        /*
        animations[i].finished.then(() => {
            if (groupNumber % 2 == 0)
                domElement.classList.add('text-bg-secondary');
        });
        */
    }
}

/**
 * Reset button event listener
 */
document.getElementById('btn-reset').addEventListener('click', reset);

function reset() {
    // hide reset button and show randomize button
    document.getElementById('btn-reset').classList.add('d-none');
    document.getElementById('btn-randomize').classList.remove('d-none');
    groupYPos = 0
    for (var i = 0; i < animations.length; i++) {
        animations[i].reverse();
        animations[i].play();
    }
}


/**
 * Download results button event listener
 */
document.getElementById('btn-download-results').addEventListener('click', () => {
    var shuffledList = []
    names.forEach(element => {
        shuffledList.push({
            name: element.value,
            group: element.groupNumber,
        });
    });
    var csv = Papa.unparse(shuffledList);
    var file = new Blob([csv], {type: 'csv'});
    var filename = 'random_people_list.csv';
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
});


/**
 * Form enter names manually key listener
 */
document.getElementById('form-enter-names').addEventListener('keyup', () => {
    var form = document.getElementById('form-enter-names');
    var namesCount = form.childElementCount;
    var lastInput = form.children[namesCount-1].children[1];
    if (lastInput.value.length > 0) {
        var id = namesCount++;
        var div = document.createElement('div');
        div.id = 'name-input-wrapper-' + id;
        div.classList.add('mb-3');
        div.dataset.inputNumber = id;
        var label = document.createElement('label');
        label.for = 'name-input-' + id;
        label.classList.add('col-form-label');
        label.innerHTML = 'Name:';
        div.append(label);
        var input = document.createElement('input');
        input.type = 'text';
        input.classList.add('form-control');
        input.classList.add('name-inputs');
        input.id = 'name-input-' + id;
        div.append(input);
        form.append(div);
        var divInDocument = document.getElementById(div.id);
        var h = divInDocument.offsetHeight;
        divInDocument.style.height = 0;
        anime({
            targets: '#'+div.id,
            height: h,
            duration: 50,
            easing: 'linear'
        });
    }
});

/**
 * Modal save button listener
 */
document.getElementById('modal-enter-names-save').addEventListener('click', () => {
    names = [];
    var counter = 0;
    Array.from(document.getElementsByClassName('name-inputs')).forEach(element => {
        if (element.value.length > 0)
            names.push({
                id: counter,
                value: element.value,
                shufflePos: counter++,
                groupNumber: 0,
            });
    });
    enterNamesModal.hide();
    console.log(names);
    regenerateCards();
});

/**
 * Modal closed event listener
 */
document.getElementById('modal-enter-names').addEventListener('hide.bs.modal', () => {
    var form = document.getElementById('form-enter-names');
    var div = document.createElement('div');
    div.id = 'name-input-wrapper-0';
    div.classList.add('mb-3');
    div.dataset.inputNumber = 0;
    var label = document.createElement('label');
    label.for = 'name-input-0';
    label.classList.add('col-form-label');
    label.innerHTML = 'Name:';
    div.append(label);
    var input = document.createElement('input');
    input.type = 'text';
    input.classList.add('form-control');
    input.classList.add('name-inputs');
    input.id = 'name-input-0';
    div.append(input);
    form.replaceChildren(div);
});