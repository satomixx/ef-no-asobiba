import CANNON from "CANNON";

/* @flow */
let world = null;
let phyPlane = null;
let scene = null;
let camera = null;
let viewPlane = null;
let renderer = null;

const wSizeWidth = window.innerWidth;  //描画サイズ（横）
const wSizeHeight = window.innerHeight; //描画サイズ（縦）

const selfData = Object();
selfData.angle = 270; //方角
selfData.posX = 48;   //位置
selfData.posY = 47;   //位置
selfData.height = 5;  //高さ
selfData.speed = 5;   //前進速度
let theta = 0;

let selfObj = null;

//Texture
const textureLoader = new THREE.TextureLoader();
const ground_texture = textureLoader.load("./images/ground.jpg");
ground_texture.wrapS = ground_texture.wrapT = THREE.RepeatWrapping;
ground_texture.repeat.set(64, 64);


initWorld();  //CANNON.jsの初期化
setView();    //Three.jsの初期化
animate();    //レンダリング


/**
 * CANNON.jsの初期化
 */
function initWorld() {
    world = new CANNON.World();                       //物理世界を作成
    world.gravity.set(0, -9.82, 0);                   //物理世界に重力を設定
    world.broadphase = new CANNON.NaiveBroadphase();  //衝突している剛体の判定
    world.solver.iterations = 10;                     //反復計算回数
    world.solver.tolerance = 0.1;                     //許容値

    //Cannon Ground
    const groundMat = new CANNON.Material("groundMat"); //マテリアルを作成
    groundMat.friction = 0.3;                         //摩擦係数
    groundMat.restitution = 0.5;                      //反発係数

    phyPlane = new CANNON.Body({mass: 0});            //ボディを作成
    phyPlane.material = groundMat;                    //ボディにマテリアルを設定
    phyPlane.addShape(new CANNON.Plane());            //地面を作成
    phyPlane.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2 );   //地面を回転
    world.add(phyPlane);                              //物理世界に追加

    //Canon Sphere
    const sphereShape = new CANNON.Sphere(1);

    const sphereMat = new CANNON.Material("sphereMat");
    sphereMat.friction = 0.8;
    sphereMat.restitution = 0.5;

    selfObj = new CANNON.Body({mass: 1});
    selfObj.material = sphereMat;

    selfObj.addShape(sphereShape);
    selfObj.position.x = selfData.posX;
    selfObj.position.y = selfData.height;
    selfObj.position.z = selfData.posY;
    world.add(selfObj);
}

/**
 * Three.jsの初期化
 */
function setView() {
    scene = new THREE.Scene();                    //Three.jsの世界（シーン）を作成
    scene.fog = new THREE.Fog(0x000000, 1, 100);  //フォグを作成

    //Three Camera
    camera = new THREE.PerspectiveCamera(90, 800 / 600, 0.1, 10000);
    camera.position.set(Math.cos(Math.PI / 5) * 30, 5, Math.sin(Math.PI / 5) * 80);
    changeLookAt();

    scene.add(camera);

    //Three Light
    const light = new THREE.DirectionalLight(0xffffff, 0.5);  //照らす方向を指定する光源
    light.position.set(10, 10, -10);  //光源の位置を指定
    light.castShadow = true;          //影を作る物体かどうかを設定
    light.shadow.mapSize.width = 2024;      //影の精細さ（解像度）を設定
    light.shadow.mapSize.height = 2024;     //影の精細さ（解像度）を設定
    light.shadow.camera.left = -50;     //ライトの視点方向の影の表示度合い
    light.shadow.camera.right = 50;     //ライトの視点方向の影の表示度合い
    light.shadow.camera.top = 50;       //ライトの視点方向の影の表示度合い
    light.shadow.camera.buttom = -50;   //ライトの視点方向の影の表示度合い
    light.shadow.camera.far = 100;      //影を表示する範囲の設定
    light.shadow.camera.near = 0;       //影を表示する範囲の設定
    //light.shadowDarkness = 0.5;       //影の透明度

    scene.add(light);

    const amb = new THREE.AmbientLight(0xffffff);  //全体に光を当てる光源
    scene.add(amb);  //光源をシーンに追加

    //Three Sphere
    // const geometry = new THREE.SphereGeometry(0.5);
    // const material = new THREE.MeshLambertMaterial({
    //     color: 0x222222
    // });

    //Three Ground
    const graMeshGeometry = new THREE.PlaneGeometry(300, 300);   //地面の形状を作成
    const graMaterial = new THREE.MeshBasicMaterial({            //マテリアルを作成
        map: ground_texture                                //地面にテクスチャ（砂地）を設定
    });                                                    //「ground_texture」は別部分で作成

    viewPlane = new THREE.Mesh(graMeshGeometry, graMaterial);  //メッシュを作成
    viewPlane.rotation.x = -Math.PI / 2;                       //地面を回転
    viewPlane.position.y = 1 / 2;                              //地面の位置を設定
    viewPlane.receiveShadow = true;                            //地面に影を表示する
    scene.add(viewPlane);                                      //シーンに追加

    //Three Render
    renderer = new THREE.WebGLRenderer({antialias: true});     //レンダラーを作成
    renderer.setSize(wSizeWidth, wSizeHeight);                 //レンダラーのサイズを設定

    renderer.setClearColor(0xffffff, 1);                       //レンダラーの描画内容をクリア
    renderer.shadowMap.enabled = true;                          //レンダラーの影の描画を有効化
    document.body.appendChild(renderer.domElement);            //DOM要素をBodyに追加

    //Start Rendering
    renderer.render(scene, camera);                            //レンダラーで3D空間を描画
}

/**
 * レンダリング
 */
function animate() {
    requestAnimationFrame(animate);

    // 物理エンジンの時間を進める
    world.step(1 / 60);

    //カメラ位置の設定
    camera.position.set(selfObj.position.x, selfObj.position.y + 0.6, selfObj.position.z);

    // レンダリング
    renderer.render(scene, camera);
}

/**
 * 注視点変更
 */
function changeLookAt() {
    theta = selfData.angle / 180 * Math.PI;
    const posX = selfData.posX + Math.cos(theta) * 10000;
    const posY = selfData.posY + Math.sin(theta) * 10000;
    camera.lookAt(new THREE.Vector3(posX, 0, posY));     //カメラの視点（視線）を変える
}
