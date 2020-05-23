// Dev tools
let toggleDebug = false;

// Gameplay tweak vars
let numReqReplays = 3; // Replays required to start game
let maxRecordingTime = 4; // recording time in seconds for replays
let recordedPoses = [ [], [], [] ]; // Position & rotation
let recordedEvents = []; // Button presses
let defParts = ['head', 'leftHand', 'rightHand'];
let randAxes = ['x', 'y'];
let defMutRotAmt = 40;
let defMutPosAmt = 0.2;

let rewindMut = false;
let mutRotAmt = 0;
let mutPosAmt = 0;
let currMutRotAmt = 0;
let currMutPosAmt = 0;
let difficulty = 'easy';
let gameStarted = false;
let gameOver = false;
let recording = false;
let replaying = false;
let fading = false;
let leftTriggerDown = false;
let rightTriggerDown = false;
let triggerDown = false;
let recordButtonSelected = false;
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

let startTime = 0;
let randRecord; // Ghost that is modified during game
let randSecond; // Beginning time in replay that mutation occurs
let randSecondBottom = 0;
let randSecondTop = 0;
let randBodyParts; // Body parts chosen to modify during replay
let spaceBuffer = 2; // This is the space buffer between spawned avatars
let cursorOverRecording;

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
  var newPoint = {
    position: AFRAME.utils.clone(el.getAttribute('position')),
    rotation: AFRAME.utils.clone(el.getAttribute('rotation')),
    timestamp: Date.now() // Record timestamp of tick for grouping
  }
  recordedPoses[index].push(newPoint);
}

