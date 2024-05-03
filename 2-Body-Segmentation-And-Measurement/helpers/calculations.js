
/**
 *        Body Part's Ids :
 * 
 *      0	left_face	                12	torso_front
        1	right_face	                13	torso_back
        2	left_upper_arm_front	    14	left_upper_leg_front
        3	left_upper_arm_back	        15	left_upper_leg_back
        4	right_upper_arm_front	    16	right_upper_leg_front
        5	right_upper_arm_back	    17	right_upper_leg_back
        6	left_lower_arm_front	    18	left_lower_leg_front
        7	left_lower_arm_back	        19	left_lower_leg_back
        8	right_lower_arm_front	    20	right_lower_leg_front
        9	right_lower_arm_back	    21	right_lower_leg_back
        10	left_hand	                22	left_foot
        11	right_hand	                23	right_foot
 */

// Valid Mask :
const PythonShell = require('python-shell');
const db = require("../models");
const { ObjectId } = require("mongodb");
const persons = db.persons;
const fs = require("fs")
const validMask = (props) => {
    // console.log("c8")
    if (props && props.allPoses.length > 0) {
        let fObj = [];
        console.log(props.allPoses[0].keypoints)
        props.allPoses.map((poseObj) => {
            let keypoints = poseObj.keypoints
            let conclusion = [];
            for (let i = 0; i < keypoints.length; i++) {
                if ([0, 5, 6, 11, 12, 13, 14].includes(i)) {
                    if (keypoints[i].score > 0.80) {
                        conclusion.push(true)
                    }
                }
            }
            if (conclusion.every((v) => v == true)) {
                fObj.push(poseObj)
            }
        })
        // console.log("c9")
        let finalObject = fObj.filter((it) => it.score > 0.60)[0]
        // console.log("-->",finalObject)
        // console.log("c10")
        if (finalObject) {
            // console.log("c11")
            return finalObject
        } else {
            return null
        }
    } else {
        return null
    }
}


// Get Matrix From 1D Array
const getMatrixFrom1D = async (frameHeight, frameWidth, data) => {
    try {
        var ind = 0;
        var matrix = [];
        // console.log("Data--->",data)
        // console.log('11',frameHeight, frameWidth, data)
        // Data : 1d array of (N x M) matrix : ( Height x Width ) Matrix
        // Logic : loop through whole 1d array and making 2d array( matrix ) by placing values at actual 2d positions

        for (var i = 0; i < parseInt(frameHeight); i++) {
            // console.log("123")
            matrix.push([]);

            matrix[i].push(new Array(parseInt(frameWidth)));

            for (var j = 0; j < frameWidth; j++) {
                // placing values at each position
                // console.log("234")

                matrix[i][j] = data[ind++];
                // console.log(matrix[i][j])
            }
        }
        // console.log("mat",matrix)
        // N x M matrix 
        return matrix;
    } catch (error) {
        console.log("Error from function ( getMatrixFrom1D ) : ", error.message)
    }
}


// Find Height : 

const findHeight = async (data, frameHeight, frameWidth) => {
    let headtop_i = Number.MAX_VALUE, bottom_i = -1;
    /* Logic :
     (0,1):(left,right)   -> This Ids are of Head portion
     (22,23):(left,right) -> This Ids are of foot portion
     Now looping through all pixels, and finding max top( top most point of body )
     Now looping through all pixels, and finding least bottom( bottom most point of body )
     Then height : top of body - bottom of body
     Calibration factor = ( real height ) / ( height in pixel graph )
    */
    for (let i = 0; i < frameHeight; i++) {
        for (let j = 0; j < frameWidth; j++) {
            if (data[i][j] == 1 || data[i][j] == 0) {
                if (i < headtop_i) {
                    headtop_i = i;
                }
            }
            if (data[i][j] == 22 || data[i][j] == 23) {
                if (i > bottom_i) {
                    bottom_i = i;
                }
            }
        }
    }
    let height = Math.abs(headtop_i - bottom_i);
    // 172.72/250 --> 0.69088
    // new cal : (frameheight/ 524px) * (172.72/250)
    // return height * 0.69088
    return { calibrated: height * 0.69088, height: height }
}


// Calibration Factor

