let gameStarted = false;
let gameOver = false;
let recording = false;
let replaying = false;
let leftTriggerDown = false;
let rightTriggerDown = false;
let triggerDown = false;
let recordButtonSelected = false;
let replayButtonSelected = false;
let startButtonSelected = false;
let restartButtonSelected = false;
let playbackSelected = false; // Cursor over replay
let ghostSelected = false; // Cursor over spawned ghost
let ghostName = undefined; // Ghost that was shot
let mutatedGhostName = undefined; // Mutated ghost
let savedRecordings = []; // Recordings saved in memory
let numReqReplays = 3; // Replays required to start game
let selectedRecording = 0; // Recording selected for playback
const recordedPosesArr = [ [], [], [] ];
let recordedPoses = recordedPosesArr; // Position & rotation
let recordedEvents = []; // Button presses
let tick = 0; // Counter for recording playback
let currRecordingTime = 0;
let endRecordingTime = 0;
let maxRecordingTime = 3; // recording time in seconds for replays

let startTime = 0;
let randRecord;
let randSecond;
let randSecondBottom = 0;
let randSecondTop = 0;
let randBodyParts; // Body parts chosen to modify during replay
let spaceBuffer = 2; // This is the temporary space buffer beween pieces
let defParts = ['head', 'leftHand', 'rightHand'];

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

// Translate object to anther object's position with optional offsets
function rotateObject(obj, ref, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0) {
  obj.object3D.position.x = ref.position.x + px;
  obj.object3D.position.y = ref.position.y + py;
  obj.object3D.position.z = ref.position.z + pz;
  obj.object3D.rotation.x = THREE.Math.degToRad(ref.rotation.x + rx);
  obj.object3D.rotation.y = THREE.Math.degToRad(ref.rotation.y + ry);
  obj.object3D.rotation.z = THREE.Math.degToRad(ref.rotation.z + rz);
}

function gameStart() {
  console.log("Starting the game...")
  gameStarted = true;

  // Make start button unclickable
  document.getElementById('startText').removeAttribute('class')

  // hide mirror replay
  buttonEvent(document.getElementById('leftCube'), 'toggle')
  buttonEvent(document.getElementById('rightCube'), 'toggle')
  buttonEvent(document.getElementById('headCube'), 'toggle')

  savedRecordings.forEach(function(element, index) {
    var sceneEl = document.querySelector('a-scene');
    // New random color -- buggy
    var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);

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
    newHeadModel.setAttribute('material', 'src: #face-texture; flatshading: true;')
    newHeadModel.setAttribute('rotation', '0 -90 0')
    newHeadModel.setAttribute('button-intersect', 'name: replayHead' + index)
    newHeadModel.setAttribute('class', 'replay links')
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
    newLeftHandModel.setAttribute('class', 'replay')
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
    newRightHandModel.setAttribute('class', 'replay')
    newRightHand.appendChild(newRightHandModel);
  })
  console.log("Finished spawning ghosts")

  // Randomize which body parts are mutated
  randBodyParts = getRandom(defParts, (Math.ceil(Math.random() * defParts.length)))
  randRecord = Math.floor(Math.random() * Math.floor(savedRecordings.length)); // Picks random replay to modify
  mutatedGhostName = 'replayHead' + randRecord
  // Get random float between 0.000 and (maxRecordingTime - 1)
  randSecond = Math.floor(Math.random() * ((maxRecordingTime - 1) * 1000 - 1 * 1000) + 1 * 1000) / (1 * 1000); // 1000 = 3 decimal points

  console.log('Mutated replay: ' + mutatedGhostName + '; randsecond: ' + randSecond + '; randBodyParts:' + randBodyParts)

  if (savedRecordings.length > 3) {
    spaceBuffer += 1;
  }

  // Move player in front of ghosteses
  document.getElementById('rig').setAttribute('position', '1 0 -5')
  document.getElementById('rig').setAttribute('rotation', '0 180 0')
}

function gameEnd() {
  // create replay button
  if (!document.getElementById('restartButton')) {
    var sceneEl = document.querySelector('a-scene');
    var restartButton = document.createElement('a-entity');
    restartButton.setAttribute('id', 'restartButton')
    restartButton.setAttribute('geometry', 'primitive:plane; height:2; width:5;')
    restartButton.setAttribute('material', 'color:lightgreen; transparent:true; opacity:0.5;')
    restartButton.setAttribute('position', '0 5 2')
    restartButton.setAttribute('rotation', '0 180 0')
    restartButton.setAttribute('text', 'color:white; align:center; width: 5; value: RESTART')
    restartButton.setAttribute('button-intersect', 'name:restart')
    sceneEl.appendChild(restartButton);
  }
  document.getElementById('restartButton').setAttribute('class', 'links')
  document.getElementById('restartButton').setAttribute('visible', true)
}

