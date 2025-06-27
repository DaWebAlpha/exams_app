import cuid from cuid
import mongoose from '../config/db.js'


const questionSchema = new mongoose.Schema({
    id: Number,
    question: String,
    options:{
        a: String,
        b: String,
        c: String,
        d: String
    },
    answer: String,
    score: {type: Number, default: 0},
    selectedOption: {type: String, default: 0}
})

const examSchema = new mongoose.Schema({
    _id: {type: String, default: cuid},
    title:{type: String, required: true},
    examType: {
        type: String,
        enum: ['Principal Superintendent', 'Assistant Director II', 'Assistant Director I', 'Deputy Director'],
        required: true
    },
    questions: [questionSchema],
    duration: { type: Number, default: 600 }, // duration in seconds (e.g., 10 mins)
    createdAt: { type: Date, default: Date.now }
})


export const Exams = mongoose.model('Exam', examSchema)