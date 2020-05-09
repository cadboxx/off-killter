let gameStarted = false;
let recording = false;
let replaying = false;
let leftTriggerDown = false;
let rightTriggerDown = false;
let triggerDown = false;
let recordButtonSelected = false;
let replayButtonSelected = false;
let startButtonSelected = false;
let playbackSelected = false;
let ghostSelected = false;
let ghostName = undefined; // Ghost that was shot
let mutatedGhostName = undefined; // Mutated ghost
let savedRecordings = []; // Recordings saved in memory
let numReqReplays = 3;
let selectedRecording = 0; // Recording selected for playback
let recordedPoses = [ [], [], [] ]; // Position & rotation
let recordedEvents = []; // Button presses
let tick = 0; // Counter for recording playback
let currRecordingTime = 0;
let endRecordingTime = 0;
let maxRecordingTime = 3; // recording time in seconds for replays

let randRecord;
let randSecond;
var startTime;
var randSecondBottom = 0;
var randSecondTop = 0;

// Records pose of object on tick
function recordEntity(el, index) {
  var newPoint = {
    position: AFRAME.utils.clone(el.getAttribute('position')),
    rotation: AFRAME.utils.clone(el.getAttribute('rotation')),
    timestamp: Date.now() // Record timestamp of tick for grouping
  }
  newPoint.position.z += 5; // Add offset so that recording is in front of player
  recordedPoses[index].push(newPoint);
}

// Floating button helper
function buttonEvent(button, event) {
  if (event == 'int') {
    button.setAttribute('color', 'yellow') // text color
  }
  if (event == 'noInt') {
    button.setAttribute('color', 'white') // text color
  }
  if (event == 'toggle') {
    if (button.getAttribute('visible') == false) {
      button.setAttribute('visible', true)
    } else {
      button.setAttribute('visible', false)
    }
  }
}

// Translate object to anther object's position with optional offsets
function rotateObject(obj, ref, x = 0, y = 0, z = 0) {
  obj.object3D.position.x = ref.position.x + x;
  obj.object3D.position.y = ref.position.y + y;
  obj.object3D.position.z = ref.position.z + z;
  obj.object3D.rotation.x = THREE.Math.degToRad(ref.rotation.x);
  obj.object3D.rotation.y = THREE.Math.degToRad(ref.rotation.y);
  obj.object3D.rotation.z = THREE.Math.degToRad(ref.rotation.z);
}

function gameStart() {
  // clear screen of current shit/create new scene?? (easier to teleport to specific place in world/??)
  console.log("Starting the game...")
  gameStarted = true;

  // hide mirror replay
  document.getElementById('leftCube').setAttribute('visible', false)
  document.getElementById('rightCube').setAttribute('visible', false)
  document.getElementById('headCube').setAttribute('visible', false)

  savedRecordings.forEach(function(element, index) {
    var sceneEl = document.querySelector('a-scene');
    // New random color
    var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);

    // spawn head model instance
    var newHead = document.createElement('a-entity')
    newHead.setAttribute('id', 'replayHead' + index)
    sceneEl.appendChild(newHead);
    var newHeadModel = document.createElement('a-entity')
    newHeadModel.setAttribute('obj-model', 'obj: #head;')
    newHeadModel.setAttribute('material', 'color: ' + randomColor)
    newHeadModel.setAttribute('scale', '0.1 0.1 0.1')
    newHeadModel.setAttribute('rotation', '0 180 0')
    newHeadModel.setAttribute('button-intersect', 'name: replayHead' + index)
    newHeadModel.setAttribute('class', 'links')
    newHead.appendChild(newHeadModel);

    // spawn hand model instances
    var newLeftHand = document.createElement('a-entity')
    newLeftHand.setAttribute('id', 'replayLeftHand' + index)
    sceneEl.appendChild(newLeftHand)
    var newLeftHandModel = document.createElement('a-entity')
    newLeftHandModel.setAttribute('gltf-model', 'url(./assets/leftHand.glb)')
    newLeftHandModel.setAttribute('rotation', '0 0 90')
    newLeftHand.appendChild(newLeftHandModel);

    var newRightHand = document.createElement('a-entity')
    newRightHand.setAttribute('id', 'replayRightHand' + index)
    sceneEl.appendChild(newRightHand)
    var newRightHandModel = document.createElement('a-entity')
    newRightHandModel.setAttribute('gltf-model', 'url(./assets/rightHand.glb)')
    newRightHandModel.setAttribute('rotation', '0 0 -90')
    newRightHand.appendChild(newRightHandModel);
  })
  console.log("Finished spawning ghosts")

  // Move player in front of ghosteses
  // Need to setup delay and starting sequence.
  document.getElementById('rig').setAttribute('position', '0 0 10')
  document.getElementById('rig').setAttribute('rotation', '0 180 0')

  // We'll add the new-replayer to the camera so it can handle looping of all replays in a single entity tick
  document.getElementById('camera').setAttribute('new-replayer', '')
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
  var pos = (6 - index)
  entityEl.setAttribute('id', 'replay' + index)
  entityEl.setAttribute('geometry', 'primitive:plane; height:0.25; width:0.25;')
  entityEl.setAttribute('material', 'color:grey; transparent:true; opacity:0.5;')
  entityEl.setAttribute('position', pos + ' 1 5')
  entityEl.setAttribute('rotation', '0 -150 0')
  entityEl.setAttribute('text', 'color:white; align:center; width: 5; value:' + (index + 1))
  entityEl.setAttribute('class', 'links')
  entityEl.setAttribute('button-intersect', 'name:replay' + index)
  sceneEl.appendChild(entityEl);
}

