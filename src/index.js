// Dev tools
let toggleDebug = false;

// Gameplay tweak vars
const numReqReplays = 3; // Replays required to start game
const maxRecordingTime = 4; // recording time in seconds for replays
const defMutRotAmt = 40; // "normal" difficulty
const defMutPosAmt = 0.2; // "normal" difficulty
let defParts = ['head', 'leftHand', 'rightHand'];
let randAxes = ['x', 'y'];
let difficulty = 'easy';

let recordedPoses = [ [], [], [] ]; // Position & rotation
let recordedEvents = []; // Button presses
let rewindMut = false;
var highlighted = false;
let mutRotAmt = 0;
let mutPosAmt = 0;
let currMutRotAmt = 0;
let currMutPosAmt = 0;
let diffMet = false;
let gameStarted = false;
let gameOver = false;
let recording = false;
let replaying = false;
let fading = false;
let leftTriggerDown = false;
let rightTriggerDown = false;
let triggerDown = false;
let recordButtonSelected = false;
let recTeleportButtonSelected = false;
let replayButtonSelected = false;
let startButtonSelected = false;
let restartButtonSelected = false;
let newRoundButtonSelected = false;
let difficultyButtonSelected = false;
let ghostSelected = false; // Cursor over spawned ghost
let ghostName = undefined; // Ghost that was shot
let mutatedGhostName = undefined; // Mutated ghost
let savedRecordings = []; // Recordings saved in memory
let selectedRecording = 0; // Recording selected for playback
let tick = 0; // Counter for recording playback
let currRecordingTime = 0;
let endRecordingTime = 0;
let fadeTime = 0;
let endFadeTime = 0;
var countdownEndTime = 0;
var countdownSecond = 0;
var countdownStartTime = 0;
var countingDown = false;
var replayCount = 0;
var startTick = 0;
var midTick = 0;
var endTick = 0;
var oldPoint = {};
var diffMeterTotal = 0;
var trackpadAxis;
var rigLocked = false;

let startTime = 0;
let randRecord; // Ghost that is modified during game
let randSecond; // Beginning time in replay that mutation occurs
let randSecondBottom = 0;
let randSecondTop = 0;
let randBodyParts; // Body parts chosen to modify during replay
let spaceBuffer = 2; // This is the space buffer between spawned avatars
let cursorOverRecording;
let oldColor = "0xFFFFFF";

