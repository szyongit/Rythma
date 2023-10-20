import DatabaseHandler from "./handler/databasehandler";

const VERSION = "1.0 (BETA)";

let channelsData = [
    { name: "dance", value: "https://streams.ilovemusic.de/iloveradio1.mp3" },
    { name: "2000s", value: "https://streams.ilovemusic.de/iloveradio37.mp3" },
    { name: "2010s", value: "https://streams.ilovemusic.de/iloveradio38.mp3" },
    { name: "ilovebass", value: "https://streams.ilovemusic.de/iloveradio29.mp3" },
    { name: "chillhop", value: "https://streams.ilovemusic.de/iloveradio17.mp3" },
    { name: 'greatesthits', value: 'https://streams.ilovemusic.de/iloveradio16.mp3' },
    { name: 'hardstlye', value: 'https://streams.ilovemusic.de/iloveradio21.mp3' },
    { name: 'hiphop', value: 'https://streams.ilovemusic.de/iloveradio3.mp3' },
    { name: 'usrap', value: 'https://streams.ilovemusic.de/iloveradio13.mp3' },
    { name: 'christmas', value: 'https://streams.ilovemusic.de/iloveradio8.mp3' },
    { name: 'trashpop', value: 'https://streams.ilovemusic.de/iloveradio19.mp3' },
    { name: 'chartsgermany', value: 'https://streams.ilovemusic.de/iloveradio9.mp3' },
    { name: 'beach', value: 'https://streams.ilovemusic.de/iloveradio7.mp3' },
    { name: 'club', value: 'https://streams.ilovemusic.de/iloveradio20.mp3' },
    { name: '90s', value: 'https://streams.ilovemusic.de/iloveradio24.mp3' },
    { name: 'rock', value: 'https://streams.ilovemusic.de/iloveradio4.mp3' },
    { name: 'newpop', value: 'https://streams.ilovemusic.de/iloveradio11.mp3' },
    { name: 'germanschlager', value: 'https://streams.ilovemusic.de/iloveradio25.mp3' },
    { name: 'germanrap', value: 'https://streams.ilovemusic.de/iloveradio6.mp3' }
]
let optionsArray = [
    { label: 'POP', value: 'newpop' },
    { label: 'ROCK', value: 'rock' },
    { label: 'HIPHOP', value: 'hiphop' },
    { label: 'US RAP ONLY', value: 'usrap' },
    { label: 'HARDSTYLE', value: 'hardstlye' },
    { label: 'CHILLHOP', value: 'chillhop' },
    { label: 'DANCE', value: 'dance' },
    { label: 'GREATEST HITS', value: 'greatesthits' },
    { label: '2010+ THROWBACKS', value: '2010s' },
    { label: '2000+ THROWBACKS', value: '2000s' },
    { label: '1990+ THROWBACKS', value: '90s' },
    { label: 'NIGHT CLUB', value: 'club' },
    { label: 'BEACH VIBEZ', value: 'beach' },
    { label: 'CHRISTMAS', value: 'christmas' },
    { label: 'TRASHPOP', value: 'trashpop' },
    { label: 'TOP 100 CHARTS GERMANY', value: 'chartsgermany' },
    { label: 'GERMAN SCHLAGER', value: 'germanschlager' },
    { label: 'GERMAN RAP', value: 'germanrap' },
    { label: 'NONE', value: 'none' }
]

const channelsMap = new Map(channelsData.map((element) => [element.name, element.value]));
let lockedChannels:Map<string, boolean> = new Map<string, boolean>();

async function init() {
    let dbData = await DatabaseHandler.ControlsData.find({}).select("channel message -_id").exec();
    const array = <string[]> dbData.filter((data) => data.channel != undefined && data.lock === true).flatMap((data) => data.channel);
    array.forEach((element) => lockedChannels.set(element, true));
}

function lockChannel(channel:string|undefined) {
    if(!channel) return;
    lockedChannels.set(channel, true);
}
function unlockChannel(channel:string|undefined) {
    if(!channel) return;
    lockedChannels.delete(channel);
}
function getLockedChannels():string[] {
    const array:string[] = [];
    lockedChannels.forEach((value, key) => array.push(key));
    return array;
}


export default {
    VERSION:VERSION,
    channelsMap:channelsMap,
    optionsArray:optionsArray,
    lockChannel:lockChannel,
    unlockChannel:unlockChannel,
    getLockedChannels:getLockedChannels,
    init:init
};