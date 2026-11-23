
import mongoose from 'mongoose'

const symptomRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    symptom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Symptom',
      required: true
    },

    frequency: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'La frecuencia debe ser un número entero'
      }
    },

    intensity: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },

    recordedAt: {
      type: Date,
      required: true,
      default: Date.now
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

symptomRecordSchema.index({
  user: 1,
  symptom: 1,
  recordedAt: -1
})

const SymptomRecord = mongoose.model(
  'SymptomRecord',
  symptomRecordSchema
)

export default SymptomRecord