// Floating button helper
function buttonEvent(button, event) {
  if (button) {
    if (event == 'int') {
      button.setAttribute('color', 'yellow') // text color
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

function changeDifficulty() {
  if (difficulty == 'turing') {
    document.getElementById('diffButton').setAttribute('material', 'color: green')
    document.getElementById('diffButton').setAttribute('value', 'EASY')
    difficulty = 'easy'
  } else if (difficulty == 'easy') {
    document.getElementById('diffButton').setAttribute('material', 'color: yellow')
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

  // Log the output...should show this endgame in a popup
  console.log('Mutating replay: ' + mutatedGhostName + '; randsecond: ' + randSecond + '; randBodyParts: ' + randBodyParts +'; randAxes: ' + randAxes)
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
  document.getElementById('fadePlane').setAttribute('fade', 'fadeSeconds: 1.5')

  // Move title
  buttonEvent(document.getElementById('titleText'), 'toggle')
  document.getElementById('titleText').setAttribute('position', '0 6 3')
  document.getElementById('titleText').setAttribute('rotation', '30 180 0')

  // Make buttons unclickable
  document.getElementById('startText').removeAttribute('class')
  document.getElementById('replayButton').removeAttribute('class')
  document.getElementById('diffButton').removeAttribute('class')

  // Hide buttons
  buttonEvent(document.getElementById('diffButton'), 'toggle')
  buttonEvent(document.getElementById('startText'), 'toggle')
  buttonEvent(document.getElementById('replayButton'), 'toggle')
  for (i = 0; i < savedRecordings.length; i++) {
    buttonEvent(document.getElementById('replay' + i), 'toggle')
  }

  // hide mirror replay
  buttonEvent(document.getElementById('leftCube'), 'toggle')
  buttonEvent(document.getElementById('rightCube'), 'toggle')
  buttonEvent(document.getElementById('headCube'), 'toggle')

  if (savedRecordings.length > 3) {
    spaceBuffer += 1;
  }

  savedRecordings.forEach(function(element, index) {
    var sceneEl = document.querySelector('a-scene');

    // spawn head model instance
    if (!document.getElementById(('replayHead' + index))) {
      var newHead = document.createElement('a-entity')
    } else {
      var newHead = document.getElementById(('replayHead' + index))
    }
    newHead.setAttribute('id', 'replayHead' + index)
    sceneEl.appendChild(newHead);
    var newHeadModel = document.createElement('a-entity')
    newHeadModel.setAttribute('geometry', 'primitive: tetrahedron; radius: 0.15; detail: 2;')
    newHeadModel.setAttribute('material', 'src: #face-texture; flatShading: true;')
    newHeadModel.setAttribute('rotation', '0 -90 0')
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
    sceneEl.appendChild(newLeftHand)
    var newLeftHandModel = document.createElement('a-entity')
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
    sceneEl.appendChild(newRightHand)
    var newRightHandModel = document.createElement('a-entity')
    newRightHandModel.setAttribute('gltf-model', '#rightHandModel')
    newRightHandModel.setAttribute('rotation', '0 0 -90')
    newRightHandModel.setAttribute('class', 'replay replayHandRight')
    newRightHand.appendChild(newRightHandModel);

    // Move to starting position
    rotateObject(newHead, element[0][tick], index * 2 - spaceBuffer)
    rotateObject(newLeftHand, element[1][tick], index * 2 - spaceBuffer)
    rotateObject(newRightHand, element[2][tick], index * 2 - spaceBuffer)
  })

  // Call our randomizer
  randomize();

  // Move player in front of ghosteses
  document.getElementById('rig').setAttribute('position', '1 0 -6')
  document.getElementById('rig').setAttribute('rotation', '0 180 0')

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
    restartButton.setAttribute('geometry', 'primitive:plane; height:0.8; width:2;')
    restartButton.setAttribute('material', 'color:lightgreen; transparent:true; opacity:0.5;')
    restartButton.setAttribute('position', '2 4 2')
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
    newRoundButton.setAttribute('geometry', 'primitive:plane; height:0.8; width:2;')
    newRoundButton.setAttribute('material', 'color:blue; transparent:true; opacity:0.5;')
    newRoundButton.setAttribute('position', '-2 4 2')
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
  mutatedGhostIndicator.setAttribute('geometry', 'primitive:ring; radius-inner:0.9; radius-outer:1')
  mutatedGhostIndicator.setAttribute('material', 'color:yellow')
  mutatedGhostIndicator.setAttribute('rotation', '0 180 0')
  mutatedGhostIndicator.setAttribute('visible', true)
  mutatedGhostIndicator.setAttribute('class', 'replay')
  mutatedGhostIndicator.setAttribute('id', 'ghostRing')
  mutatedGhostIndicator.object3D.position.x = mutatedGhost.object3D.position.x;
  mutatedGhostIndicator.object3D.position.y = mutatedGhost.object3D.position.y;
  mutatedGhostIndicator.object3D.position.z = mutatedGhost.object3D.position.z;

  // Setup button to compare mutated replay to original
  replayButton.setAttribute('position', '4.5 2 1')
  replayButton.setAttribute('rotation', '0 -155 0')
  replayButton.setAttribute('value', 'REPLAY IMPOSTER')
  replayButton.setAttribute('class', 'links')
  replayButton.setAttribute('visible', true)

  // Move difficulty button
  difficultyButton.setAttribute('position', '-4.5 2 1')
  difficultyButton.setAttribute('rotation', '0 -215 0')
  difficultyButton.setAttribute('class', 'links')
  difficultyButton.setAttribute('visible', true)

  // Make heads unclickable
  var replayObjects = document.querySelectorAll('.replayHeads');
  for (i = 0; i < replayObjects.length; i++) {
    replayObjects[i].classList.remove('links');
  }
}

// Resets everything
function restartGame() {
  // Move title
  document.getElementById('titleText').setAttribute('position', '0 5 -9')
  document.getElementById('titleText').setAttribute('rotation', '30 0 0')

  // restore mirror body
  buttonEvent(document.getElementById('leftCube'), 'toggle')
  buttonEvent(document.getElementById('rightCube'), 'toggle')
  buttonEvent(document.getElementById('headCube'), 'toggle')

  // reset player positon
  document.getElementById('rig').setAttribute('position', '0 0 -4')
  document.getElementById('rig').setAttribute('rotation', '0 0 0')

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

  document.getElementById('replayButton').setAttribute('visible', false)
  document.getElementById('replayButton').setAttribute('position', '3 2 -10')
  document.getElementById('replayButton').setAttribute('rotation', '0 -25 0')
  document.getElementById('replayButton').setAttribute('value', 'REPLAY RECORDING')

  document.getElementById('diffButton').setAttribute('visible', true)
  document.getElementById('diffButton').setAttribute('rotation', '0 25 0')
  document.getElementById('diffButton').setAttribute('position', '-3 4 -10')

  document.getElementById('startText').setAttribute('value', 'Record ' + numReqReplays + ' animations to start!')
  document.getElementById('startText').setAttribute('class', 'links')
  document.getElementById('startText').setAttribute('rotation', '0 0 0')
  document.getElementById('startText').setAttribute('position', '0 4 -10')
  document.getElementById('startText').setAttribute('color', 'white')
  document.getElementById('startText').removeAttribute('geometry')
  document.getElementById('startText').removeAttribute('material')

  document.getElementById('fadePlane').setAttribute('fade', 'fadeSeconds: 0.5')
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

  // Reset position of ghosts
  savedRecordings.forEach(function(element, index) {
    rotateObject(document.getElementById('replayHead' + index), element[0][tick], index * 2 - spaceBuffer)
    rotateObject(document.getElementById('replayLeftHand' + index), element[1][tick], index * 2 - spaceBuffer)
    rotateObject(document.getElementById('replayRightHand' + index), element[2][tick], index * 2 - spaceBuffer)
  })

  // Randomize everything again
  randomize();

  // reset buttons
  document.getElementById('restartButton').classList.remove('links')
  document.getElementById('restartButton').setAttribute('visible', false)
  document.getElementById('newRoundButton').classList.remove('links')
  document.getElementById('newRoundButton').setAttribute('visible', false)
  document.getElementById('replayButton').setAttribute('visible', false)
  document.getElementById('startText').setAttribute('visible', false)
  document.getElementById('titleText').setAttribute('visible', false)
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
  entityEl.setAttribute('material', 'color:grey; transparent:true; opacity:0.5;')
  entityEl.setAttribute('position', pos + ' 1 -10')
  entityEl.setAttribute('rotation', '0 -25 0')
  entityEl.setAttribute('text', 'color:yellow; align:center; width: 5; value:' + (index + 1))
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

// Ghost replayer
AFRAME.registerComponent('replayer', {
  tick: function () {
    var scene = document.querySelector('a-scene');
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
            rotateObject(headCube, currReplay[0][tick], index * 2 - spaceBuffer)
            rotateObject(leftCube, currReplay[1][tick], index * 2 - spaceBuffer)
            rotateObject(rightCube, currReplay[2][tick], index * 2 - spaceBuffer)
          } else {
            rotateObject(headCube, savedRecordings[randRecord][0][tick], index * 2 - spaceBuffer)
            rotateObject(leftCube, savedRecordings[randRecord][1][tick], index * 2 - spaceBuffer)
            rotateObject(rightCube, savedRecordings[randRecord][2][tick], index * 2 - spaceBuffer)
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

              // need to calc upper and lower bounds of ticks and get middle of that to use as switch
              // works....wrong end number
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
                  rotateObject(headCube, currReplay[0][tick], randPX, randPY, randPZ, randRX, randRY, randRZ)
                } else if (randBodyParts[i] == 'leftHand') {
                  rotateObject(leftCube, currReplay[1][tick], randPX, randPY, randPZ, randRX, randRY, randRZ)
                } else if (randBodyParts[i] == 'rightHand') {
                  rotateObject(rightCube, currReplay[2][tick], randPX, randPY, randPZ, randRX, randRY, randRZ)
                }
              }

              // Move element normally if not in randBodyParts array
              if (!randBodyParts.some((element) => element === 'head')) {
                rotateObject(headCube, currReplay[0][tick], index * 2 - spaceBuffer)
              }
              if (!randBodyParts.some((element) => element === 'leftHand')) {
                rotateObject(leftCube, currReplay[1][tick], index * 2 - spaceBuffer)
              }
              if (!randBodyParts.some((element) => element === 'rightHand')) {
                rotateObject(rightCube, currReplay[2][tick], index * 2 - spaceBuffer)
              }
            } else {
              // Move all body parts normally if current timestamp is not within our randomized range
              move();
            }
          } else {
            // Move !randRecord pieces normally if game isn't over
            move();
          }
        } else {
          rewindMut = false;
          startTick = 0;
          if (!gameOver && tick > currReplay[0].length) {
            replayCount += 1;
            if (replayCount < numReqReplays) {
              tick = 0;
              startTime = 0;
              currMutRotAmt = 0;
              currMutPosAmt = 0;
              startTick = 0;
              rewindMut = false;
            }
          }
        }
      })
      tick += 1;
    }
  }
});

