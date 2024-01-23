#!/usr/bin/env node

/*
v2
*/

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Media Interaction Lab
 *  Licensed under the MIT License. See LICENSE file for license information.
 *  Author: Roland Aigner | roland.aigner@fh-hagenberg.at
 *  This code is part of the supplementary material of the paper 
 *  Aigner, R., Haberfellner, M.A., Haller, M. "spaceR: Knitting Ready-Made, Tactile, and 
 *    Highly Responsive Spacer-Fabric Force Sensors for Continuous Input". In ACM UIST'22.  
 *    https://doi.org/10.1145/3526113.3545694
 *--------------------------------------------------------------------------------------------*/

"use strict";

//script to generate basic oblong spacer knits for resistive spacer sensors. the idea is to ply resistive
// yarn with the Nylon filler yarn to provide a compressible, piezoresistive filler volume. connector
// traces will be knit on both front and back faces on top and bottom 
//properties are according to Albaugh, CHI'21:
// spacing: distance between filler's front and back tucks (# of needles, 1 means alternating tuck f/b)
// density: ratio of filler to face (2/1 means two filler rows are inserted for one face row)
//          NOTE: Albaugh seems to have confused the two values though, given the illustration in Fig. 5,
//                using the notation here as described in the text, not in the figure.
//          densityFiller = 2, densityFace = 1 gives density 2/1: for every 1 face row there will be 2 
//          filler rows. front + back are counted as one single row, not two. if multiple filler rows are
//          inserted at once, offset will be applied after each of them. Note that possible cancellation
//          in filler/face ratio will be disregarded, so 4/4 is not equal to 2/2 or 1/1, e.g., 2/2 will
//          knit two face rows (front and back each) and only then insert two filler rows at once.
// offset:  horizontal shift of filler pattern, for each inserted *filler* row, i.e., "row" here is with
//          respect to filler counter, not face counter
let spacing = 3;
let densityFiller = 3;
let densityFace = 1;
let offset = 1;

if(process.argv.length !== 3) {
    console.log("usage: node pic2spacer-button.js <bitmap>");
    throw Error("invalid number of arguments")
}
let picFilename = process.argv[2];

//modify according to desired position on needle bed
let leftNeedle = 2;

let stichNr2ndStitch = 24;

let removeExt = function(filename) {
    let lastDotPos = -1;
    for(let i = 0; i < filename.length; i++)
        if(filename[i] === '.')
            lastDotPos = i;
    if(lastDotPos !== -1)
        return filename.substring(0, lastDotPos);
    return filename;
}

let outFileName = removeExt(picFilename) + "-s" + spacing + "d" + densityFiller + "-" + densityFace + "o" + offset + ".k";

var Jimp = require('jimp');

let makeFillerRepeat = function(template, wales, space, offset, offsetCntr) {

    let firstOp = undefined;
    let lastOp = undefined;

    let r = "T" + space + "t" + space;
    let repeat = "";
    for(let k = 0; k < wales; k++) {
        let p = (k - (offsetCntr * offset));
        p = ( p + Math.floor(Math.abs(p) / r.length + 1) * r.length ) % r.length;

        let c = template[k] === 'x' ? (k % 2 ? 't' : 'T' ) : (template[k] === 'f' || template[k] === 'p' ? r[p] : '.');
        if(c !== '.') {
            if(!firstOp)
                firstOp = k;
            lastOp = k;
        }
        repeat += c;
    }

    return {repeat, firstOp, lastOp};
}

