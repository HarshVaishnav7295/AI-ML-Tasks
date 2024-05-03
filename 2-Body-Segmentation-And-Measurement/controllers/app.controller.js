const PythonShell = require('python-shell')

const Calculations = require('../helpers/calculations')
const db = require("../models");
const { ObjectId } = require("mongodb");
const persons = db.persons;

const bodySegmentation = require('@tensorflow-models/body-segmentation')
const tf = require('@tensorflow/tfjs-node-gpu')
const sharp = require('sharp');
const fs = require('fs')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();
const { createCanvas, Image, loadImage } = require("canvas");
const { Buffer } = require("buffer");
const ejs = require("ejs");
const path = require("path");
const bodyPix = require("@tensorflow-models/body-pix")
const inkjet = require('inkjet');
// const { createCanvas, loadImage } = require('canvas')

// import '@tensorflow/tfjs-core';
// import '@tensorflow/tfjs-converter';
// // Register WebGL backend.
// import '@tensorflow/tfjs-backend-webgl';
const backend = require('@tensorflow/tfjs-backend-webgl')

// async function loadImage(path) {
//     console.log("1")
//     let image = new Image();
//     const promise = new Promise((resolve, reject) => {
//         image.onload = () => {
//             console.log("2")

//             resolve(image);
//         };
//     });
//     console.log("3")

//     image.src = path;

//     return promise;
// }

// async function loadCanvasImage(path) {
//     const image = await loadImage(path);
//     const canvas = createCanvas(image.width, image.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(image, 0, 0);
//     return canvas;
// }