const getCalibrationFactor = async (data, frameHeight, frameWidth, realHeight) => {
    try {
        let headtop_i = Number.MAX_VALUE, bottom_i = -1;
        /* Logic : 
         (0,1):(left,right)   -> This Ids are of Head portion
         (22,23):(left,right) -> This Ids are of foot portion

         Now looping through all pixels, and finding max top( top most point of body ) 
         Now looping through all pixels, and finding least bottom( bottom most point of body )

         Then height : top of body - bottom of body
         
         Calibration factor = ( real height ) / ( height in pixel graph )

        */
        for (let i = 0; i < frameHeight; i++) {
            for (let j = 0; j < frameWidth; j++) {
                if (data[i][j] == 1 || data[i][j] == 0) {
                    if (i < headtop_i) {
                        headtop_i = i;
                    }
                }
                if (data[i][j] == 22 || data[i][j] == 23) {
                    if (i > bottom_i) {
                        bottom_i = i;
                    }
                }
            }
        }
        let height = Math.abs(headtop_i - bottom_i);
        // console.log("Pixel height : ",height)
        // let newH = (121*6.49*height)/(4.84*886)
        // let calibrationFactor = realHeight / (newH*2.54);
        let calibrationFactor = realHeight / height;

        // let calFact = document.getElementById('calibration-factor')
        // calFact.innerHTML = `Calibration : ${calibrationFactor}`
        // calibration-factor
        return calibrationFactor;
    } catch (error) {
        console.log("Error from function ( getCalibrationFactor ) : ", error.message)
    }
}


// Chest Section ::

// Front Chest 

const getFrontChestWidth = async (data, frameHeight, frameWidth, calibrationFactor) => {
    try {
        /**
         * Logic : 
         *  As per human body ratios data, human body length is approx to 7.5 or 8 of length of human head.
         *  so chest line is situated at 2nd head position from top.
         *  so finding that row and on that finding extreme points
         */
        let headtop_i = Number.MAX_VALUE, headbottom_i = -1;
        for (let i = 0; i < frameHeight; i++) {
            for (let j = 0; j < frameWidth; j++) {
                if (data[i][j] == 0 || data[i][j] == 1) {
                    if (i < headtop_i) {
                        headtop_i = i;
                    }
                    if (i > headbottom_i) {
                        headbottom_i = i;
                    }
                }
            }
        }
        // head size by topmost and bottommost head point
        let headsize = headbottom_i - headtop_i;
        // adding 1 head length at bottom of head to get chest line
        // let chestRow = Math.ceil(headbottom_i + headsize*0.60);
        let chestRow = Math.ceil(headbottom_i + headsize);

        let chestLeft = Number.MAX_VALUE, chestRight = -1;
        for (let j = 0; j < frameWidth; j++) {
            if (data[chestRow][j] == 12) {
                if (j < chestLeft)
                    chestLeft = j;
                if (j > chestRight)
                    chestRight = j;
            }
        }
        let chestFrontWidth = Math.abs(chestRight - chestLeft);

        // let chestFrontElem = document.getElementById('chest-front-px')
        // chestFrontElem.innerHTML = `Chest Front PX :${chestFrontWidth}`

        // console.log("Chest in pixels :" ,chestFrontWidth)
        let chestCalibratedFrontWidth = chestFrontWidth * calibrationFactor;

        // let chestFrontElemCal = document.getElementById('chest-front-cal')
        // chestFrontElemCal.innerHTML = `Chest Front Cal :${chestCalibratedFrontWidth}`
        // chest-front-cal

        return {
            chestFrontWidth: chestFrontWidth,
            chestCalibratedFrontWidth: chestCalibratedFrontWidth
        };
    } catch (error) {
        console.log("Error from function ( getFrontChestWidth ) : ", error.message)
    }
}

// Side Chest 

const getSideChestWidth = async (data, frameHeight, frameWidth, calibrationFactor) => {
    try {
        /**
         *  Logic : 
         * 
         *   same logic as for front chest width measurement
         * 
         * 
         */
        let headtop_i = Number.MAX_VALUE, headbottom_i = -1;
        for (let i = 0; i < frameHeight; i++) {
            for (let j = 0; j < frameWidth; j++) {
                if (data[i][j] == 0 || data[i][j] == 1) {
                    if (i < headtop_i) {
                        headtop_i = i;
                    }
                    if (i > headbottom_i) {
                        headbottom_i = i;
                    }
                }
            }
        }
        let headsize = headbottom_i - headtop_i;
        // let chestRow = Math.ceil(headbottom_i + headsize*0.60);
        let chestRow = Math.ceil(headbottom_i + headsize);

        let chestLeft = Number.MAX_VALUE, chestRight = -1;
        for (let j = 0; j < frameWidth; j++) {
            if (data[chestRow][j] != -1) {
                if (j < chestLeft)
                    chestLeft = j;
                if (j > chestRight)
                    chestRight = j;
            }
        }
        let chestSideWidth = Math.abs(chestRight - chestLeft);
        // console.log("Chest-side in pixels :" ,chestSideWidth)

        // let chestSideElem = document.getElementById('chest-side-px')
        // chestSideElem.innerHTML = `Chest Side PX :${chestSideWidth}`

        let chestCalibratedSideWidth = chestSideWidth * calibrationFactor;
        return {
            chestCalibratedSideWidth: chestCalibratedSideWidth, chestSideWidth: chestSideWidth
        };
    } catch (error) {
        console.log("Error from function ( getSideChestWidth ) : ", error.message)

    }
}