// Multiple ghost replayer
// Handles mutations
AFRAME.registerComponent('new-replayer', {
  tick: function () {
    if (randRecord == undefined) {
      randRecord = Math.floor(Math.random() * Math.floor(savedRecordings.length)); // Picks random replay to modify
      mutatedGhostName = 'replayHead' + randRecord
      // document.getElementById('replayHead' + randRecord).setAttribute('mutated', true)
      // var headRecord = document.getElementById('replayHead' + randRecord)
      console.log(mutatedGhostName + ' is the guy who is mutated')
      // headRecord.setAttribute('button-intersect', 'name: replayHead' + randRecord + '; mutated: true')
    }
    if (randSecond == undefined) {
      // Should update this to random float between 0.00 and N.00
      // randSecond = maxRecordingTime.length;
      randSecond = 1;
    }

    var buffer = 2;
    if (savedRecordings.length > 3) {
      buffer += 1;
    }

    savedRecordings.forEach(function(element, index) {
      var headCube = document.getElementById(('replayHead' + index));
      var leftCube = document.getElementById(('replayLeftHand' + index));
      var rightCube = document.getElementById(('replayRightHand' + index));
      var currReplay = savedRecordings[index];

      // rotate the clone body
      if (tick < currReplay[0].length) {
        if (savedRecordings.indexOf(currReplay) == randRecord) {
          if (startTime == undefined) {
            startTime = Date.now()
            randSecondBottom = startTime + (randSecond * 1000);
            randSecondTop = randSecondBottom + (randSecond * 1000);
          }
          if (Date.now() >= randSecondBottom && Date.now() <= randSecondTop) {
            // Mutate object if all conditions met
            rotateObject(headCube, currReplay[0][tick], index * 2 - buffer, 0.03)
            rotateObject(leftCube, currReplay[1][tick], index * 2 - buffer, 0.08)
            rotateObject(rightCube, currReplay[2][tick], index * 2 - buffer, 0.08)
          } else {
            rotateObject(headCube, currReplay[0][tick], index * 2 - buffer)
            rotateObject(leftCube, currReplay[1][tick], index * 2 - buffer)
            rotateObject(rightCube, currReplay[2][tick], index * 2 - buffer)
          }
        } else {
          rotateObject(headCube, currReplay[0][tick], index * 2 - buffer)
          rotateObject(leftCube, currReplay[1][tick], index * 2 - buffer)
          rotateObject(rightCube, currReplay[2][tick], index * 2 - buffer)
        }
      }
    })
    tick += 1;
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
      recordButton.setAttribute('value', 'START RECORDING')
    }

    if (!replaying) {
      // mirror current player actions
      cube.object3D.position.x = el.object3D.position.x;
      cube.object3D.position.y = el.object3D.position.y;
      cube.object3D.position.z = el.object3D.position.z + 5;
      cube.object3D.rotation.x = el.object3D.rotation.x;
      cube.object3D.rotation.y = el.object3D.rotation.y;
      cube.object3D.rotation.z = el.object3D.rotation.z;
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
        document.getElementById('rig').setAttribute('position', '0 0 10')
        document.getElementById('rig').setAttribute('rotation', '0 180 0')
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
      } else if (ghostName) {
        if (ghostName == mutatedGhostName) {
          console.log("you win!!!!!!!!!!!! you shot " + ghostName)
          startButton.setAttribute('value', 'YOU WIN! You shot ' + ghostName)
          startButton.setAttribute('material', 'color: lightgreen')
          startButton.setAttribute('rotation', '0 0 0')
          startButton.setAttribute('position', '0 2 6')
        } else {
          console.log('you shot an innocent man! he was named ' + ghostName)
          startButton.setAttribute('value', 'YOU SHOT AN INNOCENT GHOST! His name was ' + ghostName)
          startButton.setAttribute('material', 'color: red')
          startButton.setAttribute('rotation', '0 2 6')
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
    
    if (replaying) {
      if (tick < currReplay[0].length) {
        document.getElementById('replayButton').setAttribute('material', 'color:lightgreen')
        document.getElementById('replayButton').setAttribute('value', 'REPLAYING')
        
        rotateObject(headCube, currReplay[0][tick])
        rotateObject(rightCube, currReplay[1][tick])
        rotateObject(leftCube, currReplay[2][tick])

        tick += 1;
      } else {
        replaying = false;
        document.getElementById('replayButton').setAttribute('material', 'color:blue')
        document.getElementById('replayButton').setAttribute('value', 'REPLAY RECORDING')
        document.getElementById('rig').setAttribute('position', '0 0 0')
        document.getElementById('rig').setAttribute('rotation', '0 0 0')
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
        if (buttonName.slice(0, 10) == 'replayHead') {
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
