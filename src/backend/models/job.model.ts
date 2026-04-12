import mongoose, { Schema, Document, Types } from 'mongoose'
import { IJob, JobType } from '../types/backend.types'

export interface IJobDocument extends Omit<IJob, '_id' | 'createdBy'>, Document {
  createdBy: Types.ObjectId
}

const contactDetailsSchema = new Schema(
  {
    email: { type: String, required: true },
    phoneNo: { type: String, required: true },
  },
  { _id: false }
)

const salarySchema = new Schema(
  {
    from: { type: Number, required: true, min: 0 },
    to: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const JobSchema = new Schema<IJobDocument>(
  {
    jobName: { type: String, required: true, trim: true },
    jobId: { type: String, required: true, unique: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobProvider: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(JobType), required: true },
    deadline: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    salary: { type: salarySchema, required: true },
    jobDescription: { type: String, required: true },
    responsibilities: [{ type: String, required: true }],
    contactDetails: { type: contactDetailsSchema, required: true },
  },
  { timestamps: true }
)

export const JobModel = mongoose.models.Job ?? mongoose.model<IJobDocument>('Job', JobSchema)