// Waist Section ::

// Front Waist 

const getFrontWaistWidth = async (data, frameHeight, frameWidth, calibrationFactor) => {
    try {
        /**
         *  Logic : 
         *    according to human body ratio, waist is at 47% from top, so 53% from bottom
         *    so finding waist line and then finding both extreme points
         * 
         */
        let headtop_i = Number.MAX_VALUE, bottom_i = -1;
        for (let i = 0; i < frameHeight; i++) {
            for (let j = 0; j < frameWidth; j++) {
                if (data[i][j] == 1 || data[i][j] == 0) {
                    if (i < headtop_i) {
                        headtop_i = i;
                    }
                }
                if (data[i][j] == 22 || data[i][j] == 23) {
                    if (i > bottom_i) {
                        bottom_i = i;
                    }
                }
            }
        }
        let height = Math.abs(headtop_i - bottom_i);
        let waistFromFoot = height * 0.53;
        let waistX = Math.abs(bottom_i - waistFromFoot);
        waistX = Math.ceil(waistX);
        // console.log("waist-x : ", waistX)


        let waistLeft = Number.MAX_VALUE, waistRight = -1;
        for (let j = 0; j < frameWidth; j++) {
            if (data[waistX][j] == 12) {
                if (j < waistLeft)
                    waistLeft = j;
                if (j > waistRight)
                    waistRight = j;
            }
        }
        let waistWidth = Math.abs(waistRight - waistLeft);
        // console.log("waistWidth : ", waistWidth)
        // console.log("Waist len in pixel : ",waistWidth)

        // let waistFrontElem = document.getElementById('waist-front-px')
        // waistFrontElem.innerHTML = `Waist Front PX :${waistWidth}`

        let calibratedWaistWidth = waistWidth * calibrationFactor


        // let waistFrontElemCal = document.getElementById('waist-front-cal')
        // waistFrontElemCal.innerHTML = `Waist Front Cal :${calibratedWaistWidth}`

        return { calibratedWaistWidth: calibratedWaistWidth, waistWidth: waistWidth };
    } catch (error) {
        console.log("Error from function ( getFrontWaistWidth ) : ", error.message)
    }
}

// Side Waist 

const getSideWaistWidth = async (data, frameHeight, frameWidth, calibrationFactor) => {
    try {
        /**
        *  Logic : 
        *    same as done in front waist measurement
        */
        let headtop_i = Number.MAX_VALUE, bottom_i = -1;
        for (let i = 0; i < frameHeight; i++) {
            for (let j = 0; j < frameWidth; j++) {
                if (data[i][j] == 1 || data[i][j] == 0) {
                    if (i < headtop_i) {
                        headtop_i = i;
                    }
                }
                if (data[i][j] == 22 || data[i][j] == 23) {
                    if (i > bottom_i) {
                        bottom_i = i;
                    }
                }
            }
        }
        let height = Math.abs(headtop_i - bottom_i);
        let waistFromFoot = height * 0.53;
        let waistX = Math.abs(bottom_i - waistFromFoot);
        waistX = Math.ceil(waistX);
        // console.log('-------',waistX)
        let waistLeft = Number.MAX_VALUE, waistRight = -1;
        for (let j = 0; j < frameWidth; j++) {
            if (data[waistX][j] != -1) {
                if (j < waistLeft)
                    waistLeft = j;
                if (j > waistRight)
                    waistRight = j;
            }
        }
        let waistWidth = Math.abs(waistRight - waistLeft);
        // console.log("Waist side in pixels :",waistWidth)

        // let waistSideElem = document.getElementById('waist-side-px')
        // waistSideElem.innerHTML = `Waist Side PX :${waistWidth}`

        let calibratedSideWaistWidth = waistWidth * calibrationFactor
        return { calibratedSideWaistWidth: calibratedSideWaistWidth, waistWidth: waistWidth };
    } catch (error) {
        console.log("Error from function ( getSideWaistWidth ) : ", error.message)
    }
}


// Chest Circumference

