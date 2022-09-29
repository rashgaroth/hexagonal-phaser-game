/*global Phaser*/

var game = new Phaser.Game(800, 680, Phaser.AUTO, 'TutContainer', { preload: preload, create: create});

//horizontal tile shaped level
const levelData = [];
for (let i = 0; i < 30; i++) {
    let tempArr = []
    for (let j = 0; j < 30; j++) {
        tempArr.push(0)
    }
    levelData.push(tempArr);
}
// var levelData=
// [[-1,-1,-1,0,0,0,0,0,0,0,-1,-1,-1],
// [-1,-1,0,0,0,0,0,0,0,0,-1,-1,-1],
// [-1,-1,0,0,0,0,0,0,0,0,0,-1,-1],
// [-1,0,0,0,0,0,0,0,0,0,0,-1,-1],
// [-1,0,0,0,0,0,0,0,0,0,0,0,-1],
// [0,0,0,0,0,0,0,0,0,0,0,0,-1],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,-1],
// [-1,0,0,0,0,0,0,0,0,0,0,0,-1],
// [-1,0,0,0,0,0,0,0,0,0,0,-1,-1],
// [-1,-1,0,0,0,0,0,0,0,0,0,-1,-1],
// [-1,-1,0,0,0,0,0,0,0,0,-1,-1,-1],
// [-1,-1,-1,0,0,0,0,0,0,0,-1,-1,-1]];

// var levelData = [
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// [0,0,0,0,0,0,0,0,0,0,0,0,0],
// ]
// levelData = [
//     [-1,-1,0,0,-1,-1],
//     [-1,0,0,0,0,-1],
//     [0,0,0,0,0,0],
//     [0,0,0,0,0,0],
//     [-1,0,0,0,0,-1],
//     [-1,-1,0,0,-1,-1],
// ]
// levelData = [
//     [-1,-1,-1,0,0,0,-1,-1,-1],
//     [-1,-1,0,0,0,0,0,-1,-1],
//      [-1,0,0,0,0,0,0,0,-1],
//       [0,0,0,0,0,0,0,0,0],
//       [0,0,0,0,0,0,0,0,0],
//       [0,0,0,0,0,0,0,0,0],
//     [-1,0,0,0,0,0,0,0,-1],
//     [-1,-1,0,0,0,0,0,-1,-1],
//     [-1,-1,-1,0,0,0,-1,-1,-1],
// ]

var bmpText;
var hexTileHeight=61;
var hexTileWidth=52;
var hexGrid;
var rootThree;
var sideLength;
var prevTile=new Phaser.Point();

function preload() {
    //load all necessary assets
    game.load.bitmapFont('font', 'assets/font.png', 'assets/font.xml');
    game.load.image('hex', 'assets/hexsmall.png');
}

function create() {
    rootThree=Math.sqrt(3);
    sideLength=hexTileHeight/2;
    bmpText = game.add.bitmapText(10, 10, 'font', 'Hex heuristic\nmove mouse', 18);
    game.stage.backgroundColor = '#cccccc';
    createLevel();
    
    // Maintain aspect ratio
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    game.input.addMoveCallback(recentreHexGrid, this);//shows heuristics wrt tile under mouse
}

function createLevel(){
    hexGrid=game.add.group();
   
    var tileX;
    var tileY;
    var hexTile;
    var axialPoint=new Phaser.Point();
    var screenPoint=new Phaser.Point();
    for (var i = 0; i < levelData.length; i++)
    {
        for (var j = 0; j < levelData[0].length; j++)
        {
            axialPoint.x=i;
            axialPoint.y=j;
            axialPoint=offsetToAxial(axialPoint);
            screenPoint=axialToScreen(axialPoint);
            
            if(levelData[i][j]!=-1){
                hexTile= new HexTileNode(game, screenPoint.x, screenPoint.y, 'hex', false,i,j,levelData[i][j]);
                hexGrid.add(hexTile);
            }
        }
        
    }
    
    hexGrid.x=30;
    hexGrid.y=50;
}