// Mirror user movement while idle
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
        var index = 0;
      } else if (el.object3D == leftHand.object3D) {
        var cube = rightCube;
        var index = 1;
      } else if (el.object3D == rightHand.object3D) {
        var cube = leftCube;
        var index = 2;
      } else {
        console.log("Error: not arm or head.")
      }

      if (recording) {
        if (currRecordingTime == 0) {
          currRecordingTime = Date.now(); // get current time
          let seconds = maxRecordingTime * 1000; // convert to milliseconds
          endRecordingTime = currRecordingTime + seconds; // set time to end recording
        } else if (currRecordingTime >= endRecordingTime) {
          if (replayButton.getAttribute('visible') == false) {
            buttonEvent(replayButton, 'toggle')
            document.getElementById('replayButton').setAttribute('class', 'links')
          }

          addReplay(recordedPoses, savedRecordings.length)

          if (savedRecordings.length >= numReqReplays) {
            startButton.setAttribute('value', 'START!')
            startButton.setAttribute('geometry', 'primitive:plane; height:0.5')
            startButton.setAttribute('material', 'color: lightgreen')

            recordButton.setAttribute('visible', false)
            recordButton.setAttribute('class', '') // Make unclickable
          } else {
            startButton.setAttribute('value', 'Record ' + (numReqReplays - savedRecordings.length) + ' more animations to start...')
          }
          recording = false;
        } else {
          recordButton.setAttribute('material', 'color:lightgreen')
          recordButton.setAttribute('value', 'RECORDING')
          let timeFormat = endRecordingTime - currRecordingTime
          startButton.setAttribute('value', timeFormat.toString() + 'ms left')
          recordEntity(el, index);
          currRecordingTime = Date.now()
        }

      } else {
        recordButton.setAttribute('material', 'color:red')
        if (savedRecordings.length < numReqReplays) {
          recordButton.setAttribute('value', 'START RECORDING')
        }
      }

      if (!replaying) {
        // Need to add a loaded/gameStart function to use this
        // rotateObject(cube, el, 0, 0, 5)

        // mirror current player actions
        cube.object3D.position.x = el.object3D.position.x * -1
        cube.object3D.position.y = el.object3D.position.y;
        cube.object3D.position.z = el.object3D.position.z;
        cube.object3D.rotation.x = el.object3D.rotation.x;
        cube.object3D.rotation.y = el.object3D.rotation.y * -1;
        cube.object3D.rotation.z = el.object3D.rotation.z * -1;
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

      if (replayButtonSelected) {
        replaying = true;
        if (gameOver) {
          tick = 0;
          startTime = 0;
          startTick = 0;
          currMutRotAmt = 0;
          currMutPosAmt = 0;
          rewindMut = false;
        }
      } else if (difficultyButtonSelected) {
        changeDifficulty();
      } else if (recordButtonSelected) {
        if (!replaying) {
          recording = true;
          recordedPoses = [ [], [], [] ];
          tick = 0;
          currRecordingTime = 0;
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
        if (!gameOver) {
          buttonEvent(document.getElementById('startText'), 'toggle')
          buttonEvent(document.getElementById('titleText'), 'toggle')
          if (ghostName == mutatedGhostName) {
            startButton.setAttribute('value', 'YOU SHOT THE IMPOSTER!')
            startButton.setAttribute('material', 'color: green')
            startButton.setAttribute('rotation', '-50 180 0')
            startButton.setAttribute('position', '0 0.2 -2')
            startButton.setAttribute('geometry', 'primitive:plane; height:0.5; width:4;')
            gameOver = true;
            gameEnd();
          } else {
            startButton.setAttribute('value', 'YOU SHOT AN INNOCENT GHOST!')
            startButton.setAttribute('material', 'color: red')
            startButton.setAttribute('rotation', '-50 180 0')
            startButton.setAttribute('position', '0 0.2 -2')
            startButton.setAttribute('geometry', 'primitive:plane; height:0.5; width:4;')
            gameOver = true;
            gameEnd();
          }
        }
      } else {
        if (cursorOverRecording && !replaying) {
          selectedRecording = parseInt(cursorOverRecording.slice(6), 10);
          document.getElementById('replay' + selectedRecording).setAttribute('text', 'color: yellow');
          for (i = 0; i < savedRecordings.length; i++) {
            if (i != selectedRecording) {
              document.getElementById('replay' + i).setAttribute('text', 'color: white')
            }
          }
        }
      }
    });

    el.addEventListener('triggerup', function (evt) {
      triggerDown = false
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

    this.el.addEventListener('raycaster-intersected', function () {
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

AFRAME.registerComponent('start-game', {
  init: function() {
    var scene = this.el; // The entity
    if (scene.is('vr-mode')) {
      document.getElementById('fadePlane').setAttribute('fade', '')
    } else {
      scene.addEventListener('enter-vr', function () {
        document.getElementById('fadePlane').setAttribute('fade', '')
      });
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
    countdownText.setAttribute('position', '-10 5 3') // Should make these schema values
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

// Dev tools
AFRAME.registerComponent('toggle-debug', {
  init: function() {
    if (toggleDebug) {
      document.querySelector('a-scene').setAttribute('stats', '')
    }
  }
});