const getChestCirumference = async (majorAxis, minorAxis, height, calibrationFactor1, calibrationFactor2) => {
    try {
        /*
            Logic : 

                Our body is near to ellipse shape, 
                 so ellipse's perimeter formula : 
                        perimeter = PI * ( (3x+3y) - sqrt( ( 3x+y )*( x+3y ) ) )
        */
        //    console.log("sfdsfsfsfsfsfsfsfsfsfs 1 : ",majorAxis)
        //    console.log("sfdsfsfsfsfsfsfsfsfsfs 2 : ",minorAxis)
        // formula-1 : 
        //let perimeter = Math.PI * (3 * (majorAxis + minorAxis) - Math.sqrt((majorAxis + 3 * minorAxis) * (3 * majorAxis + minorAxis)));
        // formula-2 :
        let apx = majorAxis.chestFrontWidth / 2 + minorAxis.chestSideWidth / 2
        let bpx = majorAxis.chestFrontWidth / 2 - minorAxis.chestSideWidth / 2
        let hpx = (bpx * bpx) / (apx * apx)
        let perimeterpx = Math.PI * (apx) * (1 + (3 * hpx / (10 + Math.sqrt(4 - 3 * hpx))))

        let a = majorAxis.chestCalibratedFrontWidth / 2 + minorAxis.chestCalibratedSideWidth / 2
        let b = majorAxis.chestCalibratedFrontWidth / 2 - minorAxis.chestCalibratedSideWidth / 2
        let h = (b * b) / (a * a)
        let perimeter = Math.PI * (a) * (1 + (3 * h / (10 + Math.sqrt(4 - 3 * h))))
        console.log("Calculated Chest Perimeter : ", perimeter)
        // old relation :
        // let predictedPerimeter = Math.floor((62.874139146809654) + (1.208111488535806 * perimeter) - (0.5282154294231999 * height))
        // new relation : 
        let predictedPerimeter = ((103.62006683442954) - (0.28443215054095855 * height) + (0.06776351002450554 * perimeterpx) - (53.04367153190805 * calibrationFactor1) + (105.42396497743705 * calibrationFactor2))


        console.log("Calculated Chest Perimeter -px: ", perimeterpx)
        let predictedPerimeterpx = (62.874139146809654) + (1.208111488535806 * perimeterpx) - (0.5282154294231999 * height)

        // without optimzed model
        // let predictedPerimeter = (65.50584059917743) + (0.9442692548988052*perimeter) - (0.38292030587105746*height) 
        // with optimzed model and correct eq. 
        // let predictedPerimeter = (62.874139146809654) + (1.208111488535806 * perimeter) - (0.5282154294231999 * height)
        // console.log("Predicted Chest Perimeter : ", predictedPerimeter)
        // return predictedPerimeter;
        return { perimeter: perimeter, perimeter_px: perimeterpx, predictedPerimeter: predictedPerimeter, predictedPerimeterpx: predictedPerimeterpx };
    } catch (error) {
        console.log("Error from function ( getChestCirumference ) : ", error.message)
    }
}

// Waist Circumference

const getWaistCircumference = async (majorAxis, minorAxis, height, calibrationFactor1, calibrationFactor2) => {
    try {
        /**
         *  Logic : 
         * 
         *   Body part as ellipse so same formula
         * 
         * 
         */
        // formula-1 : 
        //let perimeter = Math.PI * (3 * (majorAxis + minorAxis) - Math.sqrt((majorAxis + 3 * minorAxis) * (3 * majorAxis + minorAxis)));
        // formula-2 :

        let apx = majorAxis.waistWidth / 2 + minorAxis.waistWidth / 2
        let bpx = majorAxis.waistWidth / 2 - minorAxis.waistWidth / 2
        let hpx = (bpx * bpx) / (apx * apx)
        let perimeterpx = (Math.PI * (apx) * (1 + (3 * hpx / (10 + Math.sqrt(4 - 3 * hpx)))))
        console.log("Calculated waist Perimeter-px : ", perimeterpx)
        let predictedPerimeterpx = ((73.18705456218031) + (1.8473699594785384 * perimeterpx) - (0.9582604093866551 * height))

        let a = majorAxis.calibratedWaistWidth / 2 + minorAxis.calibratedSideWaistWidth / 2
        let b = majorAxis.calibratedWaistWidth / 2 - minorAxis.calibratedSideWaistWidth / 2
        let h = (b * b) / (a * a)
        let perimeter = (Math.PI * (a) * (1 + (3 * h / (10 + Math.sqrt(4 - 3 * h)))))
        console.log("Calculated waist Perimeter : ", perimeter)
        // old :
        // let predictedPerimeter = Math.floor((73.18705456218031) + (1.8473699594785384 * perimeter) - (0.9582604093866551 * height))
        //  new : 
        let predictedPerimeter = ((103.62006683442954) - (0.28443215054095855 * height) + (0.06776351002450554 * perimeterpx) - (53.04367153190805 * calibrationFactor1) + (105.42396497743705 * calibrationFactor2))


        // without optimized model with wrong eq.
        // let predictedPerimeter = (62.500643610929664) + (0.939381939440467*perimeter) - (0.3715779960074948*height) 
        // with optimzed model and correct eq.
        // let predictedPerimeter = (73.18705456218031) + (1.8473699594785384 * perimeter) - (0.9582604093866551 * height)
        // console.log("Predicted Waist Perimeter : ", predictedPerimeter)
        // return predictedPerimeter;
        return { perimeter: perimeter, perimeter_px: perimeterpx, predictedPerimeter: predictedPerimeter, predictedPerimeterpx: predictedPerimeterpx };

    } catch (error) {
        console.log("Error from function ( getWaistCircumference ) : ", error.message)
    }
}

