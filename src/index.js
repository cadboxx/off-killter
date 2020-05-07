let leftTriggerDown = false;
let rightTriggerDown = false;
let triggerDown = false;
let recordButtonSelected = false;
let replayButtonSelected = false;
let recording = false;
let replaying = false;
let recordedPoses = [ [], [], [] ]; // Position & rotation
let recordedEvents = []; // Button presses
let tick = 0; // Counter for recording playback

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
      recordButton.setAttribute('material', 'color:green')
      recordButton.setAttribute('value', 'RECORDING')
      recordEntity(el, index);
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
      }
    });

    el.addEventListener('triggerup', function (evt) {
      //console.log("Trigger up")
      if (recording && (replayButton.getAttribute('visible') == false)) {
        buttonEvent(replayButton, 'toggle')
      }
      recording = false;
      triggerDown = false
      //console.log(recordedPoses)
    });
  }
});

AFRAME.registerComponent('replayer', {
  tick: function () {
    var headCube = document.getElementById("headCube");
    var leftCube = document.getElementById("leftCube");
    var rightCube = document.getElementById("rightCube");

    if (replaying) {
      if (tick < recordedPoses[0].length) {
        document.getElementById('replayButton').setAttribute('material', 'color:green')
        document.getElementById('replayButton').setAttribute('value', 'REPLAYING')
        
        headCube.object3D.position.x = recordedPoses[0][tick].position.x;
        headCube.object3D.position.y = recordedPoses[0][tick].position.y;
        headCube.object3D.position.z = recordedPoses[0][tick].position.z;
        headCube.object3D.rotation.x = THREE.Math.degToRad(recordedPoses[0][tick].rotation.x);
        headCube.object3D.rotation.y = THREE.Math.degToRad(recordedPoses[0][tick].rotation.y);
        headCube.object3D.rotation.z = THREE.Math.degToRad(recordedPoses[0][tick].rotation.z);

        rightCube.object3D.position.x = recordedPoses[1][tick].position.x;
        rightCube.object3D.position.y = recordedPoses[1][tick].position.y;
        rightCube.object3D.position.z = recordedPoses[1][tick].position.z;
        rightCube.object3D.rotation.x = THREE.Math.degToRad(recordedPoses[1][tick].rotation.x);
        rightCube.object3D.rotation.y = THREE.Math.degToRad(recordedPoses[1][tick].rotation.y);
        rightCube.object3D.rotation.z = THREE.Math.degToRad(recordedPoses[1][tick].rotation.z);
      
        leftCube.object3D.position.x = recordedPoses[2][tick].position.x;
        leftCube.object3D.position.y = recordedPoses[2][tick].position.y;
        leftCube.object3D.position.z = recordedPoses[2][tick].position.z;
        leftCube.object3D.rotation.x = THREE.Math.degToRad(recordedPoses[2][tick].rotation.x);
        leftCube.object3D.rotation.y = THREE.Math.degToRad(recordedPoses[2][tick].rotation.y);
        leftCube.object3D.rotation.z = THREE.Math.degToRad(recordedPoses[2][tick].rotation.z);

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
  init: function () {
    var el = this.el; // The entity
    var recordButton = document.getElementById("recordButton");
    var replayButton = document.getElementById("replayButton");

    this.el.addEventListener('raycaster-intersected', function () {
      //console.log('intersecting button')
      if (el.object3D == recordButton.object3D) {
        if (!recording) {
          buttonEvent(recordButton, 'int')
          recordButtonSelected = true;
        }
      }

      if (el.object3D == replayButton.object3D) {
        if (!recording) {
          buttonEvent(replayButton, 'int')
          replayButtonSelected = true;
        }
      }
    });

    this.el.addEventListener('raycaster-intersected-cleared', function () {
      //console.log('stopped intersecting button')
      if (el.object3D == recordButton.object3D) {
        buttonEvent(recordButton, 'noInt')
        recordButtonSelected = false;
      }

      if (el.object3D == replayButton.object3D) {
        buttonEvent(replayButton, 'noInt')
        replayButtonSelected = false;
      }
    });
  }
});

// AFRAME.registerComponent('raycaster-listen', {
//   dependencies: ['raycaster'],
//   init: function () {
//     this.el.addEventListener('raycaster-intersection', function () {
//       console.log('Intersecting something');
//     });
//     this.el.addEventListener('raycaster-intersection-cleared', function () {
//       console.log('Intersecting nothing');
//     });
//   }
// });
