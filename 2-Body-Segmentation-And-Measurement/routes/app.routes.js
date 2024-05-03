const express = require('express')
const multer = require('multer')
const AppController = require('../controllers/app.controller.js')

const router = express.Router()
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        console.log("dt->",req.body)
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname+'.jpeg');
    },
});

const upload = multer({
    limits: {
        // 5MB limit
        fileSize: 5000000,
    },
    // fileFilter(req, file, cb) {
    //     // only jpg,jpeg or png allowed
    //     if (
    //         !(
    //             file.originalname.endsWith("jpg") ||
    //             file.originalname.endsWith("jpeg") ||
    //             file.originalname.endsWith("png")
    //         )
    //     ) {
    //         return cb(new Error("Please upload image of type jpeg, jpg or png"));
    //     }
    //     return cb(undefined, true);
    // },
    storage: storage,
})
router.post('/calculate', upload.fields([{
    name: "frontImage",
    maxCount: 1
}, {
    name: "sideImage",
    maxCount: 1
}]), AppController.Calculate)

router.get('/generate-dataset/:type', AppController.GenerateDataset)

router.post('/train-model', AppController.TrainModel)

router.get('/', async function (req, res) {
    res.render('pages/index', { data: '1698055334771-242312777-j-s4-new.jpg' })
})
module.exports = router