module.exports = (mongoose) => {
    var schema = mongoose.Schema({
        name: {
            type: String,
        },
        height: {
            type: String,
        },
        weight: {
            type: String,
        },
        distance: {
            type: String,
        },
        gender:{
            type:String,
        },
        device:{
            type : String
        },
        front_chest_px: {
            type: String,
        },
        side_chest_px: {
            type: String,
        },
        front_waist_px: {
            type: String,
        },
        side_waist_px: {
            type: String,
        },
        front_chest_cm: {
            type: String,
        },
        side_chest_cm: {
            type: String,
        },
        front_waist_cm: {
            type: String,
        },
        side_waist_cm: {
            type: String,
        },
        chest_circumference_px: {
            type: String,
        },
        waist_circumference_px: {
            type: String,
        },
        chest_circumference_cm: {
            type: String,
        },
        waist_circumference_cm: {
            type: String,
        },
        calibration_factor_front: {
            type: String,
        },calibration_factor_side: {
            type: String,
        },
        chest_predicted_px: {
            type: String,
        },
        waist_predicted_px: {
            type: String,
        },
        chest_predicted: {
            type: String,
        },
        waist_predicted: {
            type: String,
        },
        shirt_primary_size : {
            type: String,
        },
        shirt_secondary_size : {
            type: String,
        },
        pant_primary_size : {
            type: String,
        },
        pant_secondary_size : {
            type: String,
        }
    },
        { timestamps: true })

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const persons = mongoose.model("persons", schema);
    return persons;
}