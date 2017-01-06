import CANNON from "CANNON";

// part - functions
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
function forward() {
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




// part - main

let stats = null;
let world = null;
let phyPlane = null;
let phyBox = null;
let scene = null;
let camera = null;
let viewPlane = null;
let renderer = null;
const wSizeWidth  = window.innerWidth;   //描画サイズ（横）
const wSizeHeight = window.innerHeight;  //描画サイズ（縦）
const startPos = getStartPosData(1);
const sPos = startPos.split("_");
const endAngle = 270;
const interval_id = "stop";
const stopTimeCnt = 0;
const stopTimeId = null;
const selfData = new Object();              //自分自身を表すオブジェクト
selfData.angle = 270;                //方角
selfData.posX = Number(sPos[0]);    //位置
selfData.posY = Number(sPos[1]);    //位置
selfData.height = 2;                  //高さ
selfData.speed = 5;                  //前進速度
let theta = 0;
//MapData
const mapData = getMapData(1);    //MAPの壁座標を取得
const boxObjArray = new Array();  //Three.jsとCANNON.jsの壁オブジェクトを作成する際に元になるオブジェクト
for(let cnt = 0; cnt < mapData.length; cnt++) {
    const mData = mapData[cnt];   //配列内の壁座標データを取得
    const wall = mData.split("_"); //XとZのデータを分割
    //Three.jsとCANNON.jsの壁オブジェクトの元になるオブジェクトを生成
    boxObjArray[cnt] = createBoxObject(Number(wall[0]), 0, Number(wall[1]), 5, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0x000000 );
}
const thrBoxArray = new Array();
const canBoxArray = new Array();
let selfObj = null;
//Texture
const ground_texture = THREE.ImageUtils.loadTexture( "/images/dungeon/ground.jpg" );
ground_texture.wrapS = ground_texture.wrapT = THREE.RepeatWrapping;
ground_texture.repeat.set( 64, 64 );
const wall_texture = THREE.ImageUtils.loadTexture( "/images/dungeon/wall.jpg" );
stats = new Stats();
stats.domElement.style.position = "absolute";
stats.domElement.style.top = "5px";
stats.domElement.style.left = "5px";
stats.domElement.style.zIndex = 100;
document.body.appendChild(stats.domElement);
setPhy();         //Physics設定
setView();        //View設定
changeBtnPos();   //ボタン設定
animate();        //物理計算＆３Ｄ描画
/**
* Physics設定
*/
function setPhy() {
    world = new CANNON.World();       //物理世界を作成
    world.gravity.set(0, -9.82, 0);   //物理世界に重力を設定
    world.broadphase = new CANNON.NaiveBroadphase(); //衝突している剛体の判定
    world.solver.iterations = 10;     //反復計算回数
    world.solver.tolerance = 0.1;     //許容値
    //Cannon Ground--------------------------------------------------------------
    const groundMat = new CANNON.Material("groundMat");    //マテリアルを作成
    groundMat.friction = 0.3;       //摩擦係数
    groundMat.restitution = 0.5;    //反発係数
    phyPlane = new CANNON.Body({mass: 0});      //ボディを作成
    phyPlane.material = groundMat;              //ボディにマテリアルを設定
    phyPlane.addShape(new CANNON.Plane());      //地面を作成
    phyPlane.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2 );   //地面を回転
    world.add(phyPlane); //物理世界に追加
    //Cannon Box
    //壁オブジェクト
    for(let cnt = 0; cnt < boxObjArray.length; cnt++) {
        canBoxArray[cnt] = makeBox( 1, boxObjArray[cnt].posX, boxObjArray[cnt].posY, boxObjArray[cnt].posZ, boxObjArray[cnt].sizeX, boxObjArray[cnt].sizeY, boxObjArray[cnt].sizeZ, boxObjArray[cnt].velocX, boxObjArray[cnt].velocY, boxObjArray[cnt].velocZ,boxObjArray[cnt].angVelocX, boxObjArray[cnt].angVelocY, boxObjArray[cnt].angVelocZ, boxObjArray[cnt].mass, boxObjArray[cnt].dampVal, boxObjArray[cnt].color );
        world.add(canBoxArray[cnt]);
    }
    //Canon Sphere
    //自分自身を表す球体オブジェクトを作成
    const sphereShape = new CANNON.Sphere(1); //半径1の球体を作成
    const sphereMat = new CANNON.Material("sphereMat");
    sphereMat.friction = 0.8;       //摩擦係数
    sphereMat.restitution = 0.5;    //反発係数
    selfObj = new CANNON.Body({mass: 1});  //ボディを作成
    selfObj.material = sphereMat;          //ボディにマテリアルを設定
    selfObj.addShape(sphereShape);         //球体を作成
    selfObj.position.x = selfData.posX;    //初期位置を設定
    selfObj.position.y = selfData.height;  //初期位置を設定
    selfObj.position.z = selfData.posY;    //初期位置を設定
    world.add(selfObj); //物理世界に追加
}

