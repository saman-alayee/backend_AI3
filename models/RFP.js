const Joi = require("joi");
const mongoose = require("mongoose");

const RFP = mongoose.model(
  "RFP",
  new mongoose.Schema(
    {
      field_1: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_2: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_3: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_4: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_5: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_6: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_7: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_8: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_9: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_10: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_11: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_12: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_13: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_14: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_15: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_16: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_17: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_18: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_19: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_20: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_21: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_22: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_23: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_24: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_25: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_26: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_27: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_28: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_29: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_30: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_31: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_32: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_33: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_34: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_35: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_36: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_37: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_38: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_39: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_40: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_41: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_42: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_43: {
        type: String,
        required: true,
        maxlength: 255,
      },
      field_44: {
        type: String,
        required: true,
        maxlength: 255,
      },
    },
    { timestamps: true }
  )
);

function validateRFP(rfp) {
  const schema = Joi.object({
    field_1: Joi.string().max(255).required(),
    field_2: Joi.string().max(255).required(),
    field_3: Joi.string().max(255).required(),
    field_4: Joi.string().max(255).required(),
    field_5: Joi.string().max(255).required(),
    field_6: Joi.string().max(255).required(),
    field_7: Joi.string().max(255).required(),
    field_8: Joi.string().max(255).required(),
    field_9: Joi.string().max(255).required(),
    field_10: Joi.string().max(255).required(),
    field_11: Joi.string().max(255).required(),
    field_12: Joi.string().max(255).required(),
    field_13: Joi.string().max(255).required(),
    field_14: Joi.string().max(255).required(),
    field_15: Joi.string().max(255).required(),
    field_16: Joi.string().max(255).required(),
    field_17: Joi.string().max(255).required(),
    field_18: Joi.string().max(255).required(),
    field_19: Joi.string().max(255).required(),
    field_20: Joi.string().max(255).required(),
    field_21: Joi.string().max(255).required(),
    field_22: Joi.string().max(255).required(),
    field_23: Joi.string().max(255).required(),
    field_24: Joi.string().max(255).required(),
    field_25: Joi.string().max(255).required(),
    field_26: Joi.string().max(255).required(),
    field_27: Joi.string().max(255).required(),
    field_28: Joi.string().max(255).required(),
    field_29: Joi.string().max(255).required(),
    field_30: Joi.string().max(255).required(),
    field_31: Joi.string().max(255).required(),
    field_32: Joi.string().max(255).required(),
    field_33: Joi.string().max(255).required(),
    field_34: Joi.string().max(255).required(),
    field_35: Joi.string().max(255).required(),
    field_36: Joi.string().max(255).required(),
    field_37: Joi.string().max(255).required(),
    field_38: Joi.string().max(255).required(),
    field_39: Joi.string().max(255).required(),
    field_40: Joi.string().max(255).required(),
    field_41: Joi.string().max(255).required(),
    field_42: Joi.string().max(255).required(),
    field_43: Joi.string().max(255).required(),
    field_44: Joi.string().max(255).required(),
  });
  const result = schema.validate(rfp);
  return result;
}

exports.RFP = RFP;
exports.validate = validateRFP;
