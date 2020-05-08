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
let savedRecordings = []; // Recordings saved in memory
let numReqReplays = 3;
let selectedRecording = 0;
let recordedPoses = [ [], [], [] ]; // Position & rotation
let recordedEvents = []; // Button presses
let tick = 0; // Counter for recording playback
let currRecordingTime = 0;
let endRecordingTime = 0;
let maxRecordingTime = 5; // recording time in seconds for replays

function recordEntity(el, index) {
  var newPoint = {
    position: AFRAME.utils.clone(el.getAttribute('position')),
    rotation: AFRAME.utils.clone(el.getAttribute('rotation')),
    timestamp: Date.now()
  }
  newPoint.position.z += 5;
  recordedPoses[index].push(newPoint);
}

function buttonEvent(button, event) {
  if (event == 'int') {
    // change text color to yellow
    button.setAttribute('color', 'yellow')
  }
  if (event == 'noInt') {
    // change text color to white
    button.setAttribute('color', 'white')
  }
  if (event == 'toggle') {
    // toggle visiblity
    if (button.getAttribute('visible') == false) {
      button.setAttribute('visible', true)
    } else {
      button.setAttribute('visible', false)
    }
  }
}

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

    // // spawn head model instance
    var newHead = document.createElement('a-entity');
    newHead.setAttribute('id', 'replayHead' + index)
    newHead.setAttribute('obj-model', 'obj: #head; mtl: #head-mtl')
    newHead.setAttribute('scale', '0.1 0.1 0.1')
    sceneEl.appendChild(newHead);

    // // spawn hand models instance
    var newLeftHand = document.createElement('a-entity');
    newLeftHand.setAttribute('id', 'replayLeftHand' + index)
    newLeftHand.setAttribute('gltf-model', 'url(./assets/rightHand.glb)')
    sceneEl.appendChild(newLeftHand);

    var newRightHand = document.createElement('a-entity');
    newRightHand.setAttribute('id', 'replayRightHand' + index)
    newRightHand.setAttribute('gltf-model', 'url(./assets/leftHand.glb)')
    sceneEl.appendChild(newRightHand);
  })
  console.log("Finished spawning bodies")

  // We'll add the new-replayer to the camera so it can handle looping of all replays in a single entity tick
  document.getElementById('camera').setAttribute('new-replayer', '')
}

AFRAME.registerComponent('new-replayer', {
  tick: function () {    
    savedRecordings.forEach(function(element, index) {
      var headCube = document.getElementById(('replayHead' + index));
      var leftCube = document.getElementById(('replayLeftHand' + index));
      var rightCube = document.getElementById(('replayRightHand' + index));
      var currReplay = savedRecordings[index];

      // rotate the clone body
      if (tick < currReplay[0].length) {
        rotateObject(headCube, currReplay[0][tick], index)
        rotateObject(leftCube, currReplay[1][tick], index)
        rotateObject(rightCube, currReplay[2][tick], index)
        // console.log(tick)
      }
    })

    tick += 1;
  }
});

function addReplay(poses, index) {
  if (savedRecordings.length > 0) {
    selectedRecording += 1;
  }
  savedRecordings.push(poses)
  // Draw planes representing each replay once recorded
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

        if (savedRecordings.length >= 2) {
          document.getElementById('startText').setAttribute('value', 'START!')
          document.getElementById('startText').setAttribute('geometry', 'primitive:plane; height:0.5')
          document.getElementById('startText').setAttribute('material', 'color: lightgreen')
        } else {
          document.getElementById('startText').setAttribute('value', 'Record ' + (2 - savedRecordings.length) + ' more animations to start...')
        }

        addReplay(recordedPoses, savedRecordings.length)
        recording = false;
        currRecordingTime = 0;
      } else {
        recordButton.setAttribute('material', 'color:lightgreen')
        recordButton.setAttribute('value', 'RECORDING')
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

AFRAME.registerComponent('triggered', {
  init: function () {
    var el = this.el; // The entity
    var replayButton = document.getElementById('replayButton');

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
        }
      } else if (startButtonSelected) {
        if (savedRecordings.length >= numReqReplays) {
          gameStart();
        }
      }
    });

    el.addEventListener('triggerup', function (evt) {
      triggerDown = false
    });
  }
});

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
        tick = 0;
      }
    }
  }
});

AFRAME.registerComponent('button-intersect', {
  schema: {
    name: {type: 'string', default: ''}
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
        console.log('didnt match named button')
        var button = document.getElementById(buttonName);
        buttonEvent(button, 'int')
        playbackSelected = true;
        selectedRecording = parseInt(buttonName.slice(6), 10);
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
        startButtonSelected = true;
      } else {
        console.log('didnt match named button')
        var button = document.getElementById(buttonName);
        buttonEvent(button, 'noInt')
        playbackSelected = false;
      }
    });
  }
});
