// GLOBAL SELECTION AND VARIABLES

// selecting all divs in my HTML
const colorDivs = document.querySelectorAll('.color');
// selecting the generate button
const generateBtn = document.querySelector('.generate');
// selecting all the sliders for each div
const sliders = document.querySelectorAll('input[type="range"]');
// selecting all the text that show the HEX number
const currentHexes = document.querySelectorAll('.color h2');

// ADD EVENT LISTENER
sliders.forEach(slider => {
    slider.addEventListener("input", hslControls);
})




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
    colorDivs.forEach((div, index) => {
        // select h2 inside de div
        const hexText = div.children[0];
        // generate a random HEX
        const randomColor =  generateHex();

        // add the color to the bg
        div.style.backgroundColor = randomColor;
        // add the color to the text that show the HEX
        hexText.innerText = randomColor;

        // check the text contrast
        checkTextContrast(randomColor, hexText);

        // initali colorize slider
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        console.log(sliders);
        
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSLiders(color, hue, brightness, saturation);
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

    // console.log(e.target.parentElement);
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    // console.log(sliders);

    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = colorDivs[index].querySelector('h2').innerText;
    console.log(bgColor);
    

    let color = chroma(bgColor).set('hsl.s', saturation.value).set('hsl.l', brightness.value).set('hsl.h', hue.value);

    colorDivs[index].style.backgroundColor = color;
    
    
    
    
};

randomColors();