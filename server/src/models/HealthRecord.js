
import mongoose from 'mongoose'

const healthRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    indicator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthIndicator',
      required: true
    },

    value: {
      type: Number,
      required: [true, 'El valor de la medición es obligatorio'],
      min: 0
    },

    secondaryValue: {
      type: Number,
      min: 0,
      default: null
    },

    measuredAt: {
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

healthRecordSchema.index({
  user: 1,
  indicator: 1,
  measuredAt: -1
})

const HealthRecord = mongoose.model(
  'HealthRecord',
  healthRecordSchema
)

export default HealthRecord
