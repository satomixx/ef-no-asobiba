//MapData
var map = new Array("47_12","42_12","37_12","32_12","27_12","22_12","17_12","12_12","47_17","37_17","22_17","47_22","27_22","12_22","47_27","42_27","37_27","22_27","12_27","47_32","27_32","12_32","47_37","37_37","17_37","12_37","47_42","27_42","12_42","47_47","42_47","37_47","32_47","27_47","22_47","17_47","12_47");
var mapData = new Array(map);

function getMapData(mapNum){
    return mapData[mapNum - 1];
}

//StartPosData
var selfPos = "42_42";
var startPosData = new Array(selfPos);

function getStartPosData(startPosNum){
    return startPosData[startPosNum - 1];
}