/**
* View設定
*/
function setView() {
    scene = new THREE.Scene();                    //Three.jsの世界（シーン）を作成
    scene.fog = new THREE.Fog(0x3d3d3d, 1, 100);  //フォグを作成
    //Three Camera
    camera = new THREE.PerspectiveCamera(90, 800 / 600, 0.1, 10000);  //カメラを作成
    camera.position.set(Math.cos(Math.PI / 5) * 30, 5, Math.sin(Math.PI / 5) * 80);  //カメラの位置を設定
    changeLookAt();  //カメラの注視点を設定
    scene.add(camera);
    //Three Light
    const light = new THREE.DirectionalLight(0xffffff, 0.5);  //照らす方向を指定する光源
    light.position.set(10, 10, -10);   //光源の位置を指定
    light.castShadow = true;  //影を作る物体かどうかを設定
    light.shadowMapWidth = 2024;  //影の精細さ（解像度）を設定
    light.shadowMapHeight = 2024;  //影の精細さ（解像度）を設定
    light.shadowCameraLeft = -50;  //ライトの視点方向の影の表示度合い
    light.shadowCameraRight = 50;  //ライトの視点方向の影の表示度合い
    light.shadowCameraTop = 50;  //ライトの視点方向の影の表示度合い
    light.shadowCameraBottom = -50;  //ライトの視点方向の影の表示度合い
    light.shadowCameraFar = 500;  //影を表示する範囲の設定
    light.shadowCameraNear = 0;  //影を表示する範囲の設定
    light.shadowDarkness = 0.5;  //影の透明度
    scene.add(light);
    const amb = new THREE.AmbientLight(0xffffff);  //全体に光を当てる光源
    scene.add(amb);
    //Three Box
    //壁オブジェクトを作成
    for(let cnt = 0; cnt <boxObjArray.length; cnt++) {
        thrBoxArray[cnt] = makeBox( 0, boxObjArray[cnt].posX, boxObjArray[cnt].posY, boxObjArray[cnt].posZ, boxObjArray[cnt].sizeX, boxObjArray[cnt].sizeY, boxObjArray[cnt].sizeZ, boxObjArray[cnt].velocX, boxObjArray[cnt].velocY, boxObjArray[cnt].velocZ, boxObjArray[cnt].angVelocX, boxObjArray[cnt].angVelocY, boxObjArray[cnt].angVelocZ, boxObjArray[cnt].mass, boxObjArray[cnt].dampVal, boxObjArray[cnt].color );
        scene.add(thrBoxArray[cnt]);
    }
    //Three Ground--------------------------------------------------------------
    const graMeshGeometry = new THREE.PlaneGeometry(300, 300);  //地面の形状を作成
    const graMaterial = new THREE.MeshBasicMaterial({           //マテリアルを作成
        map: ground_texture                                   //地面にテクスチャ（砂地）を設定
    });                                                       //「ground_texture」は別部分で作成
    viewPlane = new THREE.Mesh(graMeshGeometry, graMaterial); //メッシュを作成
    viewPlane.rotation.x = -Math.PI / 2;  //地面を回転
    viewPlane.position.y = 1 / 2;         //地面の位置を設定
    viewPlane.receiveShadow = true;       //地面に影を表示する
    scene.add(viewPlane);
    //Three Render
    renderer = new THREE.WebGLRenderer({antialias: true});  //レンダラーを作成
    renderer.setSize(wSizeWidth, wSizeHeight);              //レンダラーのサイズを設定
    renderer.setClearColor(0xffffff, 1);                    //レンダラーの描画内容をクリア
    renderer.shadowMapEnabled = true;                       //レンダラーの影の描画を有効化
    document.body.appendChild(renderer.domElement);         //DOM要素をBodyに追加
    //Start Rendering
    renderer.render(scene, camera);  //レンダラーで3D空間を描画
}

