let leftTriggerDown = false;
let rightTriggerDown = false;
let triggerDown = false;
let recording = false;
let replaying = false;
let recordedPoses = [ [], [], [] ]; // Position & rotation
let recordedEvents = []; // Button presses
let tick = 0;

function recordEntity(el, index) {
  var newPoint = {
    position: AFRAME.utils.clone(el.getAttribute('position')),
    rotation: AFRAME.utils.clone(el.getAttribute('rotation')),
    timestamp: Date.now()
  }
  newPoint.position.z += 5;
  recordedPoses[index].push(newPoint);
  //el.updateMatrixWorld();
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
      console.log("not arm or head")
    }

    if (triggerDown) {
      recordEntity(el, index);
    }

    if (!replaying) {
      cube.object3D.position.x = el.object3D.position.x;
      cube.object3D.position.y = el.object3D.position.y;
      cube.object3D.position.z = el.object3D.position.z + 5;
      cube.object3D.rotation.x = el.object3D.rotation.x;
      cube.object3D.rotation.y = el.object3D.rotation.y;
      cube.object3D.rotation.z = el.object3D.rotation.z;
    }
  }
});

AFRAME.registerComponent('trigger-down', {
  init: function () {
    var el = this.el; // The entity
    // var leftHand = document.getElementById("leftHand");
    // var rightHand = document.getElementById("rightHand");

    // Update to all controls..pointup?
    el.addEventListener('triggerdown', function (evt) {
      console.log("Trigger down")
      triggerDown = true;
      replaying = false;
      tick = 0;
      recordedPoses = [ [], [], [] ];
    });

    el.addEventListener('triggerup', function (evt) {
      console.log("Trigger up")
      triggerDown = false;
      console.log(recordedPoses)
    });
  }
});

AFRAME.registerComponent('replayer', {
  tick: function () {
    var el = this.el; // The entity
    var headCube = document.getElementById("headCube");
    var leftCube = document.getElementById("leftCube");
    var rightCube = document.getElementById("rightCube");

    if (!triggerDown) {
      if (tick < recordedPoses[0].length) {
        replaying = true;
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
      }
    }
  }
});
