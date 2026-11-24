
import mongoose from 'mongoose'

const healthIndicatorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    name: {
      type: String,
      required: [true, 'El nombre del indicador es obligatorio'],
      trim: true,
      maxlength: 60
    },

    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: 40
    },

    unit: {
        trackingType: {
    type: String,
    enum: ['check', 'measure'],
    default: 'measure'
  },
  unit: {
    type: String,
    trim: true,
    maxlength: 20,
    required: function () {
      return this.trackingType === 'measure'
    }
  },

      type: String,
      required: [true, 'La unidad de medida es obligatoria'],
      trim: true,
      maxlength: 20
    },

    description: {
      type: String,
      trim: true,
      maxlength: 250,
      default: ''
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

healthIndicatorSchema.index({ user: 1, createdAt: -1 })

const HealthIndicator = mongoose.model(
  'HealthIndicator',
  healthIndicatorSchema
)

export default HealthIndicator