function restartGame() {
  // restore mirror body
  buttonEvent(document.getElementById('leftCube'), 'toggle')
  buttonEvent(document.getElementById('rightCube'), 'toggle')
  buttonEvent(document.getElementById('headCube'), 'toggle')

  // reset player positon
  document.getElementById('rig').setAttribute('position', '0 0 0')
  document.getElementById('rig').setAttribute('rotation', '0 0 0')

  // delete everything in the 'replay' class
  var replayObjects = document.querySelectorAll(".replay");
  for (i = 0; i < replayObjects.length; i++) {
    replayObjects[i].parentNode.removeChild(replayObjects[i])
  }

  // reset all vars
  gameStarted = false;
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
  playbackSelected = false;
  ghostSelected = false;
  recordedPoses = recordedPosesArr;
  selectedRecording = 0;
  savedRecordings = [];
  spaceBuffer = 2;
  tick = 0;

  // reset buttons
  document.getElementById('restartButton').setAttribute('class', '')
  document.getElementById('restartButton').setAttribute('visible', false)

  document.getElementById('recordButton').setAttribute('visible', true)
  document.getElementById('recordButton').setAttribute('class', 'links')
  document.getElementById('replayButton').setAttribute('visible', false)

  document.getElementById('startText').setAttribute('value', 'Record ' + numReqReplays + ' animations to start!')
  document.getElementById('startText').setAttribute('class', 'links')
  document.getElementById('startText').setAttribute('rotation', '0 0 0')
  document.getElementById('startText').setAttribute('position', '0 4 -10')
  document.getElementById('startText').setAttribute('color', 'white')
  document.getElementById('startText').removeAttribute('geometry')
  document.getElementById('startText').removeAttribute('material')

  console.log("restarted game")
}

// Saves given replay to memory and displays it for playback
function addReplay(poses, index) {
  if (savedRecordings.length > 0) {
    selectedRecording += 1;
  }
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
  entityEl.setAttribute('text', 'color:white; align:center; width: 5; value:' + (index + 1))
  entityEl.setAttribute('class', 'replay links')
  entityEl.setAttribute('button-intersect', 'name:replay' + index)
  sceneEl.appendChild(entityEl);
}

