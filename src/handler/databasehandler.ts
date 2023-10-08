import * as mongoose from 'mongoose';

async function connectToDB() {
    const uri = process.env.DATABASE_URI;
    if(!uri) return;

    return mongoose.connect(uri);
}

function isConnected(): boolean {
    return (mongoose.connection != undefined);
}


const Users = new mongoose.Schema({
    id: {
        type:String
    },
    joinTime: {
        type:Number
    },
    time: {
        type:Number
    }
});
const playTimeData = mongoose.model("Playtime", new mongoose.Schema({
    guild:{
        type: String,
        required:true
    },
    lastStart: {
        type: Number
    },
    time: {
        type:Number
    },
    playing: {
        type:Boolean
    },
    users: [Users]
}));

const controlsData = mongoose.model("Control", new mongoose.Schema({
    guild: {
        type:String,
        required:true
    },
    channel: {
        type:String
    },
    message: {
        type:String
    },
    lock: {
        type:Boolean,
        default:false
    }
}));

export default {
    connectToDB:connectToDB,
    isConnected:isConnected,
    connection:mongoose.connection,
    PlayTime:playTimeData,
    ControlsData:controlsData
};