const Calculate = async (req, res) => {
    try {
        tf.ready().then(async () => {
            console.log(req.body)
            console.log(req.files)
            if (!req.body.name || !req.body.height || !req.body.weight || !req.body.distance || !req.body.gender || !req.body.device) {
                return res.status(400).json({
                    success: false,
                    error: "Please provide name,weight,distance,height,gender,device."
                })
            }
            if (!req.files.frontImage || !req.files.sideImage || !req.files.frontImage[0] || !req.files.sideImage[0]) {
                return res.status(400).json({
                    success: false,
                    error: "Please provide both front and side images."
                })
            } else {
                if (!req.body.height) {
                    return res.status(400).json({
                        success: false,
                        error: "Please provide Height"
                    })
                }
                let frontImageRename = fs.renameSync(`uploads/${req.files.frontImage[0].filename}`,`uploads/${req.body.name}-${req.body.distance}-${req.body.device}-front-image.jpeg`)
                let sideImageRename = fs.renameSync(`uploads/${req.files.sideImage[0].filename}`,`uploads/${req.body.name}-${req.body.distance}-${req.body.device}-side-image.jpeg`)
                console.log("1",frontImageRename)
                console.log("2",sideImageRename)
                console.log("newFile",req.files)
                const net = bodyPix.load(
                    {
                        architecture: "ResNet50",
                        outputStride: 16,
                        multiplier: 1,
                        quantBytes: 4
                    }
                );
                net.then(async (netModel) => {
                    let frontImage = fs.readFileSync(`uploads/${req.body.name}-${req.body.distance}-${req.body.device}-front-image.jpeg`)
                    let sideImage = fs.readFileSync(`uploads/${req.body.name}-${req.body.distance}-${req.body.device}-side-image.jpeg`)
                    // console.log("front", req.body.height)
                    inkjet.decode(frontImage, async (err, decoded) => {
                        if (err) {
                            console.log("Error in decoding frontImage.")
                            return res.status(500).json({
                                success: false,
                                error: err,
                                message: "Error in decoding frontImage"
                            })
                        } else {
                            inkjet.decode(sideImage, async (err1, decoded1) => {
                                if (err1) {
                                    console.log("Error in decoding sideImage.")
                                    return res.status(500).json({
                                        success: false,
                                        error: err1,
                                        message: "Error in decoding sideImage"
                                    })
                                } else {
                                    // console.log("c1")
                                    const frontImageData = await netModel.segmentPersonParts(decoded, {
                                        flipHorizontal: false,
                                        internalResolution: 'full',
                                        // segmentationThreshold : 0.5
                                    });
                                    // console.log("c2")
                                    const sideImageData = await netModel.segmentPersonParts(decoded1, {
                                        flipHorizontal: false,
                                        internalResolution: 'full',
                                        // segmentationThreshold : 0.5
                                    });
                                    // console.log("c3")
                                    const frontImageFinalData = await Calculations.validMask(frontImageData)
                                    console.log("c4", frontImageFinalData)
                                    if (!frontImageFinalData) {
                                        return res.status(400).json({
                                            success: false,
                                            error: "Front Image is not valid for segmentation."
                                        })
                                    }
                                    const sideImageFinalData = await Calculations.validMask(sideImageData)
                                    // console.log("c5")
                                    if (!sideImageFinalData) {
                                        return res.status(400).json({
                                            success: false,
                                            error: "Side Image is not valid for segmentation."
                                        })
                                    }
                                    let frontObj = {
                                        height: frontImageData.height,
                                        width: frontImageData.width,
                                        data: frontImageData.data,
                                        realHeight: req.body.height
                                    }
                                    let sideObj = {
                                        height: sideImageData.height,
                                        width: sideImageData.width,
                                        data: sideImageData.data,
                                        realHeight: req.body.height
                                    }
                                    // console.log("final-front->",frontImageFinalData)
                                    // console.log("final-side->",sideImageFinalData)
                                    // console.log("c6")
                                    const dt = await Calculations.calculate(req.body.name, req.body.weight, req.body.distance,req.body.gender,req.body.device, frontObj, sideObj, false)
                                    let values = Object.values(dt)
                                    console.log("val : ",values)
                                    
                                    if(values.includes("NaN")){
                                        return res.status(400).json({
                                            success: false,
                                            error: "Error occured in finding measurements. Please try again.!!",
                                        })
                                    }
                                    else{
                                        const person = await persons.create(dt);
                                        console.log("person->", person)
                                        // console.log("c7")
                                        return res.status(200).json({
                                            success: true,
                                            message: "done",
                                            data: person
                                        })
                                    }
                                }
                            })
                        }
                    })
                })
            }

            // console.log(req.body.data)
            // const model = bodySegmentation.SupportedModels.BodyPix;
            // const segmenterConfig = {
            //     architecture: 'ResNet50',
            //     outputStride: 32,
            //     quantBytes: 2
            // };
            // // let img = null;
            // const segmentationConfig = { multiSegmentation: false, segmentBodyParts: true };
            // segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
            // const serializedElement = Buffer.from(req.body.data, 'base64').toString();
            // console.log('123->',serializedElement)
            // console.log(req.file)
            // // const buf = fs.readFileSync(filepath);


            // // const canvas = createCanvas(200, 200)
            // // const ctx = canvas.getContext('2d')

            // const net = bodyPix.load(
            //     {
            //         architecture: "ResNet50",
            //         outputStride: 16,
            //         multiplier: 1,
            //         quantBytes: 4
            //     }
            // );
            // net.then(async (res) => {
            //     console.log("called")
            //     // loadImage(req.file.Buffer).then((image) => {
            //     //     console.log("called----------")
            //     //     ctx.drawImage(image, 50, 0, 70, 70)
            //     //     console.log('<img src="' + canvas.toDataURL() + '" />')
            //     // }).catch((err) => {
            //     //     console.log("eer : ", err)
            //     // })
            //     // let data = await ejs.renderFile(
            //     //     path.join(__dirname, "../views/pages/index.ejs"),
            //     //     {
            //     //         data: "../uploads/1698055334771-242312777-j-s4-new.jpg"
            //     //     }
            //     // );

            //     inkjet.decode(req.files.buffer, async (err, decoded) => {
            //         // decoded: { width: number, height: number, data: Uint8Array }
            //         console.log("errr->", err)
            //         console.log("decoded : ", decoded)
            //         // const canvas = createCanvas(400, 400);
            //         // const context = canvas.getContext('2d');
            //         // let imgData = new ImageData(decoded.data,decoded.width,decoded.height)
            //         // context.putImageData(imgData, 0, 0);

            //         // Send the canvas as a response.
            //         // res.send(canvas.toDataURL());

            //         const frontImageData = await res.segmentPersonParts(decoded, {
            //             flipHorizontal: false,
            //             internalResolution: 'full',
            //             // segmentationThreshold : 0.5
            //         });

            //         console.log("frontData -> ", frontImageData)
            //     });
            //     // console.log("data", data)
            //     // console.log("data-type", typeof data)
            //     // console.log("data-instance",data instanceof   HTMLCanvasElement || data instanceof HTMLImageElement)

            // })
            // let data = await ejs.renderFile(
            //     path.join(__dirname, "../views/pages/index.ejs"),
            //     {
            //       data:"../uploads/1698055334771-242312777-j-s4-new.jpg"
            //     }
            //   );
            // console.log("data->",data)
            // res.send(data)
            // // const people = await segmenter.segmentPeople(data, segmentationConfig);
            // console.log("people : ", people)

            // loadImage(`${req.file.path}`).then(async (data) => {
            //     // if (err) {
            //     //     console.log("Error in reading image : ", err)
            //     // } else {
            //     // img = data
            //     // console.log("Img ->", img)
            //     // const image = new ImageData()
            //     // image.src = data
            //     // console.log("Image",image)
            //     // const canvas = createCanvas(image.width,image.height);

            //     // // console.log("7")
            //     // const ctx = canvas.getContext("2d");
            //     // ctx.drawImage(image, 0, 0);
            //     // console.log("8")

            //     // const input = tf.browser.fromPixels(canvas);
            //     // console.log("9")

            //     // console.log("img", input)
            //     // const canvas = await loadCanvasImage(req.file.path);

            //     // Use the canvas to create a tensor and perform further operations
            //     // const input = tf.browser.fromPixels(canvas);
            //     // const buffer = await sharp(data).jpeg().toBuffer();
            //     // const tfimage = tf.node.decodeImage(data,3);
            //     // const resizedImage = tf.image.resizeBilinear(tfimage, [224, 224]);

            //     // var dataBase64 = Buffer.from(data).toString('base64');
            //     const canvas = createCanvas(data.width, data.height)
            //     const ctx = canvas.getContext('2d')
            //     ctx.drawImage(data, 0, 0);
            //     let imageDom  = new JSDOM(`<img src={${data}}>`, { includeNodeLocations: true });
            //     // imageDom.src = data
            //     const input = tf.browser.fromPixels(canvas);
            //     console.log("data", imageDom.window.document.querySelector("img"))
            //     const people = await segmenter.segmentPeople(imageDom.window.document.querySelector("img"), segmentationConfig);
            //     console.log("people : ", people)
            //     //   const input = tf.browser.fromPixels(canvas);

            //     // const buffer = req.file.buffer;
            //     // const image = await loadImage(req.file.path)
            //     // let imgD = createCanvas.createImageData(new Uint8ClampedArray(data.data), data.width, data.height);
            //     // console.log("can", imgD)
            //     // }
            // })
            //         let path = `/images/${req.file.originalname}`;
            //         let imagepath = __dirname + `/images/${req.file.filename}`;
            // console.log("5")

            //         let image = await loadImage(path);
            //         console.log("6")

            //         const canvas = createCanvas(300,700);
            // // console.log("7")

            //         const ctx = canvas.getContext("2d");
            //         ctx.drawImage(req.file, 0, 0);
            // console.log("8")

            //         const input = tf.browser.fromPixels(canvas);
            // console.log("9")

            //         console.log("img", input)
            // Load the model.

            // const decodedImage = await sharp(buffer).jpeg().toBuffer();
            // const tfimage = tf.node.decodeImage(decodedImage);
            // const people = await segmenter.segmentPeople(image, segmentationConfig);
            // console.log(people)
            // const { frontData, sideData } = req.body
            // if (!frontData) {
            //     return res.status(400).json({
            //         errorMessage: "Please provide front and side data both."
            //     })
            // } else {
            //     const frontImageMatrix = Calculations.getMatrixFrom1D(frontData.data)
            //     // const sideImageMatrix = Calculations.getMatrixFrom1D(frontData.data)

            //     const calibrationFactor = Calculations.getCalibrationFactor(frontImageMatrix, frontData.height, frontData.width, frontData.realHeight)

            //     const frontChestWidth = Calculations.getFrontChestWidth(frontImageMatrix, frontData.height, frontData.width, calibrationFactor);
            //     console.log("chest : ",frontChestWidth)
            //     // const sideChestWidth = Calculations.getSideChestWidth(sideImageMatrix, frontData.height, frontData.width, calibrationFactor);

            //     // major axis : x/2,  minor axis : y/2
            //     // const chestCircumference = Calculations.getChestCirumference(frontChestWidth / 2, sideChestWidth / 2);

            //     const frontWaistWidth = Calculations.getFrontWaistWidth(frontImageMatrix, frontData.height, frontData.width, calibrationFactor);
            //     console.log("waist : ",frontWaistWidth)

            //     // const sideWaistWidth = Calculations.getSideWaistWidth(sideImageMatrix, frontData.height, frontData.width, calibrationFactor);

            //     // major axis : x/2,  minor axis : y/2
            //     // const waistCircumference = Calculations.getWaistCircumference(frontWaistWidth / 2, sideWaistWidth / 2);

            //     // const { shirtSize,pantSize } = Calculations.getSizes(chestCircumference, waistCircumference)
            //     // return res.status(200).json({
            //     //     shirts : {
            //     //         circumFerence : chestCircumference,
            //     //         size : shirtSize
            //     //     },
            //     //     pants : {
            //     //         circumFerence : waistCircumference,
            //     //         size : pantSize
            //     //     },
            //     // })
            // }
        })
    } catch (error) {
        console.log("Error : ", error)
        return res.status(500).json({
            error: error.message
        })
    }
}

