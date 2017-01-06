//KEY
$(window).keydown(function(e){ keyCtrl(e); return false; });
            
//BUTTON
$('#forward').click(function(e) { forward(); });
$('#stop').click(function(e) { stop(); });
$('#back').click(function(e) { back(); });
$('#jump').click(function(e) { jump(); });
$('#turn_right').click(function(e) { turnRight(); });
$('#turn_left').click(function(e) { turnLeft(); });

$(window).resize(function(e) {
    wSizeWidth = window.innerWidth;
    wSizeHeight = window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    changeBtnPos();
});
            
/**
 * 前進
 */ 
function forward(){
    chkTurn();
    theta = selfData.angle / 180 * Math.PI;
    selfObj.velocity.x = Math.cos(theta) * selfData.speed;
    selfObj.velocity.z = Math.sin(theta) * selfData.speed;
}
            
/**
 * 停止
 */ 
function stop(){
    chkTurn();
    if(stopTimeId === null){
        stopTimeCnt = 0;
        stopTimeId = setInterval(function() {
            stopTimeCnt++;
                        
            selfObj.velocity.x = 0;
            selfObj.velocity.z = 0;
    
            if (stopTimeCnt === 5) {
                clearInterval(stopTimeId);
                stopTimeId = null;
            }
        }, 100);
    }
}

/**
 * 後進
 */ 
function back(){
    chkTurn();
    theta = selfData.angle / 180 * Math.PI;
    selfObj.velocity.x = -1 * selfData.speed * Math.cos(theta);
    selfObj.velocity.z = -1 * selfData.speed * Math.sin(theta);
}
            
/**
 * ジャンプ
 */ 
function jump(){
    chkTurn();
    stop(); 
    selfObj.velocity.y = 10; //ジャンプ時の上方向加速度
}

/**
 * 転回
 * @param direction 転回方向（ 0 : 右転回, 1 : 左転回） 
 */ 
function turn(direction){    
    if(interval_id === "stop"){
        if(direction === 0){
            endAngle = selfData.angle + 45;
        } else if(direction === 1){
            endAngle = selfData.angle - 45;
        }
        
        interval_id = setInterval(                
            function() {
                if(direction === 0){
                    selfData.angle += 3;
                } else if(direction === 1){
                    selfData.angle -= 3;
                }
                
                if(direction === 0){
		                if(selfData.angle > endAngle){
		                    stopTurn(interval_id);
		                } else {
		                    changeLookAt();
		                }
                } else if(direction === 1){
		                if(selfData.angle < endAngle){
		                    stopTurn(interval_id);
		                } else {
		                    changeLookAt();
		                }
                }
            }
       , 50);
    }
}
            
/**
 * 右転回
 */ 
function turnRight(){
    turn(0);
}
            
/**
 * 左転回
 */      
function turnLeft(){
    turn(1);
}
            
/**
 * 転回チェック
 */
function chkTurn(){
    if(interval_id !== "stop"){
        stopTurn(interval_id);
    }
}
            
/**
 * 転回停止
 */
function stopTurn(intervalId){
    clearInterval(intervalId);
    interval_id = "stop";
}
            
/**
 * 注視点変更
 */
function changeLookAt(){
    theta = selfData.angle / 180 * Math.PI;
    var posX = selfData.posX + Math.cos(theta) * 10000;
    var posY = selfData.posY + Math.sin(theta) * 10000;
    camera.lookAt(new THREE.Vector3(posX, 0, posY));
}
            
/**
 * ボタン位置設定
 */
function changeBtnPos(){
    var btn_size = 100;
                
    //set button position
    $('#turn_right').css('top', wSizeHeight - (btn_size + 20));
    $('#turn_right').css('left', (btn_size + 10));
    $('#turn_left').css('top', wSizeHeight - (btn_size + 20));
    $('#turn_left').css('left', 5);
    $('#back').css('top', (wSizeHeight - btn_size) - 20);
    $('#back').css('left', (wSizeWidth - btn_size) - 20);
    $('#stop').css('top', (wSizeHeight - (btn_size * 2)) - 25);
    $('#stop').css('left', (wSizeWidth - btn_size) - 20);
    $('#forward').css('top', (wSizeHeight - (btn_size * 3)) - 30);
    $('#forward').css('left', (wSizeWidth - btn_size) - 20);
    $('#jump').css('top', (wSizeHeight - (btn_size * 4)) - 35);
    $('#jump').css('left', (wSizeWidth - btn_size) - 20);
                
    //set button size
    $('#turn_right').css('width', btn_size);
    $('#turn_right').css('height', btn_size);
    $('#turn_left').css('width', btn_size);
    $('#turn_left').css('height', btn_size);
    $('#back').css('width', btn_size);
    $('#back').css('height', btn_size);
    $('#stop').css('width', btn_size);
    $('#stop').css('height', btn_size);
    $('#forward').css('width', btn_size);
    $('#forward').css('height', btn_size);
    $('#jump').css('width', btn_size);
    $('#jump').css('height', btn_size);
}
            
/**
 * キーイベントハンドラ
 * @param e キー情報
 */
function keyCtrl(e){
    if(e.keyCode === 38 ){ forward(); }        //UP    KEY
    else if(e.keyCode === 40 ){ back(); }      //DOWN  KEY
    else if(e.keyCode === 39 ){ turnRight(); } //RIGHT KEY
    else if(e.keyCode === 37 ){ turnLeft(); }  //LEFT  KEY
    else if(e.keyCode === 74 ){ jump(); }      //J     KEY
    else if(e.keyCode === 83 ){ stop(); }      //S     KEY
}