// https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array
function getRandom(arr, n) {
  var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
  if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

// Records pose of object on tick
function recordEntity(el, index) {
  // Record point
  var newPoint = {
    position: AFRAME.utils.clone(el.getAttribute('position')),
    rotation: AFRAME.utils.clone(el.getAttribute('rotation')),
    timestamp: Date.now() // Record timestamp of tick for grouping
  }
  recordedPoses[index].push(newPoint);

  const posNoiseThreshold = 0.001;
  const rotNoiseThreshold = 0.500;
  const barTotal = maxRecordingTime;
  var xPosDelta;
  var yPosDelta;
  var zPosDelta;
  var xRotDelta;
  var yRotDelta;
  var zRotDelta;
  var pointDiff = 0;
  var entId = el.id;

  // Check oldpoint delta against newpoint
  function calcDiff() {
    // Apply a percentage of movement to balance body parts
    if (entId == 'leftHand' || entId == 'rightHand') {
      var balance = 0.25;
    } else if (entId == 'camera') {
      var balance = 0.95;
    } else {
      var balance = 0;
    }

    // Positions
    xPosDelta = Math.abs(oldPoint[entId].position.x) - Math.abs(newPoint.position.x);
    yPosDelta = Math.abs(oldPoint[entId].position.y) - Math.abs(newPoint.position.y);
    zPosDelta = (Math.abs(oldPoint[entId].position.z) - Math.abs(newPoint.position.z)) / 2;

    var posDeltas = [xPosDelta,yPosDelta,zPosDelta]
    for (d = 0; d < posDeltas.length; d++) {
      if (Math.abs(posDeltas[d]) > posNoiseThreshold) {
        pointDiff += (Math.abs(posDeltas[d]) * balance)
      }
    }

    diffMeterTotal += pointDiff
    pointDiff = 0;

    // Rotations
    xRotDelta = Math.abs(oldPoint[entId].rotation.x) - Math.abs(newPoint.rotation.x);
    yRotDelta = Math.abs(oldPoint[entId].rotation.y) - Math.abs(newPoint.rotation.y);
    zRotDelta = (Math.abs(oldPoint[entId].rotation.z) - Math.abs(newPoint.rotation.z)) / 5;

    var rotDeltas = [xRotDelta,yRotDelta,zRotDelta]
    for (d = 0; d < rotDeltas.length; d++) {
      if (Math.abs(rotDeltas[d]) > rotNoiseThreshold) {
        pointDiff += (Math.abs(rotDeltas[d]) * balance)
      }
    }
    diffMeterTotal += (pointDiff / 1000)
    pointDiff = 0;

    if (diffMeterTotal < barTotal) {
      document.getElementById('diffMeter').setAttribute('geometry', 'primitive:plane; width: ' + diffMeterTotal + '; height: 0.5')
      if (diffMeterTotal > (barTotal / 2) ) {
        document.getElementById('diffMeter').setAttribute('material', 'color: gold');
        document.getElementById('diffMeter').setAttribute('value', 'KEEP MOVING');
      }
    } else if (!diffMet) {
      diffMet = true;
      document.getElementById('diffMeter').setAttribute('material', 'color: lightgreen');
      document.getElementById('diffMeter').setAttribute('value', 'FILLED!');
    }
  }

  if (oldPoint) {
    if (oldPoint[entId]) {
      calcDiff()
    }
  }

  // Save current point for next tick
  oldPoint[entId] = {
    position: AFRAME.utils.clone(el.getAttribute('position')),
    rotation: AFRAME.utils.clone(el.getAttribute('rotation')),
    timestamp: Date.now() // Record timestamp of tick for grouping
  }
}

// Floating button helper
function buttonEvent(button, event) {
  if (button) {
    if (event == 'int') {
      button.setAttribute('color', 'gold') // text color
    }
    if (event == 'noInt') {
      button.setAttribute('color', 'white') // text color
    }
    if (event == 'toggle') {
      if (button.getAttribute('visible')) {
        button.setAttribute('visible', false)
      } else {
        button.setAttribute('visible', true)
      }
    }
  }
}

function lockRig(position=null, lock=true) {
  var rig = document.getElementById('rig');
  if (lock) {
    rigLocked = true;
    document.getElementById('leftHand').setAttribute('teleport-controls', 'cameraRig: null; teleportOrigin: null;');

    // need to get original rotation and set based on that
    if (position == 'replay') {
      rig.setAttribute('position', '4.5 0 0')
      rig.setAttribute('rotation', '0 -90 0')
    } else if (position == 'record') {
      rig.setAttribute('position', '-9 0 0')
      rig.setAttribute('rotation', '0 -90 0')
    } else if (position == 'startgame') {
      rig.setAttribute('position', '0 0 9')
      rig.setAttribute('rotation', '0 180 0')
    } else if (position == 'start') {
      rig.setAttribute('position', '1.75 0 -2.5')
      rig.setAttribute('rotation', '0 0 0')
    }
  } else {
    rigLocked = false;
    document.getElementById('leftHand').setAttribute('teleport-controls', 'cameraRig: #rig; teleportOrigin: #camera;')
  }
}

function hideTheChildren(node) {
  // hide initial text
  var childNodes = node.childNodes;
  for (i=0; i < childNodes.length; i++) {
    if (childNodes[i].attached) {
      buttonEvent(document.getElementById(childNodes[i].id), 'toggle')
    }
  }
}

function changeDifficulty() {
  if (difficulty == 'turing') {
    document.getElementById('diffButton').setAttribute('material', 'color: green')
    document.getElementById('diffButton').setAttribute('value', 'EASY')
    difficulty = 'easy'
  } else if (difficulty == 'easy') {
    document.getElementById('diffButton').setAttribute('material', 'color: gold')
    document.getElementById('diffButton').setAttribute('value', 'NORMAL')
    difficulty = 'normal'
  } else if (difficulty == 'normal') {
    document.getElementById('diffButton').setAttribute('material', 'color: orange')
    document.getElementById('diffButton').setAttribute('value', 'HARD')
    difficulty = 'hard'
  } else if (difficulty == 'hard') {
    document.getElementById('diffButton').setAttribute('material', 'color: red')
    document.getElementById('diffButton').setAttribute('value', 'TURING TEST')
    difficulty = 'turing'
  }
}

function randomize() {
  // Randomize which body parts are mutated
  randBodyParts = getRandom(defParts, (Math.ceil(Math.random() * defParts.length)))
  // Randomize which axes are mutated
  randAxes = getRandom(randAxes, (Math.ceil(Math.random() * randAxes.length)))
  // Picks random replay to modify
  randRecord = Math.floor(Math.random() * Math.floor(savedRecordings.length));
  mutatedGhostName = 'replayHead' + randRecord
  // Get random float between 0.000 and (maxRecordingTime - 1)
  randSecond = Math.floor(Math.random() * ((maxRecordingTime - 1) * 1000 - 1 * 1000) + 1 * 1000) / 1000; // 1000 = 3 decimal points

  if (difficulty == 'easy') {
    mutRotAmt = defMutRotAmt * 2;
    mutPosAmt = defMutPosAmt * 2;
  } else if (difficulty == 'normal') {
    mutRotAmt = defMutRotAmt;
    mutPosAmt = defMutPosAmt;
  } else if (difficulty == 'hard') {
    mutRotAmt = defMutRotAmt / 2;
    mutPosAmt = defMutPosAmt / 2;
  } else if (difficulty == 'turing') {
    mutRotAmt = 1;
    mutPosAmt = 0.01;
  }
}

// Translate object to anther object's position with optional offsets
function rotateObject(obj, ref, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0) {
  try {
    obj.object3D.position.x = ref.position.x + px;
    obj.object3D.position.y = ref.position.y + py;
    obj.object3D.position.z = ref.position.z + pz;
    obj.object3D.rotation.x = THREE.Math.degToRad(ref.rotation.x + rx);
    obj.object3D.rotation.y = THREE.Math.degToRad(ref.rotation.y + ry);
    obj.object3D.rotation.z = THREE.Math.degToRad(ref.rotation.z + rz);
  } catch(error) {
    console.log('Tried to move object but got error: ' + error) // This try/catch block shouldn't be required...
  }
}

function gameStart() {
  // Move player in front of ghosteses
  lockRig('startgame');

  document.getElementById('fadePlane').setAttribute('fade', 'fadeSeconds: 1.5')

  // Make buttons unclickable
  document.getElementById('startText').removeAttribute('class')
  document.getElementById('replayButton').removeAttribute('class')
  document.getElementById('diffButton').removeAttribute('class')

  // Hide buttons
  document.getElementById('diffMeter').setAttribute('visible', false)
  document.getElementById('diffButton').setAttribute('visible', false)
  document.getElementById('startText').setAttribute('visible', false)
  document.getElementById('replayButton').setAttribute('visible', false)
  for (i = 0; i < savedRecordings.length; i++) {
    document.getElementById('replay' + i).setAttribute('visible', false)
  }

  if (savedRecordings.length > 3) {
    spaceBuffer += 1;
  }

  savedRecordings.forEach(function(element, index) {
    var sceneEl = document.querySelector('a-scene');

    // spawn head model instance
    if (!document.getElementById(('replayHead' + index))) {
      var newHead = document.createElement('a-entity')
      var replayRig = document.createElement('a-entity')
    } else {
      var newHead = document.getElementById(('replayHead' + index))
      var replayRig = document.getElementById(('replayRig' + index))
    }
    replayRig.setAttribute('id', 'replayRig' + index)
    replayRig.setAttribute('class', 'replay')
    sceneEl.appendChild(replayRig)
    newHead.setAttribute('id', 'replayHead' + index)
    replayRig.appendChild(newHead);
    var newHeadModel = document.createElement('a-entity')
    newHeadModel.setAttribute('id', 'newHeadModel' + index)
    newHeadModel.setAttribute('geometry', 'primitive: sphere; radius: 0.15;')
    newHeadModel.setAttribute('material', 'src: #face-texture; flatShading: true;')
    newHeadModel.setAttribute('rotation', '0 90 0')
    newHeadModel.setAttribute('button-intersect', 'name: replayHead' + index)
    newHeadModel.setAttribute('class', 'replay replayHeads')
    newHeadModel.setAttribute('random-color', '')
    newHead.appendChild(newHeadModel);

    // spawn hand model instances
    if (!document.getElementById(('replayLeftHand' + index))) {
      var newLeftHand = document.createElement('a-entity')
    } else {
      var newLeftHand = document.getElementById(('replayLeftHand' + index))
    }
    newLeftHand.setAttribute('id', 'replayLeftHand' + index)
    replayRig.appendChild(newLeftHand)
    var newLeftHandModel = document.createElement('a-entity')
    newLeftHandModel.setAttribute('id', 'newLeftHandModel' + index)
    newLeftHandModel.setAttribute('gltf-model', '#leftHandModel')
    newLeftHandModel.setAttribute('rotation', '0 0 90')
    newLeftHandModel.setAttribute('class', 'replay replayHandLeft')
    newLeftHand.appendChild(newLeftHandModel);

    if (!document.getElementById(('replayRightHand' + index))) {
      var newRightHand = document.createElement('a-entity')
    } else {
      var newRightHand = document.getElementById(('replayRightHand' + index))
    }
    newRightHand.setAttribute('id', 'replayRightHand' + index)
    replayRig.appendChild(newRightHand)
    var newRightHandModel = document.createElement('a-entity')
    newRightHandModel.setAttribute('id', 'newRightHandModel' + index)
    newRightHandModel.setAttribute('gltf-model', '#rightHandModel')
    newRightHandModel.setAttribute('rotation', '0 0 -90')
    newRightHandModel.setAttribute('class', 'replay replayHandRight')
    newRightHand.appendChild(newRightHandModel);

    // Move to starting position
    rotateObject(newHead, element[0][tick], index * 2 - spaceBuffer, 0, 15)
    rotateObject(newLeftHand, element[1][tick], index * 2 - spaceBuffer, 0, 15)
    rotateObject(newRightHand, element[2][tick], index * 2 - spaceBuffer, 0, 15)
    replayRig.setAttribute('position', '-8 0 0')

    replayRig.setAttribute('animation', 'to: 0 0 0; dur: 2500; easing: linear; loop: false; property: position;');
  })

  // Call our randomizer
  randomize();

  document.querySelector('a-scene').setAttribute('countdown', '')
  setTimeout(function() {
    gameStarted = true
    // Make heads clickable
    var replayHeads = document.querySelectorAll(".replayHeads");
    for (i = 0; i < replayHeads.length; i++) {
      replayHeads[i].classList.add('links');
    }
  }, 3000)
}

function gameEnd() {
  var sceneEl = document.querySelector('a-scene');
  var replayButton = document.getElementById('replayButton');
  var difficultyButton = document.getElementById('diffButton');
  var mutatedGhost = document.getElementById('replayHead' + randRecord);
  var mutatedGhostIndicator;

  // create restart button
  if (!document.getElementById('restartButton')) {
    var restartButton = document.createElement('a-entity');
    restartButton.setAttribute('id', 'restartButton')
    restartButton.setAttribute('geometry', 'primitive:plane; height:0.5; width:2;')
    restartButton.setAttribute('material', 'color:lightgreen; transparent:true; opacity:0.5;')
    restartButton.setAttribute('position', '2 2.5 14.5')
    restartButton.setAttribute('rotation', '0 180 0')
    restartButton.setAttribute('text', 'color:white; align:center; width: 5; value: Restart Game')
    restartButton.setAttribute('button-intersect', 'name:restart')
    sceneEl.appendChild(restartButton);
  }
  document.getElementById('restartButton').setAttribute('class', 'links')
  document.getElementById('restartButton').setAttribute('visible', true)

  // create new round button
  if (!document.getElementById('newRoundButton')) {
    var newRoundButton = document.createElement('a-entity');
    newRoundButton.setAttribute('id', 'newRoundButton')
    newRoundButton.setAttribute('geometry', 'primitive:plane; height:0.5; width:2;')
    newRoundButton.setAttribute('material', 'color:blue; transparent:true; opacity:0.5;')
    newRoundButton.setAttribute('position', '-2 2.5 14.5')
    newRoundButton.setAttribute('rotation', '0 180 0')
    newRoundButton.setAttribute('text', 'color:white; align:center; width: 5; value: New Round')
    newRoundButton.setAttribute('button-intersect', 'name: newRoundButton')
    sceneEl.appendChild(newRoundButton);
  }
  document.getElementById('newRoundButton').setAttribute('class', 'links')
  document.getElementById('newRoundButton').setAttribute('visible', true)

  // Highlight mutated ghost
  if (!document.getElementById('ghostRing')) {
    mutatedGhostIndicator = document.createElement('a-entity');
    sceneEl.appendChild(mutatedGhostIndicator)
  } else {
    mutatedGhostIndicator = document.getElementById('ghostRing')
  }
  mutatedGhostIndicator.setAttribute('geometry', 'primitive:ring; radius-inner:0.7; radius-outer:0.8')
  mutatedGhostIndicator.setAttribute('material', 'color:gold')
  mutatedGhostIndicator.setAttribute('rotation', '0 180 0')
  mutatedGhostIndicator.setAttribute('visible', true)
  mutatedGhostIndicator.setAttribute('class', 'replay')
  mutatedGhostIndicator.setAttribute('id', 'ghostRing')
  mutatedGhostIndicator.object3D.position.x = mutatedGhost.object3D.position.x;
  mutatedGhostIndicator.object3D.position.y = mutatedGhost.object3D.position.y;
  mutatedGhostIndicator.object3D.position.z = mutatedGhost.object3D.position.z;

  // Setup button to compare mutated replay to original
  replayButton.setAttribute('position', '3.25 1 14')
  replayButton.setAttribute('rotation', '0 -150 0')
  replayButton.setAttribute('value', 'REPLAY MUTATION')
  replayButton.setAttribute('class', 'links')
  replayButton.setAttribute('visible', true)

  // Move difficulty button
  difficultyButton.setAttribute('position', '-3.25 1 14')
  difficultyButton.setAttribute('rotation', '0 -210 0')
  difficultyButton.setAttribute('class', 'links')
  difficultyButton.setAttribute('visible', true)

  // Make heads unclickable
  var replayObjects = document.querySelectorAll('.replayHeads');
  for (i = 0; i < replayObjects.length; i++) {
    replayObjects[i].classList.remove('links');
  }

  // Add text
  //console.log('Mutating replay: ' + mutatedGhostName + '; randsecond: ' + randSecond + '; randBodyParts: ' + randBodyParts +'; randAxes: ' + randAxes)
  if (!document.getElementById('mutateStatsParts')) {
    var sceneEl = document.querySelector('a-scene');
    var entityEl = document.createElement('a-text');
    entityEl.setAttribute('id', 'mutateStatsParts')
    entityEl.setAttribute('value', 'Mutated parts: ' + randBodyParts)
    entityEl.setAttribute('rotation', '-60 180 0')
    entityEl.setAttribute('position', '2 0.4 ' + (document.getElementById('rig').getAttribute('position').z + 4.5))
    entityEl.setAttribute('wrapCount', '100')
    entityEl.setAttribute('scale', '1 1 1')
    entityEl.setAttribute('color', 'black')
    sceneEl.appendChild(entityEl);

    var sceneEl = document.querySelector('a-scene');
    var entityEl = document.createElement('a-text');
    entityEl.setAttribute('id', 'mutateStatsSeconds')
    entityEl.setAttribute('value', 'Mutation started at: ' + randSecond + 's')
    entityEl.setAttribute('rotation', '-60 180 0')
    entityEl.setAttribute('position', '2 0.3 ' + (document.getElementById('rig').getAttribute('position').z + 4))
    entityEl.setAttribute('wrapCount', '100')
    entityEl.setAttribute('scale', '1 1 1')
    entityEl.setAttribute('color', 'black')
    sceneEl.appendChild(entityEl);

    var sceneEl = document.querySelector('a-scene');
    var entityEl = document.createElement('a-text');
    entityEl.setAttribute('id', 'mutateStatsAxes')
    entityEl.setAttribute('value', 'Mutated along these axes: ' + randAxes)
    entityEl.setAttribute('rotation', '-60 180 0')
    entityEl.setAttribute('position', '2 0.2 ' + (document.getElementById('rig').getAttribute('position').z + 3.5))
    entityEl.setAttribute('wrapCount', '100')
    entityEl.setAttribute('scale', '1 1 1')
    entityEl.setAttribute('color', 'black')
    sceneEl.appendChild(entityEl);
  } else {
    document.getElementById('mutateStatsAxes').setAttribute('visible', true)
    document.getElementById('mutateStatsAxes').setAttribute('value', 'Mutated along these axes: ' + randAxes)

    document.getElementById('mutateStatsSeconds').setAttribute('value', 'Mutation started at ' + randSecond + 's')
    document.getElementById('mutateStatsSeconds').setAttribute('visible', true)

    document.getElementById('mutateStatsParts').setAttribute('value', 'Mutated parts: ' + randBodyParts)
    document.getElementById('mutateStatsParts').setAttribute('visible', true)
  }
}

// Resets everything
function restartGame() {
  document.getElementById('mutateStatsAxes').setAttribute('visible', false)
  document.getElementById('mutateStatsSeconds').setAttribute('visible', false)
  document.getElementById('mutateStatsParts').setAttribute('visible', false)

  // reset player positon
  lockRig('start');
  lockRig(null, false);

  // delete everything in the 'replay' class
  var replayObjects = document.querySelectorAll(".replay");
  for (i = 0; i < replayObjects.length; i++) {
    replayObjects[i].parentNode.removeChild(replayObjects[i])
  }

  // reset all vars
  gameStarted = false;
  gameOver = false;
  recording = false;
  replaying = false;
  leftTriggerDown = false;
  rightTriggerDown = false;
  triggerDown = false;
  startTime = 0;
  randSecondBottom = 0;
  randSecondTop = 0;
  recordButtonSelected = false;
  replayButtonSelected = false;
  startButtonSelected = false;
  restartButtonSelected = false;
  ghostSelected = false;
  recordedPoses = [ [], [], [] ];
  selectedRecording = 0;
  savedRecordings = [];
  spaceBuffer = 2;
  tick = 0;
  randAxes = ['x', 'y'];
  replayCount = 0;
  currMutRotAmt = 0;
  currMutPosAmt = 0;

  // reset buttons
  document.getElementById('restartButton').setAttribute('class', '')
  document.getElementById('restartButton').setAttribute('visible', false)

  document.getElementById('newRoundButton').setAttribute('class', '')
  document.getElementById('newRoundButton').setAttribute('visible', false)

  document.getElementById('recordButton').setAttribute('visible', true)
  document.getElementById('recordButton').setAttribute('class', 'links')
  document.getElementById('recordButton').setAttribute('rotation', '0 115 0')
  document.getElementById('recordButton').setAttribute('position', '-9 1.25 3')
  document.getElementById('recordButton').setAttribute('geometry', 'primitive:circle')

  document.getElementById('replayButton').setAttribute('visible', false)
  document.getElementById('replayButton').setAttribute('position', '9 1.25 3')
  document.getElementById('replayButton').setAttribute('rotation', '0 -100 0')
  document.getElementById('replayButton').setAttribute('value', 'REPLAY RECORDING')

  document.getElementById('diffButton').setAttribute('visible', false)
  document.getElementById('diffButton').setAttribute('rotation', '0 0 0')
  document.getElementById('diffButton').setAttribute('position', '1 1.55 -9.95')

  document.getElementById('startText').setAttribute('value', 'Record ' + numReqReplays + ' animations to start!')
  document.getElementById('startText').setAttribute('class', 'links')
  document.getElementById('startText').setAttribute('rotation', '0 90 0')
  document.getElementById('startText').setAttribute('position', '-9.9 2.5 0')
  document.getElementById('startText').setAttribute('color', 'white')
  document.getElementById('startText').removeAttribute('geometry')
  document.getElementById('startText').removeAttribute('material')
  document.getElementById('startText').removeAttribute('sound')

  document.getElementById('fadePlane').setAttribute('fade', 'fadeSeconds: 3.0')
  document.getElementById('upperBlockWall').components.sound.playSound();
  setTimeout(function() {
    document.getElementById('elevator1').setAttribute('elevator-doors', 'reverse: true; open: true;');
    document.getElementById('elevator').components.sound.playSound();
  }, 1000)
}

// Restarts game loop using the same replays but a new mutation
function restartRound() {
  gameStarted = false;
  replaying = false;
  gameOver = false;
  randAxes = ['x', 'y'];
  randRecord = undefined;
  randSecond = undefined;
  randBodyParts = undefined;
  tick = 0;
  replayCount = 0;
  currMutRotAmt = 0;
  currMutPosAmt = 0;
  startTime = 0;
  startTick = 0;
  rewindMut = false;

  // Reset position of avatars
  savedRecordings.forEach(function(element, index) {
    rotateObject(document.getElementById('replayHead' + index), element[0][tick], index * 2 - spaceBuffer, 0, 15)
    rotateObject(document.getElementById('replayLeftHand' + index), element[1][tick], index * 2 - spaceBuffer, 0, 15)
    rotateObject(document.getElementById('replayRightHand' + index), element[2][tick], index * 2 - spaceBuffer, 0, 15)

    document.getElementById('newHeadModel' + index).removeAttribute('random-color')
    document.getElementById('newHeadModel' + index).setAttribute('random-color', '')
    document.getElementById('newHeadModel' + index).getObject3D('mesh').geometry.colorsNeedUpdate = true;

    document.getElementById('newRightHandModel' + index).removeAttribute('highlight')
    document.getElementById('newLeftHandModel' + index).removeAttribute('highlight')
    document.getElementById('newHeadModel' + index).removeAttribute('highlight')
  })

  // Randomize everything again
  randomize();

  document.getElementById('mutateStatsAxes').setAttribute('visible', false)
  document.getElementById('mutateStatsSeconds').setAttribute('visible', false)
  document.getElementById('mutateStatsParts').setAttribute('visible', false)

  // reset buttons
  document.getElementById('restartButton').classList.remove('links')
  document.getElementById('restartButton').setAttribute('visible', false)
  document.getElementById('newRoundButton').classList.remove('links')
  document.getElementById('newRoundButton').setAttribute('visible', false)
  document.getElementById('replayButton').setAttribute('visible', false)
  document.getElementById('startText').setAttribute('visible', false)
  document.getElementById('startText').removeAttribute('sound')
  document.getElementById('ghostRing').setAttribute('visible', false)
  document.getElementById('diffButton').classList.remove('links')
  document.getElementById('diffButton').setAttribute('visible', false)

  // Fade back in with countdown
  document.getElementById('fadePlane').setAttribute('fade', 'fadeSeconds: 0.5');
  document.querySelector('a-scene').setAttribute('countdown', '');

  // Don't start until after the countdown
  setTimeout( function() {
    gameStarted = true
    // Make heads clickable
    var replayHeads = document.querySelectorAll(".replayHeads");
    for (i = 0; i < replayHeads.length; i++) {
      replayHeads[i].classList.add('links');
    }
  }, 3000);
}

// Saves given replay to memory and displays it for playback
function addReplay(poses, index) {
  savedRecordings.push(poses)
  // Draw planes representing new replay once saved
  var sceneEl = document.querySelector('a-scene');
  var entityEl = document.createElement('a-entity');
  var pos = (2 + (index / 2))
  entityEl.setAttribute('id', 'replay' + index)
  entityEl.setAttribute('geometry', 'primitive:plane; height:0.25; width:0.25;')
  entityEl.setAttribute('material', 'color:grey; transparent:true; opacity:0.75;')
  entityEl.setAttribute('position', '9 0.5 ' + pos)
  entityEl.setAttribute('rotation', '0 -100 0')
  entityEl.setAttribute('text', 'color:gold; align:center; width: 5; value:' + (index + 1))
  entityEl.setAttribute('class', 'replay links')
  entityEl.setAttribute('button-intersect', 'name:replay' + index)
  sceneEl.appendChild(entityEl);
  selectedRecording = savedRecordings.length - 1;
  for (i = 0; i < savedRecordings.length; i++) {
    if (i != selectedRecording) {
      document.getElementById('replay' + i).setAttribute('text', 'color: white')
    }
  }
}

function addProp(prop, position, rotation, scale, physics) {
  var scene = document.querySelector('a-scene');
  if (!rotation) {
    rotation = '0 0 0'
  }
  if (!scale) {
    scale = '1 1 1'
  }

  if (prop == 'light') {
    var newLight = document.createElement('a-entity')
    newLight.setAttribute('class', 'scenery light')
    scene.appendChild(newLight)

    // I think we can just clone these for duplicates...
    var newLightBox = document.createElement('a-box')
    newLightBox.setAttribute('class', 'scenery light-geom')
    newLightBox.setAttribute('width', '2')
    newLightBox.setAttribute('height', '0.1')
    newLightBox.setAttribute('depth', '1')
    newLightBox.setAttribute('color', '#a3a3a3')
    newLight.appendChild(newLightBox)

    var newLightBar = document.createElement('a-cylinder')
    newLightBar.setAttribute('class', 'scenery light-geom')
    newLightBar.setAttribute('radius', '0.05')
    newLightBar.setAttribute('height', '1')
    newLightBar.setAttribute('color', '#a1a1a1')
    newLightBar.setAttribute('rotation', '0 0 0')
    newLightBar.setAttribute('position', '-0.75 0.49 0')
    newLight.appendChild(newLightBar)

    newLightBar = document.createElement('a-cylinder')
    newLightBar.setAttribute('class', 'scenery light-geom')
    newLightBar.setAttribute('radius', '0.05')
    newLightBar.setAttribute('height', '1')
    newLightBar.setAttribute('color', '#a1a1a1')
    newLightBar.setAttribute('rotation', '0 0 0')
    newLightBar.setAttribute('position', '0.75 0.49 0')
    newLight.appendChild(newLightBar)

    var newLightBulb = document.createElement('a-cylinder')
    newLightBulb.setAttribute('class', 'scenery light-geom')
    newLightBulb.setAttribute('radius', '0.025')
    newLightBulb.setAttribute('height', '1.5')
    newLightBulb.setAttribute('color', '#ffffcc')
    newLightBulb.setAttribute('rotation', '90 0 90')
    newLightBulb.setAttribute('position', '0 -0.05 -0.15')
    newLight.appendChild(newLightBulb)

    newLightBulb = document.createElement('a-cylinder')
    newLightBulb.setAttribute('class', 'scenery light-geom')
    newLightBulb.setAttribute('radius', '0.025')
    newLightBulb.setAttribute('height', '1.5')
    newLightBulb.setAttribute('color', '#ffffcc')
    newLightBulb.setAttribute('rotation', '90 0 90')
    newLightBulb.setAttribute('position', '0 -0.05 0.15')
    newLight.appendChild(newLightBulb)

    newLightBulb = document.createElement('a-cylinder')
    newLightBulb.setAttribute('class', 'scenery light-geom')
    newLightBulb.setAttribute('radius', '0.025')
    newLightBulb.setAttribute('height', '1.5')
    newLightBulb.setAttribute('color', '#ffffcc')
    newLightBulb.setAttribute('rotation', '90 0 90')
    newLightBulb.setAttribute('position', '0 -0.05 -0.35')
    newLight.appendChild(newLightBulb)

    newLightBulb = document.createElement('a-cylinder')
    newLightBulb.setAttribute('class', 'scenery light-geom')
    newLightBulb.setAttribute('radius', '0.025')
    newLightBulb.setAttribute('height', '1.5')
    newLightBulb.setAttribute('color', '#ffffcc')
    newLightBulb.setAttribute('rotation', '90 0 90')
    newLightBulb.setAttribute('position', '0 -0.05 0.35')
    newLight.appendChild(newLightBulb)

    newLight.setAttribute('position', position)
    newLight.setAttribute('rotation', rotation)
    newLight.setAttribute('scale', scale)
  } else if (prop == 'box') {
    var newBox = document.createElement('a-box')
    newBox.setAttribute('class', 'grabbable scenery box')
    newBox.setAttribute('width', '1.5')
    newBox.setAttribute('height', '1.5')
    newBox.setAttribute('depth', '1.5')
    newBox.setAttribute('color', '#ad8762')
    if (physics) {
      newBox.setAttribute('dynamic-body', 'mass: 2.5;')
    } else {
      newBox.setAttribute('static-body', 'mass: 0;')
    }
    scene.appendChild(newBox)

    newBox.setAttribute('position', position)
    newBox.setAttribute('rotation', rotation)
    newBox.setAttribute('scale', scale)
  } else if (prop == 'shelf') {
    var newShelf = document.createElement('a-entity')
    newShelf.setAttribute('class', 'scenery shelf')
    scene.appendChild(newShelf)

    var newShelfPiece = document.createElement('a-box')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('width', '2')
    newShelfPiece.setAttribute('height', '0.15')
    newShelfPiece.setAttribute('depth', '1')
    newShelfPiece.setAttribute('color', '#2b1d00')
    newShelfPiece.setAttribute('position', '0 0.025 0')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelfPiece = document.createElement('a-box')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('width', '2')
    newShelfPiece.setAttribute('height', '0.15')
    newShelfPiece.setAttribute('depth', '1')
    newShelfPiece.setAttribute('color', '#2b1d00')
    newShelfPiece.setAttribute('position', '0 1.525 0')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelfPiece = document.createElement('a-box')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('width', '2')
    newShelfPiece.setAttribute('height', '0.15')
    newShelfPiece.setAttribute('depth', '1')
    newShelfPiece.setAttribute('color', '#2b1d00')
    newShelfPiece.setAttribute('position', '0 2.775 0')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelfPiece = document.createElement('a-cylinder')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('height', '3.5')
    newShelfPiece.setAttribute('radius', '0.05')
    newShelfPiece.setAttribute('color', 'black')
    newShelfPiece.setAttribute('position', '0.95 1.25 0.5')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelfPiece = document.createElement('a-cylinder')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('height', '3.5')
    newShelfPiece.setAttribute('radius', '0.05')
    newShelfPiece.setAttribute('color', 'black')
    newShelfPiece.setAttribute('position', '-0.95 1.25 0.5')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelfPiece = document.createElement('a-cylinder')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('height', '3.5')
    newShelfPiece.setAttribute('radius', '0.05')
    newShelfPiece.setAttribute('color', 'black')
    newShelfPiece.setAttribute('position', '-0.95 1.25 -0.5')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelfPiece = document.createElement('a-cylinder')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('height', '3.5')
    newShelfPiece.setAttribute('radius', '0.05')
    newShelfPiece.setAttribute('color', 'black')
    newShelfPiece.setAttribute('position', '0.95 1.25 -0.5')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelf.setAttribute('position', position)
    newShelf.setAttribute('rotation', rotation)
    newShelf.setAttribute('scale', scale)
  } else if (prop == 'radio') {
    var newRadio = document.createElement('a-entity')
    newRadio.setAttribute('class', 'grabbable scenery radio')
    scene.appendChild(newRadio)

    // base
    var newRadioThing = document.createElement('a-box')
    newRadioThing.setAttribute('class', 'scenery radio-geom')
    newRadioThing.setAttribute('width', '0.5')
    newRadioThing.setAttribute('height', '0.2')
    newRadioThing.setAttribute('depth', '0.2')
    newRadioThing.setAttribute('color', '#303030')
    newRadio.appendChild(newRadioThing)

    // handle
    newRadioThing = document.createElement('a-box')
    newRadioThing.setAttribute('class', 'scenery radio-geom')
    newRadioThing.setAttribute('width', '0.005')
    newRadioThing.setAttribute('height', '0.05')
    newRadioThing.setAttribute('depth', '0.025')
    newRadioThing.setAttribute('color', '#a3a3a3')
    newRadioThing.setAttribute('position', '0.2 0.125 0')
    newRadio.appendChild(newRadioThing)

    newRadioThing = document.createElement('a-box')
    newRadioThing.setAttribute('class', 'scenery radio-geom')
    newRadioThing.setAttribute('width', '0.005')
    newRadioThing.setAttribute('height', '0.05')
    newRadioThing.setAttribute('depth', '0.025')
    newRadioThing.setAttribute('color', '#a3a3a3')
    newRadioThing.setAttribute('position', '-0.2 0.125 0')
    newRadio.appendChild(newRadioThing)

    newRadioThing = document.createElement('a-box')
    newRadioThing.setAttribute('class', 'scenery radio-geom')
    newRadioThing.setAttribute('width', '0.405')
    newRadioThing.setAttribute('height', '0.005')
    newRadioThing.setAttribute('depth', '0.025')
    newRadioThing.setAttribute('color', '#a3a3a3')
    newRadioThing.setAttribute('position', '0 0.15 0')
    newRadio.appendChild(newRadioThing)

    // antenna
    newRadioThing = document.createElement('a-cylinder')
    newRadioThing.setAttribute('class', 'scenery radio-geom')
    newRadioThing.setAttribute('height', '0.45')
    newRadioThing.setAttribute('radius', '0.01')
    newRadioThing.setAttribute('color', '#a3a3a3')
    newRadioThing.setAttribute('position', '0.225 0.21 -0.06')
    newRadioThing.setAttribute('rotation', '0 15 -15')
    newRadio.appendChild(newRadioThing)

    // grilles
    newRadioThing = document.createElement('a-cylinder')
    newRadioThing.setAttribute('class', 'scenery radio-geom')
    newRadioThing.setAttribute('height', '0.025')
    newRadioThing.setAttribute('radius', '0.07')
    newRadioThing.setAttribute('color', '#a3a3a3')
    newRadioThing.setAttribute('position', '0.155 0 0.1')
    newRadioThing.setAttribute('rotation', '0 90 90')
    newRadio.appendChild(newRadioThing)

    newRadioThing = document.createElement('a-cylinder')
    newRadioThing.setAttribute('class', 'scenery radio-geom')
    newRadioThing.setAttribute('height', '0.025')
    newRadioThing.setAttribute('radius', '0.07')
    newRadioThing.setAttribute('color', '#a3a3a3')
    newRadioThing.setAttribute('position', '-0.155 0 0.1')
    newRadioThing.setAttribute('rotation', '0 90 90')
    newRadio.appendChild(newRadioThing)

    // Button
    newRadioThing = document.createElement('a-box')
    newRadioThing.setAttribute('class', 'scenery radio-geom')
    newRadioThing.setAttribute('width', '0.15')
    newRadioThing.setAttribute('height', '0.1')
    newRadioThing.setAttribute('depth', '0.01')
    newRadioThing.setAttribute('color', '#a3a3a3')
    newRadioThing.setAttribute('position', '0 0 0.1')
    newRadioThing.setAttribute('sound', 'src: #background-music; autoplay: true; loop: true; volume: 0.25; positional: true');
    newRadio.appendChild(newRadioThing)

    newRadio.setAttribute('position', position)
    newRadio.setAttribute('rotation', rotation)
    newRadio.setAttribute('scale', scale)
    newRadio.setAttribute('dynamic-body', '')
  } else if (prop == 'table') {
    var newTable = document.createElement('a-entity')
    newTable.setAttribute('class', 'scenery table')
    scene.appendChild(newTable)

    // slab
    var newTableThing = document.createElement('a-box')
    newTableThing.setAttribute('class', 'scenery table-geom')
    newTableThing.setAttribute('width', '3')
    newTableThing.setAttribute('height', '0.05')
    newTableThing.setAttribute('depth', '2')
    newTableThing.setAttribute('position', '-1 1 -3')
    newTableThing.setAttribute('opacity', '0.25')
    newTableThing.setAttribute('color', '#a8ccd7')
    newTableThing.setAttribute('static-body', '')
    newTable.appendChild(newTableThing)

    // legs
    newTableThing = document.createElement('a-cylinder')
    newTableThing.setAttribute('class', 'scenery table-geom')
    newTableThing.setAttribute('radius', '0.05')
    newTableThing.setAttribute('height', '1')
    newTableThing.setAttribute('position', '0.25 0.5 -3.75')
    newTableThing.setAttribute('color', '#000000')
    newTableThing.setAttribute('static-body', '')
    newTable.appendChild(newTableThing)

    newTableThing = document.createElement('a-cylinder')
    newTableThing.setAttribute('class', 'scenery table-geom')
    newTableThing.setAttribute('radius', '0.05')
    newTableThing.setAttribute('height', '1')
    newTableThing.setAttribute('position', '0.25 0.5 -2.25')
    newTableThing.setAttribute('color', '#000000')
    newTableThing.setAttribute('static-body', '')
    newTable.appendChild(newTableThing)

    newTableThing = document.createElement('a-cylinder')
    newTableThing.setAttribute('class', 'scenery table-geom')
    newTableThing.setAttribute('radius', '0.05')
    newTableThing.setAttribute('height', '1')
    newTableThing.setAttribute('position', '-2.25 0.5 -3.75')
    newTableThing.setAttribute('color', '#000000')
    newTableThing.setAttribute('static-body', '')
    newTable.appendChild(newTableThing)

    newTableThing = document.createElement('a-cylinder')
    newTableThing.setAttribute('class', 'scenery table-geom')
    newTableThing.setAttribute('radius', '0.05')
    newTableThing.setAttribute('height', '1')
    newTableThing.setAttribute('position', '-2.25 0.5 -2.25')
    newTableThing.setAttribute('color', '#000000')
    newTableThing.setAttribute('static-body', '')
    newTable.appendChild(newTableThing)

    newTable.setAttribute('position', position)
    newTable.setAttribute('rotation', rotation)
    newTable.setAttribute('scale', scale)
  } else if (prop == 'chair') {
    var newChair = document.createElement('a-entity')
    newChair.setAttribute('class', 'scenery chair')
    scene.appendChild(newChair)

    var newChairPiece = document.createElement('a-box')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('width', '0.5')
    newChairPiece.setAttribute('height', '0.05')
    newChairPiece.setAttribute('depth', '0.5')
    newChairPiece.setAttribute('color', '#bd0d0d')
    newChairPiece.setAttribute('position', '0 0.65 0')
    newChairPiece.setAttribute('static-body', '')
    newChair.appendChild(newChairPiece)

    newChairPiece = document.createElement('a-box')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('width', '0.5')
    newChairPiece.setAttribute('height', '0.025')
    newChairPiece.setAttribute('depth', '0.5')
    newChairPiece.setAttribute('color', '#bd0d0d')
    newChairPiece.setAttribute('position', '0.2 1.25 0')
    newChairPiece.setAttribute('rotation', '0 0 90')
    newChairPiece.setAttribute('static-body', '')
    newChair.appendChild(newChairPiece)

    newChairPiece = document.createElement('a-cylinder')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('radius', '0.015')
    newChairPiece.setAttribute('height', '1.5')
    newChairPiece.setAttribute('color', 'black')
    newChairPiece.setAttribute('position', '0.225 0.725 0.225')
    newChairPiece.setAttribute('static-body', '')
    newChair.appendChild(newChairPiece)

    newChairPiece = document.createElement('a-cylinder')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('radius', '0.015')
    newChairPiece.setAttribute('height', '0.65')
    newChairPiece.setAttribute('color', 'black')
    newChairPiece.setAttribute('position', '-0.225 0.325 -0.225')
    newChairPiece.setAttribute('static-body', '')
    newChair.appendChild(newChairPiece)

    newChairPiece = document.createElement('a-cylinder')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('radius', '0.015')
    newChairPiece.setAttribute('height', '0.65')
    newChairPiece.setAttribute('color', 'black')
    newChairPiece.setAttribute('position', '-0.225 0.325 0.225')
    newChairPiece.setAttribute('static-body', '')
    newChair.appendChild(newChairPiece)

    newChairPiece = document.createElement('a-cylinder')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('radius', '0.015')
    newChairPiece.setAttribute('height', '1.5')
    newChairPiece.setAttribute('color', 'black')
    newChairPiece.setAttribute('position', '0.225 0.725 -0.225')
    newChairPiece.setAttribute('static-body', '')
    newChair.appendChild(newChairPiece)

    newChair.setAttribute('position', position)
    newChair.setAttribute('rotation', rotation)
    newChair.setAttribute('scale', scale)
  } else if (prop == 'poster1') { // make these a single poster prop
    var newPoster = document.createElement('a-plane')
    newPoster.setAttribute('class', 'scenery poster')
    newPoster.setAttribute('width', '1.75')
    newPoster.setAttribute('height', '2')
    newPoster.setAttribute('material', 'src: #poster1; color: #eb3458;')

    scene.appendChild(newPoster)
    newPoster.setAttribute('position', position)
    newPoster.setAttribute('rotation', rotation)
    newPoster.setAttribute('scale', scale)
  } else if (prop == 'poster2') {
    var newPoster = document.createElement('a-plane')
    newPoster.setAttribute('class', 'scenery poster')
    newPoster.setAttribute('width', '1.75')
    newPoster.setAttribute('height', '2')
    newPoster.setAttribute('material', 'src: #poster2; color: #eb3458;')

    scene.appendChild(newPoster)
    newPoster.setAttribute('position', position)
    newPoster.setAttribute('rotation', rotation)
    newPoster.setAttribute('scale', scale)
  } else if (prop == 'poster3') {
    var newPoster = document.createElement('a-plane')
    newPoster.setAttribute('class', 'scenery poster')
    newPoster.setAttribute('width', '1.75')
    newPoster.setAttribute('height', '2')
    newPoster.setAttribute('material', 'src: #poster3; color: #eb3458;')

    scene.appendChild(newPoster)
    newPoster.setAttribute('position', position)
    newPoster.setAttribute('rotation', rotation)
    newPoster.setAttribute('scale', scale)
  }
}

// Setup scene
AFRAME.registerComponent('scenery', {
  init: function() {
    function replayRoomScenery() {
      // Tables
      addProp('table', '1 0 -6')

      // Chairs
      addProp('chair', '-1.45 0 -9', '0 165 0')
      addProp('chair', '1.4 0 -9.1', '0 -3 0')

      // Lights
      addProp('light', '3 3.5 -6.5', '0 0 0', '1.5 1 1')
      addProp('light', '-3 3.5 -6.5', '0 0 0', '1.5 1 1')
      addProp('light', '-7.5 3.5 -6.5', '0 90 0', '1.5 1 1')
      addProp('light', '7.5 3.5 -6.5', '0 90 0', '1.5 1 1')

      // Boxes
      addProp('box', '-9 1 -9', '0 0 0', '0.5 0.5 0.5', true)
      addProp('box', '-9 1 -7.5', '0 10 0', '0.25 0.25 0.25', true)
      addProp('box', '-7.5 1 -9', '0 20 0', '0.25 0.25 0.25', true)
      addProp('box', '9 1 -9', '0 0 0', '0.5 0.5 0.5', true)
      addProp('box', '9 1 -7.5', '0 15 0', '0.25 0.25 0.25', true)

      // Shelves
      addProp('shelf', '-8.5 0.5 5.25', '0 0 0', '1.25 1 1')
            // Boxes on shelves
            addProp('box', '-6 1 5', '0 0 0', '0.5 0.5 0.5')
            addProp('box', '-8.75 1 5.3', '0 0 0', '0.5 0.5 0.5')
            addProp('box', '-5 1 5.2', '0 0 0', '0.5 0.5 0.5')
      addProp('shelf', '-5.5 0.5 5.25', '0 0 0', '1.25 1 1')
            // Boxes on shelves
            addProp('box', '-6 2.25 5.2', '0 0 0', '0.25 0.25 0.25')
            addProp('box', '-5.5 2.25 5.2', '0 0 0', '0.2 0.2 0.2')
            addProp('box', '-5 2.5 5.2', '0 30 0', '0.25 0.6 0.3')
            addProp('box', '-8.5 2.25 5.2', '0 0 0', '0.5 0.25 0.5')
            addProp('box', '-9 2.25 5.2', '0 0 0', '0.25 0.25 0.5')
      addProp('shelf', '8.5 0.5 5.25', '0 0 0', '1.25 1 1')
            // Boxes on shelves
            addProp('box', '6 2.3 5.2', '0 0 0', '0.25 0.25 0.25')
            addProp('box', '5.5 2.25 5.2', '0 0 0', '0.2 0.2 0.2')
            addProp('box', '5 2.5 5.2', '0 30 0', '0.25 0.6 0.3')
            addProp('box', '8 2.25 5.2', '0 0 0', '0.5 0.25 0.5')
            addProp('box', '9 2.25 5.2', '0 0 0', '0.25 0.25 0.5')
      addProp('shelf', '5.5 0.5 5.25', '0 0 0', '1.25 1 1')
            // Boxes on shelves
            addProp('box', '6 1 5.1', '0 0 0', '0.5 0.5 0.5')
            addProp('box', '8.75 1 5.3', '0 0 0', '0.5 0.5 0.5')
            addProp('box', '5 1 5.2', '0 0 0', '0.5 0.5 0.5')

      // Posters
      addProp('poster2', '4.105 2 0', '0 90 0')
      addProp('poster3', '-2.64 1.75 -2.75', '0 90 0', '0.5 0.5 0.5')
      addProp('poster1', '2.645 1.75 -2.75', '0 -90 0', '0.5 0.5 0.5')

      // Misc
      addProp('radio', '0.85 1.15 -9', '0 -25 0')
    }

    function factoryRoomScenery() {
      // Shelves
      addProp('shelf', '8.5 0 9.35', '0 0 0')
      addProp('shelf', '8.5 0 6.65', '0 0 0')

      // Tables
      addProp('table', '-5 0 21.5', '0 0 0')

      // Chairs
      addProp('chair', '-4.5 0 18.75', '0 -10 0')
      addProp('chair', '-6 0 17.5', '0 100 0')

      // Lights
      addProp('light', '-7.5 3.5 8', '0 90 0', '1.5 1 1')
      addProp('light', '7.5 3.5 8', '0 90 0', '1.5 1 1')
      addProp('light', '-2 3.5 8', '0 0 0', '1.5 1 1')
      addProp('light', '2 3.5 8', '0 0 0', '1.5 1 1')

      addProp('light', '-2.5 3.5 13', '0 0 0', '1.5 1 1')
      addProp('light', '-2.5 3.5 18', '0 0 0', '1.5 1 1')

      addProp('light', '2.5 3.5 13', '0 0 0', '1.5 1 1')
      addProp('light', '2.5 3.5 18', '0 0 0', '1.5 1 1')

      // Boxes
      addProp('box', '-9 0.5 7', '0 0 0', '0.8 0.8 0.8')
      addProp('box', '-9 0.375 9', '0 60 0', '0.5 0.5 0.5')
      addProp('box', '-9.25 0.125 7.9', '0 45 0', '0.25 0.25 0.25')
      addProp('box', '-9 1.225 9', '0 25 0', '0.65 0.65 0.65')

      addProp('box', '8.5 0.75 17.5', '0 25 0', '1 1 1')
      addProp('box', '8.5 2.26 17.5', '0 75 0', '1 1 1')
      addProp('box', '-5 0.5 13.45', '0 25 0', '0.5 0.5 0.5')
      addProp('box', '-5.5 1.25 13.47', '0 75 0', '0.5 0.5 0.5')
      addProp('box', '-6 0.5 13.45', '0 75 0', '0.5 0.5 0.5')

      // Posters
      addProp('poster1', '9.95 2.5 8', '0 -90 0')
      addProp('poster2', '-9.95 2.5 8', '0 90 0')
    }

    replayRoomScenery();
    factoryRoomScenery();

    // Add grab controls after we add scenery
    document.getElementById('rightHand').setAttribute('sphere-collider', 'objects: .grabbable');
    document.getElementById('rightHand').setAttribute('grab', '');

    document.getElementById('leftHand').setAttribute('sphere-collider', 'objects: .grabbable');
    document.getElementById('leftHand').setAttribute('grab', '');
  }
})

// Robot replayer
AFRAME.registerComponent('replayer', {
  tick: function () {
    var headCube = document.getElementById("headCube");
    var leftCube = document.getElementById("leftCube");
    var rightCube = document.getElementById("rightCube");
    var currReplay = savedRecordings[selectedRecording];
    var replayButton = document.getElementById('replayButton');

    if (!gameStarted) {
      // Handle replay of single ghost before starting game
      if (replaying) {
        if (tick < currReplay[0].length) {
          replayButton.setAttribute('material', 'color:lightgreen')
          replayButton.setAttribute('value', 'REPLAYING')

          rotateObject(headCube, currReplay[0][tick])
          rotateObject(leftCube, currReplay[1][tick])
          rotateObject(rightCube, currReplay[2][tick])

          tick += 1;
        } else {
          replaying = false;
          lockRig(null, false);
          replayButton.setAttribute('material', 'color:blue')
          replayButton.setAttribute('value', 'REPLAY RECORDING')
          tick = 0;
        }
      }
    } else if (!fading && gameStarted) {
      // Get start of replay and set mutation times
      if (startTime == 0) {
        startTime = Date.now()
        randSecondBottom = startTime + (randSecond * 1000);
        randSecondTop = randSecondBottom + (randSecond * 1000);
      }

      // Loop through all and play all recordings by tick
      savedRecordings.forEach(function(element, index) {
        var headCube = document.getElementById(('replayHead' + index));
        var leftCube = document.getElementById(('replayLeftHand' + index));
        var rightCube = document.getElementById(('replayRightHand' + index));
        var currReplay = savedRecordings[index];

        function move() {
          if (!replaying) {
            rotateObject(headCube, currReplay[0][tick], index * 2 - spaceBuffer, 0, 15)
            rotateObject(leftCube, currReplay[1][tick], index * 2 - spaceBuffer, 0, 15)
            rotateObject(rightCube, currReplay[2][tick], index * 2 - spaceBuffer, 0, 15)
          } else {
            rotateObject(headCube, savedRecordings[randRecord][0][tick], index * 2 - spaceBuffer, 0, 15)
            rotateObject(leftCube, savedRecordings[randRecord][1][tick], index * 2 - spaceBuffer, 0, 15)
            rotateObject(rightCube, savedRecordings[randRecord][2][tick], index * 2 - spaceBuffer, 0, 15)
          }
        }

        if (tick < currReplay[0].length) {
          if (savedRecordings.indexOf(currReplay) == randRecord) {
            // Mutate randBodyParts if current replay time is within randomized range
            if (Date.now() >= randSecondBottom && Date.now() <= randSecondTop) {
              var randPX = index * 2 - spaceBuffer;
              var randPY = 0;
              var randPZ = 0;
              var randRX = 0;
              var randRY = 0;
              var randRZ = 0;

              var halfCurrFps = (90 / 2); // 90 is targeted FPS but should probably use current scene fps

              if (startTick == 0) {
                startTick = tick;
                midTick = startTick + halfCurrFps;
                endTick = midTick + halfCurrFps;
              }

              // Update current rotation and position mutation amounts
              if (!rewindMut && tick > midTick) {
                rewindMut = true;
              }

              if (!rewindMut) {
                currMutRotAmt += (mutRotAmt / halfCurrFps)
                currMutPosAmt += (mutPosAmt / halfCurrFps)
              } else if (tick < endTick) {
                currMutRotAmt -= (mutRotAmt / halfCurrFps)
                currMutPosAmt -= (mutPosAmt / halfCurrFps)
                if (currMutRotAmt <= 0) {
                  currMutRotAmt = 0;
                }
                if (currMutPosAmt <= 0) {
                  currMutPosAmt = 0;
                }
              }

              // Add movement variation if axes selected for mutation
              for (i = 0; i < randAxes.length; i++) {
                if (randAxes[i] == 'x') {
                  randPX = index * 2 - spaceBuffer + currMutPosAmt; // In addition to mutating we space the replay avatars out along the X axis
                  randRX = THREE.Math.degToRad(currMutRotAmt)
                } else if (randAxes[i] == 'y') {
                  randPY = currMutPosAmt;
                  randRY = THREE.Math.degToRad(currMutRotAmt);
                } else if (randAxes[i] == 'z') {
                  randPZ = currMutPosAmt;
                  randRZ = THREE.Math.degToRad(currMutRotAmt);
                }
              }

              // Mutate recording movement if in randBodyParts array
              for (i = 0; i < randBodyParts.length; i++) {
                if (randBodyParts[i] == 'head') {
                  rotateObject(headCube, currReplay[0][tick], randPX, randPY, (randPZ + 15), randRX, randRY, randRZ)
                  if (gameOver && !document.getElementById('newHeadModel' + index).getAttribute('highlight')) {
                    document.getElementById('newHeadModel' + index).setAttribute('highlight', '')
                  }
                } else if (randBodyParts[i] == 'leftHand') {
                  rotateObject(leftCube, currReplay[1][tick], randPX, randPY, (randPZ + 15), randRX, randRY, randRZ)
                  if (gameOver && !document.getElementById('newLeftHandModel' + index).getAttribute('highlight')) {
                    document.getElementById('newLeftHandModel' + index).setAttribute('highlight', '')
                  }
                } else if (randBodyParts[i] == 'rightHand') {
                  rotateObject(rightCube, currReplay[2][tick], randPX, randPY, (randPZ + 15), randRX, randRY, randRZ)
                  if (gameOver && !document.getElementById('newRightHandModel' + index).getAttribute('highlight')) {
                    document.getElementById('newRightHandModel' + index).setAttribute('highlight', '')
                  }
                }
              }

              // Move element normally if not in randBodyParts array
              if (!randBodyParts.some((element) => element === 'head')) {
                rotateObject(headCube, currReplay[0][tick], index * 2 - spaceBuffer, 0, 15)
              }
              if (!randBodyParts.some((element) => element === 'leftHand')) {
                rotateObject(leftCube, currReplay[1][tick], index * 2 - spaceBuffer, 0, 15)
              }
              if (!randBodyParts.some((element) => element === 'rightHand')) {
                rotateObject(rightCube, currReplay[2][tick], index * 2 - spaceBuffer, 0, 15)
              }
            } else {
              // Move all body parts normally if current timestamp is not within our randomized range
              move();
              if (gameOver) {
                document.getElementById('newRightHandModel' + index).removeAttribute('highlight')
                document.getElementById('newLeftHandModel' + index).removeAttribute('highlight')
                document.getElementById('newHeadModel' + index).removeAttribute('highlight')
              }
            }
          } else {
            // Move !randRecord pieces normally if game isn't over
            move();
            if (gameOver) {
              document.getElementById('newRightHandModel' + index).removeAttribute('highlight')
              document.getElementById('newLeftHandModel' + index).removeAttribute('highlight')
              document.getElementById('newHeadModel' + index).removeAttribute('highlight')
            }
          }
        } else {
          rewindMut = false;
          startTick = 0;
          if (gameOver) {
            document.getElementById('newRightHandModel' + index).removeAttribute('highlight')
            document.getElementById('newLeftHandModel' + index).removeAttribute('highlight')
            document.getElementById('newHeadModel' + index).removeAttribute('highlight')
          }
          if (!gameOver && tick > currReplay[0].length) {
            replayCount += 1;
            if (replayCount < numReqReplays) {
              tick = 0;
              startTime = 0;
              currMutRotAmt = 0;
              currMutPosAmt = 0;
              startTick = 0;
              rewindMut = false;
            } else {
              document.getElementById('startText').setAttribute('visible', true)
              document.getElementById('startText').setAttribute('value', 'YOU RAN OUT OF TIME, BE FASTER!')
              document.getElementById('startText').setAttribute('material', 'color: red')
              document.getElementById('startText').setAttribute('rotation', '0 180 0')
              document.getElementById('startText').setAttribute('position', '0 3.5 ' + 14.5)
              document.getElementById('startText').setAttribute('geometry', 'primitive:plane; height:0.5; width:4;')
              document.getElementById('startText').setAttribute('sound', 'src: #lose-sound; autoplay: true; volume: 1')
              
              document.getElementById('leftHand').components.haptics.pulse(0.5, 1000);
              document.getElementById('rightHand').components.haptics.pulse(0.5, 1000);
              gameOver = true;
              gameEnd();
            }
          }
        }
      })
      tick += 1;
    }
  }
});

AFRAME.registerComponent('mirror-movement', {
  tick: function () {
    if (!gameStarted) {
      var el = this.el; // `this.el` is the element.
      var headCube = document.getElementById("headCube");
      var leftCube = document.getElementById("leftCube");
      var rightCube = document.getElementById("rightCube");
      var camera = document.getElementById("camera");
      var leftHand = document.getElementById("leftHand");
      var rightHand = document.getElementById("rightHand");
      var replayButton = document.getElementById('replayButton');
      var recordButton = document.getElementById('recordButton');
      var startButton = document.getElementById('startText')

      if (el.object3D == camera.object3D) {
        var cube = headCube;
        var tvcube = tvheadCube;
        var index = 0;
        var staticpos = [0, 1.65, -0.230]
        var staticrot = [0, 0, 0]
      } else if (el.object3D == leftHand.object3D) {
        var cube = rightCube;
        var tvcube = tvrightCube;
        var index = 1;
        var staticpos = [0.327, 1.25, -0.575]
        var staticrot = [0, 0, 0]
      } else if (el.object3D == rightHand.object3D) {
        var cube = leftCube;
        var tvcube = tvleftCube;
        var index = 2;
        var staticpos = [-0.327, 1.25, -0.575]
        var staticrot = [0, 0, 0]
      } else {
        console.log("Error: not arm or head.")
      }

      if (recording) {
        if (!highlighted) {
          highlighted = true;
          document.getElementById('mirrorRightHand').setAttribute('highlight', '')
          document.getElementById('mirrorLeftHand').setAttribute('highlight', '')
          document.getElementById('mirrorHead').setAttribute('highlight', '')
        }
        if (currRecordingTime == 0) {
          currRecordingTime = Date.now(); // get current time
          let seconds = maxRecordingTime * 1000; // convert to milliseconds
          endRecordingTime = currRecordingTime + seconds; // set time to end recording
        } else if (currRecordingTime >= endRecordingTime) {
          if (diffMet) {
            if (replayButton.getAttribute('visible') == false) {
              replayButton.setAttribute('visible', true)
              document.getElementById('replayButton').setAttribute('class', 'links')
            }

            addReplay(recordedPoses, savedRecordings.length)

            if (savedRecordings.length >= numReqReplays) {
              startButton.setAttribute('value', 'START!')
              startButton.setAttribute('geometry', 'primitive:plane; width: 1.4; height:0.7')
              startButton.setAttribute('material', 'color: green')
              startButton.setAttribute('position', '-1 1.55 -9.95')
              startButton.setAttribute('rotation', '0 0 0')
              document.getElementById('diffButton').setAttribute('visible', true)

              recordButton.setAttribute('visible', true)
              recordButton.setAttribute('value', 'GO TO REPLAY AREA')
              recordButton.setAttribute('geometry', 'primitive:plane;')
              recordButton.setAttribute('material', 'color: orange')
              document.getElementById('diffMeter').setAttribute('visible', false)
            } else {
              startButton.setAttribute('value', 'Record ' + (numReqReplays - savedRecordings.length) + ' more animations to start...')
            }
          } else {
            startButton.setAttribute('value', 'You need to move enough to fill the bar!')
          }

          recording = false;
          lockRig(null, false);
          document.getElementById('diffMeter').setAttribute('geometry', 'width: 0; height: 0;')
          document.getElementById('diffMeter').setAttribute('material', 'color: pink');
          document.getElementById('diffMeter').setAttribute('value', 'MOVE TO FILL');
          document.getElementById('diffMeter').setAttribute('visible', false)
          oldPoint = {};
          diffMeterTotal = 0;
          diffMet = false;
        } else {
          recordButton.setAttribute('material', 'color:lightgreen')
          recordButton.setAttribute('value', 'RECORDING')
          let timeFormat = endRecordingTime - currRecordingTime
          startButton.setAttribute('value', timeFormat.toString() + 'ms left')
          recordEntity(el, index);
          currRecordingTime = Date.now()
        }

      } else {
        if (highlighted) {
          document.getElementById('mirrorRightHand').removeAttribute('highlight')
          document.getElementById('mirrorLeftHand').removeAttribute('highlight')
          document.getElementById('mirrorHead').removeAttribute('highlight')
          highlighted = false;
        }
        recordButton.setAttribute('material', 'color:red')
        if (savedRecordings.length < numReqReplays) {
          recordButton.setAttribute('value', 'START RECORDING')
        }
      }

      if (!replaying) {
        if (savedRecordings.length == 0) {
          cube.object3D.position.x = staticpos[0];
          cube.object3D.position.y = staticpos[1];
          cube.object3D.position.z = staticpos[2];
          cube.object3D.rotation.x = staticrot[0];
          cube.object3D.rotation.y = staticrot[1];
          cube.object3D.rotation.z = staticrot[2];
        }

        // mirror current player actions to recording area "monitor"
        tvcube.object3D.position.x = el.object3D.position.x * -1;
        tvcube.object3D.position.y = el.object3D.position.y;
        tvcube.object3D.position.z = el.object3D.position.z;
        tvcube.object3D.rotation.x = el.object3D.rotation.x;
        tvcube.object3D.rotation.y = el.object3D.rotation.y * -1;
        tvcube.object3D.rotation.z = el.object3D.rotation.z * -1;
      }
    }
  }
});

// Handle controller trigger down
AFRAME.registerComponent('triggered', {
  init: function () {
    var el = this.el; // The entity
    var startButton = document.getElementById('startText')

    // Ensure support for all controllers
    el.addEventListener('triggerdown', function (evt) {
      triggerDown = true
      var vibrate = true;

      if (replayButtonSelected) {
        replaying = true;
        if (gameOver) {
          tick = 0;
          startTime = 0;
          startTick = 0;
          currMutRotAmt = 0;
          currMutPosAmt = 0;
          rewindMut = false;
        } else {
          // lock rig at replay position
          lockRig('replay');
        }
      } else if (difficultyButtonSelected) {
        changeDifficulty();
      } else if (recTeleportButtonSelected) {
        lockRig('record');
        lockRig(null, false);
      } else if (recordButtonSelected) {
        if (!replaying && savedRecordings.length < numReqReplays ) {
          document.getElementById('diffMeter').setAttribute('visible', true)
          document.getElementById('startText').setAttribute('position', '-5 2.5 0')
          document.getElementById('startText').setAttribute('rotation', '0 -90 0')
          document.getElementById('recordButton').setAttribute('position', '-5 1.25 1')
          document.getElementById('recordButton').setAttribute('rotation', '0 -100 0')
          recording = true;
          lockRig('record')
          recordedPoses = [ [], [], [] ];
          tick = 0;
          currRecordingTime = 0;
        } else {
          lockRig('replay');
        }
      } else if (startButtonSelected) {
        if (savedRecordings.length >= numReqReplays) {
          document.getElementById('fadePlane').setAttribute('fade', 'fadeIn: false; fadeSeconds: 1.5')
          setTimeout(() => {
            gameStart()
          }, 1600);
        }
      } else if (restartButtonSelected) {
        document.getElementById('fadePlane').setAttribute('fade', 'fadeIn: false; fadeSeconds: 0.5')
        setTimeout(function() { restartGame(); }, 600);
      } else if (newRoundButtonSelected) {
        document.getElementById('fadePlane').setAttribute('fade', 'fadeIn: false; fadeSeconds: 0.5')
        setTimeout(function() { restartRound(); }, 600);
      } else if (ghostName) {
        vibrate = false;
        if (!gameOver) {
          document.getElementById('startText').setAttribute('visible', true)
          if (ghostName == mutatedGhostName) {
            startButton.setAttribute('value', 'YOU PICKED THE DEFECTIVE ROBOT!')
            startButton.setAttribute('material', 'color: green')
            startButton.setAttribute('rotation', '0 180 0')
            startButton.setAttribute('position', '0 3.5 14.5')
            startButton.setAttribute('geometry', 'primitive:plane; height:0.5; width:4;')
            startButton.setAttribute('sound', 'src: #win-sound; autoplay: true; volume: 1')
            gameOver = true;
            gameEnd();
          } else {
            document.getElementById('leftHand').components.haptics.pulse(0.5, 500);
            document.getElementById('rightHand').components.haptics.pulse(0.5, 500);
            startButton.setAttribute('value', 'YOU PICKED A FUNCTIONING ROBOT!')
            startButton.setAttribute('material', 'color: red')
            startButton.setAttribute('rotation', '0 180 0')
            startButton.setAttribute('position', '0 3.5 14.5')
            startButton.setAttribute('geometry', 'primitive:plane; height:0.5; width:4;')
            startButton.setAttribute('sound', 'src: #lose-sound; autoplay: true; volume: 1')
            gameOver = true;
            gameEnd();
          }
        }
      } else {
        if (cursorOverRecording && !replaying) {
          selectedRecording = parseInt(cursorOverRecording.slice(6), 10);
          document.getElementById('replay' + selectedRecording).setAttribute('text', 'color: gold');
          for (i = 0; i < savedRecordings.length; i++) {
            if (i != selectedRecording) {
              document.getElementById('replay' + i).setAttribute('text', 'color: white')
            }
          }
        } else {
          vibrate = false;
        }
      }
      if (vibrate) {
        el.components.haptics.pulse(0.5, 100);
      }
    });

    el.addEventListener('triggerup', function (evt) {
      triggerDown = false
    });
  }
});

// Handle camera rotation locomotion when rig isn't locked
AFRAME.registerComponent('camera-rotation', {
  init: function() {
    this.el.addEventListener('trackpaddown', function() {
      if (!rigLocked) {
        if (Math.abs(trackpadAxis[0]) > 0.5 || Math.abs(trackpadAxis[0]) < -0.5) {
          var mult = -1;
          if (Math.sign(trackpadAxis[0]) == -1 ) {
            mult = 1;
          }
          var currRigRot = document.getElementById('rig').getAttribute('rotation')
          var newRotX = currRigRot.x;
          var newRotY = currRigRot.y + (30 * mult);
          var newRotZ = currRigRot.z;
          var newRot = newRotX + ' ' + newRotY + ' ' + newRotZ
          document.getElementById('rig').setAttribute('rotation', newRot)
        }
      }
    });
    this.el.addEventListener('axismove', function(axis) {
      if (axis.detail.changed[0]) {
        trackpadAxis = axis.detail.axis;
      }
    });
  }
});

// Floating button interaction
AFRAME.registerComponent('button-intersect', {
  schema: {
    name: {type: 'string', default: ''},
    mutated: {type: 'boolean', default: false}
  },
  init: function () {
    var buttonName = this.data.name;
    var el = this.el; // The entity
    var recordButton = document.getElementById("recordButton");
    var replayButton = document.getElementById("replayButton");
    var startButton = document.getElementById("startText");
    var restartButton = document.getElementById("restartButton");
    var newRoundButton = document.getElementById("newRoundButton");
    var difficultyButton = document.getElementById("diffButton");
    var recTelButton = document.getElementById("recTeleportButton");

    this.el.addEventListener('raycaster-intersected', function() {
      if (el.object3D == recordButton.object3D) {
        if (!recording) {
          buttonEvent(recordButton, 'int')
          recordButtonSelected = true;
        }
      } else if (el.object3D == replayButton.object3D) {
        if (!recording) {
          buttonEvent(replayButton, 'int')
          replayButtonSelected = true;
        }
      } else if (el.object3D == startButton.object3D) {
        if (!recording && !replaying) {
          buttonEvent(startButton, 'int')
          startButtonSelected = true;
        }
      } else if (el.object3D == difficultyButton.object3D) {
        buttonEvent(difficultyButton, 'int')
        difficultyButtonSelected = true;
      } else if (el.object3D == recTelButton.object3D) {
        buttonEvent(recTelButton, 'int')
        recTeleportButtonSelected = true;
      } else {
        if (buttonName == 'restart') {
          restartButtonSelected = true;
          buttonEvent(restartButton, 'int')
        } else if (buttonName == 'newRoundButton') {
          newRoundButtonSelected = true;
          buttonEvent(newRoundButton, 'int')
        } else if (buttonName.slice(0, 10) == 'replayHead') {
          ghostSelected = true;
          ghostName = buttonName;
        } else {
          cursorOverRecording = buttonName;
        }
      }
    });

    this.el.addEventListener('raycaster-intersected-cleared', function () {
      if (el.object3D == recordButton.object3D) {
        buttonEvent(recordButton, 'noInt')
        recordButtonSelected = false;
      } else if (el.object3D == replayButton.object3D) {
        buttonEvent(replayButton, 'noInt')
        replayButtonSelected = false;
      } else if (el.object3D == startButton.object3D) {
        buttonEvent(startButton, 'noInt')
        startButtonSelected = false;
      } else if (el.object3D == difficultyButton.object3D) {
        buttonEvent(difficultyButton, 'noInt')
        difficultyButtonSelected = false;
      } else if (el.object3D == recTelButton.object3D) {
        buttonEvent(recTelButton, 'noInt')
        recTeleportButtonSelected = false;
      } else {
        if (buttonName.slice(0, 10) == 'replayHead') {
          ghostSelected = false;
          ghostName = undefined;
        } else if (buttonName == 'restart') {
          restartButtonSelected = false;
          buttonEvent(restartButton, 'noInt')
        } else if (buttonName == 'newRoundButton') {
          newRoundButtonSelected = false;
          buttonEvent(newRoundButton, 'noInt')
        } else {
          cursorOverRecording = undefined;
        }
      }
    });
  }
});

// Setup component for fading camera to black
AFRAME.registerComponent('fade', {
  schema: {
    fadeIn: {type: 'boolean', default: true},
    fadeSeconds: {type: 'number', default: 3}
  },
  init: function() {
    fading = true;
  },
  tick: function() {
    var fadeIn = this.data.fadeIn;
    var fadeSeconds = this.data.fadeSeconds;
    var el = this.el; // The entity
    var startingOpacity = 1;
    if (!fadeIn) {
      startingOpacity = 0;
    }

    if (fadeTime == 0) {
      el.setAttribute('visible', true)
      el.setAttribute('opacity', startingOpacity)
      fadeTime = Date.now(); // get current time
      endFadeTime = fadeTime + (fadeSeconds * 1000); // set time to end recording
    }
    if (fadeTime < endFadeTime) {
      var diffTime = endFadeTime - fadeTime
      if (startingOpacity == 1) {
        var fadePercentage = (diffTime / (fadeSeconds * 1000))
      } else {
        var fadePercentage = 1 - (diffTime / (fadeSeconds * 1000))
      }
      el.setAttribute('opacity', fadePercentage)
      // handle child nodes
      var childNodes = el.childNodes;
      for (i=0; i < childNodes.length; i++) {
        if (childNodes[i].attached) {
          document.getElementById(childNodes[i].id).setAttribute('opacity', fadePercentage)
        }
      }

      fadeTime = Date.now()
    } else {
      fadeTime = 0;
      if (fadeIn) {
        el.setAttribute('visible', false)
      }
      el.removeAttribute('fade');
    }
  },
  remove: function() {
    fading = false;
  }
});

// quick hacky way to fade in elevator sound
function fadeSoundIn() {
  setTimeout(function(){
    document.getElementById('rig').setAttribute('sound', 'volume: 0.02')
  }, 200);
  setTimeout(function(){
    document.getElementById('rig').setAttribute('sound', 'volume: 0.03')
  }, 300);
  setTimeout(function(){
    document.getElementById('rig').setAttribute('sound', 'volume: 0.04')
  }, 400);
  setTimeout(function(){
    document.getElementById('rig').setAttribute('sound', 'volume: 0.05')
  }, 500);
}

AFRAME.registerComponent('start-game', {
  init: function() {
    var scene = this.el; // The entity
    if (scene.is('vr-mode')) {
      document.getElementById('fadePlane').setAttribute('fade', '')
      hideTheChildren(document.getElementById('fadePlane'));
      document.getElementById('upperBlockWall').components.sound.playSound();
      setTimeout(function(){
        fadeSoundIn();
        document.getElementById('elevator').components.sound.playSound();
        document.getElementById('elevator2').setAttribute('elevator-doors', 'open: true;');
      }, 1500)
    } else {
      scene.addEventListener('enter-vr', function () {
        document.getElementById('fadePlane').setAttribute('fade', '')
        hideTheChildren(document.getElementById('fadePlane'));
        document.getElementById('upperBlockWall').components.sound.playSound();
        setTimeout(function(){
          fadeSoundIn();
          document.getElementById('elevator').components.sound.playSound();
          document.getElementById('elevator2').setAttribute('elevator-doors', 'open: true;');
        }, 1500)
      });
    }
  }
});

// animate elevator doors
AFRAME.registerComponent('elevator-doors', {
  schema: {
    open: {type: 'boolean', defaut: true},
    reverse: {type: 'boolean', default: false}
  },
  init: function() {
    var childNodes = this.el.children;
    var id = this.el.id;

    for (i=0; i < childNodes.length; i++) {
      if (childNodes[i].classList.contains('leftdoor')) {
        var leftDoor = childNodes[i]
        if (this.data.reverse) {
          var animation = "to: " + (leftDoor.getAttribute('position').x + 1) + ' ' + leftDoor.getAttribute('position').y + ' ' + (leftDoor.getAttribute('position').z + 0.01) + "; dur: 3000; easing: linear; loop: false; property: position;"
        } else {
          var animation = "to: " + (leftDoor.getAttribute('position').x - 1) + ' ' + leftDoor.getAttribute('position').y + ' ' + (leftDoor.getAttribute('position').z + 0.01) + "; dur: 3000; easing: linear; loop: false; property: position;"
        }
        leftDoor.setAttribute('animation', animation)
      } else if (childNodes[i].classList.contains('rightdoor')) {
        var rightDoor = childNodes[i]
        if (this.data.reverse) {
          var animation = "to: " + (rightDoor.getAttribute('position').x - 1) + ' ' + rightDoor.getAttribute('position').y + ' ' + (rightDoor.getAttribute('position').z + 0.01) + "; dur: 3000; easing: linear; loop: false; property: position;"
        } else {
          var animation = "to: " + (rightDoor.getAttribute('position').x + 1) + ' ' + rightDoor.getAttribute('position').y + ' ' + (rightDoor.getAttribute('position').z + 0.01) + "; dur: 3000; easing: linear; loop: false; property: position;"
        }
        rightDoor.setAttribute('animation', animation)
      }
    }

    setTimeout(function() {
      document.getElementById(id).removeAttribute('elevator-doors');
    }, 3100)

    if (this.data.open) {
      if (this.data.reverse) {
        var dir = 'false'
      } else {
        var dir = 'true'
      }

      setTimeout(function() {
        document.getElementById(id).setAttribute('elevator-doors', 'open: false; reverse: ' + dir + ';');
        setTimeout(function() {
          document.getElementById('upperBlockWall').components.sound.playSound();
        }, 2000)
      }, 25000)
    }
  }
});

// Adds a numeric countdown to fadePlane
AFRAME.registerComponent('countdown', {
  schema: {
    seconds: {type: 'number', default: 3}
  },
  init: function() {
    // Create number text
    countdownSecond = this.data.seconds;
    var countdownText = document.createElement('a-entity');
    countdownText.setAttribute('id', 'countdownText')
    countdownText.setAttribute('text', 'value: ' + countdownSecond)
    countdownText.setAttribute('color', 'black')
    countdownText.setAttribute('position', '-9.65 3.5 ' + (document.getElementById('rig').getAttribute('position').z + 5)) // Should make these schema values
    countdownText.setAttribute('rotation', '30 180 0')
    countdownText.setAttribute('scale', '20 20 20')
    document.querySelector('a-scene').appendChild(countdownText)
    countingDown = true;
    countdownStartTime = Date.now();
    countdownEndTime = countdownStartTime + (this.data.seconds * 1000);
  },
  tick: function() {
    var currTime = Date.now()

    if (currTime < countdownEndTime) {
      var diffTime = countdownEndTime - currTime;
      if ((countdownSecond * 1000) >= diffTime) {
        countdownSecond = countdownSecond - 1
        document.getElementById('countdownText').setAttribute('text', 'value: ' + (countdownSecond + 1))
        document.getElementById('leftHand').components.haptics.pulse(0.5, 100);
        document.getElementById('rightHand').components.haptics.pulse(0.5, 100);
      }
    } else {
      this.el.removeAttribute('countdown')
    }
  },
  remove: function() {
    countingDown = false;
    // Delete the number text
    document.querySelector('a-scene').removeChild(document.getElementById('countdownText'))
  }
});

// Changes color of mesh
AFRAME.registerComponent('highlight', {
  init: function() {
    let el = this.el;
    let mesh = el.getObject3D('mesh');
    if (!mesh){return;}
    mesh.traverse(function(node){
      if (node.isMesh){
        if (el.classList.contains('replayHeads')) {
          oldColor = node.material.color;
        }
        node.material.color = new THREE.Color(0xffff00);
      }
    });
  },
  remove: function() {
    let el = this.el;
    let mesh = el.getObject3D('mesh');
    if (!mesh){return;}
    mesh.traverse(function(node){
      if (node.isMesh){
        if (el.classList.contains('replayHeads')) {
          node.material.color = oldColor;
        } else {
          node.material.color = new THREE.Color(0xFFFFFF);
        }
      }
    });
  }
});

AFRAME.registerComponent('joymove', {
  tick: function() {
    if (this.el.body.previousPosition.x.toFixed(3) != this.el.body.position.x.toFixed(3)) {
      if (this.el.body.position.x > 0 ) {
        if (document.getElementById('crane').object3D.position.x < 2) {
          document.getElementById('crane').object3D.position.x += this.el.body.position.x
        }
      } else {
        if (document.getElementById('crane').object3D.position.x > -2) {
          document.getElementById('crane').object3D.position.x += this.el.body.position.x
        }
      }
    }
  }
});

// Dev tools
AFRAME.registerComponent('toggle-debug', {
  init: function() {
    if (toggleDebug) {
      document.querySelector('a-scene').setAttribute('stats', '')
      document.querySelector('a-scene').setAttribute('physics', 'debug: true;')
    }
  }
});