// Function to get lines

const getChesWaisttLine = async (data, frameHeight, frameWidth, calibrationFactor) => {
    try {
        // console.log(data,"123")
        /**
         * Logic : 
         *  As per human body ratios data, human body length is approx to 7.5 or 8 of length of human head.
         *  so chest line is situated at 2nd head position from top.
         *  so finding that row and on that finding extreme points
         */
        let headtop_i = Number.MAX_VALUE, headbottom_i = -1;
        for (let i = 0; i < frameHeight; i++) {
            for (let j = 0; j < frameWidth; j++) {
                if (data[i][j] == 0 || data[i][j] == 1) {
                    if (i < headtop_i) {
                        headtop_i = i;
                    }
                    if (i > headbottom_i) {
                        headbottom_i = i;
                    }
                }
            }
        }
        // head size by topmost and bottommost head point
        let headsize = headbottom_i - headtop_i;
        // adding 1 head length at bottom of head to get chest line
        // let chestRow = Math.ceil(headbottom_i + headsize*0.60);
        let chestRow = Math.ceil(headbottom_i + headsize);

        headtop_i = Number.MAX_VALUE
        let bottom_i = -1;
        for (let i = 0; i < frameHeight; i++) {
            for (let j = 0; j < frameWidth; j++) {
                if (data[i][j] == 1 || data[i][j] == 0) {
                    if (i < headtop_i) {
                        headtop_i = i;
                    }
                }
                if (data[i][j] == 22 || data[i][j] == 23) {
                    if (i > bottom_i) {
                        bottom_i = i;
                    }
                }
            }
        }
        let height = Math.abs(headtop_i - bottom_i);
        let waistFromFoot = height * 0.53;
        let waistX = Math.abs(bottom_i - waistFromFoot);
        waistX = Math.ceil(waistX);

        // console.log("chestx",chestRow)
        // console.log("waistx",waistX)

        for (let i = 0; i < frameHeight; i++) {
            if (i == chestRow || i == waistX) {

            }
            // if (i == headbottom_i) {
            //     data[i] = Array(frameWidth).fill(1)
            // }
            // else if (i == bottom_i) {
            //     data[i] = Array(frameWidth).fill(11)
            // }
            // else if (i == chestRow) {
            //     data[i] = Array(frameWidth).fill(4)
            // } else if (i == waistX) {
            //     data[i] = Array(frameWidth).fill(12)
            // }
            else {
                data[i] = Array(frameWidth).fill(-1)
            }

        }
        var oneDArray = [];
        // console.log(data.length)
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if ([chestRow, waistX].includes(i) && data[i][j] != -1) {
                    // if (data[i][j] != -1) {
                    oneDArray.push(data[i][j]);
                    // }
                    // if(data[i][j] == 12 || data[i][j] == 4 || data[i][j] == 11 || data[i][j] == 1){
                    //     oneDArray.push(data[i][j]);
                    // }
                }
                else {
                    oneDArray.push(-1);
                }
            }
        }
        // }

        return oneDArray;
    } catch (error) {
        console.log("Error from function ( getChestWaistLine ) : ", error.message)
    }
}

// Function to get Sizes