Jimp.read('pics/' + picFilename)
    .then(img => {

        let wales = img.bitmap.width;
        let courses = img.bitmap.height;

        let ku = require("knittingutils");
        let ks = new ku.KnitSequence();

        ks.comment("created from file '" + picFilename + "'");

        let yarnSpandex     = ks.makeYarn("Spandex");
        let yarnPES         = ks.makeYarn("PES");
        let yarnMadeira     = ks.makeYarn("Madeira");
        let yarnColor       = ks.makeYarn("Color");
        let yarnNylon       = ks.makeYarn("Nylon");
        let yarnResistat    = ks.makeYarn("Resistat");

        let space = "-".repeat(spacing - 1);

        let offsetCntr = 0;
        let densityCntr = 0;

        ks.rack(0.25);

        let madeiraCutCntr = 0;
        let colorCutCntr = 0;

        let fillerOngoing = false;
        let fillerSet = [yarnResistat, yarnNylon];

        for(let j = 0; j < courses; j++) {

            let backYarn = yarnSpandex;
            let frontYarn = yarnPES;

            let useMadeira = false;
            let cutAndSkipFiller = false;
            let useColor = false;
            let template = "";
            for(let i = 0; i < wales; i++) {
                let idx = img.getPixelIndex(i, courses - j - 1);

                let r = img.bitmap.data[idx + 0];
                let g = img.bitmap.data[idx + 1];
                let b = img.bitmap.data[idx + 2];

                switch(r)
                {
                    case 0x7f:
                        template += 'c';    //connect front and back -- non-active area
                        break;
                    case 0xbf:
                        template += 'x';    //switch front/back -- button edge
                        break;
                    case 0xff:
                        template += 'f';    //fill -- button area
                        break;
                    default:
                        template += ' ';    //knit as usual
                        break;
                }

                if(g === 0xff)
                    useMadeira = true;
                if(b === 0xff)
                    cutAndSkipFiller = true;
            }

            if(useColor)
            {
                colorCutCntr = 3
            }
            else if(colorCutCntr)
            {
                colorCutCntr--;
                if(!colorCutCntr)
                    ks.cut(yarnColor);
            }

            if(useMadeira) 
            {
                backYarn = yarnMadeira;
                madeiraCutCntr = 3;
            }
            else if(madeiraCutCntr)
            {
                madeiraCutCntr--;
                if(!madeiraCutCntr)
                    ks.cut(yarnMadeira);
            }

            //alternate front/back knitting order, to minimize shearing effect
            // (see Albaugh, CHI'21)
            let y = ( j % 2 ? [frontYarn, backYarn] : [backYarn, frontYarn] );
            let k = ( j % 2 ? ["K", "k"] : ["k", "K"]);
            let c = ( j % 2 ? ["K", "x"] : ["x", "K"]);

            let faceRepeat = [ "", "" ];

            for(let i = 0; i < wales; i++) {
                if(template[i] === 'c') {
                    faceRepeat[0] += c[0];
                    faceRepeat[1] += c[1];
                } else if(template[i] === 'x') {
                    faceRepeat[0] += k[1];
                    faceRepeat[1] += k[0];
                } else {
                    faceRepeat[0] += k[0];
                    faceRepeat[1] += k[1];
                }
            }

            for( let i = 0; i < 2; i++ ) {
                if(y[i] === frontYarn) {
                    let repeat2nd = "";
                    for( let k = 0; k < template.length; k++ )
                        repeat2nd += (template[k] === 'f' || template[k] === 'p') ? '2' : '.';

                    ks.newCourse(y[i]);
                    ks.insert(y[i], faceRepeat[i], faceRepeat[i].length, 0, repeat2nd, stichNr2ndStitch);
                } else {
                    ks.newCourse(y[i]);
                    ks.insert(y[i], faceRepeat[i]);
                }
            }

            densityCntr++;

            if(densityCntr >= densityFace) {
                for(let i = 0; i < densityFiller; i++, offsetCntr++) {

                    let {repeat, firstOp, lastOp} = makeFillerRepeat(template, wales, space, offset, offsetCntr);

                    if(firstOp === undefined || cutAndSkipFiller) {
                        if(fillerOngoing) {
                            ks.cut(fillerSet);
                            fillerOngoing = false;
                        }
                    } else {
                        fillerOngoing = true;
                        ks.newCourse(fillerSet, firstOp);
                        ks.insert(fillerSet, repeat.substring(firstOp, lastOp + 1));
                    }
                }
                densityCntr = 0;
            }
        }

        ks.newCourse(yarnSpandex);
        ks.insert(yarnSpandex, "k", wales);

        ks.newCourse(yarnPES);
        ks.insert(yarnPES, "K", wales);

        ks.printAllMaps();
        ks.printOrder();

        ks.printSequence();

        ks.shift(leftNeedle);

        ks.mapYarn(yarnSpandex,     3);
        ks.mapYarn(yarnPES,         4);
        ks.mapYarn(yarnMadeira,     5);
        ks.mapYarn(yarnColor,       1);
        ks.mapYarn(yarnNylon,       6, false);
        ks.mapYarn(yarnResistat,    7, false);

        ks.generate(outFileName, "spacer: spacing " + spacing + ", density " + densityFiller + "/" + densityFace + ", offest " + offset,
            "Keep",
            undefined,          //machine
            true,               //autoRack
            true,               //halfGauge
            true,               //castOff
            undefined,          //backend
            ku.FRONT | ku.BACK, //castonBeds
            true,               //tube
            ku.FRONT | ku.BACK  //castoffBeds
            );
    });