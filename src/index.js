let leftTriggerDown = false;
let rightTriggerDown = false;
let triggerDown = false;
let recording = false;
let replaying = false;
let recordedPoses = [ [], [], [], [] ]; // Position & rotation
let recordedEvents = []; // Button presses
let tick = 0;

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
    } else if (el.object3D == leftHand.object3D) {
      var cube = rightCube;
    } else if (el.object3D == rightHand.object3D) {
      var cube = leftCube;
    } else {
      console.log("not arm or head")
    }

    if (!replaying) {
      cube.object3D.position.x = el.object3D.position.x;
      cube.object3D.position.y = el.object3D.position.y;
      cube.object3D.position.z = el.object3D.position.z + 5;
      cube.object3D.rotation.x = el.object3D.rotation.x;
      cube.object3D.rotation.y = el.object3D.rotation.y;
    }
  }
});

AFRAME.registerComponent('recorder', {
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
      var index = 3;
    }

    if (triggerDown) {
      var newPoint = {
        position: AFRAME.utils.clone(this.el.getAttribute('position')),
        rotation: AFRAME.utils.clone(this.el.getAttribute('rotation')),
        timestamp: Date.now()
      };
      
      newPoint.position.z += 5;
      console.log(index)
      console.log(newPoint)
      console.log(recordedPoses)
      recordedPoses[index].push(newPoint);
      el.object3D.updateMatrixWorld();
    } else {
      if (tick < recordedPoses[index].length) {
        replaying = true;
        cube.object3D.position.x = recordedPoses[index][tick].position.x;
        cube.object3D.position.y = recordedPoses[index][tick].position.y;
        cube.object3D.position.z = recordedPoses[index][tick].position.z;
        cube.object3D.rotation.x = recordedPoses[index][tick].rotation.x;
        cube.object3D.rotation.y = recordedPoses[index][tick].rotation.y;
        tick += 1;
      } else {
        replaying = false;
      }
    }

  }
});

AFRAME.registerComponent('trigger-down', {
  init: function () {
    var el = this.el; // The entity
    console.log(el)
    // Update to all controls..pointup?
    el.addEventListener('triggerdown', function (evt) {
      console.log("Started recording")
      triggerDown = true;
      recordedPoses = [ [], [], [], [] ];
      tick = 0;
    });
    el.addEventListener('triggerup', function (evt) {
      console.log("Stopped recording")
      triggerDown = false;
    });
  }
});
