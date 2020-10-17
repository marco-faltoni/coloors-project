// GLOBAL SELECTION AND VARIABLES

// selecting all divs in my HTML
const colorDivs = document.querySelectorAll('.color');
// selecting the generate button
const generateBtn = document.querySelector('.generate');
// selecting all the sliders for each div
const sliders = document.querySelectorAll('input[type="range"]');
// selecting all the text that show the HEX number
const clickedHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const closeadjustBtns = document.querySelectorAll('.close-adjustment');
const sliderCtn = document.querySelectorAll('.sliders');
let initialColors;

// for Local Storage
let savedPalettes = [];


// ADD EVENT LISTENER
generateBtn.addEventListener('click', randomColors);
sliders.forEach(slider => {
    slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index)=> {
    div.addEventListener('change', () => {
        updateTextUI(index);
    })
})
clickedHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copytoClipboard(hex);
    });
});
popup.addEventListener('transitionend',() => {
    // remove pop up animation
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});
adjustBtn.forEach((btn, index) => {
    btn.addEventListener('click', () =>{
        openSettingPanel(index);
    })
});
closeadjustBtns.forEach((btn, index) => {
    btn.addEventListener('click', () =>{
        closeSettingPanel(index);
    })
});
lockBtn.forEach((button, index) => {
    button.addEventListener("click", e => {
        // im passing the event and the buttons specific index
        lockLayer(e, index);
    });
});



// FUNCTIONS

// if you want generate some HEX colour without using any JS libraries, only JS plain

// function generateHex(){
//     const letters = '#0123456789ABCDEF';
//     let hash = '#';
//     for (let i = 0; i < 6; i++) {
//         hash += letters[Math.floor(Math.random() * 16)];
//     }
//     return hash;
// }
// let randomHex = generateHex();
// console.log(randomHex);

// generate random HEX color using chroma library
function generateHex(){
    const hexColor = chroma.random();
    return hexColor;
}

function randomColors(){
    initialColors = [];
    colorDivs.forEach((div, index) => {
        // select h2 inside de div
        const hexText = div.children[0];
        // generate a random HEX
        const randomColor =  generateHex();

        // check if one of the hex text is locked
        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            // i have to put a return because im into a loop
            return;
        } else {
            initialColors.push(chroma(randomColor).hex());
        }

        console.log(chroma(randomColor).hex());

        // add the color to the bg
        div.style.backgroundColor = randomColor;
        // add the color to the text that show the HEX
        hexText.innerText = randomColor;

        // check the text contrast
        checkTextContrast(randomColor, hexText);

        // initali colorize slider
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        // console.log(sliders);
        
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSLiders(color, hue, brightness, saturation);
    })

    resetInputs();
    // check for button contrast
    adjustBtn.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockBtn[index]);
    })

}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5 ) {
        text.style.color = "black";
    } else {
        text.style.color = "white";  
    }
}

function colorizeSLiders(color, hue, brightness, saturation) {
    // take the min scale saturation
    const noSat = color.set('hsl.s', 0);
    // take the max scale saturation
    const fullSat = color.set('hsl.s', 1);
    // take the color palette gradiation thanks to chroma
    const satPalette = chroma.scale([noSat, color, fullSat]);

    // take the mid scale brightness
    const midBright = color.set("hsl.l", 0.5);
    // take the color palette gradiation thanks to chroma. im using a middle brightness because whitout that i will see only a black&white slider
    const brightPalette = chroma.scale(["black", midBright, "white"]);

    // update input saturation background colors
    saturation.style.backgroundImage = `linear-gradient(to right, ${satPalette(0)}, ${satPalette(1)})`;
    // update input brightness background colors
    brightness.style.backgroundImage = `linear-gradient(to right, ${brightPalette(0)}, ${brightPalette(0.5)}, ${brightPalette(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e){
    const index = e.target.getAttribute("data-bright") || e.target.getAttribute("data-sat") || e.target.getAttribute("data-hue");
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    // console.log(sliders);

    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    // const bgColor = colorDivs[index].querySelector('h2').innerText;
    const bgColor = initialColors[index];
    // console.log(bgColor);

    let color = chroma(bgColor).set('hsl.s', saturation.value).set('hsl.l', brightness.value).set('hsl.h', hue.value);

    colorDivs[index].style.backgroundColor = color;

    // colorize inputs
    colorizeSLiders(color, hue, brightness, saturation);
};

function updateTextUI(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    checkTextContrast(color, textHex);

    for (icon of icons) {
        checkTextContrast(color, icon);
    }
}

function resetInputs(){
    const allSliders = document.querySelectorAll('.sliders input');
    allSliders.forEach(slider => {
        if (slider.name === 'hue') {
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
            
        }
        if (slider.name === 'brightness') {
            const btColor = initialColors[slider.getAttribute('data-bright')];
            const btValue = chroma(btColor).hsl()[2];
            slider.value = Math.floor(btValue * 100) / 100;
            
        }
        if (slider.name === 'saturation') {
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
            
        }
    });
};

function copytoClipboard(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    // pop up animation
    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}

function openSettingPanel(i) {
    sliderCtn[i].classList.toggle('active');
}

function closeSettingPanel(i) {
    sliderCtn[i].classList.remove('active');
}

function lockLayer(e, index) {
    // catch the specific svg and the button's index to the background
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];
    // matching the bg index with the btn index and add locked class
    activeBg.classList.toggle("locked");
    // check if the svg has the open lock or not and changing the HTML
    if (lockSVG.classList.contains("fa-lock-open")) {
        e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
        e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
}


// implement save palette and locale storage stuffs
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');

// event listener
saveBtn.addEventListener('click',openPalette);
closeSave.addEventListener('click',closePalette);
submitSave.addEventListener('click',savePalette);

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(e) {
    // rimuovo la finestra di salvataggio
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    // salvo il testo di salvataggio immesso dall'utente 
    const name = saveInput.value;
    // creo una variabile con array vuoto su cui andrò a pushare le palette
    const colors = [];
    // ciclo le attuali palette e le pusho nell'array vuoto creato sopra
    clickedHexes.forEach(hex => {
        colors.push(hex.innerText)
    });
    // genero un oggetto
    // salvo la lunghezza delle palette, inizializzata vuota all'inizio
    let paletteNr = savedPalettes.length;

    // creo un oggetto in cui salvo il testo dell'utente, i colori pushati e il numero identificativo di ogni palette salvata
    const paletteObj = {name, colors, nr: paletteNr};
    // console.log(paletteObj);

    // pusho l'oggetto con i dati sopra nell'array vuoto creato all'inizio
    savedPalettes.push(paletteObj);
    console.log(savedPalettes);

    // chiamo la funziona che mi salva la palette nel local storage
    savetoLocal(paletteObj);

    // ripulisco il testo dell'utente per il nuovo eventuale salvataggio
    saveInput.value = '';
}

function savetoLocal(palette) {
    // inizializzo var non definita
    let localPalettes;
    // se il la chiave del local storage è nulla, la var la setto come array vuoto, altrimenti setto la chiave del local storage con il nome "palettes"
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }
    // pusho l'oggetto che ho passato alla funzione nell'array
    localPalettes.push(palette);
    // passo al Local storage l'array con l'oggetto contente le info salvate
    localStorage.setItem('palette', JSON.stringify(localPalettes));
}

randomColors();