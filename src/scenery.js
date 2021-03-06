// Handles adding all of the base scenery

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

    var newLightBar = document.createElement('a-box')
    newLightBar.setAttribute('class', 'scenery light-geom')
    newLightBar.setAttribute('depth', '0.05')
    newLightBar.setAttribute('width', '0.05')
    newLightBar.setAttribute('height', '1')
    newLightBar.setAttribute('color', '#a1a1a1')
    newLightBar.setAttribute('rotation', '0 0 0')
    newLightBar.setAttribute('position', '-0.75 0.49 0')
    newLight.appendChild(newLightBar)

    newLightBar = document.createElement('a-box')
    newLightBar.setAttribute('class', 'scenery light-geom')
    newLightBar.setAttribute('depth', '0.05')
    newLightBar.setAttribute('width', '0.05')
    newLightBar.setAttribute('height', '1')
    newLightBar.setAttribute('color', '#a1a1a1')
    newLightBar.setAttribute('rotation', '0 0 0')
    newLightBar.setAttribute('position', '0.75 0.49 0')
    newLight.appendChild(newLightBar)

    var newLightBulb = document.createElement('a-box')
    newLightBulb.setAttribute('class', 'scenery light-geom')
    newLightBulb.setAttribute('depth', '0.025')
    newLightBulb.setAttribute('width', '0.025')
    newLightBulb.setAttribute('height', '1.5')
    newLightBulb.setAttribute('color', '#ffffcc')
    newLightBulb.setAttribute('rotation', '90 0 90')
    newLightBulb.setAttribute('position', '0 -0.05 -0.15')
    newLight.appendChild(newLightBulb)

    newLightBulb = document.createElement('a-box')
    newLightBulb.setAttribute('class', 'scenery light-geom')
    newLightBulb.setAttribute('depth', '0.025')
    newLightBulb.setAttribute('width', '0.025')
    newLightBulb.setAttribute('height', '1.5')
    newLightBulb.setAttribute('color', '#ffffcc')
    newLightBulb.setAttribute('rotation', '90 0 90')
    newLightBulb.setAttribute('position', '0 -0.05 0.15')
    newLight.appendChild(newLightBulb)

    newLightBulb = document.createElement('a-box')
    newLightBulb.setAttribute('class', 'scenery light-geom')
    newLightBulb.setAttribute('depth', '0.025')
    newLightBulb.setAttribute('width', '0.025')
    newLightBulb.setAttribute('height', '1.5')
    newLightBulb.setAttribute('color', '#ffffcc')
    newLightBulb.setAttribute('rotation', '90 0 90')
    newLightBulb.setAttribute('position', '0 -0.05 -0.35')
    newLight.appendChild(newLightBulb)

    newLightBulb = document.createElement('a-box')
    newLightBulb.setAttribute('class', 'scenery light-geom')
    newLightBulb.setAttribute('depth', '0.025')
    newLightBulb.setAttribute('width', '0.025')
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

    newShelfPiece = document.createElement('box')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('height', '3.5')
    newShelfPiece.setAttribute('width', '0.05')
    newShelfPiece.setAttribute('depth', '0.05')
    newShelfPiece.setAttribute('color', 'black')
    newShelfPiece.setAttribute('position', '0.95 1.25 0.5')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelfPiece = document.createElement('a-box')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('height', '3.5')
    newShelfPiece.setAttribute('width', '0.05')
    newShelfPiece.setAttribute('depth', '0.05')
    newShelfPiece.setAttribute('color', 'black')
    newShelfPiece.setAttribute('position', '-0.95 1.25 0.5')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelfPiece = document.createElement('a-box')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('height', '3.5')
    newShelfPiece.setAttribute('width', '0.05')
    newShelfPiece.setAttribute('depth', '0.05')
    newShelfPiece.setAttribute('color', 'black')
    newShelfPiece.setAttribute('position', '-0.95 1.25 -0.5')
    newShelfPiece.setAttribute('static-body', '')
    newShelf.appendChild(newShelfPiece)

    newShelfPiece = document.createElement('a-box')
    newShelfPiece.setAttribute('class', 'scenery shelf-geom')
    newShelfPiece.setAttribute('height', '3.5')
    newShelfPiece.setAttribute('width', '0.05')
    newShelfPiece.setAttribute('depth', '0.05')
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
    newTableThing = document.createElement('a-box')
    newTableThing.setAttribute('class', 'scenery table-geom')
    newTableThing.setAttribute('depth', '0.05')
    newTableThing.setAttribute('width', '0.05')
    newTableThing.setAttribute('height', '1')
    newTableThing.setAttribute('position', '0.25 0.5 -3.75')
    newTableThing.setAttribute('color', '#000000')
    newTableThing.setAttribute('static-body', '')
    newTable.appendChild(newTableThing)

    newTableThing = document.createElement('a-box')
    newTableThing.setAttribute('class', 'scenery table-geom')
    newTableThing.setAttribute('depth', '0.05')
    newTableThing.setAttribute('width', '0.05')
    newTableThing.setAttribute('height', '1')
    newTableThing.setAttribute('position', '0.25 0.5 -2.25')
    newTableThing.setAttribute('color', '#000000')
    newTableThing.setAttribute('static-body', '')
    newTable.appendChild(newTableThing)

    newTableThing = document.createElement('a-box')
    newTableThing.setAttribute('class', 'scenery table-geom')
    newTableThing.setAttribute('depth', '0.05')
    newTableThing.setAttribute('width', '0.05')
    newTableThing.setAttribute('height', '1')
    newTableThing.setAttribute('position', '-2.25 0.5 -3.75')
    newTableThing.setAttribute('color', '#000000')
    newTableThing.setAttribute('static-body', '')
    newTable.appendChild(newTableThing)

    newTableThing = document.createElement('a-box')
    newTableThing.setAttribute('class', 'scenery table-geom')
    newTableThing.setAttribute('depth', '0.05')
    newTableThing.setAttribute('width', '0.05')
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

    newChairPiece = document.createElement('a-box')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('width', '0.015')
    newChairPiece.setAttribute('depth', '0.015')
    newChairPiece.setAttribute('height', '1.5')
    newChairPiece.setAttribute('color', 'black')
    newChairPiece.setAttribute('position', '0.225 0.725 0.225')
    newChairPiece.setAttribute('static-body', '')
    newChair.appendChild(newChairPiece)

    newChairPiece = document.createElement('a-box')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('width', '0.015')
    newChairPiece.setAttribute('depth', '0.015')
    newChairPiece.setAttribute('height', '0.65')
    newChairPiece.setAttribute('color', 'black')
    newChairPiece.setAttribute('position', '-0.225 0.325 -0.225')
    newChairPiece.setAttribute('static-body', '')
    newChair.appendChild(newChairPiece)

    newChairPiece = document.createElement('a-box')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('width', '0.015')
    newChairPiece.setAttribute('depth', '0.015')
    newChairPiece.setAttribute('height', '0.65')
    newChairPiece.setAttribute('color', 'black')
    newChairPiece.setAttribute('position', '-0.225 0.325 0.225')
    newChairPiece.setAttribute('static-body', '')
    newChair.appendChild(newChairPiece)

    newChairPiece = document.createElement('a-box')
    newChairPiece.setAttribute('class', 'scenery chair-geom')
    newChairPiece.setAttribute('width', '0.015')
    newChairPiece.setAttribute('depth', '0.015')
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
  } else if (prop == 'videoCamera') {
    var newProp = document.createElement('a-entity')
    newProp.setAttribute('class', 'scenery video-camera')
    scene.appendChild(newProp)

    var newPropThing = document.createElement('a-cylinder')
    newPropThing.setAttribute('class', 'scenery video-camera-geom')
    newPropThing.setAttribute('position', '0 1.2 -0.4')
    newPropThing.setAttribute('rotation', '90 0 0')
    newPropThing.setAttribute('height', '0.05')
    newPropThing.setAttribute('radius', '0.05')
    newPropThing.setAttribute('color', '#3d3d3d')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-cylinder')
    newPropThing.setAttribute('class', 'scenery video-camera-geom')
    newPropThing.setAttribute('position', '0 0.985 0')
    newPropThing.setAttribute('height', '0.01')
    newPropThing.setAttribute('radius', '0.2')
    newPropThing.setAttribute('color', '#3d3d3d')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery video-camera-geom')
    newPropThing.setAttribute('width', '0.2')
    newPropThing.setAttribute('height', '0.5')
    newPropThing.setAttribute('depth', '0.8')
    newPropThing.setAttribute('position', '0 1.24 0')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery video-camera-geom')
    newPropThing.setAttribute('width', '0.05')
    newPropThing.setAttribute('height', '1')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('position', '0.2 0.5 0.2')
    newPropThing.setAttribute('rotation', '-12.5 0 12.5')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery video-camera-geom')
    newPropThing.setAttribute('width', '0.05')
    newPropThing.setAttribute('height', '1')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('position', '0.2 0.5 -0.2')
    newPropThing.setAttribute('rotation', '12.5 0 12.5')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery video-camera-geom')
    newPropThing.setAttribute('width', '0.05')
    newPropThing.setAttribute('height', '1')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('position', '-0.2 0.5 0.2')
    newPropThing.setAttribute('rotation', '-12.5 0 -12.5')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery video-camera-geom')
    newPropThing.setAttribute('width', '0.05')
    newPropThing.setAttribute('height', '1')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('position', '-0.2 0.5 -0.2')
    newPropThing.setAttribute('rotation', '12.5 0 -12.5')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newProp.setAttribute('position', position)
    newProp.setAttribute('rotation', rotation)
    newProp.setAttribute('scale', scale)
  } else if (prop == 'replayMonitor') {
    var newProp = document.createElement('a-entity')
    newProp.setAttribute('class', 'scenery replay-monitor')
    scene.appendChild(newProp)

    var newPropThing = document.createElement('a-cylinder')
    newPropThing.setAttribute('class', 'scenery replay-monitor-geom')
    newPropThing.setAttribute('position', '0 0.985 0')
    newPropThing.setAttribute('height', '0.01')
    newPropThing.setAttribute('radius', '0.2')
    newPropThing.setAttribute('color', '#3d3d3d')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery replay-monitor-geom')
    newPropThing.setAttribute('position', '0 1.44 0')
    newPropThing.setAttribute('height', '0.9')
    newPropThing.setAttribute('width', '1.6')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery replay-monitor-geom')
    newPropThing.setAttribute('position', '0 1.44 -0.025')
    newPropThing.setAttribute('height', '0.81')
    newPropThing.setAttribute('width', '1.44')
    newPropThing.setAttribute('depth', '0.01')
    newPropThing.setAttribute('color', 'green')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery replay-monitor-geom')
    newPropThing.setAttribute('position', '0.2 0.5 0.2')
    newPropThing.setAttribute('rotation', '-12.5 0 12.5')
    newPropThing.setAttribute('height', '1')
    newPropThing.setAttribute('width', '0.05')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery replay-monitor-geom')
    newPropThing.setAttribute('position', '0.2 0.5 -0.2')
    newPropThing.setAttribute('rotation', '12.5 0 12.5')
    newPropThing.setAttribute('height', '1')
    newPropThing.setAttribute('width', '0.05')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery replay-monitor-geom')
    newPropThing.setAttribute('position', '-0.2 0.5 0.2')
    newPropThing.setAttribute('rotation', '-12.5 0 -12.5')
    newPropThing.setAttribute('height', '1')
    newPropThing.setAttribute('width', '0.05')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery replay-monitor-geom')
    newPropThing.setAttribute('position', '-0.2 0.5 -0.2')
    newPropThing.setAttribute('rotation', '12.5 0 -12.5')
    newPropThing.setAttribute('height', '1')
    newPropThing.setAttribute('width', '0.05')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('color', 'black')
    newProp.appendChild(newPropThing)

    newProp.setAttribute('position', position)
    newProp.setAttribute('rotation', rotation)
    newProp.setAttribute('scale', scale)
  } else if (prop == 'greenScreen') { // make these a single backdrop prop
    var newProp = document.createElement('a-entity')
    newProp.setAttribute('class', 'scenery green-screen')
    scene.appendChild(newProp)

    var newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery green-screen-geom')
    newPropThing.setAttribute('height', '4')
    newPropThing.setAttribute('width', '5')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('color', 'green')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery green-screen-geom')
    newPropThing.setAttribute('position', '0 -2 2.5')
    newPropThing.setAttribute('rotation', '90 90 0')
    newPropThing.setAttribute('height', '5')
    newPropThing.setAttribute('width', '5')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('color', 'green')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery green-screen-geom')
    newPropThing.setAttribute('position', '-1 -1 6')
    newPropThing.setAttribute('height', '2')
    newPropThing.setAttribute('width', '10')
    newPropThing.setAttribute('depth', '0.2')
    newPropThing.setAttribute('material', 'color: #007eb0; src: #floor-texture;')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery green-screen-geom')
    newPropThing.setAttribute('position', '-1 1 6')
    newPropThing.setAttribute('height', '2')
    newPropThing.setAttribute('width', '10')
    newPropThing.setAttribute('depth', '0.2')
    newPropThing.setAttribute('material', 'color: #001d29; src: #floor-texture;')
    newProp.appendChild(newPropThing)

    newProp.setAttribute('position', position)
    newProp.setAttribute('rotation', rotation)
    newProp.setAttribute('scale', scale)
  } else if (prop == 'replayScreen') {
    var newProp = document.createElement('a-entity')
    newProp.setAttribute('class', 'scenery replay-screen')
    scene.appendChild(newProp)

    var newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery replay-screen-geom')
    newPropThing.setAttribute('height', '4')
    newPropThing.setAttribute('width', '5')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('color', '#ffcccb')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery replay-screen-geom')
    newPropThing.setAttribute('position', '0 -2 2.5')
    newPropThing.setAttribute('rotation', '90 90 0')
    newPropThing.setAttribute('height', '5')
    newPropThing.setAttribute('width', '5')
    newPropThing.setAttribute('depth', '0.05')
    newPropThing.setAttribute('color', '#ffcccb')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery green-screen-geom')
    newPropThing.setAttribute('position', '1 -1 6')
    newPropThing.setAttribute('height', '2')
    newPropThing.setAttribute('width', '10')
    newPropThing.setAttribute('depth', '0.2')
    newPropThing.setAttribute('material', 'color: #007eb0; src: #floor-texture;')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery green-screen-geom')
    newPropThing.setAttribute('position', '1 1 6')
    newPropThing.setAttribute('height', '2')
    newPropThing.setAttribute('width', '10')
    newPropThing.setAttribute('depth', '0.2')
    newPropThing.setAttribute('material', 'color: #001d29; src: #floor-texture;')
    newProp.appendChild(newPropThing)

    newProp.setAttribute('position', position)
    newProp.setAttribute('rotation', rotation)
    newProp.setAttribute('scale', scale)
  } else if (prop == 'helpManual') {
    var newProp = document.createElement('a-entity')
    newProp.setAttribute('class', 'scenery help-manual')
    scene.appendChild(newProp)

    // Pages
    var newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'grabbable scenery help-manual-geom')
    newPropThing.setAttribute('constraint', 'target: #folder2; maxForce: 5e8; type: hinge; pivot: -0.123 0 0; targetPivot: 0.123 0 0; axis: 0 1 0; targetAxis: 0 1 0;')
    newPropThing.setAttribute('height', '0.2794')
    newPropThing.setAttribute('width', '0.2159')
    newPropThing.setAttribute('depth', '0.005')
    newPropThing.setAttribute('material', 'color: #f5f5f5; src: #help-manual-page1; flatShading: true;')
    newPropThing.setAttribute('dynamic-body', 'mass: 0.01;')
    newPropThing.setAttribute('position', '0 1.215 -8.25')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'grabbable scenery help-manual-geom')
    newPropThing.setAttribute('constraint', 'target: #folder2; maxForce: 5e8; type: hinge; pivot: -0.124 0 0; targetPivot: 0.124 0 0; axis: 0 1 0; targetAxis: 0 1 0;')
    newPropThing.setAttribute('height', '0.2794')
    newPropThing.setAttribute('width', '0.2159')
    newPropThing.setAttribute('depth', '0.005')
    newPropThing.setAttribute('material', 'color: #f5f5f5; src: #help-manual-page2; flatShading: true;')
    newPropThing.setAttribute('dynamic-body', 'mass: 0.01;')
    newPropThing.setAttribute('position', '0 1.210 -8.26')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'grabbable scenery help-manual-geom')
    newPropThing.setAttribute('constraint', 'target: #folder2; maxForce: 5e8; type: hinge; pivot: -0.125 0 0; targetPivot: 0.125 0 0; axis: 0 1 0; targetAxis: 0 1 0;')
    newPropThing.setAttribute('height', '0.2794')
    newPropThing.setAttribute('width', '0.2159')
    newPropThing.setAttribute('depth', '0.005')
    newPropThing.setAttribute('material', 'color: #f5f5f5; src: #help-manual-page3; flatShading: true;')
    newPropThing.setAttribute('dynamic-body', 'mass: 0.01;')
    newPropThing.setAttribute('position', '0 1.205 -8.27')
    newProp.appendChild(newPropThing)

    // Cover
    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'grabbable scenery help-manual-geom')
    newPropThing.setAttribute('constraint', 'target: #folder2; maxForce: 5e8; type: hinge; pivot: -0.12 0 0; targetPivot: 0.12 0 0; axis: 0 1 0; targetAxis: 0 1 0;')
    newPropThing.setAttribute('id', 'folder1')
    newPropThing.setAttribute('height', '0.295275')
    newPropThing.setAttribute('width', '0.2413')
    newPropThing.setAttribute('depth', '0.006')
    newPropThing.setAttribute('material', 'color: #fffbb5; src: #help-manual-cover; flatShading: true;')
    newPropThing.setAttribute('dynamic-body', 'mass: 0.02;')
    newPropThing.setAttribute('position', '0 1.22 -8.25')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'grabbable scenery help-manual-geom')
    newPropThing.setAttribute('id', 'folder2')
    newPropThing.setAttribute('height', '0.295275')
    newPropThing.setAttribute('width', '0.2413')
    newPropThing.setAttribute('depth', '0.006')
    newPropThing.setAttribute('material', 'color: #fffbb5; src: #help-manual-cover; flatShading: true;')
    newPropThing.setAttribute('dynamic-body', 'mass: 0.02;')
    newPropThing.setAttribute('position', '0 1.22 -8.25')
    newProp.appendChild(newPropThing)

    // newProp.setAttribute('position', position)
    // newProp.setAttribute('rotation', rotation)
    // newProp.setAttribute('scale', scale)
  } else if (prop == 'logoWall') {
    var newProp = document.createElement('a-entity')
    newProp.setAttribute('class', 'scenery logo-wall')
    scene.appendChild(newProp)

    var newPropThing = document.createElement('a-plane')
    newPropThing.setAttribute('class', 'scenery logo-wall-geom')
    newPropThing.setAttribute('height', '3')
    newPropThing.setAttribute('width', '8')
    newPropThing.setAttribute('color', '#FFFFFF')
    newPropThing.setAttribute('rotation', '-180 0 0')
    newPropThing.setAttribute('position', '0 1.75 19.98')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-plane')
    newPropThing.setAttribute('class', 'scenery logo-wall-geom')
    newPropThing.setAttribute('height', '2')
    newPropThing.setAttribute('width', '2')
    newPropThing.setAttribute('material', 'src: #text-logo; alphaTest: 0.5;')
    newPropThing.setAttribute('rotation', '-180 0 180')
    newPropThing.setAttribute('position', '2 1.75 19.95')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-plane')
    newPropThing.setAttribute('class', 'scenery logo-wall-geom')
    newPropThing.setAttribute('height', '2')
    newPropThing.setAttribute('width', '2')
    newPropThing.setAttribute('material', 'src: #text-logo; alphaTest: 0.5;')
    newPropThing.setAttribute('rotation', '-180 0 180')
    newPropThing.setAttribute('position', '-2 1.75 19.95')
    newProp.appendChild(newPropThing)
  } else if (prop == 'dumpster') {
    var newProp = document.createElement('a-entity')
    newProp.setAttribute('class', 'scenery dumpster')
    scene.appendChild(newProp)

    var newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery dumpster-geom')
    newPropThing.setAttribute('height', '2')
    newPropThing.setAttribute('width', '2')
    newPropThing.setAttribute('depth', '3')
    newPropThing.setAttribute('position', '5 0.75 17.5')
    newPropThing.setAttribute('material', 'src: #floor-texture; color:#005703;')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery dumpster-geom')
    newPropThing.setAttribute('height', '0.15')
    newPropThing.setAttribute('width', '2')
    newPropThing.setAttribute('depth', '1.5')
    newPropThing.setAttribute('position', '5.6 2.7 16.75')
    newPropThing.setAttribute('rotation', '0 0 110')
    newPropThing.setAttribute('material', 'color: black;')
    newProp.appendChild(newPropThing)

    newPropThing = document.createElement('a-box')
    newPropThing.setAttribute('class', 'scenery dumpster-geom')
    newPropThing.setAttribute('height', '0.15')
    newPropThing.setAttribute('width', '2')
    newPropThing.setAttribute('depth', '1.5')
    newPropThing.setAttribute('position', '5 1.825 18.25')
    newPropThing.setAttribute('material', 'color: black;')
    newProp.appendChild(newPropThing)
  }
}

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
  addProp('videoCamera', '-4.8 0 0', '0 90 0')
  addProp('replayMonitor', '-5 0 -1.5', '0 100 0')
  addProp('greenScreen', '-10 2 0', '0 90 0')
  addProp('replayScreen', '10 2 0', '0 -90 0')
  addProp('helpManual') // Currently positioning is set during prop creation
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

  // Misc
  addProp('logoWall') // prop currently sets position
  addProp('dumpster') // prop currently sets position
}

// Setup scene
AFRAME.registerComponent('scenery', {
  schema: {
    room: {type: 'string', default: null}
  },
  init: function() {
    if (this.data.room == 'replay') {
      replayRoomScenery();
    } else if (this.data.room == 'factory') {
      factoryRoomScenery();
    }

    // Add grab controls after we add scenery
    var rightHand = document.getElementById('rightHand');
    rightHand.setAttribute('sphere-collider', 'objects: .grabbable');
    rightHand.setAttribute('grab', '');

    var leftHand = document.getElementById('leftHand');
    leftHand.setAttribute('sphere-collider', 'objects: .grabbable');
    leftHand.setAttribute('grab', '');
  }
});
