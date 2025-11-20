const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskName : {
        type : String,
        required : true,
    },
    description : {
        type: String,
    },
    status: {
        type: String,
        enum: ['In_Progress', 'Completed', 'Not_Started'],
        default: 'Not_Started'
    },
    taskOwner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },

}, {timestamps : true})

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;