/**
* 物理計算＆３Ｄ描画
*/
function animate() {
    requestAnimationFrame(animate);
    // 物理エンジンの時間を進行
    world.step(1 / 60);
    //カメラ位置の設定
    camera.position.set(selfObj.position.x, selfObj.position.y + 1.6, selfObj.position.z);
    //FPS計測
    stats.update();
    // レンダリング
    renderer.render(scene, camera);
}

/**
* Create Wall Box Object
*
* @param  mode    オブジェクト種別 ( 0 : Three, 1 :CANNON )
* @param  posX    X座標位置
* @param  posY    Y座標位置
* @param  posZ    Z座標位置
* @param  sizeX   X方向サイズ
* @param  sizeY   Y方向サイズ
* @param  sizeZ   Z方向サイズ
* @param  velocX  X方向加速度
* @param  velocY  Y方向加速度
* @param  velocZ  Z方向加速度
* @param  angX    X方向回転角加速度
* @param  angY    Y方向回転角加速度
* @param  angZ    Z方向回転角加速度
* @param  mass    質量
* @param  dampVal 減衰値
* @param  color   色
* @return retObj  「Three.js」 or 「CANNON.js」オブジェクト
*/
function makeBox(mode, posX, posY, posZ, sizeX, sizeY, sizeZ, velocX, velocY, velocZ, angVelocX, angVelocY, angVelocZ, mass, dampVal, color) {
    let retObj = null;
    let thrBox = null;
    let canBox = null;
    if(mode === 0) {
        //Three.js
        thrBox = new THREE.Mesh(new THREE.BoxGeometry(sizeX, sizeY, sizeZ, 10, 10), new THREE.MeshBasicMaterial({
            map: wall_texture
        }));
        thrBox.castShadow = true;
        thrBox.receiveShadow = true;
        thrBox.position.x = posX;
        thrBox.position.y = posY + ( sizeY /2 );
        thrBox.position.z = posZ;
        retObj = thrBox;
    } else if(mode === 1) {
        //CANNON.js
        canBox = new CANNON.Body({mass: mass});
        canBox.addShape(new CANNON.Box(new CANNON.Vec3(sizeX/2, sizeY/2, sizeZ/2)));
        canBox.position.set(posX, posY, posZ);
        canBox.velocity.set(velocX, velocY, velocZ);
        canBox.angularVelocity.set(angVelocX, angVelocY, angVelocZ);
        canBox.angularDamping = dampVal;
        retObj = canBox;
    }
    return retObj;
}

/**
* Create Wall Box Root Object
*
* @param  mode    オブジェクト種別
* @param  posX    X座標位置
* @param  posY    Y座標位置
* @param  posZ    Z座標位置
* @param  sizeX   X方向サイズ
* @param  sizeY   Y方向サイズ
* @param  sizeZ   Z方向サイズ
* @param  velocX  X方向加速度
* @param  velocY  Y方向加速度
* @param  velocZ  Z方向加速度
* @param  angX    X方向回転角加速度
* @param  angY    Y方向回転角加速度
* @param  angZ    Z方向回転角加速度
* @param  mass    質量
* @param  dampVal 減衰値
* @param  color   色
* @return box     ルートオブジェクト
*/
function createBoxObject(posX, posY, posZ, sizeX, sizeY, sizeZ, velocX, velocY, velocZ, angVelocX, angVelocY, angVelocZ, mass, dampVal, color) {
    const box = new Object();
    box.posX = posX;
    box.posY = posY;
    box.posZ = posZ;
    box.sizeX = sizeX;
    box.sizeY = sizeY;
    box.sizeZ = sizeZ;
    box.velocX = velocX;
    box.velocY = velocY;
    box.velocZ = velocZ;
    box.angVelocX = angVelocX;
    box.angVelocY = angVelocY;
    box.angVelocZ = angVelocZ;
    box.mass = mass;
    box.dampVal = dampVal;
    box.color = color;
    return box;
}
