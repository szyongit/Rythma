"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
];
const dataMap = new Map(channelsData.map((element) => [element.name, element.value]));
exports.default = dataMap;
