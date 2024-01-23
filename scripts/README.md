# Knitout file generator scripts

This code is part of the supplementary material of the paper 
> Aigner, R., Haberfellner, M.A., Haller, M. "spaceR: Knitting Ready-Made, Tactile, and Highly Responsive Spacer-Fabric Force Sensors for Continuous Input". In ACM UIST'22.  https://doi.org/10.1145/3526113.3545694

The JavaScript in this folder is based on [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/).

## How to install dependencies

Install NodeJS using the according package found on the [download section of the webpage](https://nodejs.org/en/download/).

Unpack the files contained in this archive, open a command line window, cd into that folder and enter ```npm install``` to install all npm dependencies.

### Dependencies

- fs
- jimp
- os
- Knitout
- KnittingUtils

[Knitout](https://textiles-lab.github.io/knitout/knitout.html) ressources can be found on the [CMU Textiles Lab](https://textiles-lab.github.io/)'s [Github](https://github.com/textiles-lab). In particular, the [Knitout frontend for JavaScript](https://github.com/textiles-lab/knitout-frontend-js) is published as an [npm package](https://www.npmjs.com/package/knitout) and will be therefore be installed by npm.

[KnittingUtils](https://github.com//MediaInteractionLab/knittingutils) is not published on npm at this point; therefore ```package.json``` is configured so npm will obtain it from Github (commit [#76261a8](https://github.com//MediaInteractionLab/knittingutils/archive/76261a8.zip))

a copy of the repository is found in the archive ```knittingutils-76261a8.zip```, in case Github the repo is unavailable

## How to run

run scripts using, ```node <scriptFile> <picTemplateFilename>``` (e.g., ```node pic2spacer-button.js circle-18.bmp```). Note that the picture template files need to be placed in the folder ```pics``` and _only filenames_ are to be specified (not relative paths, i.e., excluding the folder name).

To create all files, use the batch file ```make-all.bat```.

## Color code in picture templates

Picture templates are found in folder ```pics```. 

Color code description for ```pic2spacer-button.js```:
- red channel: 
    - ```7f hex```: PES is knit on both beds (for connecting faces at this position)
    - ```bf hex```: invert beds - PES is knit back and Spandex is knit front
    - ```ff hex```: use filler here - this is spacer/button area
    - anything else: knit as usual
- green channel:
    - ```ff hex```: use conductive yarn for front bed here (instead of Spandex)
- blue channel:
    - ```ff hex```: cut filler and don't use filler in this row

Color code description for ```pic2spacer-button-full.js```:
- red channel:
    - ```3f hex```: use filler here, but just Nylon (without resistive yarn)
    - ```7f hex```: PES is knit on both beds (for connecting faces at this position)
    - ```bf hex```: invert beds - PES is knit back and Spandex is knit front
    - ```ff hex```: use filler here - this is spacer/button area
    - anything else: knit as usual
- green channel:
    - ```ff hex```: use conductive yarn for front bed here (instead of Spandex)
- blue channel: not used

Color code description for ```pic2apad.js```:
- red channel:
    - ```7f hex```: PES is knit on both beds (for connecting faces at this position)
    - ```bf hex```: invert beds - PES is knit back and Spandex is knit front
    - ```ff hex```: use Nylon as a filler here
    - anything else: knit as usual
- green channel:
    - ```ff hex```: use conductive yarn for front bed here (instead of Spandex)
- blue channel:
    - ```7f hex```: use both Nylon and resistive yarn as a filler here

## Limitations

[TODO]
- madeira only entire row
- need to edit Knitout manually here and there (e.g., first knit course with carrier set for filler)