function recentreHexGrid(){
    var tile= findCubicHexTile();
    tile=axialToOffset(tile);
    // console.log(tile, prevTile,"80");
    // console.log(Phaser.Point.equals(tile,prevTile), "@81");
    if(Phaser.Point.equals(tile,prevTile))return;
    prevTile=tile.clone();
    var hexTile;
    if(!checkforBoundary(tile.x,tile.y)){
        if(!checkForOccuppancy(tile.x,tile.y)){
            for (var i = 0; i < levelData.length; i++)
            for (var j = 0; j < levelData[0].length; j++)
            {
                if(levelData[i][j]!=-1){
                hexTile=hexGrid.getByName("tile"+i+"_"+j);
                // console.log(hexTile.showDifference, "@92");
                hexTile.getHeuristic(tile.x,tile.y);
                // hexTile.showDifference();
                // getHeuristic = getHeuristic.bind(hexTile);
                // showDifference = showDifference.bind(hexTile);
                hexTile.tint=Phaser.Color.interpolateColor('0xff0000','0xffffff',1, hexTile.heuristic,0.2);//'0xffffff';
                // hexTile.tileTag.visible=true;  
                // hexTile.tileTag.text = hexTile.heuristic+';'+hexTile.cost;
                // getHeuristic(tile.x, tile.y);
                // showDifference();
                }
            }
        }
        
    }
}

function showDifference(){
    console.log(this.heuristic, "@105");
    if(this.heuristic === 0){
    }
    
}

function getHeuristic(i,j){
    j=(j-(Math.floor(i/2)));
    var di=i-this.originali;
    var dj=j-this.convertedj;
    var si=Math.sign(di);
    var sj=Math.sign(dj);
    var absi=di*si;
    var absj=dj*sj;
    if(si!=sj){
        this.heuristic= Math.max(absi,absj);
    }else{
        this.heuristic= (absi+absj);
    }
}
function findCubicHexTile(){
    var pos=game.input.activePointer.position;
    pos.x-=hexGrid.x;
    pos.y-=hexGrid.y;
    // console.log(pos.x+':'+ pos.y);
    return screenToAxial(pos);
}
function screenToAxial(screenPoint){
    var axialPoint=new Phaser.Point();
    axialPoint.x=screenPoint.y/(1.5*sideLength);
    axialPoint.y=(screenPoint.x-(screenPoint.y/rootThree))/(rootThree*sideLength);
    var cubicZ=calculateCubicZ(axialPoint);
    var round_x=Math.round(axialPoint.x);
    var round_y=Math.round(axialPoint.y);
    var round_z=Math.round(cubicZ);
    if(round_x+round_y+round_z==0){
        screenPoint.x=round_x;
        screenPoint.y=round_y;
    }else{
        var delta_x=Math.abs(axialPoint.x-round_x);
        var delta_y=Math.abs(axialPoint.y-round_y);
        var delta_z=Math.abs(cubicZ-round_z);
        if(delta_x>delta_y && delta_x>delta_z){
            screenPoint.x=-round_y-round_z;
            screenPoint.y=round_y;
        }else if(delta_y>delta_x && delta_y>delta_z){
            screenPoint.x=round_x;
            screenPoint.y=-round_x-round_z;
        }else if(delta_z>delta_x && delta_z>delta_y){
            screenPoint.x=round_x
            screenPoint.y=round_y;
        }
    }
    return screenPoint;
}
function axialToScreen(axialPoint){
    var tileX=rootThree*sideLength*(axialPoint.y+(axialPoint.x/2));
    var tileY=3*sideLength/2*axialPoint.x;
    axialPoint.x=tileX;
    axialPoint.y=tileY;
    return axialPoint;
}
function offsetToAxial(offsetPoint){
    offsetPoint.y=(offsetPoint.y-(Math.floor(offsetPoint.x/2)));
    return offsetPoint;
}
function axialToOffset(axialPt){
    axialPt.y=(axialPt.y+(Math.floor(axialPt.x/2)));
    return axialPt;
}
function calculateCubicZ(newAxialPoint){
    return -newAxialPoint.x-newAxialPoint.y;
}
function checkForOccuppancy(i,j){//check if the tile is outside effective area or has a mine
    var tileType=levelData[i][j];
    if(tileType==-1 || tileType==10){
        return true;
    }
    return false;
}
function checkforBoundary(i,j){//check if the tile is outside level data array
    if(i<0 || j<0 || i >levelData.length-1 || j>levelData[0].length-1){
        return true;
    }
    return false;
}