// Multiple ghost replayer
// Handles mutations
AFRAME.registerComponent('new-replayer', {
  tick: function () {
    if (gameStarted) {
      if (startTime == 0) {
        startTime = Date.now()

        randSecondBottom = startTime + (randSecond * 1000);
        randSecondTop = randSecondBottom + (randSecond * 1000);
      }

      savedRecordings.forEach(function(element, index) {
        var headCube = document.getElementById(('replayHead' + index));
        var leftCube = document.getElementById(('replayLeftHand' + index));
        var rightCube = document.getElementById(('replayRightHand' + index));
        var currReplay = savedRecordings[index];

        // rotate the clone body
        if (tick < currReplay[0].length) {
          if (savedRecordings.indexOf(currReplay) == randRecord) {
            if (Date.now() >= randSecondBottom && Date.now() <= randSecondTop) {
              // Mutate object if all conditions met
              for (i = 0; i < randBodyParts.length; i++) {
                if (randBodyParts[i] == 'head') {
                  rotateObject(headCube, currReplay[0][tick], index * 2 - spaceBuffer, 0.1)
                } else if (randBodyParts[i] == 'leftHand') {
                  rotateObject(leftCube, currReplay[1][tick], index * 2 - spaceBuffer, 0.1)
                } else if (randBodyParts[i] == 'rightHand') {
                  rotateObject(rightCube, currReplay[2][tick], index * 2 - spaceBuffer, 0.1)
                }
              }
              if (!randBodyParts.indexOf('head')) {
                rotateObject(headCube, currReplay[0][tick], index * 2 - spaceBuffer)
              } else if (!randBodyParts.indexOf('leftHand')) {
                rotateObject(leftCube, currReplay[1][tick], index * 2 - spaceBuffer)
              } else if (!randBodyParts.indexOf('rightHand')) {
                rotateObject(rightCube, currReplay[2][tick], index * 2 - spaceBuffer)
              }
            } else {
              rotateObject(headCube, currReplay[0][tick], index * 2 - spaceBuffer)
              rotateObject(leftCube, currReplay[1][tick], index * 2 - spaceBuffer)
              rotateObject(rightCube, currReplay[2][tick], index * 2 - spaceBuffer)
            }
          } else {
            rotateObject(headCube, currReplay[0][tick], index * 2 - spaceBuffer)
            rotateObject(leftCube, currReplay[1][tick], index * 2 - spaceBuffer)
            rotateObject(rightCube, currReplay[2][tick], index * 2 - spaceBuffer)
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
    var mirrorBody = document.getElementById('mirrorBody');
    var bodyCube = document.getElementById('bodyCube');

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
        }

        addReplay(recordedPoses, savedRecordings.length)

        if (savedRecordings.length >= numReqReplays) {
          startButton.setAttribute('value', 'START!')
          startButton.setAttribute('geometry', 'primitive:plane; height:0.5')
          startButton.setAttribute('material', 'color: lightgreen')

          recordButton.setAttribute('visible', false)
          recordButton.setAttribute('class', '') // Make unclickable

          // TODO: Move replay buttons.
          // replayButton.setAttribute('position', '0 2 5')
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
      // Move body cube
      // if (el.object3D == camera.object3D) {
      //   bodyCube.object3D.position.x = cube.object3D.position.x;
      //   bodyCube.object3D.position.y = cube.object3D.position.y - 0.5;
      //   bodyCube.object3D.position.z = cube.object3D.position.z;
      //   bodyCube.object3D.rotation.x = cube.object3D.rotation.x;
      //   bodyCube.object3D.rotation.y = cube.object3D.rotation.y;
      //   bodyCube.object3D.rotation.z = cube.object3D.rotation.z;
      // }
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
      //console.log("Trigger down")
      triggerDown = true

      if (replayButtonSelected) {
        replaying = true;
      } else if (recordButtonSelected) {
        if (!replaying) {
          recording = true;
          recordedPoses = [ [], [], [] ];
          tick = 0;
          currRecordingTime = 0;
        }
      } else if (startButtonSelected) {
        if (savedRecordings.length >= numReqReplays) {
          gameStart();
        }
      } else if (restartButtonSelected) {
        restartGame();
      } else if (ghostName) {
        console.log("you shot " + ghostName)
        if (ghostName == mutatedGhostName) {
          startButton.setAttribute('value', 'YOU SHOT THE IMPOSTER!')
          startButton.setAttribute('material', 'color: lightgreen')
          startButton.setAttribute('rotation', '0 180 0')
          startButton.setAttribute('position', '-1 4 5')
          gameOver = true;
          gameEnd();
        } else {
          startButton.setAttribute('value', 'YOU SHOT AN INNOCENT GHOST!')
          startButton.setAttribute('material', 'color: red')
          startButton.setAttribute('rotation', '-1 180 0')
          startButton.setAttribute('position', '0 4 5')
          gameOver = true;
          gameEnd();
        }
      }
    });

    el.addEventListener('triggerup', function (evt) {
      triggerDown = false
    });
  }
});

// Single playback replayer
AFRAME.registerComponent('replayer', {
  tick: function () {
    var headCube = document.getElementById("headCube");
    var leftCube = document.getElementById("leftCube");
    var rightCube = document.getElementById("rightCube");
    var currReplay = savedRecordings[selectedRecording]
    var bodyCube = document.getElementById("bodyCube");
    
    if (replaying) {
      if (tick < currReplay[0].length) {
        document.getElementById('replayButton').setAttribute('material', 'color:lightgreen')
        document.getElementById('replayButton').setAttribute('value', 'REPLAYING')
        
        rotateObject(headCube, currReplay[0][tick])
        rotateObject(rightCube, currReplay[2][tick])
        rotateObject(leftCube, currReplay[1][tick])
        bodyCube.object3D.position.x = headCube.object3D.position.x;
        bodyCube.object3D.position.y = headCube.object3D.position.y - 0.5;
        bodyCube.object3D.position.z = headCube.object3D.position.z;

        tick += 1;
      } else {
        replaying = false;
        document.getElementById('replayButton').setAttribute('material', 'color:blue')
        document.getElementById('replayButton').setAttribute('value', 'REPLAY RECORDING')
        tick = 0;
      }
    }
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

    this.el.addEventListener('raycaster-intersected', function () {
      // console.log('intersecting button')
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
      } else {
        if (buttonName == 'restart') {
          restartButtonSelected = true;
        } else if (buttonName.slice(0, 10) == 'replayHead') {
          console.log('selected head')
          ghostSelected = true;
          ghostName = buttonName;
        } else {
          console.log('didnt match named button')
          var button = document.getElementById(buttonName);
          buttonEvent(button, 'int')
          playbackSelected = true;
          selectedRecording = parseInt(buttonName.slice(6), 10);
        }
      }
    });

    this.el.addEventListener('raycaster-intersected-cleared', function () {
      //console.log('stopped intersecting button')
      if (el.object3D == recordButton.object3D) {
        buttonEvent(recordButton, 'noInt')
        recordButtonSelected = false;
      } else if (el.object3D == replayButton.object3D) {
        buttonEvent(replayButton, 'noInt')
        replayButtonSelected = false;
      } else if (el.object3D == startButton.object3D) {
        buttonEvent(startButton, 'noInt')
        startButtonSelected = false;
      } else {
        if (buttonName.slice(0, 10) == 'replayHead') {
          console.log('left head')
          ghostSelected = false;
          ghostName = undefined;
        } else {
          console.log('didnt match named button')
          var button = document.getElementById(buttonName);
          buttonEvent(button, 'noInt')
          playbackSelected = false;
        }
      }
    });
  }
});