const getSizes = async (chestCircumference, waistCircumference) => {
    try {

        let shirt_primary_size = '', pant_primary_size = '', shirt_secondary_size = '', pant_secondary_size = ''
        // shirt size
        /**
         *  S --> less than 91 
         *  M --> 91 to 98   --> mean : 94.5
         *  L --> 98 to 105  --> mean : 101.5
         *  XL --> 105 to 118 --> mean : 111.5 
         *  XXL --> greater than 118
         */
        console.log("chest->", parseFloat(chestCircumference))
        console.log("waist->", parseFloat(waistCircumference))
        if (parseFloat(chestCircumference) <= 91) {
            shirt_primary_size = "S";
        }
        else if (parseFloat(chestCircumference) > 91 && parseFloat(chestCircumference) <= 98) {
            shirt_primary_size = "M";
        }
        else if (parseFloat(chestCircumference) > 98 && parseFloat(chestCircumference) <= 105) {
            shirt_primary_size = "L";
        }
        else if (parseFloat(chestCircumference) > 98 && parseFloat(chestCircumference) <= 118) {
            shirt_primary_size = "XL";
        }
        else if (parseFloat(chestCircumference) > 118) {
            shirt_primary_size = "XXL"
        }
        let secondary_sizes = ["S", "M", "L", "XL", "XXL"]
        let mean_arr = [94.5, 101.5, 111.5, 118]
        let mean_diff = mean_arr.map((it, index) => {
            let diff = Math.abs(parseFloat(chestCircumference) - parseFloat(it))
            return {
                tag: secondary_sizes[index],
                diff: diff
            }
        })
        let secondary_item = 0;
        let least_diff = mean_diff[0]
        mean_diff.map((it, index) => {
            if (least_diff.diff > it.diff) {
                least_diff = it
                secondary_item = index
            }
        })
        mean_diff.sort(function (a, b) { return a.diff - b.diff })
        shirt_secondary_size = secondary_sizes[secondary_item]
        if (shirt_secondary_size == shirt_primary_size) {
            shirt_secondary_size = mean_diff[1].tag
        }
        // pant size
        /*
            28 --> less than 78
            30 --> 78 to 84 --> m : 81
            32 --> 84 to 89 --> 86.5
            34 --> 89 to 94 --> 91.5
            36 --> 94 to 100 --> 97
            38 --> 100 to 106 --> 103
            40 --> 106 to 112 --> 109
            42 --> 112 to 116 --> 114
            44 --> greater than 116
        */
        if (parseFloat(waistCircumference) <= 78) {
            pant_primary_size = "28";
        }
        else if (parseFloat(waistCircumference) > 78 && parseFloat(waistCircumference) <= 84) {
            pant_primary_size = "30";
        }
        else if (parseFloat(waistCircumference) > 84 && parseFloat(waistCircumference) <= 89) {
            pant_primary_size = "32";
        }
        else if (parseFloat(waistCircumference) > 89 && parseFloat(waistCircumference) <= 94) {
            pant_primary_size = "34";
        }
        else if (parseFloat(waistCircumference) > 94 && parseFloat(waistCircumference) <= 100) {
            pant_primary_size = "36";
        }
        else if (parseFloat(waistCircumference) > 100 && parseFloat(waistCircumference) <= 106) {
            pant_primary_size = "38";
        }
        else if (parseFloat(waistCircumference) > 106 && parseFloat(waistCircumference) <= 112) {
            pant_primary_size = "40";
        }
        else if (parseFloat(waistCircumference) > 112 && parseFloat(waistCircumference) <= 116) {
            pant_primary_size = "42";
        }
        else if (parseFloat(waistCircumference) > 116) {
            pant_primary_size = "44";
        }
        let secondary_sizes_pant = ["28", "30", "32", "34", "36", "38", "40", "42", "44"]
        let mean_arr_pant = [78, 81, 86.5, 91.5, 97, 103, 109, 114, 116]
        let mean_diff_pant = mean_arr_pant.map((it, index) => {
            let diff = Math.abs(parseFloat(waistCircumference) - parseFloat(it))
            return {
                tag: secondary_sizes_pant[index],
                diff: diff
            }
        })
        let secondary_item_pant = 0;
        let least_diff_pant = mean_diff_pant[0]
        mean_diff_pant.map((it, index) => {
            if (least_diff_pant.diff > it.diff) {
                least_diff_pant = it
                secondary_item_pant = index
            }
        })
        mean_diff_pant.sort(function (a, b) { return a.diff - b.diff })
        pant_secondary_size = secondary_sizes_pant[secondary_item_pant]
        if (pant_secondary_size == pant_primary_size) {
            pant_secondary_size = mean_diff_pant[1].tag
        }

        return {
            shirt_primary_size, shirt_secondary_size, pant_primary_size, pant_secondary_size
        }
    } catch (error) {
        console.log("Error from function ( getSizes ) : ", error.message)

    }
}

const GetPredictions = async (chest, waist, calibrationFactor1, calibrationFactor2) => {
    try {
        let chestObj = {
            circumference: chest,
            distance: 121,
            calibration1: calibrationFactor1,
            calibration2: calibrationFactor2
        }
        let waistObj = {
            circumference: waist,
            distance: 121,
            calibration1: calibrationFactor1,
            calibration2: calibrationFactor2
        }
        let chestInp = JSON.stringify(chestObj)
        let waistInp = JSON.stringify(waistObj)
        let options = {
            mode: 'text',
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: './ML-Model/',
            args: [chestInp, waistInp]
        };

        const pyshell = new PythonShell.PythonShell('model.prediction.py', options);

        // Listen for the message event
        pyshell.on('message', (message) => {
            // Handle the message from the Python function here
            console.log("dddd->", JSON.parse(message));
        });

        pyshell.end(function (err, code, signal) {
            if (err) throw err;
            console.log('The exit code was: ' + code);
            console.log('The exit signal was: ' + signal);
            console.log('finished');
        });
        // PythonShell.PythonShell.run('model.prediction.py', options).then(messages => {
        //     console.log('finished->', messages);
        // });

        // Listen for the message event


    } catch (error) {
        console.log("Error from function ( GetPredictions ) : ", error.message)
    }
}

// Main HAndler Function:

const calculate = async (name, weight, distance, gender, device, frontData, sideData, isAutoHeight) => {
    // console.log("c12")

    // console.log("data1",frontData)
    // console.log("data2",sideData)
    const frontImageMatrix = await getMatrixFrom1D(frontData.height, frontData.width, frontData.data)
    // console.log(frontData)
    // console.log("front",frontImageMatrix)
    const sideImageMatrix = await getMatrixFrom1D(sideData.height, sideData.width, sideData.data)
    // console.log("side",sideImageMatrix)
    let calibrationFactor1, calibrationFactor2, chestCircumference, waistCircumference, frontChestWidth, sideChestWidth, frontWaistWidth, sideWaistWidth;
    // console.log("calibrationFactor1 : ", calibrationFactor1)
    // console.log("calibrationFactor2 : ", calibrationFactor2)



    if (isAutoHeight) {
        calibrationFactor1 = 0.69088
        calibrationFactor2 = 0.69088
        const foundHeightFront = await findHeight(frontImageMatrix, frontData.height, frontData.width)
        const foundHeightSide = await findHeight(sideImageMatrix, sideData.height, sideData.width)
        let heightelemfront = document.getElementById('person-height-front')
        heightelemfront.innerHTML = `Front Height : ${foundHeightFront.calibrated}`
        let heightelemside = document.getElementById('person-height-side')
        heightelemside.innerHTML = `Side Height : ${foundHeightSide.calibrated}`

        let heightelemfrontpx = document.getElementById('person-height-front-px')
        heightelemfrontpx.innerHTML = `Front Height PX: ${foundHeightFront.height}`
        let heightelemsidepx = document.getElementById('person-height-side-px')
        heightelemsidepx.innerHTML = `Side Height PX: ${foundHeightSide.height}`

        // let calibrationFactor = calibrationFactor1 > calibrationFactor2 ? calibrationFactor1 : calibrationFactor2
        frontChestWidth = await getFrontChestWidth(frontImageMatrix, frontData.height, frontData.width, calibrationFactor1);
        // console.log("chest : ", frontChestWidth)
        sideChestWidth = await getSideChestWidth(sideImageMatrix, sideData.height, sideData.width, calibrationFactor2);
        console.log("front-chest : ", frontChestWidth)
        console.log("side-chest : ", sideChestWidth)
        console.log("form-chest : ")
        cal(frontChestWidth, sideChestWidth)
        // major axis : x/2,  minor axis : y/2

        frontWaistWidth = await getFrontWaistWidth(frontImageMatrix, frontData.height, frontData.width, calibrationFactor1);
        console.log("front-waist : ", frontWaistWidth)

        sideWaistWidth = await getSideWaistWidth(sideImageMatrix, sideData.height, sideData.width, calibrationFactor2);
        console.log("side-waist : ", sideWaistWidth)
        console.log("form-waist : ")
        cal(frontWaistWidth, sideWaistWidth)
        chestCircumference = await getChestCirumference(frontChestWidth, sideChestWidth, foundHeightSide.calibrated);
        waistCircumference = await getWaistCircumference(frontWaistWidth, sideWaistWidth, foundHeightSide.calibrated);
    } else {
        calibrationFactor1 = await getCalibrationFactor(frontImageMatrix, frontData.height, frontData.width, frontData.realHeight)
        calibrationFactor2 = await getCalibrationFactor(sideImageMatrix, sideData.height, sideData.width, sideData.realHeight)


        // let calibrationFactor = calibrationFactor1 > calibrationFactor2 ? calibrationFactor1 : calibrationFactor2
        frontChestWidth = await getFrontChestWidth(frontImageMatrix, frontData.height, frontData.width, calibrationFactor1);
        // console.log("chest : ", frontChestWidth)
        sideChestWidth = await getSideChestWidth(sideImageMatrix, sideData.height, sideData.width, calibrationFactor2);
        console.log("front-chest : ", frontChestWidth)
        console.log("side-chest : ", sideChestWidth)
        // console.log("form-chest : ")
        // cal(frontChestWidth, sideChestWidth)
        // major axis : x/2,  minor axis : y/2

        frontWaistWidth = await getFrontWaistWidth(frontImageMatrix, frontData.height, frontData.width, calibrationFactor1);
        console.log("front-waist : ", frontWaistWidth)

        sideWaistWidth = await getSideWaistWidth(sideImageMatrix, sideData.height, sideData.width, calibrationFactor2);
        console.log("side-waist : ", sideWaistWidth)
        // console.log("form-waist : ")
        // cal(frontWaistWidth, sideWaistWidth)
        chestCircumference = await getChestCirumference(frontChestWidth, sideChestWidth, frontData.realHeight, calibrationFactor1, calibrationFactor2);
        waistCircumference = await getWaistCircumference(frontWaistWidth, sideWaistWidth, frontData.realHeight, calibrationFactor1, calibrationFactor2);

        // let dp = await GetPredictions(chestCircumference.perimeter_px, waistCircumference.perimeter_px, calibrationFactor1, calibrationFactor2, frontData.realHeight)
        // console.log("Predictions->", dp)
    }


    // major axis : x/2,  minor axis : y/2
    // console.log("front-waist : ",frontWaistWidth)
    // console.log("side-waist : ",sideWaistWidth)

    // console.log("1",chestCircumference)
    // console.log("2",waistCircumference)
    const { shirt_primary_size, shirt_secondary_size, pant_primary_size, pant_secondary_size } = await getSizes(chestCircumference.perimeter, waistCircumference.perimeter)
    console.log("shirt_primary : ", shirt_primary_size)
    console.log("pant_primary : ", pant_primary_size)
    console.log("shirt_secondary: ", shirt_secondary_size)
    console.log("pant_secondary : ", pant_secondary_size)

    // const chestElem = document.getElementById('chest')
    // chestElem.innerHTML = `Chest size : ${chestCircumference} Cm`

    // const waistElem = document.getElementById('waist')
    // waistElem.innerHTML = `Waist size : ${waistCircumference} Cm`

    // printCircumPX()
    // let front = await getChesWaisttLine(frontImageMatrix, frontData.height, frontData.width, frontData.realHeight)
    // let side = await getChesWaisttLine(sideImageMatrix, sideData.height, sideData.width, sideData.realHeight)
    // return getChesWaisttLine(frontImageMatrix,frontData.height,frontData.width,frontData.realHeight)
    // return { front, side }
    return data = {
        name: name,
        height: frontData.realHeight,
        weight: weight,
        distance: distance,
        gender: gender,
        device: device,
        front_chest_px: frontChestWidth.chestFrontWidth,
        side_chest_px: sideChestWidth.chestSideWidth,
        front_waist_px: frontWaistWidth.waistWidth,
        side_waist_px: sideWaistWidth.waistWidth,
        front_chest_cm: frontChestWidth.chestCalibratedFrontWidth,
        side_chest_cm: sideChestWidth.chestCalibratedSideWidth,
        front_waist_cm: frontWaistWidth.calibratedWaistWidth,
        side_waist_cm: sideChestWidth.chestCalibratedSideWidth,
        chest_circumference_px: chestCircumference.perimeter_px,
        waist_circumference_px: waistCircumference.perimeter_px,
        chest_circumference_cm: chestCircumference.perimeter,
        waist_circumference_cm: waistCircumference.perimeter,
        calibration_factor_front: calibrationFactor1,
        calibration_factor_side: calibrationFactor2,
        // device: device,
        // mode: mode,
        chest_predicted_px: chestCircumference.predictedPerimeterpx,
        waist_predicted_px: waistCircumference.predictedPerimeterpx,
        chest_predicted: chestCircumference.predictedPerimeter,
        waist_predicted: waistCircumference.predictedPerimeter,
        shirt_primary_size: shirt_primary_size,
        shirt_secondary_size: shirt_secondary_size,
        pant_primary_size: pant_primary_size,
        pant_secondary_size: pant_secondary_size
    }
}

