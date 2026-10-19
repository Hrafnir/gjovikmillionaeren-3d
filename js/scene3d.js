import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BOARD_TILES, GROUP_COLORS } from './data.js';

export class BoardScene3D {
  constructor(container, onTileSelect) {
    this.container = container;
    this.onTileSelect = onTileSelect;

    this.scene = new THREE.Scene();
    this.isNight = false;

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.5,
      400
    );
    this.camera.position.set(0, 38, 42);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.06;
    this.controls.minDistance = 12;
    this.controls.maxDistance = 85;
    this.controls.target.set(0, 0, 2);

    // Camera Mode ('orbit', 'follow', 'top')
    this.cameraMode = 'orbit';
    this.followTargetPos = new THREE.Vector3(0, 0, 0);
    this.desiredCamPos = new THREE.Vector3(0, 38, 42);
    this.desiredLookAt = new THREE.Vector3(0, 0, 2);

    // Collections
    this.tileMeshes = [];
    this.tilePositions = [];
    this.tileRotations = [];
    this.ownerMarkers = new Map();
    this.buildingGroups = new Map();
    this.playerTokens = new Map();
    this.streetLights = [];
    this.windowMaterials = [];
    this.particles = [];
    this.smokeParticles = [];

    // Raycaster for clicking tiles
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredTileId = null;

    this.clock = new THREE.Clock();

    this.initLights();
    this.initEnvironment();
    this.initBoardTiles();
    this.initGjovikLandmarks();
    this.initSkibladnerShip();
    this.init3DDice();
    this.bindEvents();