const TrainModel = async (req,res) => {
    try {
        let chestObj = {
            circumference: 1234,
            distance: 121,
            calibration1: 0.50,
            calibration2: 0.50
        }
        let waistObj = {
            circumference: 1234,
            distance: 121,
            calibration1: 0.50,
            calibration2: 0.50
        }
        let chestInp = JSON.stringify(chestObj)
        let waistInp = JSON.stringify(waistObj)
        let options = { 
            mode: 'json',
            scriptPath: './ML-Model/',
            args: [chestInp, waistInp]
        };
        const pyshell = new PythonShell.PythonShell('model.training.py', options);
        // PythonShell.PythonShell.run('model.training.py', options).then(messages => {
        //             console.log('finished->', messages);
        //         });
        // // Listen for the message event
        pyshell.send("hello")
        pyshell.on('data', (data) => {
            console.log('Data from Python script:', data);
          });
        pyshell.on('message', (message) => {
            // Handle the message from the Python function here
            console.log("dddd->",message);
            console.log("dddd->123");
        });

        pyshell.end(function (err,data) {
            if (err) throw err;
            console.log('The exit code was: ' + data);  
            console.log('finished');
          });
        // let options = { 
        //     mode: 'text',
        //     pythonOptions: ['-u'], // get print results in real-time
        //     scriptPath: './ML-Model/'
        // };
        
        // const pyshell = new PythonShell.PythonShell('model.training.py', options);
        // pyshell.on('message', (message) => {
        //     // Handle the message from the Python function here
        //     console.log("dddd->",message);
        // });

        // pyshell.end(function (err,code,signal) {
        //     if (err) throw err;
        //     console.log('The exit code was: ' + code);
        //     console.log('The exit signal was: ' + signal);
        //     console.log('finished');
        //   });
       
    } catch (error) {
        console.log("Error : ", error)
        return res.status(500).json({
            error: error.message
        })
    }
}

const GenerateDataset = async(req,res)=>{
    try{
        if(!req.params.type){
            return res.status(400).json({
                error: "Please provide gender type"
            })
        }else{
            const type = req.params.type
            const data = await Calculations.generateDataset(type)
            // console.log("111111111",data)
            if(data.success){
                return res.status(200).json({
                    message: "Done",
                    csv : data.csv
                })
            }else{
                return res.status(500).json({
                    error:data.error
                })
            }
        }
    }catch(error){
        console.log("Error : ", error)
        return res.status(500).json({
            error: error.message
        })
    }
}

module.exports = {
    Calculate,
    TrainModel,
    GenerateDataset
}