const generateDataset = async (type) => {

    const data = await persons.find({
        gender: type
    }, {
        name: 1,
        height: 1,
        weight: 1,
        distance: 1,
        gender: 1,
        chest_circumference_px: 1,
        waist_circumference_px: 1,
        calibration_factor_front: 1,
        calibration_factor_side: 1,
    })
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    if (!fs.existsSync(`uploads/${type}-dataset.csv`)) {
        console.log("called")
        fs.writeFileSync(`uploads/${type}-dataset.csv`, "")
        console.log("called1")

    }
    const csvWriter = createCsvWriter({
        path: `uploads/${type}-dataset.csv`,
        header: [
            { id: 'name', title: 'name' },
            { id: 'height', title: 'height' },
            { id: 'weight', title: 'weight' },
            { id: 'distance', title: 'distance' },
            { id: 'gender', title: 'gender' },
            { id: 'chest_circumference_px', title: 'chest_circumference_px' },
            { id: 'waist_circumference_px', title: 'waist_circumference_px' },
            { id: 'calibration_factor_front', title: 'calibration_factor_front' },
            { id: 'calibration_factor_side', title: 'calibration_factor_side' }
        ]
    });
    const resp = await new Promise((resolve, reject) => {
        csvWriter.writeRecords(data).then(() => {
            resolve(true)
        }).catch((err) => {
            console.log("Error : ", err)
            resolve(false)
        })
    })

    if (resp) {
        return {
            success: true,
            csv: `http://localhost:8000/${type}-dataset.csv`
        }
    } else {
        return {
            success: false,
            error: ""
        }
    }
}

module.exports = {
    getMatrixFrom1D,
    getCalibrationFactor,
    getFrontChestWidth,
    getSideChestWidth,
    getChestCirumference,
    getFrontWaistWidth,
    getSideWaistWidth,
    getWaistCircumference,
    getSizes,
    validMask,
    calculate,
    generateDataset
}
