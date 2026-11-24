
import mongoose from 'mongoose'

const symptomSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    name: {
      type: String,
      required: [true, 'El nombre del malestar es obligatorio'],
      trim: true,
      maxlength: 60
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

symptomSchema.index({ user: 1, createdAt: -1 })

const Symptom = mongoose.model('Symptom', symptomSchema)

export default Symptom