    this.animate();
  }

  initLights() {
    this.ambientLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.65);
    this.sunLight.position.set(28, 48, 30);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 5;
    this.sunLight.shadow.camera.far = 130;
    const d = 28;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Subtle rim light over Mjøsa
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    this.rimLight.position.set(-30, 20, -30);
    this.scene.add(this.rimLight);

    this.updateAtmosphere();
  }

  updateAtmosphere() {
    if (this.isNight) {
      this.scene.background = new THREE.Color(0x060b19);
      this.scene.fog = new THREE.FogExp2(0x060b19, 0.0065);
      this.ambientLight.color.setHex(0x3b82f6);
      this.ambientLight.groundColor.setHex(0x090d16);
      this.ambientLight.intensity = 0.35;
      this.sunLight.color.setHex(0x818cf8);
      this.sunLight.intensity = 0.45;
      this.streetLights.forEach(l => {
        l.light.intensity = 2.2;
        l.bulb.material.emissiveIntensity = 2.5;
      });
      this.windowMaterials.forEach(m => {
        m.emissiveIntensity = 1.6;
      });
    } else {
      this.scene.background = new THREE.Color(0x7dd3fc);
      this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0045);
      this.ambientLight.color.setHex(0xe0f2fe);
      this.ambientLight.groundColor.setHex(0x334155);
      this.ambientLight.intensity = 0.9;
      this.sunLight.color.setHex(0xfffbeb);
      this.sunLight.intensity = 1.7;
      this.streetLights.forEach(l => {
        l.light.intensity = 0;
        l.bulb.material.emissiveIntensity = 0.2;
      });
      this.windowMaterials.forEach(m => {
        m.emissiveIntensity = 0.15;
      });
    }
  }

  toggleDayNight() {
    this.isNight = !this.isNight;
    this.updateAtmosphere();
    return this.isNight;
  }

  initEnvironment() {
    // Mjøsa Animated Water Plane
    const waterGeo = new THREE.PlaneGeometry(260, 260, 72, 72);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.18,
      metalness: 0.65,
      flatShading: true
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.y = -1.2;
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    // Save initial vertex positions for wave animation
    const pos = this.waterMesh.geometry.attributes.position;
    this.waterBaseY = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      this.waterBaseY[i] = pos.getY(i);
    }

    // Island Base under the Board
    const islandGeo = new THREE.CylinderGeometry(23.5, 26.5, 1.6, 64);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x3f6212,
      roughness: 0.85
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = -0.85;
    island.receiveShadow = true;
    this.scene.add(island);

    // Wooden Board Frame
    const frameGeo = new THREE.BoxGeometry(33.2, 0.7, 33.2);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.2
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = -0.25;
    frame.receiveShadow = true;
    frame.castShadow = true;
    this.scene.add(frame);

    // Inner Green Park Ground of Gjøvik
    const parkGeo = new THREE.BoxGeometry(24.4, 0.3, 24.4);
    const parkMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.9
    });
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.position.y = 0.05;
    park.receiveShadow = true;
    this.scene.add(park);
  }

  // Generate 40 Board Tiles around the 11x11 perimeter
  initBoardTiles() {
    // Board extends from -15 to +15.
    // Corners are 3.6 x 3.6, regular edge tiles are 2.533 x 3.6
    const cornerSize = 3.6;
    const edgeW = (30 - cornerSize * 2) / 9; // 2.5333
    const edgeD = 3.6;
    const halfSpan = 15 - cornerSize / 2; // 13.2

    for (let i = 0; i < 40; i++) {
      const tile = BOARD_TILES[i];
      const side = Math.floor(i / 10);
      const idx = i % 10;
      const isCorner = idx === 0;

      let x = 0, z = 0, rotY = 0;
      let w = isCorner ? cornerSize : edgeW;
      let d = edgeD;

      // Offset from corner center to edge tile center
      const offsetFromCorner = cornerSize / 2 + edgeW * (idx - 0.5);

      if (side === 0) {
        // Bottom row: right (0) to left (10)
        x = isCorner ? halfSpan : halfSpan - offsetFromCorner;
        z = halfSpan;
        rotY = 0;
      } else if (side === 1) {
        // Left column: bottom (10) to top (20)
        x = -halfSpan;
        z = isCorner ? halfSpan : halfSpan - offsetFromCorner;
        rotY = -Math.PI / 2;
      } else if (side === 2) {
        // Top row: left (20) to right (30)
        x = isCorner ? -halfSpan : -halfSpan + offsetFromCorner;
        z = -halfSpan;
        rotY = Math.PI;
      } else {
        // Right column: top (30) to bottom (0)
        x = halfSpan;
        z = isCorner ? -halfSpan : -halfSpan + offsetFromCorner;
        rotY = Math.PI / 2;
      }

      this.tilePositions[i] = new THREE.Vector3(x, 0.35, z);
      this.tileRotations[i] = rotY;

      const tex = this.createTileTexture(tile, isCorner);
      const geo = new THREE.BoxGeometry(w - 0.05, 0.38, d - 0.05);
      const sideMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
      const topMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.32,
        metalness: 0.05
      });

      const mesh = new THREE.Mesh(geo, [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);
      mesh.position.set(x, 0.2, z);
      mesh.rotation.y = rotY;
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.userData = { tileId: i };

      this.scene.add(mesh);
      this.tileMeshes.push(mesh);

      // Group for houses/hotels on this tile
      const bGroup = new THREE.Group();
      bGroup.position.set(x, 0.4, z);
      bGroup.rotation.y = rotY;
      this.scene.add(bGroup);
      this.buildingGroups.set(i, bGroup);
    }
  }

  createTileTexture(tile, isCorner) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Cream / off-white tile background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);

    // Outer border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 498, 498);

    const groupInfo = GROUP_COLORS[tile.group] || GROUP_COLORS.special;

    // Color header bar for streets
    if (tile.type === 'street') {
      ctx.fillStyle = groupInfo.hex;
      ctx.fillRect(14, 14, 484, 128);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(14, 142);
      ctx.lineTo(498, 142);
      ctx.stroke();
    } else {
      // Subtle top accent for special/station tiles
      ctx.fillStyle = isCorner ? '#fef3c7' : '#e2e8f0';
      ctx.fillRect(14, 14, 484, 484);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 498, 498);
    }

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';

    // Title
    ctx.font = isCorner ? '900 50px Outfit, sans-serif' : '800 44px Outfit, sans-serif';
    const titleY = tile.type === 'street' ? 215 : 130;
    this.wrapCanvasText(ctx, tile.shortName.toUpperCase(), 256, titleY, 440, 50);

    // Icon for special / station / utility
    if (tile.icon) {
      ctx.font = isCorner ? '150px sans-serif' : '125px sans-serif';
      ctx.fillText(tile.icon, 256, isCorner ? 345 : 320);
    }

    // Price at bottom
    if (tile.price) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 44px "Space Grotesk", sans-serif';
      ctx.fillText(`kr ${tile.price}`, 256, 462);
    } else if (tile.amount) {
      ctx.fillStyle = '#dc2626';
      ctx.font = '800 40px "Space Grotesk", sans-serif';
      ctx.fillText(`- kr ${tile.amount}`, 256, 462);
    } else if (tile.id === 0) {
      ctx.fillStyle = '#15803d';
      ctx.font = '900 40px "Space Grotesk", sans-serif';
      ctx.fillText('+ kr 2 000', 256, 462);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }

  wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, y);
  }

  // Build iconic 3D Gjøvik Landmarks in the center of the board!
  initGjovikLandmarks() {
    const centerGroup = new THREE.Group();
    this.scene.add(centerGroup);

    // Shared glowing window material
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.2
    });
    this.windowMaterials.push(winMat);

    // 1. HOVDETOPPEN & FJELLHALLEN (Near bottom-left corner, (-7, 0, 6))
    const mtnGroup = new THREE.Group();
    mtnGroup.position.set(-6.8, 0.2, 5.8);

    const mtnGeo = new THREE.ConeGeometry(4.4, 5.2, 7);
    const mtnMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      flatShading: true
    });
    const mtn = new THREE.Mesh(mtnGeo, mtnMat);
    mtn.position.y = 2.6;
    mtn.castShadow = true;
    mtn.receiveShadow = true;
    mtnGroup.add(mtn);

    // Snowy / grassy peak cap
    const peakGeo = new THREE.ConeGeometry(2.1, 2.2, 7);
    const peakMat = new THREE.MeshStandardMaterial({ color: 0x166534, flatShading: true });
    const peak = new THREE.Mesh(peakGeo, peakMat);
    peak.position.y = 4.2;
    mtnGroup.add(peak);

    // Fjellhallen Portal Arch
    const portalGeo = new THREE.BoxGeometry(2.2, 1.6, 1.4);
    const portalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.set(1.8, 0.8, 1.8);
    portal.rotation.y = Math.PI / 4;
    mtnGroup.add(portal);

    const caveGeo = new THREE.BoxGeometry(1.4, 1.1, 1.5);
    const caveMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8
    });
    const cave = new THREE.Mesh(caveGeo, caveMat);
    cave.position.set(1.85, 0.65, 1.85);
    cave.rotation.y = Math.PI / 4;
    mtnGroup.add(cave);

    // Fastland Ski Jump (Hoppbakke) swooping down from Hovdetoppen!
    const rampGeo = new THREE.BoxGeometry(0.9, 0.18, 5.2);
    const rampMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.position.set(0, 2.8, -2.8);
    ramp.rotation.x = Math.PI / 5;
    ramp.castShadow = true;
    mtnGroup.add(ramp);

    centerGroup.add(mtnGroup);

    // 2. FASTLAND FRILUFTSBAD & DET IKONISKE 1947 FUNKIS-STUPETÅRNET (Top-left (-6.5, 0, -6.2))
    const poolGroup = this.createFastlandPoolAndTower(winMat);
    poolGroup.position.set(-6.4, 0.22, -6.1);
    centerGroup.add(poolGroup);

    // 3. GJØVIK GÅRD – Den Hvite Hovedbygningen (Bottom-right (6.5, 0, 6.2))
    const manorGroup = new THREE.Group();
    manorGroup.position.set(6.5, 0.2, 6.2);
    manorGroup.rotation.y = -Math.PI / 6;

    const manorBody = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.8, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    manorBody.position.y = 0.9;
    manorBody.castShadow = true;
    manorGroup.add(manorBody);

    const manorRoof = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 1.3, 4),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 })
    );
    manorRoof.position.y = 2.45;
    manorRoof.rotation.y = Math.PI / 4;
    manorRoof.scale.set(1.15, 1, 0.7);
    manorRoof.castShadow = true;
    manorGroup.add(manorRoof);

    centerGroup.add(manorGroup);

    // 4. GJØVIK CHOKOLADEFABRIKK & STORGATA KVARTALET (Top-right (6.2, 0, -6.0))
    const chocoGroup = new THREE.Group();
    chocoGroup.position.set(6.2, 0.2, -6.0);

    const factory = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 2.2, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.75 })
    );
    factory.position.y = 1.1;
    factory.castShadow = true;
    chocoGroup.add(factory);

    // Classic brick chimney
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.48, 4.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x7c2d12 })
    );
    chimney.position.set(1.4, 2.3, -0.8);
    chimney.castShadow = true;
    chocoGroup.add(chimney);

    // Glowing windows on Factory
    for (let wx = -1.2; wx <= 1.2; wx += 0.8) {
      const wMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 2.66), winMat);
      wMesh.position.set(wx, 1.2, 0);
      chocoGroup.add(wMesh);
    }

    centerGroup.add(chocoGroup);

    // 5. CENTER LOGO MONUMENT & CARD DECKS (Byavisa & Mjøsgløtt)
    this.createCenterLogoAndDecks(centerGroup);

    // 6. TREES & STREET LAMPS AROUND THE PARK
    const treePositions = [
      [-9.5, 1.2], [-3.2, 8.5], [2.5, 8.8], [9.2, 2.4],
      [-9.2, -2.5], [-2.5, -8.8], [3.0, -8.5], [9.4, -2.2],
      [-4.0, 2.0], [4.2, 2.2], [-4.0, -2.2], [4.0, -2.0]
    ];
    treePositions.forEach(([tx, tz]) => {
      const tree = this.createPineTree();
      tree.position.set(tx, 0.2, tz);
      const s = 0.75 + Math.random() * 0.45;
      tree.scale.set(s, s, s);
      centerGroup.add(tree);
    });

    // Street Lamps along inner road
    const lampCoords = [
      [-10.5, 10.5], [0, 10.5], [10.5, 10.5],
      [-10.5, 0], [10.5, 0],
      [-10.5, -10.5], [0, -10.5], [10.5, -10.5]
    ];
    lampCoords.forEach(([lx, lz]) => {
      const lamp = this.createStreetLamp();
      lamp.group.position.set(lx, 0.2, lz);
      centerGroup.add(lamp.group);
      this.streetLights.push(lamp);
    });

    this.updateAtmosphere();
  }

  // Authentic 3D Model of Fastland Badedam (Hovdetjernet) & Kåre Uglands 1947 Funkis Stupetårn
  createFastlandPoolAndTower() {
    const poolGroup = new THREE.Group();

    const whiteConcreteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.05
    });
    const pierConcreteMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.7
    });
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.3
    });
    const matStripMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9
    });

    // Hovdetjernet Concrete Basin Rim (elongated rounded basin)
    const poolRim = new THREE.Mesh(
      new THREE.CylinderGeometry(2.9, 3.0, 0.22, 32),
      pierConcreteMat
    );
    poolRim.scale.set(1.18, 1, 0.78);
    poolRim.receiveShadow = true;
    poolGroup.add(poolRim);

    const poolWater = new THREE.Mesh(
      new THREE.CylinderGeometry(2.65, 2.65, 0.25, 32),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.12,
        metalness: 0.35,
        emissive: 0x0369a1,
        emissiveIntensity: 0.28
      })
    );
    poolWater.scale.set(1.18, 1, 0.78);
    poolGroup.add(poolWater);

    // Classic Fastland Garderobebygg (white wooden building with red roof along back edge)
    const bathHouse = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.75, 0.75),
      new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.6 })
    );
    bathHouse.position.set(0.5, 0.45, -2.55);
    bathHouse.castShadow = true;
    poolGroup.add(bathHouse);

    const bathRoof = new THREE.Mesh(
      new THREE.ConeGeometry(2.1, 0.5, 4),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 })
    );
    bathRoof.position.set(0.5, 1.05, -2.55);
    bathRoof.rotation.y = Math.PI / 4;
    bathRoof.scale.set(1.05, 1, 0.38);
    poolGroup.add(bathRoof);

    // Concrete Pier Base at water's edge for the 1947 Funkis Diving Tower
    const towerRoot = new THREE.Group();
    towerRoot.position.set(-1.95, 0.1, 0.15);
    poolGroup.add(towerRoot);

    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.28, 1.85),
      pierConcreteMat
    );
    pier.position.set(-0.15, 0.14, 0);
    pier.receiveShadow = true;
    towerRoot.add(pier);

    // TWIN FORWARD-INCLINED FUNKIS CONCRETE PORTAL COLUMNS (Vanger)
    // Rising 3.4 units high (~10 meters in scale), leaning slightly forward over the water (+X)
    [-0.36, 0.36].forEach(zOff => {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 3.45, 0.18),
        whiteConcreteMat
      );
      pillar.position.set(0.18, 1.82, zOff);
      pillar.rotation.z = -0.14; // Characteristic forward funkis lean
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      towerRoot.add(pillar);

      // Angled concrete haunch / cantilever bracket under the 5m & 10m platforms
      const bracket10 = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.2, 0.16),
        whiteConcreteMat
      );
      bracket10.position.set(0.56, 3.35, zOff);
      bracket10.rotation.z = 0.12;
      towerRoot.add(bracket10);
    });

    // Helper to build a funkis concrete platform with white safety railings
    const addFunkisPlatform = (y, xCenter, lengthX, widthZ, hasSideWings = false) => {
      const platGroup = new THREE.Group();
      platGroup.position.set(xCenter, y, 0);

      // Concrete slab
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(lengthX, 0.13, widthZ),
        whiteConcreteMat
      );
      slab.castShadow = true;
      slab.receiveShadow = true;
      platGroup.add(slab);

      // Non-slip dark runner mat at front diving edge
      const mat = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.14, Math.min(widthZ * 0.55, 0.65)),
        matStripMat
      );
      mat.position.set(lengthX / 2 - 0.24, 0.01, 0);
      platGroup.add(mat);

      // White functionalist tubular railings along both sides and back (leaving front diving edge open)
      const railH = 0.34;
      [-widthZ / 2 + 0.04, widthZ / 2 - 0.04].forEach(rz => {
        // Top & mid horizontal bars
        [railH, railH * 0.52].forEach(ry => {
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(lengthX - 0.18, 0.035, 0.035),
            railMat
          );
          bar.position.set(-0.06, ry, rz);
          platGroup.add(bar);
        });
        // Vertical posts
        for (let px = -lengthX / 2 + 0.08; px <= lengthX / 2 - 0.22; px += 0.38) {
          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.022, 0.022, railH, 6),
            railMat
          );
          post.position.set(px, railH / 2, rz);
          platGroup.add(post);
        }
      });

      // Back railing
      const backBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.035, widthZ),
        railMat
      );
      backBar.position.set(-lengthX / 2 + 0.05, railH, 0);
      platGroup.add(backBar);

      if (hasSideWings) {
        // Characteristic wide 5m cross-wing concrete beam
        const wingBeam = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.18, widthZ + 0.3),
          whiteConcreteMat
        );
        wingBeam.position.set(0, -0.1, 0);
        platGroup.add(wingBeam);
      }

      towerRoot.add(platGroup);
    };

    // 5-METER PLATFORM (Wide cantilevered wing platform mid-way up)
    addFunkisPlatform(1.75, 0.25, 1.35, 1.55, true);

    // 7.5-METER PLATFORM (Intermediate cantilevered slab)
    addFunkisPlatform(2.6, 0.38, 1.15, 0.95, false);

    // 10-METER TOP PLATFORM (Iconic crowning cantilevered slab at top of twin columns)
    addFunkisPlatform(3.52, 0.52, 1.45, 1.05, false);

    // STEEP REAR CONCRETE/STEEL STAIRCASE (Climbing up the back between the twin columns)
    const stairSpine = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 3.65, 0.46),
      whiteConcreteMat
    );
    stairSpine.position.set(-0.42, 1.82, 0);
    stairSpine.rotation.z = -0.32;
    stairSpine.castShadow = true;
    towerRoot.add(stairSpine);

    // Individual stair treads + twin handrails up the back
    for (let s = 0; s < 14; s++) {
      const frac = s / 14;
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.05, 0.48),
        pierConcreteMat
      );
      stepMesh.position.set(-0.92 + frac * 0.95, 0.25 + frac * 3.2, 0);
      towerRoot.add(stepMesh);
    }

    [-0.24, 0.24].forEach(hz => {
      const handrail = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 3.65, 0.035),
        railMat
      );
      handrail.position.set(-0.48, 2.08, hz);
      handrail.rotation.z = -0.32;
      towerRoot.add(handrail);
    });

    // SEPARATE 3-METER & 1-METER SVIKTBRETT (Springboards) beside the main tower
    const addSpringboard = (zPos, height, boardColor) => {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, height, 0.28),
        whiteConcreteMat
      );
      base.position.set(0.05, height / 2, zPos);
      base.castShadow = true;
      towerRoot.add(base);

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.05, 0.24),
        new THREE.MeshStandardMaterial({ color: boardColor, roughness: 0.4 })
      );
      board.position.set(0.42, height + 0.03, zPos);
      board.castShadow = true;
      towerRoot.add(board);
    };

    addSpringboard(1.08, 1.05, 0x0284c7); // 3m svikt
    addSpringboard(-1.05, 0.48, 0xd97706); // 1m svikt

    return poolGroup;
  }

  createCenterLogoAndDecks(parent) {
    // Center emblem slab
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e3a8a');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 18;
    ctx.strokeRect(18, 18, 988, 476);

    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.font = '900 92px Outfit, sans-serif';
    ctx.fillText('GJØVIK', 512, 210);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 64px Outfit, sans-serif';
    ctx.fillText('MILLIONÆREN', 512, 300);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 38px "Space Grotesk", sans-serif';
    ctx.fillText('🦢 DEN HVITE BY VED MJØSA 🚢', 512, 395);

    const tex = new THREE.CanvasTexture(canvas);
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 0.35, 4.25),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 })
    );
    slab.position.set(0, 0.28, 0);
    slab.receiveShadow = true;
    parent.add(slab);

    // Byavisa Deck (Sjanse) & Mjøsgløtt Deck (Prøvelykken)
    const makeDeck = (label, colorHex, x, z, rot) => {
      const dCanvas = document.createElement('canvas');
      dCanvas.width = 512;
      dCanvas.height = 320;
      const dCtx = dCanvas.getContext('2d');
      dCtx.fillStyle = colorHex;
      dCtx.fillRect(0, 0, 512, 320);
      dCtx.strokeStyle = '#fff';
      dCtx.lineWidth = 14;
      dCtx.strokeRect(14, 14, 484, 292);
      dCtx.fillStyle = '#fff';
      dCtx.textAlign = 'center';
      dCtx.font = '900 56px Outfit, sans-serif';
      dCtx.fillText(label, 256, 180);

      const dTex = new THREE.CanvasTexture(dCanvas);
      const deckMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.45, 2.1),
        new THREE.MeshStandardMaterial({ map: dTex, roughness: 0.35 })
      );
      deckMesh.position.set(x, 0.35, z);
      deckMesh.rotation.y = rot;
      deckMesh.castShadow = true;
      parent.add(deckMesh);
    };

    makeDeck('📰 BYAVISA', '#ea580c', -5.2, 0, Math.PI / 4);
    makeDeck('🎁 MJØSGLØTT', '#0284c7', 5.2, 0, Math.PI / 4);
  }

  createPineTree() {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.2, 0.8, 7),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    trunk.position.y = 0.4;
    trunk.castShadow = true;
    g.add(trunk);

    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x166534, flatShading: true });
    [0.9, 1.45, 1.95].forEach((y, idx) => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.75 - idx * 0.16, 0.9, 7),
        leavesMat
      );
      cone.position.y = y;
      cone.castShadow = true;
      g.add(cone);
    });
    return g;
  }

  createStreetLamp() {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.09, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    );
    pole.position.y = 1.1;
    group.add(pole);

    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.3
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), bulbMat);
    bulb.position.y = 2.25;
    group.add(bulb);

    const light = new THREE.PointLight(0xfbbf24, 0, 9);
    light.position.y = 2.2;
    group.add(light);

    return { group, bulb, light };
  }

  // Build an authentic 1888-style 3D model of DS «Skibladner» («Mjøsas Hvite Svane»)
  buildSkibladnerModel(scale = 1.0) {
    const ship = new THREE.Group();

    const whiteHullMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.08 });
    const oxideBottomMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.85 });
    const teakMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.45 });
    const blackStackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.35, metalness: 0.3 });
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

    // 1. SLEEK STEAMER HULL (Extruded pointed clipper bow & rounded cruiser stern)
    const hullShape = new THREE.Shape();
    // Length along X from -3.4 (stern) to +3.6 (sharp clipper bow), half-beam Z = 0.72
    hullShape.moveTo(-3.3, 0);
    hullShape.quadraticCurveTo(-3.4, 0.58, -2.5, 0.68);
    hullShape.lineTo(1.2, 0.72);
    hullShape.quadraticCurveTo(2.6, 0.62, 3.65, 0); // Pointed clipper bow at +X
    hullShape.quadraticCurveTo(2.6, -0.62, 1.2, -0.72);
    hullShape.lineTo(-2.5, -0.68);
    hullShape.quadraticCurveTo(-3.4, -0.58, -3.3, 0);

    const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
      depth: 0.62,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 3
    });
    hullGeo.rotateX(Math.PI / 2);

    const whiteHull = new THREE.Mesh(hullGeo, whiteHullMat);
    whiteHull.position.y = 0.68;
    whiteHull.castShadow = true;
    whiteHull.receiveShadow = true;
    ship.add(whiteHull);

    // Underwater red-oxide bottom hull
    const bottomHull = new THREE.Mesh(hullGeo, oxideBottomMat);
    bottomHull.scale.set(0.97, 0.45, 0.95);
    bottomHull.position.y = 0.28;
    ship.add(bottomHull);

    // Golden sheer stripe (gullrand) & bow scrollwork
    const goldStripe = new THREE.Mesh(hullGeo, goldMat);
    goldStripe.scale.set(1.01, 0.12, 1.015);
    goldStripe.position.y = 0.63;
    ship.add(goldStripe);

    // Teak Wooden Main Deck
    const deckMesh = new THREE.Mesh(hullGeo, teakMat);
    deckMesh.scale.set(0.96, 0.08, 0.94);
    deckMesh.position.y = 0.73;
    ship.add(deckMesh);

    // Bowsprit (Baugspryd) with gold tip at the clipper bow
    const bowsprit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.045, 1.25, 8),
      whiteHullMat
    );
    bowsprit.rotation.z = -Math.PI / 2 + 0.22;
    bowsprit.position.set(4.05, 0.82, 0);
    ship.add(bowsprit);

    // 2. TEAK SALOONS, PROMENADE DECK & SUN AWNING (Solseil)
    // Aft Mahogany/Teak Saloon ("Første Plads Salon")
    const aftSaloon = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 0.46, 1.02),
      teakMat
    );
    aftSaloon.position.set(-1.55, 0.96, 0);
    aftSaloon.castShadow = true;
    ship.add(aftSaloon);

    // Glowing saloon windows along port & starboard
    const saloonWinMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45
    });
    this.windowMaterials.push(saloonWinMat);
    for (let wx = -2.45; wx <= -0.65; wx += 0.36) {
      const wPane = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 1.06), saloonWinMat);
      wPane.position.set(wx, 0.98, 0);
      ship.add(wPane);
    }

    // Forward Saloon & Teak/White Wheelhouse (Styrehus) ahead of the paddleboxes
    const fwdCabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.42, 0.92),
      whiteHullMat
    );
    fwdCabin.position.set(1.35, 0.94, 0);
    fwdCabin.castShadow = true;
    ship.add(fwdCabin);

    const wheelhouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.38, 0.72),
      teakMat
    );
    wheelhouse.position.set(1.15, 1.32, 0);
    wheelhouse.castShadow = true;
    ship.add(wheelhouse);

    const bridgeGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.2, 0.76),
      saloonWinMat
    );
    bridgeGlass.position.set(1.15, 1.36, 0);
    ship.add(bridgeGlass);

    // Characteristic White Canvas Sun Awning (Solseil) over the aft promenade deck
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.06, 1.18),
      awningMat
    );
    awning.position.set(-1.55, 1.48, 0);
    awning.castShadow = true;
    ship.add(awning);

    // Brass stanchions supporting the sun awning
    for (let sx = -2.7; sx <= -0.4; sx += 0.57) {
      [-0.52, 0.52].forEach(sz => {
        const stanchion = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.32, 6),
          goldMat
        );
        stanchion.position.set(sx, 1.32, sz);
        ship.add(stanchion);
      });
    }

    // 3. ICONIC ARCHED WHITE PADDLEBOXES (Hjulkasser) WITH «SKIBLADNER» CREST
    const pbCanvas = document.createElement('canvas');
    pbCanvas.width = 512;
    pbCanvas.height = 256;
    const pbCtx = pbCanvas.getContext('2d');
    pbCtx.fillStyle = '#ffffff';
    pbCtx.fillRect(0, 0, 512, 256);

    // Decorative golden arch & fan louvers on the paddlebox
    pbCtx.strokeStyle = '#d97706';
    pbCtx.lineWidth = 10;
    pbCtx.beginPath();
    pbCtx.arc(256, 250, 220, Math.PI, 0);
    pbCtx.stroke();

    pbCtx.strokeStyle = '#cbd5e1';
    pbCtx.lineWidth = 4;
    for (let a = 1; a < 11; a++) {
      const ang = Math.PI + (a / 12) * Math.PI;
      pbCtx.beginPath();
      pbCtx.moveTo(256, 250);
      pbCtx.lineTo(256 + Math.cos(ang) * 195, 250 + Math.sin(ang) * 195);
      pbCtx.stroke();
    }

    // Gold star & SKIBLADNER banner
    pbCtx.fillStyle = '#fbbf24';
    pbCtx.beginPath();
    pbCtx.arc(256, 210, 44, Math.PI, 0);
    pbCtx.fill();

    pbCtx.fillStyle = '#0f172a';
    pbCtx.textAlign = 'center';
    pbCtx.font = '900 34px serif';
    pbCtx.fillText('SKIBLADNER', 256, 110);

    const pbTex = new THREE.CanvasTexture(pbCanvas);
    const pbSideMat = new THREE.MeshStandardMaterial({ map: pbTex, roughness: 0.25 });

    // Semi-cylinder arched paddleboxes on port & starboard
    const pbGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.38, 24, 1, false, 0, Math.PI);
    pbGeo.rotateZ(Math.PI / 2);
    pbGeo.rotateY(Math.PI / 2);

    [-0.86, 0.86].forEach(zSide => {
      const pBox = new THREE.Mesh(pbGeo, [whiteHullMat, pbSideMat, pbSideMat]);
      pBox.position.set(0.05, 0.68, zSide);
      pBox.castShadow = true;
      ship.add(pBox);
    });

    // Bridge walkway connecting top of both paddleboxes
    const bridgeDeck = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.08, 2.05),
      whiteHullMat
    );
    bridgeDeck.position.set(0.05, 1.48, 0);
    ship.add(bridgeDeck);

    // 4. RED STEEL PADDLE WHEELS (Skovlhjul) rotating inside the paddleboxes
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(0.05, 0.52, 0);
    const redWheelMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4, metalness: 0.4 });

    [-0.86, 0.86].forEach(zSide => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.035, 8, 20), redWheelMat);
      rim.position.z = zSide;
      wheelGroup.add(rim);

      for (let b = 0; b < 10; b++) {
        const ang = (b / 10) * Math.PI * 2;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.32), redWheelMat);
        blade.position.set(Math.cos(ang) * 0.56, Math.sin(ang) * 0.56, zSide);
        blade.rotation.z = ang;
        wheelGroup.add(blade);
      }
    });
    ship.add(wheelGroup);

    // 5. TALL, SLENDER PITCH-BLACK SMOKESTACK (Svart Skorstein) WITH BRASS STEAM WHISTLE
    const stackGroup = new THREE.Group();
    stackGroup.position.set(0.18, 1.15, 0);
    stackGroup.rotation.z = 0.08; // Authentic slight aft rake

    const blackStack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.19, 2.35, 20),
      blackStackMat
    );
    blackStack.position.y = 1.15;
    blackStack.castShadow = true;
    stackGroup.add(blackStack);

    // Crown ring on top of smokestack
    const stackCrown = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.025, 8, 20),
      blackStackMat
    );
    stackCrown.rotation.x = Math.PI / 2;
    stackCrown.position.y = 2.32;
    stackGroup.add(stackCrown);

    // Polished Brass Steam Whistle (Dampfløyte) on front of stack
    const whistlePipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.95, 8),
      goldMat
    );
    whistlePipe.position.set(0.21, 1.45, 0);
    stackGroup.add(whistlePipe);

    ship.add(stackGroup);

    // 6. TWO TALL SLENDER MASTS (Foremast & Mainmast) & NORWEGIAN POSTFLAGG
    const addMast = (xPos, height) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.055, height, 10),
        teakMat
      );
      m.position.set(xPos, 0.8 + height / 2, 0);
      m.rotation.z = 0.07;
      m.castShadow = true;
      ship.add(m);
    };
    addMast(2.45, 2.45);  // Foremast
    addMast(-2.15, 2.25); // Mainmast

    // Norwegian Split Flag at Stern
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 0.95, 8),
      whiteHullMat
    );
    flagPole.position.set(-3.28, 1.1, 0);
    flagPole.rotation.z = 0.35;
    ship.add(flagPole);

    const flagMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.32, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
    );
    flagMesh.position.set(-3.58, 1.42, 0);
    ship.add(flagMesh);

    ship.scale.setScalar(scale);
    return { ship, wheelGroup };
  }

  // Animated 3D Skibladner Paddle Steamer sailing in Mjøsa around the board!
  initSkibladnerShip() {
    const built = this.buildSkibladnerModel(1.18);
    this.skibladner = built.ship;
    this.paddleWheel = built.wheelGroup;
    this.skibladnerAngle = 0;
    this.scene.add(this.skibladner);
  }

  // 3D Dice with Canvas Pips
  init3DDice() {
    this.diceMeshes = [];
    this.dicePhysics = [];

    const makeDieFace = (pips) => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 244, 244);

      ctx.fillStyle = pips === 1 || pips === 6 ? '#dc2626' : '#0f172a';
      const coords = {
        1: [[128, 128]],
        2: [[70, 70], [186, 186]],
        3: [[70, 70], [128, 128], [186, 186]],
        4: [[70, 70], [186, 70], [70, 186], [186, 186]],
        5: [[70, 70], [186, 70], [128, 128], [70, 186], [186, 186]],
        6: [[70, 64], [186, 64], [70, 128], [186, 128], [70, 192], [186, 192]]
      };
      coords[pips].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 24, 0, Math.PI * 2);
        ctx.fill();
      });
      return new THREE.MeshStandardMaterial({
        map: new THREE.CanvasTexture(c),
        roughness: 0.2
      });
    };

    // Standard Three.js BoxGeometry material order: +X(1), -X(6), +Y(2), -Y(5), +Z(3), -Z(4)
    const materials = [
      makeDieFace(1),
      makeDieFace(6),
      makeDieFace(2),
      makeDieFace(5),
      makeDieFace(3),
      makeDieFace(4)
    ];

    for (let i = 0; i < 2; i++) {
      const die = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 1.15), materials);
      die.castShadow = true;
      die.receiveShadow = true;
      die.position.set(i === 0 ? -1.2 : 1.2, 0.95, 3.6);
      this.scene.add(die);
      this.diceMeshes.push(die);
      this.dicePhysics.push({
        active: false,
        vel: new THREE.Vector3(),
        angVel: new THREE.Vector3(),
        targetRot: new THREE.Euler()
      });
    }
  }

  // Roll 3D Dice to land on exact numbers d1, d2
  roll3DDice(d1, d2) {
    const values = [d1, d2];
    // Target Euler rotations so that top (+Y) face displays `val`
    // Materials: 0:+X(1), 1:-X(6), 2:+Y(2), 3:-Y(5), 4:+Z(3), 5:-Z(4)
    const rotForTop = {
      1: new THREE.Euler(0, 0, Math.PI / 2),
      6: new THREE.Euler(0, 0, -Math.PI / 2),
      2: new THREE.Euler(0, 0, 0),
      5: new THREE.Euler(Math.PI, 0, 0),
      3: new THREE.Euler(-Math.PI / 2, 0, 0),
      4: new THREE.Euler(Math.PI / 2, 0, 0)
    };

    for (let i = 0; i < 2; i++) {
      const die = this.diceMeshes[i];
      const phys = this.dicePhysics[i];
      die.position.set(i === 0 ? -2.8 : 2.8, 6.5 + i * 0.8, 6.5);
      phys.vel.set((i === 0 ? 1 : -1) * (1.5 + Math.random()), -2, -3.5 - Math.random() * 1.5);
      phys.angVel.set(12 + Math.random() * 8, 10 + Math.random() * 8, 12 + Math.random() * 8);
      phys.targetRot.copy(rotForTop[values[i]]);
      phys.active = true;
      phys.startTime = performance.now();
    }
  }

  // Helper to get forward track angle (+X forward) at a given tileId
  getTrackForwardAngle(tileId) {
    if (tileId >= 0 && tileId < 10) return Math.PI;          // Bottom row: moving left (-X)
    if (tileId >= 10 && tileId < 20) return Math.PI / 2;     // Left column: moving up (-Z)
    if (tileId >= 20 && tileId < 30) return 0;               // Top row: moving right (+X)
    return -Math.PI / 2;                                     // Right column: moving down (+Z)
  }

  // Create Custom 3D Token for each Player
  createPlayerTokens(players) {
    // Clear existing
    this.playerTokens.forEach(mesh => this.scene.remove(mesh));
    this.playerTokens.clear();

    players.forEach((p, idx) => {
      const colorHex = p.color || p.token.color;
      const tokenGroup = this.buildCustomTokenMesh(p.token.id, colorHex);
      const pos = this.getPlayerSlotPosition(p.position, idx, players.length);
      tokenGroup.position.copy(pos);
      tokenGroup.rotation.y = this.getTrackForwardAngle(p.position);
      this.scene.add(tokenGroup);
      this.playerTokens.set(p.id, tokenGroup);
    });
  }

  // Live-update a player's 3D token color mid-game without losing position/rotation
  updatePlayerTokenColor(player) {
    const oldMesh = this.playerTokens.get(player.id);
    const colorHex = player.color || player.token.color;
    const newMesh = this.buildCustomTokenMesh(player.token.id, colorHex);

    if (oldMesh) {
      newMesh.position.copy(oldMesh.position);
      newMesh.rotation.copy(oldMesh.rotation);
      this.scene.remove(oldMesh);
    }
    this.scene.add(newMesh);
    this.playerTokens.set(player.id, newMesh);
  }

  buildCustomTokenMesh(tokenId, colorHex) {
    const group = new THREE.Group();

    const playerMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.25,
      metalness: 0.35
    });
    const playerGlowMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.5
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.85
    });
    const darkBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.6
    });

    // Shared Collector Pedestal Base with Player-Colored Glowing Ring & Brass Trim
    const pedBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.65, 0.14, 28), darkBaseMat);
    pedBottom.position.y = 0.07;
    pedBottom.castShadow = true;
    pedBottom.receiveShadow = true;
    group.add(pedBottom);

    const colorRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.075, 12, 28), playerGlowMat);
    colorRing.rotation.x = Math.PI / 2;
    colorRing.position.y = 0.13;
    group.add(colorRing);

    const brassTop = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.54, 0.06, 28), playerMat);
    brassTop.position.y = 0.17;
    brassTop.castShadow = true;
    group.add(brassTop);

    // ==================== 1. SKIBLADNER (🚢 Mjøsas Hvite Svane) ====================
    if (tokenId === 'skibladner') {
      // Player-colored wave cushion under the steamer
      const waveBase = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.49, 0.08, 24), playerMat);
      waveBase.position.y = 0.22;
      group.add(waveBase);

      // White foam bow wake
      const wakeMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.4 });
      [-0.18, 0.18].forEach(zSide => {
        const wake = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.06), wakeMat);
        wake.position.set(0.15, 0.26, zSide);
        wake.rotation.y = zSide > 0 ? -0.25 : 0.25;
        group.add(wake);
      });

      const miniBuilt = this.buildSkibladnerModel(0.25);
      miniBuilt.ship.position.y = 0.16;
      group.add(miniBuilt.ship);
    }

    // ==================== 2. GJØVIK-SJOKOLADEN (🍫 Chokoladefabrikken) ====================
    else if (tokenId === 'chocolate') {
      const chocGroup = new THREE.Group();
      chocGroup.position.set(0, 0.22, 0);
      chocGroup.rotation.z = 0.18;  // Jaunty tilted showcase angle
      chocGroup.rotation.y = -0.25;

      const darkChocMat = new THREE.MeshStandardMaterial({
        color: 0x3b1d0e,
        roughness: 0.22,
        metalness: 0.08
      });
      const milkChocMat = new THREE.MeshStandardMaterial({
        color: 0x542914,
        roughness: 0.26,
        metalness: 0.05
      });

      // Main molded chocolate slab
      const slab = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.08, 0.72), darkChocMat);
      slab.position.y = 0.56;
      slab.castShadow = true;
      chocGroup.add(slab);

      // 3x4 Grid of 3D beveled chocolate squares (ruter) on both front & back
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
          const sqY = 0.22 + row * 0.23;
          const sqZ = -0.21 + col * 0.21;
          [-0.08, 0.08].forEach(xSide => {
            const piece = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.19, 0.18), milkChocMat);
            piece.position.set(xSide, sqY, sqZ);
            piece.castShadow = true;
            chocGroup.add(piece);
          });
        }
      }

      // Crinkled Golden Foil Band peeling back in the middle
      const foilBand = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.76), goldMat);
      foilBand.position.y = 0.55;
      foilBand.castShadow = true;
      chocGroup.add(foilBand);

      // Diagonal folded gold foil triangles
      [-0.18, 0.18].forEach((zOff, i) => {
        const fold = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.24, 3), goldMat);
        fold.position.set(0.11, 0.66, zOff);
        fold.rotation.z = i === 0 ? -0.3 : 0.3;
        chocGroup.add(fold);
      });

      // Classic Vintage «GJØVIK CHOKOLADE» Wrapper in Player's Chosen Color!
      const wrapCanvas = document.createElement('canvas');
      wrapCanvas.width = 256;
      wrapCanvas.height = 256;
      const wCtx = wrapCanvas.getContext('2d');
      wCtx.fillStyle = colorHex || '#facc15';
      wCtx.fillRect(0, 0, 256, 256);
      wCtx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      wCtx.fillRect(24, 24, 208, 208);
      wCtx.strokeStyle = colorHex || '#fbbf24';
      wCtx.lineWidth = 10;
      wCtx.strokeRect(12, 12, 232, 232);
      wCtx.fillStyle = '#ffffff';
      wCtx.textAlign = 'center';
      wCtx.font = '900 42px serif';
      wCtx.fillText('GJØVIK', 128, 112);
      wCtx.fillStyle = '#fbbf24';
      wCtx.font = '800 26px sans-serif';
      wCtx.fillText('CHOKOLADE', 128, 160);
      wCtx.font = '700 20px serif';
      wCtx.fillText('★ ANNO 1909 ★', 128, 202);

      const wrapTex = new THREE.CanvasTexture(wrapCanvas);
      const wrapMat = new THREE.MeshStandardMaterial({ map: wrapTex, roughness: 0.3 });
      const wrapperBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.52, 0.78),
        [playerMat, playerMat, goldMat, playerMat, wrapMat, wrapMat]
      );
      wrapperBox.position.y = 0.28;
      wrapperBox.castShadow = true;
      chocGroup.add(wrapperBox);

      group.add(chocGroup);
    }

    // ==================== 3. FASTLAND-HOPPSKI (🎿 Klar for svev fra Hovdetoppen) ====================
    else if (tokenId === 'ski') {
      const skiGroup = new THREE.Group();
      skiGroup.position.y = 0.2;

      // Snowy jump-hill mound on top of pedestal
      const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
      const snowMound = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.16, 20), snowMat);
      snowMound.position.y = 0.06;
      snowMound.rotation.z = 0.18;
      skiGroup.add(snowMound);

      const bindingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.6 });
      const whiteStripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });

      // Build a pair of long ski-jumping skis with curved upturned tips (+X forward)
      const makeJumpingSki = (zOffset, yawAngle) => {
        const singleSki = new THREE.Group();
        singleSki.position.set(0, 0.24, zOffset);
        singleSki.rotation.y = yawAngle;
        singleSki.rotation.z = 0.22; // Angled upward for take-off!

        // Main flat ski body
        const blade = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.045, 0.15), playerMat);
        blade.castShadow = true;
        singleSki.add(blade);

        // Norwegian racing center stripe
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.05, 0.05), whiteStripeMat);
        singleSki.add(stripe);

        // Upturned curved ski tip (tupp) at +X
        const tipCurve = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.042, 0.14), playerMat);
        tipCurve.position.set(0.68, 0.06, 0);
        tipCurve.rotation.z = 0.48;
        tipCurve.castShadow = true;
        singleSki.add(tipCurve);

        // Pointed apex of ski tip
        const tipPoint = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), whiteStripeMat);
        tipPoint.rotation.z = -Math.PI / 2 + 0.65;
        tipPoint.rotation.y = Math.PI / 4;
        tipPoint.position.set(0.84, 0.15, 0);
        singleSki.add(tipPoint);

        // Detailed Ski Binding & Boot Heelpiece
        const toePiece = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.13), bindingMat);
        toePiece.position.set(0.08, 0.05, 0);
        singleSki.add(toePiece);

        const heelPiece = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.12), goldMat);
        heelPiece.position.set(-0.14, 0.05, 0);
        singleSki.add(heelPiece);

        return singleSki;
      };

      // Classic V-style / parallel ski pair
      skiGroup.add(makeJumpingSki(-0.14, 0.09));
      skiGroup.add(makeJumpingSki(0.14, -0.09));

      // Two Ski Poles with grips & snow baskets planted on each side
      const poleShaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
      [-0.31, 0.31].forEach((zPole, idx) => {
        const poleGrp = new THREE.Group();
        poleGrp.position.set(-0.08, 0.52, zPole);
        poleGrp.rotation.z = idx === 0 ? -0.22 : -0.15;
        poleGrp.rotation.x = idx === 0 ? 0.12 : -0.12;

        // Metallic shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.016, 0.92, 8), poleShaftMat);
        shaft.castShadow = true;
        poleGrp.add(shaft);

        // Ergonomic top grip
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.16, 10), bindingMat);
        grip.position.y = 0.42;
        poleGrp.add(grip);

        // Snow basket ring near bottom (trinse)
        const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 12), bindingMat);
        basket.position.y = -0.34;
        poleGrp.add(basket);

        skiGroup.add(poleGrp);
      });

      group.add(skiGroup);
    }

    // ==================== 4. KALLERUD-STUDENTEN (🎓 NTNU Mortarboard & Diploma) ====================
    else if (tokenId === 'ntnu') {
      const ntnuGroup = new THREE.Group();
      ntnuGroup.position.y = 0.2;

      const velvetBlackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.55, metalness: 0.1 });
      const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.4 });
      const ntnuBlueMat = new THREE.MeshStandardMaterial({ color: 0x00509e, roughness: 0.35 });

      // Bottom textbook (NTNU Ingeniørfag / Cyber)
      const bookCover = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.14, 0.62), ntnuBlueMat);
      bookCover.position.y = 0.07;
      bookCover.rotation.y = 0.12;
      bookCover.castShadow = true;
      ntnuGroup.add(bookCover);

      const bookPages = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.10, 0.58), pagesMat);
      bookPages.position.set(0.02, 0.07, 0);
      bookPages.rotation.y = 0.12;
      ntnuGroup.add(bookPages);

      // Academic Graduation Cap (Studentlue / Mortarboard) sitting on the book
      const capGroup = new THREE.Group();
      capGroup.position.set(-0.02, 0.14, -0.02);
      capGroup.rotation.z = 0.08;
      capGroup.rotation.x = 0.05;

      // Skullcap (pull) with player-colored academic band at bottom
      const skullCap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.28, 24), velvetBlackMat);
      skullCap.position.y = 0.16;
      skullCap.castShadow = true;
      capGroup.add(skullCap);

      const capBand = new THREE.Mesh(new THREE.CylinderGeometry(0.295, 0.285, 0.07, 24), playerMat);
      capBand.position.y = 0.06;
      capGroup.add(capBand);

      // Crisp Square Mortarboard Top with Gold Trim
      const boardTop = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.055, 0.86), velvetBlackMat);
      boardTop.position.y = 0.31;
      boardTop.rotation.y = Math.PI / 4; // Diamond orientation
      boardTop.castShadow = true;
      capGroup.add(boardTop);

      const boardTrim = new THREE.Mesh(new THREE.BoxGeometry(0.89, 0.025, 0.89), playerMat);
      boardTrim.position.y = 0.305;
      boardTrim.rotation.y = Math.PI / 4;
      capGroup.add(boardTrim);

      // Gold Center Button & Draped Golden Tassel (Dusk)
      const topButton = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), goldMat);
      topButton.position.y = 0.35;
      capGroup.add(topButton);

      // Tassel cord across the mortarboard
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 8), goldMat);
      cord.rotation.z = Math.PI / 2 - 0.08;
      cord.position.set(0.21, 0.35, 0.08);
      cord.rotation.y = -0.35;
      capGroup.add(cord);

      // Hanging tassel fringe over the edge
      const tasselDrop = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.26, 12), goldMat);
      tasselDrop.position.set(0.41, 0.21, 0.15);
      capGroup.add(tasselDrop);

      ntnuGroup.add(capGroup);

      // Rolled White Diploma Scroll with Ribbon Bow beside the cap
      const scrollGroup = new THREE.Group();
      scrollGroup.position.set(0.24, 0.18, 0.24);
      scrollGroup.rotation.x = Math.PI / 2;
      scrollGroup.rotation.z = 0.55;

      const parchment = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.64, 16), pagesMat);
      parchment.castShadow = true;
      scrollGroup.add(parchment);

      const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.11, 16), playerMat);
      scrollGroup.add(ribbon);

      ntnuGroup.add(scrollGroup);
      group.add(ntnuGroup);
    }

    // ==================== 5. TOTEN-TRAKTOREN (🚜 Ekte Traktor med store bakhjul, førerhus og eksosrør) ====================
    else if (tokenId === 'tractor') {
      const tractor = new THREE.Group();
      tractor.position.y = 0.20;

      const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.75, metalness: 0.1 });
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.5 });
      const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });
      const cabGlassMat = new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.65,
        roughness: 0.1,
        metalness: 0.8
      });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.9 });
      const headlightMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.75
      });

      // Helper to build a detailed tractor wheel with radial rubber lug treads & yellow rim
      const makeTractorWheel = (radius, width, lugCount) => {
        const wGrp = new THREE.Group();
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 24), tireMat);
        tire.rotation.x = Math.PI / 2;
        tire.castShadow = true;
        wGrp.add(tire);

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, width + 0.02, 20), rimMat);
        rim.rotation.x = Math.PI / 2;
        wGrp.add(rim);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, width + 0.04, 12), chassisMat);
        hub.rotation.x = Math.PI / 2;
        wGrp.add(hub);

        // Deep tractor tire treads (knaster)
        for (let i = 0; i < lugCount; i++) {
          const ang = (i / lugCount) * Math.PI * 2;
          const lug = new THREE.Mesh(
            new THREE.BoxGeometry(radius * 0.18, 0.045, width * 0.92),
            tireMat
          );
          lug.position.set(Math.cos(ang) * radius, Math.sin(ang) * radius, 0);
          lug.rotation.z = ang + Math.PI / 2;
          wGrp.add(lug);
        }
        return wGrp;
      };

      // Two HUGE Rear Tractor Wheels (at -X)
      [-0.36, 0.36].forEach(zSide => {
        const rearWheel = makeTractorWheel(0.27, 0.19, 12);
        rearWheel.position.set(-0.24, 0.27, zSide);
        tractor.add(rearWheel);

        // Curved Rear Mudguards (bakskjermer) over the rear tires
        const fender = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.21), playerMat);
        fender.position.set(-0.24, 0.57, zSide);
        fender.castShadow = true;
        tractor.add(fender);
      });

      // Two Smaller Front Steered Wheels (at +X)
      [-0.31, 0.31].forEach(zSide => {
        const frontWheel = makeTractorWheel(0.16, 0.12, 8);
        frontWheel.position.set(0.36, 0.16, zSide);
        tractor.add(frontWheel);
      });

      // Heavy Cast-Iron Underbody Chassis & Axles
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.16, 0.36), chassisMat);
      chassis.position.set(0.06, 0.24, 0);
      tractor.add(chassis);

      // Sculpted Engine Hood (Panser) pointing forward (+X)
      const hood = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.30, 0.36), playerMat);
      hood.position.set(0.24, 0.44, 0);
      hood.castShadow = true;
      tractor.add(hood);

      // Rounded top nose of hood
      const hoodTop = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.55, 16), playerMat);
      hoodTop.rotation.z = Math.PI / 2;
      hoodTop.position.set(0.24, 0.56, 0);
      hoodTop.scale.set(1, 0.65, 1);
      tractor.add(hoodTop);

      // Dark Front Radiator Grille & Twin Glowing Headlights
      const grille = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.28), chassisMat);
      grille.position.set(0.52, 0.44, 0);
      tractor.add(grille);

      [-0.17, 0.17].forEach(zLight => {
        const lampHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.07, 12), chassisMat);
        lampHousing.rotation.z = Math.PI / 2;
        lampHousing.position.set(0.49, 0.49, zLight);
        tractor.add(lampHousing);

        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12), headlightMat);
        lens.rotation.z = Math.PI / 2;
        lens.position.set(0.50, 0.49, zLight);
        tractor.add(lens);
      });

      // Tall Vertical Exhaust Pipe (Eksosrør) with Muffler & Flap on the Hood
      const exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.56, 10), chromeMat);
      exhaustPipe.position.set(0.28, 0.78, 0.13);
      exhaustPipe.castShadow = true;
      tractor.add(exhaustPipe);

      const muffler = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 12), chassisMat);
      muffler.position.set(0.28, 0.74, 0.13);
      tractor.add(muffler);

      const exhaustFlap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 10), chromeMat);
      exhaustFlap.position.set(0.29, 1.07, 0.13);
      exhaustFlap.rotation.z = -0.35;
      tractor.add(exhaustFlap);

      // Enclosed Driver Cab (Førerhus) with Glass Windows, Corner Pillars & Roof
      const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.40, 0.42), cabGlassMat);
      cabGlass.position.set(-0.20, 0.74, 0);
      tractor.add(cabGlass);

      // 4 Black ROPS Cab Pillars
      [[-0.40, -0.20], [-0.40, 0.20], [0.0, -0.20], [0.0, 0.20]].forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.42, 0.035), chassisMat);
        pillar.position.set(px, 0.74, pz);
        tractor.add(pillar);
      });

      // Tractor Cab Roof & Rotating Amber Beacon (Varsellampe)
      const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.48), playerMat);
      cabRoof.position.set(-0.20, 0.96, 0);
      cabRoof.castShadow = true;
      tractor.add(cabRoof);

      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.08, 12), headlightMat);
      beacon.position.set(-0.20, 1.02, 0);
      tractor.add(beacon);

      group.add(tractor);
    }

    // ==================== 6. BYVÅPEN-SVANEN (🦢 Gjøviks Hvite Svane med løftede vinger og S-hals) ====================
    else {
      const swan = new THREE.Group();
      swan.position.y = 0.20;

      const whitePlumageMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.22,
        metalness: 0.05
      });
      const beakMat = new THREE.MeshStandardMaterial({
        color: 0xea580c,
        roughness: 0.3,
        metalness: 0.1
      });
      const blackMaskMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3
      });

      // Heraldic Water Cushion in player/royal color on top of pedestal
      const waterCushion = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.07, 24), playerMat);
      waterCushion.position.y = 0.03;
      swan.add(waterCushion);

      // Plump Sculpted White Swan Body
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 18), whitePlumageMat);
      body.scale.set(1.38, 0.78, 0.92);
      body.position.set(-0.04, 0.26, 0);
      body.castShadow = true;
      swan.add(body);

      // Breast swell at front (+X)
      const breast = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 16), whitePlumageMat);
      breast.scale.set(1.0, 0.88, 0.85);
      breast.position.set(0.20, 0.30, 0);
      swan.add(breast);

      // Upturned Pointed Tail Feathers at Stern (-X)
      for (let t = -1; t <= 1; t++) {
        const tailFeather = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 8), whitePlumageMat);
        tailFeather.position.set(-0.46, 0.34, t * 0.07);
        tailFeather.rotation.z = 0.95;
        tailFeather.rotation.y = t * 0.2;
        tailFeather.castShadow = true;
        swan.add(tailFeather);
      }

      // Majestic Raised, Arched Multi-Tiered Wings (Som på Gjøviks byvåpen!)
      [-1, 1].forEach(sideSign => {
        const wingGroup = new THREE.Group();
        wingGroup.position.set(-0.02, 0.34, sideSign * 0.23);
        wingGroup.rotation.x = sideSign * 0.28; // Flared gracefully outward
        wingGroup.rotation.z = 0.18;

        // 3 Tiered Feather Layers curving upward and back
        [
          { w: 0.56, h: 0.42, x: -0.04, y: 0.16, rotZ: 0.25 },
          { w: 0.48, h: 0.34, x: -0.12, y: 0.32, rotZ: 0.42 },
          { w: 0.38, h: 0.24, x: -0.20, y: 0.46, rotZ: 0.58 }
        ].forEach((tier, idx) => {
          const featherLayer = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 16, 12),
            whitePlumageMat
          );
          featherLayer.scale.set(tier.w / 0.28, tier.h / 0.28, 0.22);
          featherLayer.position.set(tier.x, tier.y, sideSign * idx * 0.02);
          featherLayer.rotation.z = tier.rotZ;
          featherLayer.castShadow = true;
          wingGroup.add(featherLayer);
        });

        swan.add(wingGroup);
      });

      // Graceful S-Curved Swan Neck using CatmullRomCurve3 + TubeGeometry
      const neckCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.24, 0.32, 0),
        new THREE.Vector3(0.36, 0.50, 0),
        new THREE.Vector3(0.24, 0.76, 0),
        new THREE.Vector3(0.30, 0.96, 0),
        new THREE.Vector3(0.40, 0.94, 0)
      ]);
      const neckGeo = new THREE.TubeGeometry(neckCurve, 24, 0.072, 14, false);
      const neckMesh = new THREE.Mesh(neckGeo, whitePlumageMat);
      neckMesh.castShadow = true;
      swan.add(neckMesh);

      // Sculpted Swan Head at top of S-curve
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 14), whitePlumageMat);
      head.scale.set(1.25, 0.92, 0.88);
      head.position.set(0.41, 0.94, 0);
      head.castShadow = true;
      swan.add(head);

      // Mute Swan Black Basal Knob (Nebbknøl) & Eyes
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), blackMaskMat);
      knob.position.set(0.50, 0.97, 0);
      swan.add(knob);

      [-0.065, 0.065].forEach(zEye => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), blackMaskMat);
        eye.position.set(0.45, 0.96, zEye);
        swan.add(eye);
      });

      // Vibrant Orange Pointed Swan Beak (+X forward)
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 12), beakMat);
      beak.rotation.z = -Math.PI / 2 - 0.15;
      beak.position.set(0.57, 0.92, 0);
      swan.add(beak);

      // Small Golden Crown on the Swan's Head
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.042, 0.06, 8), goldMat);
      crown.position.set(0.39, 1.04, 0);
      swan.add(crown);

      group.add(swan);
    }

    return group;
  }

  getPlayerSlotPosition(tileId, playerIdx, totalPlayers) {
    const center = this.tilePositions[tileId] || new THREE.Vector3();
    const angle = (playerIdx / Math.max(totalPlayers, 1)) * Math.PI * 2;
    const radius = 0.62;
    return new THREE.Vector3(
      center.x + Math.cos(angle) * radius,
      0.4,
      center.z + Math.sin(angle) * radius
    );
  }

  // Animate a token hopping step-by-step around the board while facing forward along the street!
  async animatePlayerStep(playerId, targetTileId, playerIdx, totalPlayers) {
    const token = this.playerTokens.get(playerId);
    if (!token) return;

    const startPos = token.position.clone();
    const endPos = this.getPlayerSlotPosition(targetTileId, playerIdx, totalPlayers);
    const targetRotY = this.getTrackForwardAngle(targetTileId);

    // Calculate movement vector so the token faces the direction it hops
    const dx = endPos.x - startPos.x;
    const dz = endPos.z - startPos.z;
    const moveRotY = Math.hypot(dx, dz) > 0.05 ? Math.atan2(-dz, dx) : targetRotY;

    this.followTargetPos.copy(endPos);

    return new Promise(resolve => {
      const duration = 185;
      const startTime = performance.now();

      const tick = (now) => {
        const t = Math.min((now - startTime) / duration, 1);
        token.position.lerpVectors(startPos, endPos, t);
        token.position.y = 0.4 + Math.sin(t * Math.PI) * 1.15;
        token.rotation.y = moveRotY;
        // Slight joyful forward pitch during the jump arc
        token.rotation.z = Math.sin(t * Math.PI) * -0.14;

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          token.position.copy(endPos);
          token.rotation.y = targetRotY;
          token.rotation.z = 0;
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  // Update 3D Ownership Strip & 3D Houses/Hotels on a Tile
  updateTileOwnershipAndBuildings(tileId, ownerColorHex, housesCount, isMortgaged) {
    const bGroup = this.buildingGroups.get(tileId);
    if (!bGroup) return;

    // Clear old children
    while (bGroup.children.length > 0) {
      bGroup.remove(bGroup.children[0]);
    }

    if (!ownerColorHex) return;

    // Dark contrasting base frame so every player color (including yellow & white) pops clearly
    const frameGeo = new THREE.BoxGeometry(2.38, 0.08, 0.46);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0.03, 1.55);
    bGroup.add(frame);

    // Ownership glowing strip on outer edge of tile
    const stripGeo = new THREE.BoxGeometry(2.26, 0.20, 0.36);
    const stripMat = new THREE.MeshStandardMaterial({
      color: isMortgaged ? 0x475569 : ownerColorHex,
      emissive: isMortgaged ? 0x000000 : ownerColorHex,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.25
    });
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(0, 0.11, 1.55);
    strip.castShadow = true;
    bGroup.add(strip);

    // Corner owner bollards on outer left & right of the strip for 3D visibility from low angles
    [-1.04, 1.04].forEach(xSide => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 0.34, 14),
        stripMat
      );
      post.position.set(xSide, 0.17, 1.55);
      post.castShadow = true;
      bGroup.add(post);
    });

    if (isMortgaged) return;

    // Add 3D Houses (1-4) or 3D Hotel (5) along the top color bar of the tile
    if (housesCount >= 1 && housesCount <= 4) {
      for (let h = 0; h < housesCount; h++) {
        const house = this.create3DHouse();
        const xOffset = -0.82 + h * 0.55;
        house.position.set(xOffset, 0, -1.22);
        bGroup.add(house);
      }
    } else if (housesCount === 5) {
      const hotel = this.create3DHotel();
      hotel.position.set(0, 0, -1.22);
      bGroup.add(hotel);
    }
  }

  create3DHouse() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.36, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 })
    );
    base.position.y = 0.18;
    base.castShadow = true;
    g.add(base);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(0.36, 0.3, 4),
      new THREE.MeshStandardMaterial({ color: 0x15803d })
    );
    roof.position.y = 0.51;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
    return g;
  }

  create3DHotel() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.68, 0.56),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 })
    );
    base.position.y = 0.34;
    base.castShadow = true;
    g.add(base);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.14, 0.64),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.6 })
    );
    roof.position.y = 0.75;
    g.add(roof);
    return g;
  }

  // Celebration 3D Confetti Burst at a World Position
  spawnCelebrationParticles(worldPos, colorHex = '#fbbf24') {
    const pos = worldPos || new THREE.Vector3(0, 2, 0);
    for (let i = 0; i < 36; i++) {
      const pMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.22, 0.06),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? colorHex : '#38bdf8',
          emissive: colorHex,
          emissiveIntensity: 0.5
        })
      );
      pMesh.position.copy(pos);
      pMesh.position.y += 1.0;
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        4 + Math.random() * 6,
        (Math.random() - 0.5) * 8
      );
      this.scene.add(pMesh);
      this.particles.push({ mesh: pMesh, vel, life: 1.4 });
    }
  }

  setCameraMode(mode, activePlayerPos) {
    this.cameraMode = mode;
    if (activePlayerPos) {
      this.followTargetPos.copy(activePlayerPos);
    }
    if (mode === 'orbit') {
      this.controls.enabled = true;
      this.desiredCamPos.set(0, 38, 42);
      this.desiredLookAt.set(0, 0, 2);
    } else if (mode === 'top') {
      this.controls.enabled = true;
      this.desiredCamPos.set(0, 52, 0.1);
      this.desiredLookAt.set(0, 0, 0);
    } else if (mode === 'follow') {
      this.controls.enabled = true;
    }
  }

  focusOnTile(tileId) {
    const pos = this.tilePositions[tileId];
    if (!pos) return;
    this.followTargetPos.copy(pos);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.renderer.domElement.addEventListener('pointerdown', (e) => {
      this.downX = e.clientX;
      this.downY = e.clientY;
    });

    this.renderer.domElement.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - this.downX, e.clientY - this.downY);
      if (dist > 6) return; // Dragged camera

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.tileMeshes);
      if (intersects.length > 0) {
        const tileId = intersects[0].object.userData.tileId;
        if (this.onTileSelect) {
          this.onTileSelect(tileId);
        }
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    // 1. Animate Mjøsa Water Waves
    if (this.waterMesh) {
      const pos = this.waterMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vz = pos.getZ(i);
        const wave = Math.sin(vx * 0.18 + elapsed * 1.8) * 0.18 +
                     Math.cos(vz * 0.18 + elapsed * 1.4) * 0.18;
        pos.setY(i, this.waterBaseY[i] + wave);
      }
      pos.needsUpdate = true;
    }

    // 2. Sail Skibladner around the Gjøvik Island!
    if (this.skibladner) {
      this.skibladnerAngle += dt * 0.15;
      const radius = 29.8;
      const sx = Math.cos(this.skibladnerAngle) * radius;
      const sz = Math.sin(this.skibladnerAngle) * radius;
      this.skibladner.position.set(sx, -1.12 + Math.sin(elapsed * 3) * 0.05, sz);
      // Align +X clipper bow with tangent direction (-sin(a), 0, cos(a))
      this.skibladner.rotation.y = -this.skibladnerAngle - Math.PI / 2;
      if (this.paddleWheel) {
        this.paddleWheel.rotation.z -= dt * 5.0;
      }

      // Puff steam smoke from the top of Skibladner's tall black smokestack
      if (Math.random() < 0.25) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.72 })
        );
        puff.position.set(sx, 3.05, sz);
        this.scene.add(puff);
        this.smokeParticles.push({ mesh: puff, life: 1.7 });
      }
    }

    // Update steam smoke
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const sp = this.smokeParticles[i];
      sp.life -= dt;
      sp.mesh.position.y += dt * 1.4;
      sp.mesh.scale.addScalar(dt * 0.8);
      sp.mesh.material.opacity = Math.max(0, sp.life * 0.45);
      if (sp.life <= 0) {
        this.scene.remove(sp.mesh);
        this.smokeParticles.splice(i, 1);
      }
    }

    // 3. Update 3D Dice Physics
    for (let i = 0; i < 2; i++) {
      const phys = this.dicePhysics[i];
      const die = this.diceMeshes[i];
      if (phys && phys.active) {
        phys.vel.y -= 24 * dt; // Gravity
        die.position.addScaledVector(phys.vel, dt);
        die.rotation.x += phys.angVel.x * dt;
        die.rotation.y += phys.angVel.y * dt;
        die.rotation.z += phys.angVel.z * dt;

        // Bounce on board floor (y = 0.85)
        if (die.position.y < 0.85) {
          die.position.y = 0.85;
          phys.vel.y = Math.abs(phys.vel.y) * 0.48;
          phys.vel.x *= 0.68;
          phys.vel.z *= 0.68;
          phys.angVel.multiplyScalar(0.6);
        }

        if (performance.now() - phys.startTime > 720) {
          phys.active = false;
          die.position.y = 0.85;
          die.rotation.copy(phys.targetRot);
        }
      }
    }

    // 4. Update Confetti Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.vel.y -= 15 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += 5 * dt;
      p.mesh.rotation.y += 5 * dt;
      if (p.life <= 0 || p.mesh.position.y < 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    // 5. Camera Modes
    if (this.cameraMode === 'follow') {
      const target = this.followTargetPos;
      const idealCam = new THREE.Vector3(target.x * 1.35, 14, target.z * 1.35 + 10);
      this.camera.position.lerp(idealCam, 0.05);
      this.controls.target.lerp(target, 0.08);
    } else if (this.cameraMode === 'top') {
      this.camera.position.lerp(this.desiredCamPos, 0.06);
      this.controls.target.lerp(this.desiredLookAt, 0.08);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
