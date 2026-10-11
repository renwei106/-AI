/* Gravity Simulator core, Copyright (c) 2026 Dimitriuses, MIT. See gravity-LICENSE.txt and gravity-UPSTREAM.json. */
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// vendor/gravity-simulator/src/Vector2D.ts
var Vector2D = class _Vector2D {
  constructor(x = 0, y = 0) {
    __publicField(this, "x", x);
    __publicField(this, "y", y);
  }
  /**
   * Add another vector to this vector
   */
  add(v) {
    return new _Vector2D(this.x + v.x, this.y + v.y);
  }
  /**
   * Subtract another vector from this vector
   */
  sub(v) {
    return new _Vector2D(this.x - v.x, this.y - v.y);
  }
  /**
   * Multiply vector by a scalar
   */
  mult(scalar) {
    return new _Vector2D(this.x * scalar, this.y * scalar);
  }
  /**
   * Divide vector by a scalar
   */
  div(scalar) {
    if (scalar === 0) return new _Vector2D(0, 0);
    return new _Vector2D(this.x / scalar, this.y / scalar);
  }
  /**
   * Get the magnitude (length) of the vector
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  /**
   * Get the squared magnitude (avoids sqrt for performance)
   */
  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }
  /**
   * Dot product. Used by the collision solver to split a relative velocity into
   * the part along the contact normal (which bounces) and the part across it
   * (which does not).
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  /**
   * Normalize the vector (make it unit length)
   */
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new _Vector2D(0, 0);
    return this.div(mag);
  }
  /**
   * Limit the magnitude of the vector
   */
  limit(max) {
    const mag = this.magnitude();
    if (mag > max) {
      return this.normalize().mult(max);
    }
    return new _Vector2D(this.x, this.y);
  }
  /**
   * Create a copy of this vector
   */
  copy() {
    return new _Vector2D(this.x, this.y);
  }
  /**
   * Calculate distance to another vector
   */
  dist(v) {
    return this.sub(v).magnitude();
  }
  /**
   * Static method to create a vector from angle and magnitude
   */
  static fromAngle(angle, magnitude = 1) {
    return new _Vector2D(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }
};

// vendor/gravity-simulator/src/quadtree.ts
var DEFAULT_THETA = 0.5;
var MAX_DEPTH = 24;
var QuadNode = class {
  constructor(cx, cy, half) {
    __publicField(this, "cx", cx);
    __publicField(this, "cy", cy);
    __publicField(this, "half", half);
    /** Total mass in this node, and where its centre of mass sits. */
    __publicField(this, "mass", 0);
    __publicField(this, "comX", 0);
    __publicField(this, "comY", 0);
    /** Largest body radius anywhere under this node; used by contact queries. */
    __publicField(this, "maxRadius", 0);
    /**
     * Largest single mass and largest speed anywhere under this node.
     *
     * Both are upper bounds used to prune the timescale search: a cell cannot
     * contain a pair that interacts faster than its heaviest, fastest member
     * would at the cell's nearest edge.
     */
    __publicField(this, "maxMass", 0);
    __publicField(this, "maxSpeed", 0);
    /** Indices into the body array. Non-empty only for leaves. */
    __publicField(this, "bodies", []);
    /** Four children, or null while this is a leaf. */
    __publicField(this, "children", null);
  }
};
var QuadTree = class _QuadTree {
  constructor(bodies, root) {
    __publicField(this, "bodies", bodies);
    __publicField(this, "root");
    this.root = root;
  }
  /**
   * Build a tree over `bodies`.
   *
   * The root is the smallest square containing every body, padded slightly so
   * nothing sits exactly on a boundary. An empty list still yields a usable
   * tree, so callers do not need to special-case it.
   */
  static build(bodies) {
    if (bodies.length === 0) {
      return new _QuadTree(bodies, new QuadNode(0, 0, 1));
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const body of bodies) {
      if (body.x < minX) minX = body.x;
      if (body.y < minY) minY = body.y;
      if (body.x > maxX) maxX = body.x;
      if (body.y > maxY) maxY = body.y;
    }
    const half = Math.max((maxX - minX) / 2, (maxY - minY) / 2, 1e-6) * 1.01;
    const root = new QuadNode((minX + maxX) / 2, (minY + maxY) / 2, half);
    const tree = new _QuadTree(bodies, root);
    for (let i = 0; i < bodies.length; i++) {
      tree.insert(root, i, 0);
    }
    tree.summarise(root);
    return tree;
  }
  insert(node, index, depth) {
    if (node.children) {
      this.insert(node.children[this.quadrantOf(node, index)], index, depth + 1);
      return;
    }
    if (node.bodies.length === 0 || depth >= MAX_DEPTH) {
      node.bodies.push(index);
      return;
    }
    const existing = node.bodies;
    node.bodies = [];
    node.children = this.subdivide(node);
    for (const occupant of existing) {
      this.insert(node.children[this.quadrantOf(node, occupant)], occupant, depth + 1);
    }
    this.insert(node.children[this.quadrantOf(node, index)], index, depth + 1);
  }
  subdivide(node) {
    const quarter = node.half / 2;
    return [
      new QuadNode(node.cx - quarter, node.cy - quarter, quarter),
      new QuadNode(node.cx + quarter, node.cy - quarter, quarter),
      new QuadNode(node.cx - quarter, node.cy + quarter, quarter),
      new QuadNode(node.cx + quarter, node.cy + quarter, quarter)
    ];
  }
  quadrantOf(node, index) {
    const body = this.bodies[index];
    return (body.x >= node.cx ? 1 : 0) + (body.y >= node.cy ? 2 : 0);
  }
  /** Fill in mass, centre of mass and max radius, bottom up. */
  summarise(node) {
    node.mass = 0;
    node.comX = 0;
    node.comY = 0;
    node.maxRadius = 0;
    node.maxMass = 0;
    node.maxSpeed = 0;
    if (node.children) {
      for (const child of node.children) {
        this.summarise(child);
        if (child.mass === 0) continue;
        node.mass += child.mass;
        node.comX += child.comX * child.mass;
        node.comY += child.comY * child.mass;
        node.maxRadius = Math.max(node.maxRadius, child.maxRadius);
        node.maxMass = Math.max(node.maxMass, child.maxMass);
        node.maxSpeed = Math.max(node.maxSpeed, child.maxSpeed);
      }
    } else {
      for (const index of node.bodies) {
        const body = this.bodies[index];
        node.mass += body.mass;
        node.comX += body.x * body.mass;
        node.comY += body.y * body.mass;
        node.maxRadius = Math.max(node.maxRadius, body.radius);
        node.maxMass = Math.max(node.maxMass, body.mass);
        node.maxSpeed = Math.max(node.maxSpeed, Math.hypot(body.vx, body.vy));
      }
    }
    if (node.mass > 0) {
      node.comX /= node.mass;
      node.comY /= node.mass;
    }
  }
  /**
   * Acceleration on the body at `index` from everything else in the tree.
   *
   * Softening matches `forces.ts` exactly wherever individual bodies are
   * reached: a pair never pulls harder than it does at contact, the sum of the
   * two radii. A cell standing in for many bodies softens on its widest member
   * instead, which only matters in dense configurations — the opening angle
   * already guarantees a cell is far away before it is used at all.
   */
  accelerationOn(index, G, theta = DEFAULT_THETA) {
    const body = this.bodies[index];
    const acceleration = { x: 0, y: 0 };
    this.walk(this.root, body.x, body.y, body.radius, index, G, theta * theta, acceleration);
    return new Vector2D(acceleration.x, acceleration.y);
  }
  /**
   * Acceleration at a point that is not a body: the field, in other words.
   *
   * `maxRange` mirrors the range cutoff the field sampler has always applied —
   * bodies beyond it contribute nothing — and lets whole branches be discarded
   * without opening them.
   */
  accelerationAt(x, y, G, theta = DEFAULT_THETA, maxRange = Infinity) {
    const acceleration = { x: 0, y: 0 };
    this.walk(this.root, x, y, 0, -1, G, theta * theta, acceleration, maxRange);
    return new Vector2D(acceleration.x, acceleration.y);
  }
  /**
   * Gravitational potential at a point, −G·m/r summed over the tree.
   *
   * The same opening-angle rule as `accelerationAt`, so a cell far enough to
   * stand in for its contents does so here too, and theta = 0 is again the
   * exact sum. There is no range cutoff: a contour drawn from a potential that
   * ignored distant mass would break along the cutoff circle, and the whole
   * point of an equipotential is that it is global.
   */
  potentialAt(x, y, G, theta = DEFAULT_THETA) {
    return this.walkPotential(this.root, x, y, G, theta * theta);
  }
  walkPotential(node, x, y, G, thetaSquared) {
    if (node.mass === 0) return 0;
    const dx = node.comX - x;
    const dy = node.comY - y;
    const distanceSquared = dx * dx + dy * dy;
    if (node.children) {
      const width = node.half * 2;
      if (width * width < thetaSquared * distanceSquared) {
        const distance = Math.max(Math.sqrt(distanceSquared), node.maxRadius);
        return -(G * node.mass) / distance;
      }
      let total2 = 0;
      for (const child of node.children) {
        total2 += this.walkPotential(child, x, y, G, thetaSquared);
      }
      return total2;
    }
    let total = 0;
    for (const index of node.bodies) {
      const body = this.bodies[index];
      const bodyDx = body.x - x;
      const bodyDy = body.y - y;
      const distance = Math.max(Math.sqrt(bodyDx * bodyDx + bodyDy * bodyDy), body.radius);
      total -= G * body.mass / distance;
    }
    return total;
  }
  walk(node, x, y, radius, skip, G, thetaSquared, out, maxRange = Infinity) {
    if (node.mass === 0) return;
    if (maxRange !== Infinity && this.distanceToBox(node, x, y) > maxRange) return;
    const dx = node.comX - x;
    const dy = node.comY - y;
    const distanceSquared = dx * dx + dy * dy;
    if (node.children) {
      const width = node.half * 2;
      const wholeCellInRange = maxRange === Infinity || this.farDistanceToBox(node, x, y) <= maxRange;
      if (wholeCellInRange && width * width < thetaSquared * distanceSquared) {
        this.pull(dx, dy, distanceSquared, node.mass, node.maxRadius + radius, G, out);
        return;
      }
      for (const child of node.children) {
        this.walk(child, x, y, radius, skip, G, thetaSquared, out, maxRange);
      }
      return;
    }
    for (const index of node.bodies) {
      if (index === skip) continue;
      const body = this.bodies[index];
      const bodyDx = body.x - x;
      const bodyDy = body.y - y;
      const bodyDistanceSquared = bodyDx * bodyDx + bodyDy * bodyDy;
      if (maxRange !== Infinity && bodyDistanceSquared > maxRange * maxRange) continue;
      this.pull(bodyDx, bodyDy, bodyDistanceSquared, body.mass, body.radius + radius, G, out);
    }
  }
  /** One softened inverse-square pull, accumulated into `out`. */
  pull(dx, dy, distanceSquared, mass, contactDistance, G, out) {
    if (distanceSquared === 0) return;
    const softened = Math.max(distanceSquared, contactDistance * contactDistance);
    const distance = Math.sqrt(distanceSquared);
    const magnitude = G * mass / softened;
    out.x += dx / distance * magnitude;
    out.y += dy / distance * magnitude;
  }
  /**
   * The shortest interaction timescale between any two bodies in the tree —
   * the number the adaptive step rule divides the frame by.
   *
   * The rule wants a minimum over all pairs, which is a quadratic scan, and at
   * two thousand bodies it cost more than everything else in a frame put
   * together. This is the same minimum, found by branch and bound: for each
   * body, a cell is skipped when even its heaviest and fastest member, placed
   * at the cell's nearest edge, could not beat the best pair found so far.
   *
   * Both bounds are upper bounds on what a cell can contain, so nothing that
   * could win is ever skipped: **this returns exactly what the pairwise scan
   * returns**, which `tests/integrators.test.ts` checks directly rather than
   * taking on trust.
   */
  shortestInteractionTime(G) {
    return this.searchPair(this.root, this.root, G, Infinity);
  }
  /**
   * The shortest timescale between any body in `a` and any body in `b`, given
   * that nothing better than `best` has been found yet.
   *
   * Cells against cells, rather than each body against the tree. The bound is
   * the same idea either way — the optimistic pair the two cells could
   * possibly hold — but a cell-pair bound rejects a whole *block* of pairs at
   * once, where a body-against-cell bound rejects one body's share of them and
   * has to be re-derived for the next body. That is the difference between
   * pruning n times and pruning once.
   *
   * `a === b` is the self case, and it cannot be pruned: two bodies inside one
   * cell may be touching, so the optimistic separation is zero. It is split
   * instead, into each child against itself and each distinct pair of children,
   * which is also what keeps every pair counted exactly once.
   */
  searchPair(a, b, G, best) {
    if (a.mass === 0 || b.mass === 0) return best;
    if (a === b) {
      if (!a.children) return this.scanLeaf(a, best, G);
      for (const child of a.children) best = this.searchPair(child, child, G, best);
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          best = this.searchPair(a.children[i], a.children[j], G, best);
        }
      }
      return best;
    }
    if (this.pairBound(a, b, G) >= best) return best;
    if (!a.children && !b.children) return this.scanLeafPair(a, b, best, G);
    if (!a.children || b.children && b.half >= a.half) {
      for (const child of b.children) best = this.searchPair(a, child, G, best);
    } else {
      for (const child of a.children) best = this.searchPair(child, b, G, best);
    }
    return best;
  }
  /**
   * The most optimistic timescale any pair drawn from these two cells could
   * have: their nearest approach, their heaviest members, their fastest.
   *
   * It has to stay a *lower* bound — an over-optimistic bound only wastes
   * work, but a bound that is ever too high prunes away the answer. Nearest
   * edge-to-edge distance rather than centre-to-centre, `maxMass` and
   * `maxSpeed` rather than the cells' own totals, and the contact clamp left
   * off, since clamping only ever raises the separation.
   */
  pairBound(a, b, G) {
    const gap = this.distanceBetweenBoxes(a, b);
    if (gap <= 0) return 0;
    const dynamical = Math.sqrt(gap ** 3 / (G * (a.maxMass + b.maxMass)));
    const speed = a.maxSpeed + b.maxSpeed;
    const crossing2 = speed > 0 ? gap / speed : Infinity;
    return Math.min(dynamical, crossing2);
  }
  /** Every pair within one leaf. */
  scanLeaf(node, best, G) {
    for (let i = 0; i < node.bodies.length; i++) {
      for (let j = i + 1; j < node.bodies.length; j++) {
        best = Math.min(best, this.timescaleOf(node.bodies[i], node.bodies[j], G));
      }
    }
    return best;
  }
  /** Every pair across two different leaves. */
  scanLeafPair(a, b, best, G) {
    for (const i of a.bodies) {
      for (const j of b.bodies) {
        best = Math.min(best, this.timescaleOf(i, j, G));
      }
    }
    return best;
  }
  /**
   * The step rule's timescale for one pair: the smaller of how fast their own
   * gravity turns them and how long they stay at this separation. The same
   * arithmetic as the pairwise scan in `integrators.ts`, which is what it is
   * tested against.
   */
  timescaleOf(i, j, G) {
    const a = this.bodies[i];
    const b = this.bodies[j];
    const contact = a.radius + b.radius;
    const separation = Math.max(Math.hypot(b.x - a.x, b.y - a.y), contact);
    const dynamical = Math.sqrt(separation ** 3 / (G * (a.mass + b.mass)));
    const relativeSpeed = Math.hypot(b.vx - a.vx, b.vy - a.vy);
    const crossing2 = relativeSpeed > 0 ? separation / relativeSpeed : Infinity;
    return Math.min(dynamical, crossing2);
  }
  /** Nearest distance between two nodes' squares, zero if they touch or overlap. */
  distanceBetweenBoxes(a, b) {
    const reach = a.half + b.half;
    const dx = Math.max(Math.abs(a.cx - b.cx) - reach, 0);
    const dy = Math.max(Math.abs(a.cy - b.cy) - reach, 0);
    return Math.hypot(dx, dy);
  }
  /** Distance from a point to the node's square, zero if the point is inside. */
  distanceToBox(node, x, y) {
    const dx = Math.max(Math.abs(x - node.cx) - node.half, 0);
    const dy = Math.max(Math.abs(y - node.cy) - node.half, 0);
    return Math.sqrt(dx * dx + dy * dy);
  }
  /** Distance from a point to the farthest corner of the node's square. */
  farDistanceToBox(node, x, y) {
    const dx = Math.abs(x - node.cx) + node.half;
    const dy = Math.abs(y - node.cy) + node.half;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Indices of every body whose surface is within `radius` of the point —
   * the broad phase for contact detection.
   *
   * Each node knows the largest body radius beneath it, so a branch can be
   * discarded when even its widest member could not reach the query.
   */
  withinContact(x, y, radius, out) {
    this.collect(this.root, x, y, radius, out);
  }
  collect(node, x, y, radius, out) {
    if (node.mass === 0) return;
    if (this.distanceToBox(node, x, y) > radius + node.maxRadius) return;
    if (node.children) {
      for (const child of node.children) this.collect(child, x, y, radius, out);
      return;
    }
    for (const index of node.bodies) {
      const body = this.bodies[index];
      const dx = body.x - x;
      const dy = body.y - y;
      const reach = radius + body.radius;
      if (dx * dx + dy * dy < reach * reach) out.push(index);
    }
  }
};
function treeOf(particles) {
  return QuadTree.build(
    particles.map((particle) => ({
      x: particle.position.x,
      y: particle.position.y,
      mass: particle.mass,
      radius: particle.radius,
      vx: particle.velocity.x,
      vy: particle.velocity.y
    }))
  );
}
function treeAt(particles, positions) {
  return QuadTree.build(
    particles.map((particle, index) => ({
      x: positions[index].x,
      y: positions[index].y,
      mass: particle.mass,
      radius: particle.radius,
      vx: particle.velocity.x,
      vy: particle.velocity.y
    }))
  );
}

// vendor/gravity-simulator/src/contours.ts
var MAX_CONTOUR_CELLS = 6400;
function crossing(ax, ay, av, bx, by, bv, level) {
  const span = bv - av;
  const t = span === 0 ? 0.5 : (level - av) / span;
  return new Vector2D(ax + (bx - ax) * t, ay + (by - ay) * t);
}
function contourLevels(min, max, count) {
  const deepest = Math.abs(Math.min(min, max));
  const shallowest = Math.abs(Math.max(min, max));
  if (!Number.isFinite(deepest) || !Number.isFinite(shallowest)) return [];
  if (shallowest <= 0 || deepest <= shallowest) return [];
  const ratio = deepest / shallowest;
  const levels = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    levels.push(-shallowest * Math.pow(ratio, t));
  }
  return levels;
}
function sampleScalarGrid(scalarAt, view, resolution) {
  const width = view.maxX - view.minX;
  const height = view.maxY - view.minY;
  if (!(width > 0) || !(height > 0)) return null;
  const cell = Math.max(width, height) / resolution;
  let columns = Math.max(1, Math.ceil(width / cell));
  let rows = Math.max(1, Math.ceil(height / cell));
  if (columns * rows > MAX_CONTOUR_CELLS) {
    const shrink = Math.sqrt(columns * rows / MAX_CONTOUR_CELLS);
    columns = Math.max(1, Math.floor(columns / shrink));
    rows = Math.max(1, Math.floor(rows / shrink));
  }
  const stepX = width / columns;
  const stepY = height / rows;
  const values = new Float64Array((columns + 1) * (rows + 1));
  let min = Infinity;
  let max = -Infinity;
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const value = scalarAt(view.minX + column * stepX, view.minY + row * stepY);
      values[row * (columns + 1) + column] = value;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { values, columns, rows, min, max };
}
function traceContours(scalarAt, view, levelCount = 12, resolution = 90, refineNear = [], fixedLevels) {
  const lattice = Lattice.over(view, resolution, scalarAt);
  if (!lattice) return [];
  lattice.sampleCoarse();
  const levels = fixedLevels ?? contourLevels(lattice.min, lattice.max, levelCount);
  if (levels.length === 0) return [];
  const ascending = levels.map((level, index) => ({ level, index })).sort((a, b) => a.level - b.level);
  const segments = levels.map(() => []);
  const forced = lattice.cellsAround(refineNear);
  for (let row = 0; row < lattice.coarseRows; row++) {
    for (let column = 0; column < lattice.coarseColumns; column++) {
      if (!forced.has(row * lattice.coarseColumns + column)) {
        if (!lattice.worthRefining(column, row, ascending)) continue;
      }
      lattice.refine(column, row);
      for (let sub = 0; sub < 4; sub++) {
        lattice.marchFine(2 * column + (sub & 1), 2 * row + (sub >> 1), ascending, segments);
      }
    }
  }
  const lines = [];
  levels.forEach((level, index) => {
    if (segments[index].length > 0) lines.push({ level, segments: segments[index] });
  });
  return lines;
}
var Lattice = class _Lattice {
  constructor(scalarAt, view, columns, rows, stepX, stepY) {
    __publicField(this, "scalarAt", scalarAt);
    __publicField(this, "view", view);
    __publicField(this, "columns", columns);
    __publicField(this, "rows", rows);
    __publicField(this, "stepX", stepX);
    __publicField(this, "stepY", stepY);
    __publicField(this, "values");
    __publicField(this, "filled");
    __publicField(this, "min", Infinity);
    __publicField(this, "max", -Infinity);
    this.values = new Float64Array((columns + 1) * (rows + 1));
    this.filled = new Uint8Array((columns + 1) * (rows + 1));
  }
  /** Fine cells across, and down: even, so the coarse pass is exactly half. */
  static over(view, resolution, scalarAt) {
    const width = view.maxX - view.minX;
    const height = view.maxY - view.minY;
    if (!(width > 0) || !(height > 0)) return null;
    const cell = Math.max(width, height) / resolution;
    let columns = Math.max(1, Math.ceil(width / cell));
    let rows = Math.max(1, Math.ceil(height / cell));
    if (columns * rows > MAX_CONTOUR_CELLS) {
      const shrink = Math.sqrt(columns * rows / MAX_CONTOUR_CELLS);
      columns = Math.max(1, Math.floor(columns / shrink));
      rows = Math.max(1, Math.floor(rows / shrink));
    }
    columns += columns % 2;
    rows += rows % 2;
    return new _Lattice(scalarAt, view, columns, rows, width / columns, height / rows);
  }
  get coarseColumns() {
    return this.columns / 2;
  }
  get coarseRows() {
    return this.rows / 2;
  }
  /** The value at fine lattice point (i, j), evaluating it if it is new. */
  at(i, j) {
    const index = j * (this.columns + 1) + i;
    if (this.filled[index] === 0) {
      const value = this.scalarAt(this.view.minX + i * this.stepX, this.view.minY + j * this.stepY);
      this.values[index] = value;
      this.filled[index] = 1;
      if (value < this.min) this.min = value;
      if (value > this.max) this.max = value;
    }
    return this.values[index];
  }
  /** Every other point: the first pass, and where the levels come from. */
  sampleCoarse() {
    for (let j = 0; j <= this.rows; j += 2) {
      for (let i = 0; i <= this.columns; i += 2) this.at(i, j);
    }
  }
  /**
   * The coarse cells holding the points a caller says are worth a closer look.
   *
   * Refinement that only follows the readings is blind to anything smaller
   * than its first cell — the same trap the gradient arrow mode fell into,
   * where a small body sitting in a cell dominated by a large one produced no
   * arrows at all. A caller that knows where the structure is names those
   * places, and their cells are refined whether or not the coarse pass found
   * them interesting.
   *
   * Cells, not samples: forcing a patch of *points* around every body cost more
   * at three hundred bodies than the thinning saved, since the patches overlap
   * and most of them land on ground the coarse pass was going to refine anyway.
   */
  cellsAround(points) {
    const cells = /* @__PURE__ */ new Set();
    for (const point of points) {
      const column = Math.floor((point.x - this.view.minX) / (this.stepX * 2));
      const row = Math.floor((point.y - this.view.minY) / (this.stepY * 2));
      if (column < 0 || row < 0 || column >= this.coarseColumns || row >= this.coarseRows) {
        continue;
      }
      cells.add(row * this.coarseColumns + column);
    }
    return cells;
  }
  /** Does any level pass through this coarse cell, as its corners see it? */
  worthRefining(column, row, levels) {
    const i = column * 2;
    const j = row * 2;
    const a = this.at(i, j);
    const b = this.at(i + 2, j);
    const c = this.at(i + 2, j + 2);
    const d = this.at(i, j + 2);
    const lowest = Math.min(a, b, c, d);
    const highest = Math.max(a, b, c, d);
    const first = lowerBound(levels, lowest);
    return first < levels.length && levels[first].level < highest;
  }
  /** Sample the five interior points a coarse cell needs to become four. */
  refine(column, row) {
    const i = column * 2;
    const j = row * 2;
    this.at(i + 1, j);
    this.at(i, j + 1);
    this.at(i + 1, j + 1);
    this.at(i + 2, j + 1);
    this.at(i + 1, j + 2);
  }
  /** March one fine cell against every level that crosses it. */
  marchFine(i, j, levels, segments) {
    const topLeft = this.at(i, j);
    const topRight = this.at(i + 1, j);
    const bottomRight = this.at(i + 1, j + 1);
    const bottomLeft = this.at(i, j + 1);
    const lowest = Math.min(topLeft, topRight, bottomRight, bottomLeft);
    const highest = Math.max(topLeft, topRight, bottomRight, bottomLeft);
    let first = lowerBound(levels, lowest);
    if (first >= levels.length || levels[first].level >= highest) return;
    const x0 = this.view.minX + i * this.stepX;
    const y0 = this.view.minY + j * this.stepY;
    for (; first < levels.length && levels[first].level < highest; first++) {
      marchCell(
        segments[levels[first].index],
        levels[first].level,
        x0,
        y0,
        x0 + this.stepX,
        y0 + this.stepY,
        topLeft,
        topRight,
        bottomRight,
        bottomLeft
      );
    }
  }
};
function lowerBound(levels, value) {
  let low = 0;
  let high = levels.length;
  while (low < high) {
    const middle = low + high >> 1;
    if (levels[middle].level < value) low = middle + 1;
    else high = middle;
  }
  return low;
}
function marchCell(out, level, x0, y0, x1, y1, topLeft, topRight, bottomRight, bottomLeft) {
  const code = (topLeft > level ? 8 : 0) | (topRight > level ? 4 : 0) | (bottomRight > level ? 2 : 0) | (bottomLeft > level ? 1 : 0);
  if (code === 0 || code === 15) return;
  const top = () => crossing(x0, y0, topLeft, x1, y0, topRight, level);
  const right = () => crossing(x1, y0, topRight, x1, y1, bottomRight, level);
  const bottom = () => crossing(x0, y1, bottomLeft, x1, y1, bottomRight, level);
  const left = () => crossing(x0, y0, topLeft, x0, y1, bottomLeft, level);
  switch (code) {
    case 1:
    case 14:
      out.push({ from: left(), to: bottom() });
      break;
    case 2:
    case 13:
      out.push({ from: bottom(), to: right() });
      break;
    case 3:
    case 12:
      out.push({ from: left(), to: right() });
      break;
    case 4:
    case 11:
      out.push({ from: top(), to: right() });
      break;
    case 6:
    case 9:
      out.push({ from: top(), to: bottom() });
      break;
    case 7:
    case 8:
      out.push({ from: left(), to: top() });
      break;
    // The two ambiguous cases, where opposite corners are on one side of the
    // level and the other two on the other. Resolved by the cell's average: it
    // decides which pair of corners is actually connected, and gets the saddle
    // between two bodies right — which is exactly where this matters.
    case 5:
    case 10: {
      const middle = (topLeft + topRight + bottomRight + bottomLeft) / 4;
      const joined = code === 5 ? middle > level : middle <= level;
      if (joined) {
        out.push({ from: left(), to: top() });
        out.push({ from: bottom(), to: right() });
      } else {
        out.push({ from: left(), to: bottom() });
        out.push({ from: top(), to: right() });
      }
      break;
    }
  }
}

// vendor/gravity-simulator/src/streamlines.ts
var MAX_STREAMLINE_STEPS = 6e3;
var MIN_SEGMENT_FRACTION = 0.25;
var REVERSAL_COSINE = 0;
function defaultStreamlineOptions(view) {
  const span = Math.max(view.maxX - view.minX, view.maxY - view.minY);
  return {
    spacing: span / 26,
    stepLength: span / 160,
    maxStepsPerLine: 220,
    maxTotalSteps: MAX_STREAMLINE_STEPS
  };
}
var inside = (point, view, margin) => point.x >= view.minX - margin && point.x <= view.maxX + margin && point.y >= view.minY - margin && point.y <= view.maxY + margin;
function traceStreamlines(fieldAt, view, options) {
  const { spacing, stepLength, maxStepsPerLine, maxTotalSteps } = options;
  if (!(spacing > 0) || !(stepLength > 0)) return [];
  const occupancy = new OccupancyGrid(spacing);
  const lines = [];
  let stepsSpent = 0;
  const tooClose = (point) => occupancy.has(point.x, point.y, spacing / 2);
  const follow = (seed, sign) => {
    const points = [];
    let point = seed;
    let previousDirection = null;
    for (let step = 0; step < maxStepsPerLine && stepsSpent < maxTotalSteps; step++) {
      const first = fieldAt(point.x, point.y);
      stepsSpent++;
      if (first.magnitude() === 0) break;
      const halfway = point.add(first.normalize().mult(sign * stepLength / 2));
      const second = fieldAt(halfway.x, halfway.y);
      stepsSpent++;
      if (second.magnitude() === 0) break;
      const direction = second.normalize();
      if (previousDirection && direction.dot(previousDirection) < REVERSAL_COSINE) break;
      previousDirection = direction;
      const next = point.add(direction.mult(sign * stepLength));
      if (!inside(next, view, spacing)) break;
      if (tooClose(next)) break;
      points.push(next);
      point = next;
    }
    return points;
  };
  const seedSpacing = spacing;
  const firstX = Math.floor(view.minX / seedSpacing) * seedSpacing;
  const firstY = Math.floor(view.minY / seedSpacing) * seedSpacing;
  const centreX = (view.minX + view.maxX) / 2;
  const centreY = (view.minY + view.maxY) / 2;
  const seeds = [];
  for (let x = firstX; x <= view.maxX; x += seedSpacing) {
    for (let y = firstY; y <= view.maxY; y += seedSpacing) {
      seeds.push(new Vector2D(x, y));
    }
  }
  seeds.sort(
    (a, b) => Math.hypot(a.x - centreX, a.y - centreY) - Math.hypot(b.x - centreX, b.y - centreY)
  );
  for (const seed of seeds) {
    if (stepsSpent >= maxTotalSteps) break;
    if (tooClose(seed)) continue;
    const backward = follow(seed, -1).reverse();
    const forward = follow(seed, 1);
    const line = [...backward, seed, ...forward];
    if (line.length < 4) continue;
    for (const point of line) occupancy.add(point);
    lines.push(line);
  }
  return lines.map(thin);
}
function thin(line) {
  if (line.length < 3) return line;
  const minimum = line[0].sub(line[1]).magnitude() * MIN_SEGMENT_FRACTION;
  const kept = [line[0]];
  for (let i = 1; i < line.length - 1; i++) {
    if (line[i].sub(kept[kept.length - 1]).magnitude() >= minimum) kept.push(line[i]);
  }
  kept.push(line[line.length - 1]);
  return kept;
}

// vendor/gravity-simulator/src/forces.ts
var SIMULATION_G = 0.5;
function gravitationalForce(from, to, mass, otherMass, contactDistance, G) {
  const direction = to.sub(from);
  const distanceSquared = direction.magnitudeSquared();
  const softened = Math.max(distanceSquared, contactDistance * contactDistance);
  return direction.normalize().mult(G * mass * otherMass / softened);
}
function gravitationalPotential(point, particles, G) {
  let potential = 0;
  for (const particle of particles) {
    const distance = Math.max(particle.position.sub(point).magnitude(), particle.radius);
    potential -= G * particle.mass / distance;
  }
  return potential;
}
function accelerationsAt(particles, positions, G) {
  const accelerations = particles.map(() => new Vector2D(0, 0));
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const force = gravitationalForce(
        positions[i],
        positions[j],
        particles[i].mass,
        particles[j].mass,
        particles[i].radius + particles[j].radius,
        G
      );
      accelerations[i] = accelerations[i].add(force.div(particles[i].mass));
      accelerations[j] = accelerations[j].sub(force.div(particles[j].mass));
    }
  }
  return accelerations;
}

// vendor/gravity-simulator/src/VectorField.ts
function nearCell(particle, cell, range) {
  const dx = Math.max(cell.x - particle.position.x, particle.position.x - (cell.x + cell.size), 0);
  const dy = Math.max(cell.y - particle.position.y, particle.position.y - (cell.y + cell.size), 0);
  return dx * dx + dy * dy <= range * range;
}
var FIELD_NOISE_FRACTION = 1e-3;
var GRADIENT_SPLIT_THRESHOLD = 0.25;
var GRADIENT_FINE_FRACTION = 0.5;
var GRADIENT_CLOSE_FRACTION = 0.15;
var HEIGHTMAP_RESOLUTION = 64;
var MAX_SAMPLES = 12e3;
var OccupancyGrid = class {
  /**
   * @param cellSize should be at least the largest `half` that will be queried,
   *   which keeps every lookup to a 2x2 or 3x3 block of cells.
   */
  constructor(cellSize) {
    __publicField(this, "cellSize", cellSize);
    __publicField(this, "cells", /* @__PURE__ */ new Map());
  }
  clear() {
    this.cells.clear();
  }
  has(x, y, half) {
    const minCX = Math.floor((x - half) / this.cellSize);
    const maxCX = Math.floor((x + half) / this.cellSize);
    const minCY = Math.floor((y - half) / this.cellSize);
    const maxCY = Math.floor((y + half) / this.cellSize);
    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const bucket = this.cells.get(`${cx},${cy}`);
        if (!bucket) continue;
        for (const p of bucket) {
          if (Math.abs(p.x - x) < half && Math.abs(p.y - y) < half) return true;
        }
      }
    }
    return false;
  }
  add(point) {
    const key = `${Math.floor(point.x / this.cellSize)},${Math.floor(point.y / this.cellSize)}`;
    const bucket = this.cells.get(key);
    if (bucket) bucket.push(point);
    else this.cells.set(key, [point]);
  }
};
var VectorField = class {
  constructor(baseGridSize = 30) {
    __publicField(this, "samples", []);
    __publicField(this, "contours", []);
    __publicField(this, "streamlines", []);
    __publicField(this, "heightmap", null);
    /**
     * The view the current geometry was built for.
     *
     * The heightmap is an image stretched across exactly this rectangle, so the
     * renderer needs the same bounds the sampler used — taking the camera's
     * current bounds instead would stretch last frame's image over this frame's
     * view while panning.
     */
    __publicField(this, "lastView", null);
    __publicField(this, "maxInfluenceRadius", 300);
    // Range over which vectors are drawn (user-adjustable)
    __publicField(this, "baseGridSize", 30);
    // Nominal sample spacing
    __publicField(this, "fieldMode", "gradient");
    /**
     * Index over the accepted samples, used by adaptive mode's duplicate test.
     * Rebuilt every frame alongside `samples`.
     */
    __publicField(this, "occupancy", new OccupancyGrid(1));
    /**
     * Barnes-Hut tree to sample through, or null to sum over every particle.
     *
     * Sampling is O(n) per sample point over several thousand points, so this is
     * the other half of what the tree is for — the field is usually the more
     * expensive of the two.
     */
    __publicField(this, "tree", null);
    __publicField(this, "theta", DEFAULT_THETA);
    /**
     * The strongest force sampled so far this frame, and the floor derived from
     * it.
     *
     * Tracked as the pass runs rather than measured beforehand, so it costs no
     * extra force evaluations: the sampling rules that use it are stopping rules,
     * and a floor that starts at zero simply prunes nothing until the pass has
     * seen enough to know what "weak" means here. The samples are filtered once
     * at the end, when the answer is final.
     */
    __publicField(this, "peakForce", 0);
    /**
     * A pinned range of potentials, when the viewer has locked the scale.
     *
     * Set by `main` from the renderer's lock, because the renderer is where the
     * range was measured and the field is where the levels are chosen. Contours
     * traced against a fixed set of levels are the same curves frame to frame,
     * which is what a locked scale means for a mode that draws level sets rather
     * than arrows.
     */
    __publicField(this, "lockedPotential", null);
    this.baseGridSize = baseGridSize;
  }
  /**
   * Rebuild the field for the current particles and camera view.
   *
   * `tree`, when given, is used to evaluate the field instead of summing over
   * particles. The sample *positions* still come from the particles themselves:
   * adaptive mode walks rings around each body, which is a question about where
   * to look rather than what is there.
   */
  update(particles, G = 1, view, tree = null, theta = DEFAULT_THETA) {
    this.samples = [];
    this.contours = [];
    this.streamlines = [];
    this.heightmap = null;
    this.lastView = view;
    this.occupancy.clear();
    this.tree = tree;
    this.theta = theta;
    if (particles.length === 0) return;
    this.peakForce = 0;
    switch (this.fieldMode) {
      case "uniform":
        this.generateUniformGrid(particles, G, view);
        break;
      case "adaptive":
        this.generateAdaptiveGrid(particles, G, view);
        break;
      case "gradient":
        this.generateGradientGrid(particles, G, view);
        break;
      case "contours":
        this.contours = traceContours(
          (x, y) => this.potentialAt(new Vector2D(x, y), particles, G),
          view,
          void 0,
          void 0,
          // Where the structure is. The tracer refines a cell when its corners
          // straddle a level, and a body small enough to sit inside one coarse
          // cell without bending it past a level is invisible to that test —
          // the same blindness the gradient arrow mode had to be told about.
          particles.map((particle) => particle.position),
          // The lock holds absolute depths; the tracer wants the signed range
          // the potential actually runs over, which is negative.
          this.lockedPotential ? contourLevels(-this.lockedPotential.max, -this.lockedPotential.min, 12) : void 0
        );
        break;
      case "heightmap":
        this.heightmap = sampleScalarGrid(
          (x, y) => this.potentialAt(new Vector2D(x, y), particles, G),
          view,
          HEIGHTMAP_RESOLUTION
        );
        break;
      case "streamlines":
        this.streamlines = traceStreamlines(
          (x, y) => this.calculateForceAt(new Vector2D(x, y), particles, G),
          view,
          defaultStreamlineOptions(view)
        );
        break;
    }
    this.dropNegligibleSamples();
  }
  /**
   * Sample where the field changes, not where the bodies are.
   *
   * Start with a coarse lattice and subdivide a cell only when its own reading
   * differs enough from its parent's — which is a direct measure of how much
   * the field is doing there. Smooth regions keep one arrow; the steep ground
   * near a body, or the saddle between two, gets as many as the budget allows.
   *
   * The point of it is that **the sample count follows the field's structure
   * rather than the number of bodies**. The zone-based mode asks for four rings
   * around every particle, so three hundred bodies ask for thousands of samples
   * and get truncated at the cap; this asks the same question of a two-body
   * scene and a three-hundred-body one, and answers it with a similar number of
   * arrows.
   */
  generateGradientGrid(particles, G, view) {
    const coarse = this.baseGridSize * 4;
    const finest = this.baseGridSize;
    const fine = this.baseGridSize * GRADIENT_FINE_FRACTION;
    const startX = Math.floor(view.minX / coarse) * coarse;
    const startY = Math.floor(view.minY / coarse) * coarse;
    const queue = [];
    for (let x = startX; x <= view.maxX; x += coarse) {
      for (let y = startY; y <= view.maxY; y += coarse) {
        queue.push({ x, y, size: coarse, parentMagnitude: -1, occupants: [] });
      }
    }
    const closeRange = this.maxInfluenceRadius * GRADIENT_CLOSE_FRACTION;
    for (const cell of queue) {
      cell.occupants = particles.filter((particle) => nearCell(particle, cell, closeRange));
    }
    while (queue.length > 0 && this.samples.length < MAX_SAMPLES) {
      const cell = queue.pop();
      const centre = new Vector2D(cell.x + cell.size / 2, cell.y + cell.size / 2);
      const force = this.calculateForceAt(centre, particles, G);
      const magnitude = force.magnitude();
      if (magnitude > this.peakForce) this.peakForce = magnitude;
      if (magnitude <= this.noiseFloor() && cell.occupants.length === 0) continue;
      const change = cell.parentMagnitude < 0 ? Infinity : Math.abs(magnitude - cell.parentMagnitude) / Math.max(magnitude, cell.parentMagnitude);
      const roomToSplit = this.samples.length + queue.length + 4 <= MAX_SAMPLES;
      const nearBody = cell.occupants.length > 0;
      const limit = nearBody ? fine : finest;
      if (cell.size > limit && (nearBody || change > GRADIENT_SPLIT_THRESHOLD) && roomToSplit) {
        const half = cell.size / 2;
        for (const [dx, dy] of [
          [0, 0],
          [half, 0],
          [0, half],
          [half, half]
        ]) {
          const childX = cell.x + dx;
          const childY = cell.y + dy;
          queue.push({
            x: childX,
            y: childY,
            size: half,
            parentMagnitude: magnitude,
            occupants: cell.occupants.filter(
              (particle) => nearCell(particle, { x: childX, y: childY, size: half }, closeRange)
            )
          });
        }
        continue;
      }
      if (magnitude > this.noiseFloor()) this.samples.push({ position: centre, force });
    }
  }
  /**
   * The weakest force worth an arrow, as things stand this frame.
   *
   * Zero until the first sample is taken, which is deliberate: a stopping rule
   * that prunes before it knows the scale would prune the scale itself.
   */
  noiseFloor() {
    return this.peakForce * FIELD_NOISE_FRACTION;
  }
  /**
   * Drop the samples the finished pass says are negligible.
   *
   * The rules above run against a floor that was still rising, so the earliest
   * samples were judged against a smaller number than the last ones. One pass
   * at the end judges them all against the same one.
   */
  dropNegligibleSamples() {
    const floor = this.noiseFloor();
    if (floor <= 0) return;
    this.samples = this.samples.filter((sample) => sample.force.magnitude() > floor);
  }
  /** Potential at a point, through the tree when there is one. */
  potentialAt(point, particles, G) {
    return this.tree ? this.tree.potentialAt(point.x, point.y, G, this.theta) : gravitationalPotential(point, particles, G);
  }
  /**
   * Regular lattice across the whole visible region.
   *
   * The lattice is anchored to world coordinates rather than to the viewport,
   * so arrows stay put while the camera pans instead of crawling across the
   * screen.
   */
  generateUniformGrid(particles, G, view) {
    const width = view.maxX - view.minX;
    const height = view.maxY - view.minY;
    let gridSize = this.baseGridSize;
    const wanted = width / gridSize * (height / gridSize);
    if (wanted > MAX_SAMPLES) {
      gridSize *= Math.sqrt(wanted / MAX_SAMPLES);
    }
    const startX = Math.floor(view.minX / gridSize) * gridSize;
    const startY = Math.floor(view.minY / gridSize) * gridSize;
    for (let x = startX; x <= view.maxX; x += gridSize) {
      for (let y = startY; y <= view.maxY; y += gridSize) {
        const samplePoint = new Vector2D(x, y);
        const force = this.calculateForceAt(samplePoint, particles, G);
        const magnitude = force.magnitude();
        if (magnitude > this.peakForce) this.peakForce = magnitude;
        if (magnitude > this.noiseFloor()) {
          this.samples.push({ position: samplePoint, force });
        }
      }
    }
  }
  /**
   * Four density zones per particle: dense near the body, sparse at the edge of
   * its influence.
   */
  generateAdaptiveGrid(particles, G, view) {
    const maxRadius = this.maxInfluenceRadius;
    const zones = [
      { maxDist: maxRadius * 0.2, gridSize: this.baseGridSize * 0.3 },
      { maxDist: maxRadius * 0.4, gridSize: this.baseGridSize * 0.5 },
      { maxDist: maxRadius * 0.7, gridSize: this.baseGridSize * 0.8 },
      { maxDist: maxRadius, gridSize: this.baseGridSize * 1.2 }
    ];
    this.occupancy = new OccupancyGrid(Math.max(this.baseGridSize * 0.6, 1e-6));
    for (const particle of particles) {
      let innerRadius = 0;
      for (const zone of zones) {
        this.generateSamplesInRing(
          particle,
          innerRadius,
          zone.maxDist,
          zone.gridSize,
          particles,
          G,
          view
        );
        innerRadius = zone.maxDist;
      }
    }
  }
  /**
   * Sample one annulus around a particle, clipped to the visible region.
   */
  generateSamplesInRing(particle, innerRadius, outerRadius, gridSize, allParticles, G, view) {
    const centerX = particle.position.x;
    const centerY = particle.position.y;
    const minX = Math.max(view.minX, centerX - outerRadius);
    const maxX = Math.min(view.maxX, centerX + outerRadius);
    const minY = Math.max(view.minY, centerY - outerRadius);
    const maxY = Math.min(view.maxY, centerY + outerRadius);
    const startX = Math.ceil(minX / gridSize) * gridSize;
    const startY = Math.ceil(minY / gridSize) * gridSize;
    const halfSpacing = gridSize * 0.5;
    for (let x = startX; x <= maxX; x += gridSize) {
      for (let y = startY; y <= maxY; y += gridSize) {
        if (this.samples.length >= MAX_SAMPLES) return;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < innerRadius || dist > outerRadius) continue;
        if (this.occupancy.has(x, y, halfSpacing)) continue;
        const samplePoint = new Vector2D(x, y);
        const force = this.calculateForceAt(samplePoint, allParticles, G);
        const magnitude = force.magnitude();
        if (magnitude > this.peakForce) this.peakForce = magnitude;
        if (magnitude > this.noiseFloor()) {
          this.samples.push({ position: samplePoint, force });
          this.occupancy.add(samplePoint);
        }
      }
    }
  }
  /**
   * Total gravitational field at a point: the sum over every particle within
   * range, of G·m/r². Field strength per unit mass, so the test particle's own
   * mass does not appear.
   */
  calculateForceAt(point, particles, G) {
    if (this.tree) {
      return this.tree.accelerationAt(point.x, point.y, G, this.theta, this.maxInfluenceRadius);
    }
    let totalForce = new Vector2D(0, 0);
    for (const particle of particles) {
      const direction = particle.position.sub(point);
      const distanceSquared = direction.magnitudeSquared();
      if (distanceSquared > this.maxInfluenceRadius * this.maxInfluenceRadius) continue;
      const softened = Math.max(distanceSquared, particle.radius * particle.radius);
      const forceMagnitude = G * particle.mass / softened;
      totalForce = totalForce.add(direction.normalize().mult(forceMagnitude));
    }
    return totalForce;
  }
  /**
   * Get all samples (for rendering)
   */
  getSamples() {
    return this.samples;
  }
  /** Equipotential lines, when the mode draws them. */
  getContours() {
    return this.contours;
  }
  /** Traced streamlines, when the mode draws them. */
  getStreamlines() {
    return this.streamlines;
  }
  /** The sampled potential, when the mode shades it. */
  getHeightmap() {
    return this.heightmap;
  }
};

// vendor/gravity-simulator/src/integrators.ts
var symplecticEuler = (particles, dt, field) => {
  for (const particle of particles) {
    particle.velocity = particle.velocity.add(particle.acceleration.mult(dt));
    particle.position = particle.position.add(particle.velocity.mult(dt));
  }
  field.refresh();
};
var velocityVerlet = (particles, dt, field) => {
  const previousAcceleration = particles.map((particle) => particle.acceleration);
  for (const particle of particles) {
    particle.position = particle.position.add(particle.velocity.mult(dt)).add(particle.acceleration.mult(0.5 * dt * dt));
  }
  field.refresh();
  particles.forEach((particle, index) => {
    particle.velocity = particle.velocity.add(
      previousAcceleration[index].add(particle.acceleration).mult(0.5 * dt)
    );
  });
};
var CBRT_TWO = Math.cbrt(2);
var FOREST_RUTH_OUTER = 1 / (2 - CBRT_TWO);
var FOREST_RUTH_MIDDLE = -CBRT_TWO / (2 - CBRT_TWO);
var forestRuth = (particles, dt, field) => {
  velocityVerlet(particles, FOREST_RUTH_OUTER * dt, field);
  velocityVerlet(particles, FOREST_RUTH_MIDDLE * dt, field);
  velocityVerlet(particles, FOREST_RUTH_OUTER * dt, field);
};
var rungeKutta4 = (particles, dt, field) => {
  const position = particles.map((particle) => particle.position);
  const velocity = particles.map((particle) => particle.velocity);
  const k1v = particles.map((particle) => particle.acceleration);
  const k1x = velocity;
  const k2v = field.accelerationsAt(position.map((x, i) => x.add(k1x[i].mult(dt / 2))));
  const k2x = velocity.map((v, i) => v.add(k1v[i].mult(dt / 2)));
  const k3v = field.accelerationsAt(position.map((x, i) => x.add(k2x[i].mult(dt / 2))));
  const k3x = velocity.map((v, i) => v.add(k2v[i].mult(dt / 2)));
  const k4v = field.accelerationsAt(position.map((x, i) => x.add(k3x[i].mult(dt))));
  const k4x = velocity.map((v, i) => v.add(k3v[i].mult(dt)));
  particles.forEach((particle, index) => {
    const dx = k1x[index].add(k2x[index].mult(2)).add(k3x[index].mult(2)).add(k4x[index]).mult(dt / 6);
    const dv = k1v[index].add(k2v[index].mult(2)).add(k3v[index].mult(2)).add(k4v[index]).mult(dt / 6);
    particle.position = position[index].add(dx);
    particle.velocity = velocity[index].add(dv);
  });
  field.refresh();
};
var INTEGRATORS = {
  euler: symplecticEuler,
  verlet: velocityVerlet,
  rk4: rungeKutta4,
  "forest-ruth": forestRuth
};
function pairTimescale(a, b, G) {
  const contactDistance = a.radius + b.radius;
  const separation = Math.max(b.position.sub(a.position).magnitude(), contactDistance);
  const dynamical = Math.sqrt(separation ** 3 / (G * (a.mass + b.mass)));
  const relativeSpeed = b.velocity.sub(a.velocity).magnitude();
  const crossing2 = relativeSpeed > 0 ? separation / relativeSpeed : Infinity;
  return Math.min(dynamical, crossing2);
}
function shortestInteractionTime(particles, G) {
  let shortest = Infinity;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      shortest = Math.min(shortest, pairTimescale(particles[i], particles[j], G));
    }
  }
  return shortest;
}
var SAFETY_FRACTION = 1 / 16;
var MAX_SUB_STEPS = 64;
function subStepsForTimescale(shortest, dt, maxSubSteps = MAX_SUB_STEPS) {
  if (!Number.isFinite(shortest)) return 1;
  const safeStep = SAFETY_FRACTION * shortest;
  if (!(safeStep > 0)) return maxSubSteps;
  return Math.max(1, Math.min(maxSubSteps, Math.ceil(dt / safeStep)));
}
function recommendedSubSteps(particles, G, dt, maxSubSteps = MAX_SUB_STEPS, tree = null) {
  const shortest = tree ? tree.shortestInteractionTime(G) : shortestInteractionTime(particles, G);
  return subStepsForTimescale(shortest, dt, maxSubSteps);
}

// vendor/gravity-simulator/src/Particle.ts
var Particle = class _Particle {
  constructor(x, y, mass = 50, vx = 0, vy = 0) {
    __publicField(this, "position");
    __publicField(this, "velocity");
    __publicField(this, "acceleration");
    __publicField(this, "mass");
    __publicField(this, "radius");
    __publicField(this, "trail", []);
    /**
     * Set when something moved this body other than integration, and cleared by
     * the next `recordTrail()`.
     */
    __publicField(this, "teleported", false);
    __publicField(this, "maxTrailLength", 50);
    __publicField(this, "netForce", new Vector2D(0, 0));
    // Total gravitational force acting on this particle
    /**
     * Which way the body is facing, in radians, and how fast that is changing.
     *
     * Gravity never changes either: a body is treated as a point mass for the
     * force law, and a point mass in a central field feels no torque. Spin comes
     * from contact and from contact only, which is why it arrived with M6 rather
     * than at the start.
     */
    __publicField(this, "angle", 0);
    __publicField(this, "angularVelocity", 0);
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(vx, vy);
    this.acceleration = new Vector2D(0, 0);
    this.mass = mass;
    this.radius = _Particle.radiusForMass(mass);
  }
  /**
   * Radius of a body of this mass: `2 * m^(1/3)`.
   *
   * A body's radius is a pure function of its mass and nothing else. Contact
   * distance, the softening floor in the force law, the adaptive step rule's
   * clamp and the renderer all read it, so a body whose radius disagreed with
   * its mass would be a different size to every other body of the same mass and
   * would soften at the wrong distance.
   */
  static radiusForMass(mass) {
    return Math.pow(mass, 1 / 3) * 2;
  }
  /**
   * Moment of inertia, as a uniform disc: `½·m·r²`.
   *
   * Follows from the mass and the radius, and the radius follows from the mass,
   * so this is one more thing that is not free to disagree with the rest.
   */
  get momentOfInertia() {
    return 0.5 * this.mass * this.radius * this.radius;
  }
  /**
   * Velocity of the surface point offset by `arm` from the centre.
   *
   * A spinning body's surface moves even when its centre does not, which is
   * what makes an off-centre impact impart spin rather than only deflect.
   * In two dimensions `ω × r` is `ω · perpendicular(r)`.
   */
  velocityAt(arm) {
    return this.velocity.add(new Vector2D(-arm.y, arm.x).mult(this.angularVelocity));
  }
  /**
   * Apply an impulse at a point offset by `arm` from the centre.
   *
   * Linear response is `J/m` whatever the arm; the angular response is the
   * cross product of the arm with the impulse over the moment of inertia, which
   * is zero for an impulse aimed straight at the centre.
   */
  applyImpulse(impulse, arm) {
    this.velocity = this.velocity.add(impulse.div(this.mass));
    this.angularVelocity += (arm.x * impulse.y - arm.y * impulse.x) / this.momentOfInertia;
  }
  /** Total angular momentum about `origin`: spin plus orbital. */
  angularMomentumAbout(origin) {
    const offset = this.position.sub(origin);
    const orbital = this.mass * (offset.x * this.velocity.y - offset.y * this.velocity.x);
    return this.momentOfInertia * this.angularVelocity + orbital;
  }
  /**
   * Apply a force to the particle (F = ma, so a = F/m)
   */
  applyForce(force) {
    this.netForce = this.netForce.add(force);
    const acceleration = force.div(this.mass);
    this.acceleration = this.acceleration.add(acceleration);
  }
  /**
   * Clear the accumulated force and acceleration.
   *
   * Called at the *start* of a simulation step, before any force is applied —
   * deliberately not at the end of update(). `netForce` is what the renderer
   * draws as the orange force arrow, and it is read after the step completes,
   * so clearing it on the way out of update() would leave the renderer nothing
   * but zero to draw. See tests/PhysicsEngine.test.ts.
   */
  resetForces() {
    this.acceleration = new Vector2D(0, 0);
    this.netForce = new Vector2D(0, 0);
  }
  /**
   * Append the current position to the trail, dropping the oldest point once
   * the trail is full.
   *
   * Called once per *frame* by `PhysicsEngine.step()`, deliberately not once
   * per integration sub-step: adaptive stepping runs up to 64 sub-steps in a
   * frame, and a trail that recorded each of them would drain in a fraction of
   * a second and stutter in length as the sub-step count changed.
   */
  recordTrail() {
    this.trail.push({ position: this.position.copy(), jumped: this.teleported });
    this.teleported = false;
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }
  /**
   * Swallow `other`, conserving mass and momentum.
   *
   * This body survives and keeps its identity, so its trail carries through the
   * collision rather than restarting; the caller drops the absorbed one from
   * the simulation. The merged body sits at the pair's centre of mass and
   * carries their combined momentum, which makes the merge perfectly inelastic
   * — kinetic energy is lost, as it is in any real merge.
   *
   * The new radius comes from the new mass, via the rule above. The roadmap
   * originally called for summing the two areas instead; that would make a
   * merged body wider than any other body of the same mass, and radius is
   * relied on as a function of mass in four other places.
   */
  absorb(other) {
    const total = this.mass + other.mass;
    const centre = this.position.mult(this.mass).add(other.position.mult(other.mass)).div(total);
    const angularMomentum = this.angularMomentumAbout(centre) + other.angularMomentumAbout(centre);
    this.position = centre;
    this.velocity = this.velocity.mult(this.mass).add(other.velocity.mult(other.mass)).div(total);
    this.mass = total;
    this.radius = _Particle.radiusForMass(total);
    this.angularVelocity = angularMomentum / this.momentOfInertia;
    this.teleported = true;
  }
  /**
   * Calculate gravitational force from another particle
   * F = G * m1 * m2 / r^2
   */
  attractionTo(other, G = 1) {
    return gravitationalForce(
      this.position,
      other.position,
      this.mass,
      other.mass,
      this.radius + other.radius,
      G
    );
  }
  /**
   * Clear the trail
   */
  clearTrail() {
    this.trail = [];
  }
};

// vendor/gravity-simulator/src/fragmentation.ts
var SHATTER_ENERGY_RATIO = 1;
var DISPERSAL_EFFICIENCY = 0.5;
var LARGEST_REMNANT_FRACTION = 0.5;
var MAX_FRAGMENTS = 5;
var RING_SLACK = 1.1;
function bindingEnergy(mass, G) {
  return G * mass * mass / Particle.radiusForMass(mass);
}
function impactEnergy(a, b) {
  const reduced = a.mass * b.mass / (a.mass + b.mass);
  return 0.5 * reduced * b.velocity.sub(a.velocity).magnitudeSquared();
}
function fragmentsOf(a, b, G) {
  const total = a.mass + b.mass;
  const centre = a.position.mult(a.mass).add(b.position.mult(b.mass)).div(total);
  const velocity = a.velocity.mult(a.mass).add(b.velocity.mult(b.mass)).div(total);
  const impact = impactEnergy(a, b);
  const binding = bindingEnergy(total, G);
  if (impact < SHATTER_ENERGY_RATIO * binding) return null;
  const excess = impact - binding;
  const dispersal = Math.sqrt(2 * DISPERSAL_EFFICIENCY * excess / total);
  const smallest = layoutFor(total, 2, b.position.sub(a.position));
  const escape = Math.sqrt(2 * G * total / smallest.ring);
  if (dispersal < escape) return null;
  const count = Math.min(
    MAX_FRAGMENTS,
    2 + Math.floor(2 * Math.log2(dispersal / escape))
  );
  const layout = layoutFor(total, count, b.position.sub(a.position));
  const { masses, radii, ring } = layout;
  const offsets = ringOffsets(radii, ring, b.position.sub(a.position));
  balanceOffsets(offsets, masses);
  const internal = a.angularMomentumAbout(centre) + b.angularMomentumAbout(centre);
  const inertia = masses.reduce(
    (sum, mass, i) => sum + mass * offsets[i].magnitudeSquared() + spinInertia(mass),
    0
  );
  const spin = inertia > 0 ? internal / inertia : 0;
  const fragments = masses.map((mass, i) => {
    const offset = offsets[i];
    const direction = offset.magnitude() > 0 ? offset.normalize() : new Vector2D(1, 0);
    const outward = direction.mult(dispersal);
    const tangential = new Vector2D(-offset.y, offset.x).mult(spin);
    const fragment = new Particle(
      centre.x + offset.x,
      centre.y + offset.y,
      mass,
      velocity.x + outward.x + tangential.x,
      velocity.y + outward.y + tangential.y
    );
    fragment.angularVelocity = spin;
    fragment.maxTrailLength = Math.max(a.maxTrailLength, b.maxTrailLength);
    return fragment;
  });
  correctMomentum(fragments, velocity.mult(total));
  return fragments;
}
function layoutFor(total, count, impact) {
  const masses = fragmentMasses(total, count);
  const radii = masses.map((mass) => Particle.radiusForMass(mass));
  return { masses, radii, ring: ringRadiusFor(radii, impact) };
}
function ringRadiusFor(radii, impact) {
  let ring = RING_SLACK * RING_SLACK * radii.reduce((sum, r) => sum + r, 0) / Math.PI;
  for (let attempt = 0; attempt < 12; attempt++) {
    const offsets = ringOffsets(radii, ring, impact);
    let clear = true;
    for (let i = 0; i < offsets.length && clear; i++) {
      for (let j = i + 1; j < offsets.length && clear; j++) {
        if (offsets[i].sub(offsets[j]).magnitude() <= radii[i] + radii[j]) clear = false;
      }
    }
    if (clear) return ring;
    ring *= RING_SLACK;
  }
  return ring;
}
function fragmentMasses(total, count) {
  const largest = total * LARGEST_REMNANT_FRACTION;
  const rest = (total - largest) / (count - 1);
  return [largest, ...Array.from({ length: count - 1 }, () => rest)];
}
function ringOffsets(radii, ring, impact) {
  const start = impact.magnitude() > 0 ? Math.atan2(impact.y, impact.x) : 0;
  const offsets = [];
  let angle = start;
  for (const radius of radii) {
    const span = 2 * radius * RING_SLACK / ring;
    const middle = angle + span / 2;
    offsets.push(new Vector2D(Math.cos(middle) * ring, Math.sin(middle) * ring));
    angle += span;
  }
  return offsets;
}
function balanceOffsets(offsets, masses) {
  const total = masses.reduce((sum, mass) => sum + mass, 0);
  let x = 0;
  let y = 0;
  for (let i = 0; i < offsets.length; i++) {
    x += masses[i] * offsets[i].x / total;
    y += masses[i] * offsets[i].y / total;
  }
  for (let i = 0; i < offsets.length; i++) {
    offsets[i] = new Vector2D(offsets[i].x - x, offsets[i].y - y);
  }
}
function correctMomentum(fragments, wanted) {
  let mass = 0;
  let px = 0;
  let py = 0;
  for (const fragment of fragments) {
    mass += fragment.mass;
    px += fragment.mass * fragment.velocity.x;
    py += fragment.mass * fragment.velocity.y;
  }
  const shift = new Vector2D((wanted.x - px) / mass, (wanted.y - py) / mass);
  for (const fragment of fragments) {
    fragment.velocity = fragment.velocity.add(shift);
  }
}
function spinInertia(mass) {
  return 0.5 * mass * Particle.radiusForMass(mass) ** 2;
}

// vendor/gravity-simulator/src/collisions.ts
var RESTITUTION = 0.5;
var CONTACT_FRICTION = 1 / 3;
var CONTACT_SLOP = 0.05;
function sweptContactTime(a, aFrom, b, bFrom) {
  const contact = a.radius + b.radius;
  const p = bFrom.sub(aFrom);
  const v = b.position.sub(bFrom).sub(a.position.sub(aFrom));
  if (p.magnitudeSquared() <= contact * contact) return 0;
  const va = v.magnitudeSquared();
  if (va === 0) return null;
  const half = p.dot(v);
  if (half >= 0) return null;
  const c = p.magnitudeSquared() - contact * contact;
  const discriminant = half * half - va * c;
  if (discriminant < 0) return null;
  const t = (-half - Math.sqrt(discriminant)) / va;
  return t >= 0 && t <= 1 ? t : null;
}
function overlapping(a, b) {
  const contact = a.radius + b.radius;
  return b.position.sub(a.position).magnitudeSquared() < contact * contact;
}
function contactGeometry(a, b) {
  const offset = b.position.sub(a.position);
  const distance = offset.magnitude();
  const contact = a.radius + b.radius;
  if (distance === 0) {
    return { normal: new Vector2D(1, 0), overlap: contact };
  }
  return { normal: offset.div(distance), overlap: contact - distance };
}
function touchingPairs(particles, treeThreshold, previous) {
  const pairs = [];
  const touched = (i, j) => {
    if (overlapping(particles[i], particles[j])) return true;
    return previous ? sweptContactTime(particles[i], previous[i], particles[j], previous[j]) !== null : false;
  };
  if (particles.length >= treeThreshold) {
    const tree = sweptTree(particles, previous);
    const candidates = [];
    for (let i = 0; i < particles.length; i++) {
      candidates.length = 0;
      const body = particles[i];
      const centre = previous ? previous[i].add(body.position).div(2) : body.position;
      const reach = previous ? body.radius + body.position.sub(previous[i]).magnitude() / 2 : body.radius;
      tree.withinContact(centre.x, centre.y, reach, candidates);
      for (const j of candidates) {
        if (j > i && touched(i, j)) pairs.push([i, j]);
      }
    }
    return pairs;
  }
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      if (touched(i, j)) pairs.push([i, j]);
    }
  }
  return pairs;
}
function sweptTree(particles, previous) {
  if (!previous) return treeOf(particles);
  return QuadTree.build(
    particles.map((particle, index) => {
      const travel = particle.position.sub(previous[index]);
      const centre = previous[index].add(particle.position).div(2);
      return {
        x: centre.x,
        y: centre.y,
        mass: particle.mass,
        radius: particle.radius + travel.magnitude() / 2,
        vx: particle.velocity.x,
        vy: particle.velocity.y
      };
    })
  );
}
function mergeAll(particles, treeThreshold, previous) {
  let merges = 0;
  for (let guard = particles.length; guard > 0; guard--) {
    const pairs = touchingPairs(particles, treeThreshold, previous);
    if (pairs.length === 0) break;
    const consumed = /* @__PURE__ */ new Set();
    const removals = [];
    for (const [i, j] of pairs) {
      if (consumed.has(i) || consumed.has(j)) continue;
      if (previous) rewindToContact(particles[i], previous[i], particles[j], previous[j]);
      const heavier = particles[i].mass >= particles[j].mass ? i : j;
      const lighter = heavier === i ? j : i;
      particles[heavier].absorb(particles[lighter]);
      consumed.add(lighter);
      removals.push(lighter);
      merges++;
    }
    removals.sort((a, b) => b - a);
    for (const index of removals) {
      particles.splice(index, 1);
      previous?.splice(index, 1);
    }
  }
  return merges;
}
function shatterAll(particles, treeThreshold, G, previous) {
  let events = 0;
  for (let guard = 2 * particles.length + MAX_FRAGMENTS; guard > 0; guard--) {
    const pairs = touchingPairs(particles, treeThreshold, previous);
    if (pairs.length === 0) break;
    const consumed = /* @__PURE__ */ new Set();
    const removals = [];
    const additions = [];
    for (const [i, j] of pairs) {
      if (consumed.has(i) || consumed.has(j)) continue;
      if (previous) rewindToContact(particles[i], previous[i], particles[j], previous[j]);
      const a = particles[i];
      const b = particles[j];
      const fragments = fragmentsOf(a, b, G);
      if (fragments) {
        additions.push(...fragments);
        removals.push(i, j);
      } else {
        const heavier = a.mass >= b.mass ? i : j;
        particles[heavier].absorb(particles[heavier === i ? j : i]);
        removals.push(heavier === i ? j : i);
      }
      consumed.add(i);
      consumed.add(j);
      events++;
    }
    removals.sort((x, y) => y - x);
    for (const index of removals) {
      particles.splice(index, 1);
      previous?.splice(index, 1);
    }
    for (const fragment of additions) {
      particles.push(fragment);
      previous?.push(fragment.position);
    }
  }
  return events;
}
function rewindToContact(a, aFrom, b, bFrom) {
  const time = sweptContactTime(a, aFrom, b, bFrom);
  if (time === null || time === 0) return;
  movePair(
    a,
    aFrom.add(a.position.sub(aFrom).mult(time)).sub(a.position),
    b,
    bFrom.add(b.position.sub(bFrom).mult(time)).sub(b.position)
  );
}
function movePair(a, shiftA, b, shiftB) {
  const orbitalLost = a.mass * (shiftA.x * a.velocity.y - shiftA.y * a.velocity.x) + b.mass * (shiftB.x * b.velocity.y - shiftB.y * b.velocity.x);
  a.position = a.position.add(shiftA);
  b.position = b.position.add(shiftB);
  const spinChange = -orbitalLost / (a.momentOfInertia + b.momentOfInertia);
  a.angularVelocity += spinChange;
  b.angularVelocity += spinChange;
}
function bounceAll(particles, treeThreshold, restitution, previous) {
  let impacts = 0;
  for (const [i, j] of touchingPairs(particles, treeThreshold, previous)) {
    const a = particles[i];
    const b = particles[j];
    if (previous) rewindToContact(a, previous[i], b, previous[j]);
    if (!overlapping(a, b)) continue;
    if (resolveContact(a, b, restitution)) impacts++;
  }
  return impacts;
}
function resolveContact(a, b, restitution) {
  const { normal, overlap } = contactGeometry(a, b);
  const contactPoint = a.position.add(normal.mult(a.radius - overlap / 2));
  const armA = contactPoint.sub(a.position);
  const armB = contactPoint.sub(b.position);
  const relative = b.velocityAt(armB).sub(a.velocityAt(armA));
  const approachSpeed = relative.dot(normal);
  let struck = false;
  if (approachSpeed < 0) {
    const normalImpulse = -(1 + restitution) * approachSpeed / effectiveMass(a, b, armA, armB, normal);
    a.applyImpulse(normal.mult(-normalImpulse), armA);
    b.applyImpulse(normal.mult(normalImpulse), armB);
    const sliding = relative.sub(normal.mult(approachSpeed));
    const slidingSpeed = sliding.magnitude();
    if (slidingSpeed > 0) {
      const tangent = sliding.div(slidingSpeed);
      const wanted = slidingSpeed / effectiveMass(a, b, armA, armB, tangent);
      const frictionImpulse = Math.min(wanted, CONTACT_FRICTION * normalImpulse);
      a.applyImpulse(tangent.mult(frictionImpulse), armA);
      b.applyImpulse(tangent.mult(-frictionImpulse), armB);
    }
    struck = true;
  }
  separate(a, b, normal, overlap);
  return struck;
}
function separate(a, b, normal, overlap) {
  const penetration = Math.max(overlap - CONTACT_SLOP, 0);
  if (penetration === 0) return;
  const total = a.mass + b.mass;
  movePair(
    a,
    normal.mult(-(penetration * b.mass) / total),
    b,
    normal.mult(penetration * a.mass / total)
  );
}
function effectiveMass(a, b, armA, armB, direction) {
  const leverA = armA.x * direction.y - armA.y * direction.x;
  const leverB = armB.x * direction.y - armB.y * direction.x;
  return 1 / a.mass + 1 / b.mass + leverA * leverA / a.momentOfInertia + leverB * leverB / b.momentOfInertia;
}
function resolveCollisions(particles, mode, treeThreshold = Infinity, restitution = RESTITUTION, previous, G = SIMULATION_G) {
  if (mode === "none" || particles.length < 2) return 0;
  switch (mode) {
    case "merge":
      return mergeAll(particles, treeThreshold, previous);
    case "shatter":
      return shatterAll(particles, treeThreshold, G, previous);
    default:
      return bounceAll(particles, treeThreshold, restitution, previous);
  }
}

// vendor/gravity-simulator/src/PhysicsEngine.ts
var ORIGIN = new Vector2D(0, 0);
var BARNES_HUT_THRESHOLD = 128;
var PhysicsEngine = class {
  constructor(baseGridSize = 30) {
    __publicField(this, "particles", []);
    __publicField(this, "vectorField");
    __publicField(this, "G", SIMULATION_G);
    /** Which integration scheme `step()` uses. See integrators.ts. */
    __publicField(this, "integrator", "verlet");
    /**
     * Slice each frame into as many sub-steps as the closest pair needs.
     *
     * On by default: it is the whole point of roadmap M1, and it costs nothing on
     * a scene that does not need it — a wide orbit asks for one sub-step, which
     * is what the simulation did anyway.
     */
    __publicField(this, "adaptiveStepping", true);
    /** Sub-steps the last `step()` actually took. Read by the UI. */
    __publicField(this, "lastSubSteps", 1);
    /**
     * What happens when two bodies touch: merge, bounce, or pass through.
     *
     * Merging by default. Passing through is what the simulation did before
     * roadmap M2 and is kept because it is occasionally what you want, but it is
     * the least physical of the three.
     */
    __publicField(this, "collisionMode", "merge");
    /** Collision events resolved since the engine was created. Read by the UI. */
    __publicField(this, "collisionCount", 0);
    /**
     * How bouncy a contact is: 1 keeps all the approach speed, 0 none of it.
     *
     * Only bounce mode reads it — a merge is perfectly inelastic by definition.
     */
    __publicField(this, "restitution", RESTITUTION);
    /** How forces are summed. See `ForceMode`. */
    __publicField(this, "forceMode", "auto");
    /** Barnes-Hut opening angle; 0 makes the tree exact. */
    __publicField(this, "theta", DEFAULT_THETA);
    /**
     * The tree built by the last `computeForces()`, reused by the field sampler.
     *
     * Both want the same tree over the same positions, and building it is the
     * expensive half of a query. Invalidated wherever `forcesDirty` is set.
     */
    __publicField(this, "tree", null);
    /**
     * Whether `acceleration` and `netForce` are stale.
     *
     * The integrators are entitled to assume accelerations are current when they
     * are handed the particles — velocity Verlet's one-evaluation-per-step rests
     * on it. Adding or removing a body invalidates that, so it is tracked rather
     * than assumed.
     */
    __publicField(this, "forcesDirty", true);
    this.vectorField = new VectorField(baseGridSize);
  }
  /**
   * Add a particle to the simulation
   */
  addParticle(particle) {
    this.particles.push(particle);
    this.invalidateForces();
  }
  /**
   * Remove a particle from the simulation
   */
  removeParticle(particle) {
    const index = this.particles.indexOf(particle);
    if (index > -1) {
      this.particles.splice(index, 1);
      this.invalidateForces();
    }
  }
  /**
   * Clear all particles
   */
  clearParticles() {
    this.particles = [];
    this.invalidateForces();
  }
  /** Cached accelerations and the tree they came from are no longer usable. */
  invalidateForces() {
    this.forcesDirty = true;
    this.tree = null;
  }
  /**
   * Is the tree in use for this many bodies?
   *
   * Read by the UI, which says so on screen: the approximation is worth
   * knowing about when it is switched on.
   */
  usingBarnesHut() {
    if (this.forceMode === "exact") return false;
    if (this.forceMode === "barnes-hut") return true;
    return this.particles.length >= BARNES_HUT_THRESHOLD;
  }
  /**
   * Clear last step's accumulation and sum the pairwise gravitational forces.
   *
   * Split out from integration so a paused simulation can still show correct
   * force arrows: the UI calls this alone while paused, so adding or deleting
   * a body updates every arrow without anything moving.
   *
   * O(n²) in the particle count — see ROADMAP.md on Barnes-Hut.
   */
  computeForces() {
    this.forcesDirty = false;
    for (const particle of this.particles) {
      particle.resetForces();
    }
    if (this.usingBarnesHut()) {
      this.tree = treeOf(this.particles);
      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i];
        const acceleration = this.tree.accelerationOn(i, this.G, this.theta);
        particle.acceleration = acceleration;
        particle.netForce = acceleration.mult(particle.mass);
      }
      return;
    }
    this.tree = null;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const particleA = this.particles[i];
        const particleB = this.particles[j];
        const force = particleA.attractionTo(particleB, this.G);
        particleA.applyForce(force);
        particleB.applyForce(force.mult(-1));
      }
    }
  }
  /** `ForceField`: recompute forces where the particles actually are. */
  refresh() {
    this.computeForces();
  }
  /** `ForceField`: accelerations for a trial configuration. Mutates nothing. */
  accelerationsAt(positions) {
    if (this.usingBarnesHut()) {
      const trial = treeAt(this.particles, positions);
      return positions.map((_, index) => trial.accelerationOn(index, this.G, this.theta));
    }
    return accelerationsAt(this.particles, positions, this.G);
  }
  /**
   * Integrate every particle forward by `dt` with the current scheme, once.
   *
   * No sub-stepping and no trail point: this is one turn of the crank, which is
   * what `step()` calls in a loop. `netForce` deliberately survives the call —
   * the renderer reads it afterwards to draw each particle's force arrow, and
   * every scheme leaves it current for the *new* positions.
   */
  integrate(dt = 1) {
    if (this.forcesDirty) this.computeForces();
    INTEGRATORS[this.integrator](this.particles, dt, this);
    for (const particle of this.particles) {
      particle.angle += particle.angularVelocity * dt;
    }
  }
  /**
   * Resolve contacts, and report whether anything happened.
   *
   * Kept public because a paused simulation may still need it: adding a body on
   * top of another while frozen should not leave two bodies inside each other
   * waiting for the clock to start.
   */
  resolveCollisions(previous) {
    const events = resolveCollisions(
      this.particles,
      this.collisionMode,
      this.forceMode === "exact" ? Infinity : BARNES_HUT_THRESHOLD,
      this.restitution,
      previous,
      this.G
    );
    if (events > 0) {
      this.collisionCount += events;
      this.tree = null;
      this.forcesDirty = true;
    }
    return events;
  }
  /**
   * One frame: however many sub-steps the closest pair needs, contacts resolved
   * after each, then one trail point per particle.
   *
   * The trail records the frame, not the sub-steps — see `Particle.recordTrail`.
   *
   * Contacts are resolved per sub-step rather than per frame because that is
   * the whole point of sub-stepping: a fast pass is sliced finely enough to
   * notice the moment of contact, instead of stepping over it.
   */
  step(dt = 1) {
    if (this.adaptiveStepping) {
      const tree = this.usingBarnesHut() ? this.tree ?? treeOf(this.particles) : null;
      this.lastSubSteps = recommendedSubSteps(this.particles, this.G, dt, MAX_SUB_STEPS, tree);
    } else {
      this.lastSubSteps = 1;
    }
    const subStep = dt / this.lastSubSteps;
    for (let i = 0; i < this.lastSubSteps; i++) {
      const previous = this.particles.map((particle) => particle.position);
      this.integrate(subStep);
      this.resolveCollisions(previous);
    }
    if (this.forcesDirty) this.computeForces();
    for (const particle of this.particles) {
      particle.recordTrail();
    }
  }
  /**
   * Rebuild the vector field for the region of world space currently on
   * screen. `view` comes from the camera, so the field covers what the user
   * can actually see rather than a fixed box around the origin.
   */
  updateField(view) {
    const tree = this.usingBarnesHut() ? this.tree ?? treeOf(this.particles) : null;
    this.vectorField.update(this.particles, this.G, view, tree, this.theta);
  }
  /** Step the simulation and rebuild the field. */
  update(view, dt = 1) {
    this.step(dt);
    this.updateField(view);
  }
  /**
   * What the simulation ought to be conserving, and is not.
   *
   * Total energy, total momentum and total angular momentum, summed over every
   * body. Nothing in the simulation reads these — they are for the debug
   * overlay, which shows how far each has drifted from where it started, and
   * that is the only honest way to watch an integrator work: a scheme in
   * trouble says so in these three numbers long before the picture looks wrong.
   *
   * The potential term is a sum over every *pair*, so this costs a full O(n²)
   * pass — the thing the tree exists to avoid. Call it when something is going
   * to read the answer, and not otherwise. `main` recomputes four times a
   * second while the overlay is open, which is as fast as the digits can be
   * read anyway.
   */
  diagnostics() {
    let kinetic = 0;
    let potential = 0;
    let angularMomentum = 0;
    let momentumX = 0;
    let momentumY = 0;
    let momentumScale = 0;
    let angularScale = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      const angular = a.angularMomentumAbout(ORIGIN);
      kinetic += 0.5 * a.mass * a.velocity.magnitudeSquared();
      momentumX += a.mass * a.velocity.x;
      momentumY += a.mass * a.velocity.y;
      angularMomentum += angular;
      momentumScale += a.mass * a.velocity.magnitude();
      angularScale += Math.abs(angular);
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const separation = b.position.sub(a.position).magnitude();
        const floor = a.radius + b.radius;
        potential -= this.G * a.mass * b.mass / Math.max(separation, floor);
      }
    }
    return {
      kinetic,
      potential,
      energy: kinetic + potential,
      momentum: new Vector2D(momentumX, momentumY),
      angularMomentum,
      momentumScale,
      angularScale
    };
  }
  /**
   * The system's centre of mass.
   *
   * What a single body's position is worth measuring against: "310 units from
   * the origin" says nothing once the camera has been moved, while "310 units
   * from the barycentre" is a statement about the system. Cheap — one pass, no
   * pairs — unlike `diagnostics()` above.
   */
  barycentre() {
    let mass = 0;
    let x = 0;
    let y = 0;
    for (const particle of this.particles) {
      mass += particle.mass;
      x += particle.mass * particle.position.x;
      y += particle.mass * particle.position.y;
    }
    return mass > 0 ? new Vector2D(x / mass, y / mass) : new Vector2D(0, 0);
  }
  /**
   * Get particle at a specific position (for mouse interaction)
   */
  getParticleAt(x, y, threshold = 30) {
    for (const particle of this.particles) {
      const distance = Math.sqrt(
        Math.pow(particle.position.x - x, 2) + Math.pow(particle.position.y - y, 2)
      );
      if (distance < threshold) {
        return particle;
      }
    }
    return null;
  }
};

// vendor/gravity-simulator/src/scalebar.ts
var SCALE_BAR_MIN_PX = 70;
var SCALE_BAR_MAX_PX = 180;
var FALLBACK = { length: 100, label: "100 units" };
function niceScaleLength(zoom) {
  if (!(zoom > 0) || !Number.isFinite(zoom)) return FALLBACK;
  let decade = Math.pow(10, Math.floor(Math.log10(SCALE_BAR_MIN_PX / zoom)) - 1);
  for (let step = 0; step < 24; step++) {
    for (const multiple of [1, 2, 5]) {
      const length = decade * multiple;
      const pixels = length * zoom;
      if (pixels >= SCALE_BAR_MIN_PX && pixels <= SCALE_BAR_MAX_PX) {
        return { length, label: `${formatLength(length)} units` };
      }
    }
    decade *= 10;
  }
  return FALLBACK;
}
function formatLength(value) {
  return value >= 1 ? value.toLocaleString("en-US") : String(value);
}

// vendor/gravity-simulator/src/Renderer.ts
var PARTICLE_ARROW_MIN_LENGTH = 18;
var PARTICLE_ARROW_MAX_LENGTH = 60;
var COLOR_BACKGROUND = [10, 15, 30];
var COLOR_FORCE_ARROW = [255, 136, 0];
var COLOR_VELOCITY_ARROW = [0, 255, 255];
var COLOR_TRAIL = [200, 200, 255];
var COLOR_STREAMLINE = [130, 190, 235];
var TRAIL_BANDS = 16;
var MIN_LABELLED_DIAMETER_PX = 18;
var MIN_SPUN_DIAMETER_PX = 10;
var COLOR_SPIN_MARKER = [40, 60, 110];
var CONTOUR_LABEL_PX = 10;
function formatLevel(value) {
  const [mantissa, exponent] = Math.abs(value).toExponential(1).split("e");
  const power = Number(exponent);
  return power === 0 ? mantissa : `${mantissa}e${power}`;
}
var COLOR_SCALE_BAR = [150, 165, 190];
var COLOR_FOLLOW_RING = [255, 200, 0];
var COLOR_DEBUG_TEXT = [190, 210, 240];
var COLOR_DEBUG_PANEL = [10, 15, 30, 200];
var MIN_DRAWN_DIAMETER_PX = 3;
var FOLLOW_RING_MARGIN_PX = 8;
var FOLLOW_RING_MIN_RADIUS_PX = 10;
var SCALE_BAR_MARGIN_PX = 28;
function hsvToRgb(hue, saturation, value) {
  const c = value * saturation;
  const x = c * (1 - Math.abs(hue / 60 % 2 - 1));
  const m = value - c;
  const [r, g, b] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
var COLOR_PARTICLE_GLOW = [100, 150, 255];
var COLOR_PARTICLE_BODY = [150, 200, 255];
var COLOR_PARTICLE_EDGE = [200, 220, 255];
var COLOR_VELOCITY_PREVIEW = [255, 200, 0];
function logNormalize(value, min, max) {
  const logMin = Math.log(min + 1);
  const logMax = Math.log(max + 1);
  if (!(logMax > logMin)) return 0.5;
  const t = (Math.log(value + 1) - logMin) / (logMax - logMin);
  return Math.max(0, Math.min(1, t));
}
var Renderer = class {
  constructor(p, engine) {
    __publicField(this, "p");
    __publicField(this, "engine");
    __publicField(this, "showVectorField", true);
    __publicField(this, "showTrails", true);
    __publicField(this, "showParticleVectors", true);
    // Show force and velocity vectors on particles
    // Render settings
    __publicField(this, "particleSizeMultiplier", 1);
    __publicField(this, "arrowSizeMultiplier", 1);
    /**
     * Screen pixels per world unit — the camera's zoom, pushed in by main each
     * frame.
     *
     * Everything here draws in world coordinates, so nothing else needs it; the
     * exception is deciding whether a mass label is large enough on screen to be
     * worth drawing. See `drawParticles`.
     */
    __publicField(this, "zoom", 1);
    /**
     * The range of field magnitudes drawn in the last frame, and the levels the
     * contours traced — whichever the mode produced.
     *
     * Arrow length and hue are both normalized against the range *present in the
     * frame*, so without publishing the two ends of it the picture is
     * self-consistent and unreadable in absolute terms: the legend can say which
     * colour is strong, but not how strong. This is what lets it say the number.
     */
    __publicField(this, "fieldScale", null);
    /**
     * A pinned set of magnitude ranges, or null to normalize per frame.
     *
     * Everything about the arrows is otherwise relative to the frame they are
     * drawn in, which is what keeps them legible across the ~10⁶ span the sliders
     * can produce and what makes two frames incomparable by eye. Pinning the
     * range fixes that at the price the relative version was paying it for: a
     * scene that collapses after the lock is set saturates, and one that flies
     * apart fades out. Hence a control rather than a default, and hence the
     * legend having to say which of the two it is showing.
     *
     * The field entry is only meaningful for the arrow modes. Contours and the
     * heightmap draw *potential*, and streamlines have no magnitude at all, so
     * the lock does not apply to them and they go on publishing their own range —
     * a locked force range would be a number in the wrong units.
     */
    __publicField(this, "scaleLock", null);
    /**
     * Set when the viewer asks for a lock, cleared once a frame has filled it in.
     *
     * The ranges only exist part-way through a draw, so a lock asked for between
     * frames has nothing to capture yet; this defers it by one frame rather than
     * capturing an empty scale or making the caller wait for a callback.
     */
    __publicField(this, "lockRequested", false);
    /**
     * Whether a lock was requested when this frame started.
     *
     * The request is cleared at the *end* of `draw()`, not by whichever pass
     * happens to fill in a part of it: which passes run depends on the field mode
     * and on two checkboxes, so no single pass can know whether it is the last
     * one. An earlier version cleared the flag when the field and the per-body
     * ranges were both present, and a lock set while a contour was on screen was
     * therefore never satisfied at all.
     */
    /** Reused between frames; see `drawHeightmap`. */
    __publicField(this, "heightmapImage", null);
    this.p = p;
    this.engine = engine;
  }
  /**
   * Draw the entire simulation
   */
  draw() {
    this.p.background(...COLOR_BACKGROUND);
    if (this.showVectorField) {
      this.drawField();
    }
    if (this.showTrails) {
      this.drawTrails();
    }
    this.drawParticles();
    if (this.showParticleVectors) {
      this.drawParticleVectors();
    }
    this.lockRequested = false;
  }
  /**
   * Draw the vector field.
   *
   * Colour and length are both driven by force magnitude, normalized against
   * the range present in this frame so the field stays legible whatever the
   * masses and distances are.
   */
  /** Draw whichever picture of the field the current mode produced. */
  drawField() {
    this.fieldScale = null;
    const mode = this.engine.vectorField.fieldMode;
    if (mode === "contours") {
      this.drawContours();
      return;
    }
    if (mode === "heightmap") {
      this.drawHeightmap();
      return;
    }
    if (mode === "streamlines") {
      this.drawStreamlines();
      return;
    }
    this.drawVectorField();
  }
  /**
   * Equipotential lines, coloured by depth on the same ramp the arrows use:
   * red for the deep well, blue for the shallows.
   *
   * Drawn as one polyline pass per level rather than per segment, for the same
   * reason the trails are banded — the stroke change is the cost.
   */
  drawContours() {
    const lines = this.engine.vectorField.getContours();
    if (lines.length === 0) return;
    const levels = lines.map((line) => Math.abs(line.level));
    const drawn = { min: Math.min(...levels), max: Math.max(...levels) };
    if (this.lockRequested) this.captureLock({ potential: drawn });
    this.fieldScale = this.scaleLock?.potential ?? drawn;
    this.p.push();
    this.p.colorMode(this.p.HSB, 360, 100, 100, 100);
    this.p.noFill();
    this.p.strokeWeight(1 / this.zoom);
    const logMin = Math.log(this.fieldScale.min);
    const logMax = Math.log(this.fieldScale.max);
    for (const line of lines) {
      const t = logMax === logMin ? 0.5 : (Math.log(Math.abs(line.level)) - logMin) / (logMax - logMin);
      this.p.stroke(240 - t * 240, 85, 95, 70);
      for (const segment of line.segments) {
        this.p.line(segment.from.x, segment.from.y, segment.to.x, segment.to.y);
      }
    }
    this.drawContourLabels(lines);
    this.p.pop();
  }
  /**
   * Write the level on every other contour, near the middle of the view.
   *
   * The legend gives the range of potentials on screen; it cannot say which
   * line is which. Labelling all of them is clutter — every other one is enough
   * to read the gradient, and choosing the segment nearest the middle height of
   * the view lines the labels up in a rough ladder, the way a contour map does
   * it.
   */
  drawContourLabels(lines) {
    const view = this.engine.vectorField.lastView;
    if (!view) return;
    const middleY = (view.minY + view.maxY) / 2;
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(CONTOUR_LABEL_PX / this.zoom);
    this.p.noStroke();
    for (let i = 0; i < lines.length; i += 2) {
      const line = lines[i];
      let best = null;
      let bestDistance = Infinity;
      for (const segment of line.segments) {
        const x = (segment.from.x + segment.to.x) / 2;
        const y = (segment.from.y + segment.to.y) / 2;
        const distance = Math.abs(y - middleY);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = { x, y };
        }
      }
      if (!best) continue;
      this.p.fill(0, 0, 100, 75);
      this.p.text(formatLevel(line.level), best.x, best.y);
    }
  }
  /**
   * The potential as shaded ground: deep wells bright, flat space dark.
   *
   * Drawn as a small `p5.Image` stretched over the view rather than as one
   * rectangle per cell. A few thousand `rect()` calls a frame is exactly the
   * kind of per-item state change that made the trails and the particle pass
   * expensive; writing pixels and letting the canvas scale the result costs one
   * draw call, and the interpolation it does on the way up is the smooth
   * gradient a heightmap wants anyway.
   *
   * The scale is logarithmic in |potential|, for the same reason the contour
   * levels are: the value spans orders of magnitude across a single view, and
   * a linear ramp puts every visible change inside the innermost few pixels.
   */
  drawHeightmap() {
    const grid = this.engine.vectorField.getHeightmap();
    if (!grid || grid.min >= 0) return;
    const view = this.engine.vectorField.lastView;
    if (!view) return;
    const seen = {
      min: Math.max(Math.abs(grid.max), Math.abs(grid.min) * 1e-4),
      max: Math.abs(grid.min)
    };
    if (this.lockRequested) this.captureLock({ potential: seen });
    const range = this.scaleLock?.potential ?? seen;
    this.fieldScale = range;
    const shallowest = range.min;
    const logMin = Math.log(range.min);
    const logMax = Math.log(range.max);
    const columns = grid.columns + 1;
    const rows = grid.rows + 1;
    if (!this.heightmapImage || this.heightmapImage.width !== columns || this.heightmapImage.height !== rows) {
      this.heightmapImage = this.p.createImage(columns, rows);
    }
    const image = this.heightmapImage;
    image.loadPixels();
    for (let i = 0; i < columns * rows; i++) {
      const magnitude = Math.abs(grid.values[i]);
      const t = logMax === logMin ? 0 : Math.min(
        1,
        Math.max(0, (Math.log(Math.max(magnitude, shallowest)) - logMin) / (logMax - logMin))
      );
      const [r, g, b] = hsvToRgb(240 - t * 240, 0.85, 0.15 + t * 0.85);
      const pixel = i * 4;
      image.pixels[pixel] = r;
      image.pixels[pixel + 1] = g;
      image.pixels[pixel + 2] = b;
      image.pixels[pixel + 3] = 235;
    }
    image.updatePixels();
    this.p.push();
    this.p.image(image, view.minX, view.minY, view.maxX - view.minX, view.maxY - view.minY);
    this.p.pop();
  }
  /**
   * Streamlines, as polylines with an arrowhead partway along so the direction
   * of the flow is visible.
   */
  drawStreamlines() {
    const lines = this.engine.vectorField.getStreamlines();
    if (lines.length === 0) return;
    this.p.push();
    this.p.noFill();
    this.p.stroke(...COLOR_STREAMLINE);
    this.p.strokeWeight(1 / this.zoom);
    for (const line of lines) {
      this.p.beginShape();
      for (const point of line) this.p.vertex(point.x, point.y);
      this.p.endShape();
    }
    this.p.fill(...COLOR_STREAMLINE);
    this.p.noStroke();
    for (const line of lines) {
      if (line.length < 4) continue;
      const at = Math.floor(line.length / 2);
      const direction = line[at].sub(line[at - 1]);
      if (direction.magnitude() === 0) continue;
      this.drawArrowhead(line[at].x, line[at].y, direction.normalize(), 5 / this.zoom);
    }
    this.p.pop();
  }
  drawVectorField() {
    const samples = this.engine.vectorField.getSamples();
    if (samples.length === 0) return;
    let maxMagnitude = 0;
    let minMagnitude = Infinity;
    for (const sample of samples) {
      const mag = sample.force.magnitude();
      if (mag > 0) {
        if (mag > maxMagnitude) maxMagnitude = mag;
        if (mag < minMagnitude) minMagnitude = mag;
      }
    }
    if (minMagnitude === Infinity) return;
    if (this.lockRequested) this.captureLock({ field: { min: minMagnitude, max: maxMagnitude } });
    const range = this.scaleLock?.field ?? { min: minMagnitude, max: maxMagnitude };
    this.fieldScale = range;
    this.p.push();
    this.p.colorMode(this.p.HSB, 360, 100, 100, 100);
    for (const sample of samples) {
      this.drawFieldArrow(sample.position, sample.force, range.min, range.max);
    }
    this.p.pop();
  }
  /**
   * One vector-field arrow.
   * Hue runs Red (strong) -> Yellow -> Green -> Cyan -> Blue (weak).
   * Requires HSB colour mode, set once by the caller.
   */
  drawFieldArrow(position, vector, minMagnitude, maxMagnitude) {
    const magnitude = vector.magnitude();
    if (magnitude <= 0) return;
    const t = logNormalize(magnitude, minMagnitude, maxMagnitude);
    const hue = this.p.map(t, 0, 1, 240, 0);
    const saturation = this.p.map(t, 0, 1, 60, 100);
    const brightness = 90;
    const alpha = this.p.map(t, 0, 1, 30, 90);
    this.p.stroke(hue, saturation, brightness, alpha);
    this.p.fill(hue, saturation, brightness, alpha);
    this.p.strokeWeight(this.p.map(t, 0, 1, 1, 3) * this.arrowSizeMultiplier);
    const arrowLength = 25 * this.arrowSizeMultiplier * (0.2 + t * 0.8);
    const direction = vector.normalize();
    const endX = position.x + direction.x * arrowLength;
    const endY = position.y + direction.y * arrowLength;
    this.p.line(position.x, position.y, endX, endY);
    this.drawArrowhead(endX, endY, direction, this.p.map(t, 0, 1, 3, 8) * this.arrowSizeMultiplier);
  }
  /**
   * Draw particle trails, fading towards the oldest end.
   *
   * Drawn as `TRAIL_BANDS` polylines per particle rather than one `line()` per
   * point pair. A per-segment fade needs a `stroke()` before every segment, and
   * that state change is the whole cost: at the figure-eight preset's
   * period-length trail it was 7,800 stroke-and-line pairs a frame and pinned
   * the app at 30fps. Banding makes it 48 shape draws for the same picture —
   * the fade is 16 steps instead of 2,600, which is not visible on a trail that
   * is fading out anyway.
   */
  drawTrails() {
    this.p.push();
    this.p.noFill();
    this.p.strokeWeight(1);
    for (const particle of this.engine.particles) {
      const trail = particle.trail;
      if (trail.length < 2) continue;
      const bandSize = Math.max(1, Math.ceil((trail.length - 1) / TRAIL_BANDS));
      for (let start = 0; start < trail.length - 1; start += bandSize) {
        const end = Math.min(start + bandSize, trail.length - 1);
        const alpha = this.p.map((start + end) / 2, 0, trail.length - 1, 0, 255);
        this.p.stroke(...COLOR_TRAIL, alpha);
        this.p.beginShape();
        for (let i = start; i <= end; i++) {
          if (i > start && trail[i].jumped) {
            this.p.endShape();
            this.p.beginShape();
          }
          this.p.vertex(trail[i].position.x, trail[i].position.y);
        }
        this.p.endShape();
      }
    }
    this.p.pop();
  }
  /**
   * Draw the force and velocity arrow on every particle.
   *
   * Both are normalized against the range across all particles this frame, so
   * the arrows compare bodies against each other and stay on-screen whatever
   * the absolute magnitudes are.
   */
  drawParticleVectors() {
    const particles = this.engine.particles;
    if (particles.length === 0) return;
    const forces = particles.map((p) => p.netForce.magnitude());
    const speeds = particles.map((p) => p.velocity.magnitude());
    const frameForce = { min: Math.min(...forces), max: Math.max(...forces) };
    const frameSpeed = { min: Math.min(...speeds), max: Math.max(...speeds) };
    if (this.lockRequested) this.captureLock({ force: frameForce, speed: frameSpeed });
    const forceRange = this.scaleLock?.force ?? frameForce;
    const speedRange = this.scaleLock?.speed ?? frameSpeed;
    this.p.push();
    for (const particle of particles) {
      const force = particle.netForce.magnitude();
      if (force > 0) {
        this.drawParticleArrow(
          particle,
          particle.netForce,
          logNormalize(force, forceRange.min, forceRange.max),
          COLOR_FORCE_ARROW
        );
      }
      const speed = particle.velocity.magnitude();
      if (speed > 0) {
        this.drawParticleArrow(
          particle,
          particle.velocity,
          logNormalize(speed, speedRange.min, speedRange.max),
          COLOR_VELOCITY_ARROW
        );
      }
    }
    this.p.pop();
  }
  /**
   * One particle arrow, starting at the edge of the body so it does not sit
   * underneath the mass label.
   */
  drawParticleArrow(particle, vector, t, color) {
    const direction = vector.normalize();
    const length = (PARTICLE_ARROW_MIN_LENGTH + (PARTICLE_ARROW_MAX_LENGTH - PARTICLE_ARROW_MIN_LENGTH) * t) * this.arrowSizeMultiplier;
    const startOffset = particle.radius * this.particleSizeMultiplier;
    const startX = particle.position.x + direction.x * startOffset;
    const startY = particle.position.y + direction.y * startOffset;
    const endX = startX + direction.x * length;
    const endY = startY + direction.y * length;
    this.p.stroke(...color, 230);
    this.p.fill(...color, 230);
    this.p.strokeWeight(3 * this.arrowSizeMultiplier);
    this.p.line(startX, startY, endX, endY);
    this.drawArrowhead(endX, endY, direction, 8 * this.arrowSizeMultiplier);
  }
  /**
   * Filled triangle at (x, y) pointing along `direction`.
   */
  drawArrowhead(x, y, direction, size) {
    this.p.push();
    this.p.translate(x, y);
    this.p.rotate(Math.atan2(direction.y, direction.x));
    this.p.noStroke();
    this.p.triangle(-size, -size / 2, -size, size / 2, 0, 0);
    this.p.pop();
  }
  /**
   * Draw all particles
   */
  /**
   * Draw every body: glows, then bodies, then labels.
   *
   * One pass per layer rather than one pass per body, because `fill()` and
   * `stroke()` build a colour object each time they are called and that state
   * change — not the geometry — is the cost. Six state changes per body became
   * six per frame.
   *
   * The label pass is skipped entirely when bodies are too small on screen to
   * hold a label: `text()` is the most expensive call in this file, and at the
   * galaxy preset's 22% zoom a label is about two pixels tall, so it was being
   * paid for and not read. Four hundred bodies cost 83 ms a frame before both
   * changes and 22 ms after.
   *
   * Drawing all the glows first also means a glow can no longer be painted over
   * a body drawn earlier in the list, which is what used to happen wherever two
   * bodies overlapped.
   */
  drawParticles() {
    const particles = this.engine.particles;
    if (particles.length === 0) return;
    this.p.push();
    const floor = MIN_DRAWN_DIAMETER_PX / (2 * this.zoom);
    const drawnRadius = (particle) => Math.max(particle.radius * this.particleSizeMultiplier, floor);
    this.p.noStroke();
    this.p.fill(...COLOR_PARTICLE_GLOW, 30);
    for (const particle of particles) {
      this.p.circle(particle.position.x, particle.position.y, drawnRadius(particle) * 3);
    }
    this.p.fill(...COLOR_PARTICLE_BODY);
    this.p.stroke(...COLOR_PARTICLE_EDGE);
    this.p.strokeWeight(2);
    for (const particle of particles) {
      this.p.circle(particle.position.x, particle.position.y, drawnRadius(particle) * 2);
    }
    this.drawSpinMarkers(particles);
    this.drawMassLabels(particles);
    this.p.pop();
  }
  /**
   * A radius line on each spinning body, so its rotation is visible.
   *
   * Without it, spin is state the simulation carries and the picture never
   * shows — an off-centre impact would look like a plain deflection and the
   * whole of M6 would be invisible. Only bodies actually turning get one, so a
   * scene with no contacts looks exactly as it did.
   */
  drawSpinMarkers(particles) {
    const smallest = MIN_SPUN_DIAMETER_PX / (2 * this.particleSizeMultiplier * this.zoom);
    let any = false;
    for (const particle of particles) {
      if (particle.angularVelocity !== 0 && particle.radius >= smallest) {
        any = true;
        break;
      }
    }
    if (!any) return;
    this.p.stroke(...COLOR_SPIN_MARKER);
    this.p.strokeWeight(1.5 / this.zoom);
    this.p.noFill();
    for (const particle of particles) {
      if (particle.angularVelocity === 0 || particle.radius < smallest) continue;
      const visualRadius = particle.radius * this.particleSizeMultiplier;
      this.p.line(
        particle.position.x,
        particle.position.y,
        particle.position.x + Math.cos(particle.angle) * visualRadius,
        particle.position.y + Math.sin(particle.angle) * visualRadius
      );
    }
  }
  /** Mass labels, for the bodies large enough on screen to carry one. */
  drawMassLabels(particles) {
    const smallestLabelled = MIN_LABELLED_DIAMETER_PX / (2 * this.particleSizeMultiplier * this.zoom);
    let any = false;
    for (const particle of particles) {
      if (particle.radius >= smallestLabelled) {
        any = true;
        break;
      }
    }
    if (!any) return;
    this.p.fill(20, 30, 50);
    this.p.noStroke();
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(Math.max(8, Math.min(14, 10 * this.particleSizeMultiplier)));
    for (const particle of particles) {
      if (particle.radius < smallestLabelled) continue;
      this.p.text(Math.round(particle.mass), particle.position.x, particle.position.y);
    }
  }
  /**
   * A ruler along the bottom of the canvas: a bar of known world length, with
   * the length written under it.
   *
   * Everything else in the picture is relative. Arrow length is normalized
   * against the frame, body radius follows mass rather than anything the viewer
   * chose, and the zoom readout is a percentage of an arbitrary starting point —
   * so nothing on screen answered "how far apart are those two?" until this.
   *
   * **Drawn in screen space**, so it must be called after the camera transform
   * has been reset; the whole point is that its length on screen stays put
   * while the world scales underneath it.
   */
  drawScaleBar() {
    const { length, label } = niceScaleLength(this.zoom);
    const pixels = length * this.zoom;
    const right = this.p.width / 2 + pixels / 2;
    const left = this.p.width / 2 - pixels / 2;
    const y = this.p.height - SCALE_BAR_MARGIN_PX;
    this.p.push();
    this.p.stroke(...COLOR_SCALE_BAR);
    this.p.strokeWeight(2);
    this.p.line(left, y, right, y);
    this.p.line(left, y - 4, left, y + 4);
    this.p.line(right, y - 4, right, y + 4);
    this.p.noStroke();
    this.p.fill(...COLOR_SCALE_BAR);
    this.p.textAlign(this.p.CENTER, this.p.TOP);
    this.p.textSize(11);
    this.p.text(label, this.p.width / 2, y + 6);
    this.p.pop();
  }
  /**
   * Pin the arrow scales to whatever is on screen at the next opportunity.
   *
   * Takes effect on the next frame that actually draws arrows, which is also
   * the only moment the ranges exist.
   */
  lockScale() {
    this.lockRequested = true;
  }
  /** Go back to normalizing against each frame. */
  unlockScale() {
    this.lockRequested = false;
    this.scaleLock = null;
  }
  /**
   * Fill in the pending lock from the ranges a draw pass just computed.
   *
   * Whichever pass gets there first captures its own part and leaves sensible
   * values for the rest: the field pass runs before the per-body pass, and
   * either may be switched off, so neither can assume it is the one that will
   * be asked.
   */
  captureLock(part) {
    const existing = this.scaleLock;
    this.scaleLock = {
      field: part.field ?? existing?.field ?? null,
      potential: part.potential ?? existing?.potential ?? null,
      force: part.force ?? existing?.force ?? { min: 0, max: 0 },
      speed: part.speed ?? existing?.speed ?? { min: 0, max: 0 }
    };
  }
  /**
   * A ring around the body the camera is following.
   *
   * Drawn in *screen* space, like the ruler and the overlay, for the reason
   * that makes the ring worth having: it has to stay the same size on screen
   * whatever the zoom, or the thing meant to say "this one" would shrink to
   * nothing exactly when a viewer is zoomed out and most needs it.
   */
  drawFollowRing(screenX, screenY, bodyRadiusPx) {
    const radius = Math.max(bodyRadiusPx + FOLLOW_RING_MARGIN_PX, FOLLOW_RING_MIN_RADIUS_PX);
    this.p.push();
    this.p.noFill();
    this.p.stroke(...COLOR_FOLLOW_RING);
    this.p.strokeWeight(1.5);
    this.p.circle(screenX, screenY, radius * 2);
    this.p.strokeWeight(2);
    for (const angle of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      this.p.line(
        screenX + cos * radius,
        screenY + sin * radius,
        screenX + cos * (radius + 5),
        screenY + sin * (radius + 5)
      );
    }
    this.p.pop();
  }
  /**
   * The debug overlay: whatever `main` decided is worth knowing, in the corner.
   *
   * Screen space, after the camera transform is reset, for the same reason the
   * ruler is. The renderer deliberately knows nothing about what the lines say
   * — it takes strings — so that adding a reading to the overlay never means
   * teaching the renderer about the simulation.
   */
  drawDebugOverlay(lines) {
    if (lines.length === 0) return;
    const padding = 8;
    const lineHeight = 14;
    const width = 232;
    const height = lines.length * lineHeight + padding * 2;
    const left = this.p.width - width - 10;
    const top = 10;
    this.p.push();
    this.p.noStroke();
    this.p.fill(...COLOR_DEBUG_PANEL);
    this.p.rect(left, top, width, height, 6);
    this.p.fill(...COLOR_DEBUG_TEXT);
    this.p.textAlign(this.p.LEFT, this.p.TOP);
    this.p.textSize(11);
    this.p.textFont("monospace");
    lines.forEach((line, index) => {
      this.p.text(line, left + padding, top + padding + index * lineHeight);
    });
    this.p.pop();
  }
  /**
   * Draw a preview arrow for adding velocity
   */
  drawVelocityPreview(startX, startY, endX, endY) {
    this.p.push();
    this.p.stroke(...COLOR_VELOCITY_PREVIEW);
    this.p.fill(...COLOR_VELOCITY_PREVIEW);
    this.p.strokeWeight(2);
    this.p.line(startX, startY, endX, endY);
    const direction = new Vector2D(endX - startX, endY - startY).normalize();
    this.drawArrowhead(endX, endY, direction, 10);
    this.p.pop();
  }
};

// vendor/gravity-simulator/periodic.ts
var periodicDelta = (d, span) => d - span * Math.floor(d / span + 0.5);
function periodicTree(particles, bounds, positions = particles.map((p) => p.position)) {
  const { width: w, height: h } = bounds;
  const bodies = particles.map((p, i) => ({ x: periodicDelta(positions[i].x, w), y: periodicDelta(positions[i].y, h), mass: p.mass, radius: p.radius, vx: p.velocity.x, vy: p.velocity.y }));
  const tree = QuadTree.build(bodies);
  function sample(x, y, radius, skip, G, theta, range, potential = false) {
    x = periodicDelta(x, w);
    y = periodicDelta(y, h);
    let ax = 0, ay = 0, value = 0;
    const add = (dx, dy, mass, r) => {
      const d2 = dx * dx + dy * dy;
      if (d2 > range * range) return;
      if (potential) {
        value -= G * mass / Math.max(Math.sqrt(d2), r, 1e-9);
        return;
      }
      if (!d2) return;
      const f = G * mass / (Math.max(d2, (r + radius) ** 2) * Math.sqrt(d2));
      ax += dx * f;
      ay += dy * f;
    };
    function visit(node) {
      if (!node.mass) return;
      if (!node.children) {
        for (const i of node.bodies) {
          if (i !== skip) {
            const b = bodies[i];
            add(periodicDelta(b.x - x, w), periodicDelta(b.y - y, h), b.mass, b.radius);
          }
        }
        return;
      }
      const dx = periodicDelta(node.comX - x, w), dy = periodicDelta(node.comY - y, h), d2 = dx * dx + dy * dy;
      const cx = periodicDelta(node.cx - x, w), cy = periodicDelta(node.cy - y, h);
      const coherent = Math.abs(cx) + node.half < w / 2 && Math.abs(cy) + node.half < h / 2;
      const containsSelf = skip >= 0 && Math.abs(bodies[skip].x - node.cx) <= node.half && Math.abs(bodies[skip].y - node.cy) <= node.half;
      if (coherent && !containsSelf && 4 * node.half ** 2 < theta * theta * d2 && Math.hypot(cx, cy) + Math.SQRT2 * node.half <= range) {
        add(dx, dy, node.mass, node.maxRadius);
        return;
      }
      for (const child of node.children) visit(child);
    }
    visit(tree.root);
    return potential ? value : new Vector2D(ax, ay);
  }
  tree.accelerationOn = (i, G, theta = 0.5) => sample(bodies[i].x, bodies[i].y, bodies[i].radius, i, G, theta, Infinity);
  tree.accelerationAt = (x, y, G, theta = 0.5, range = Infinity) => sample(x, y, 0, -1, G, theta, range);
  tree.potentialAt = (x, y, G, theta = 0.5) => sample(x, y, 0, -1, G, theta, Infinity, true);
  const shortest = tree.shortestInteractionTime.bind(tree);
  tree.shortestInteractionTime = (G) => Math.min(shortest(G), QuadTree.build(bodies.map((b) => ({ ...b, x: periodicDelta(b.x + w / 2, w), y: periodicDelta(b.y + h / 2, h) }))).shortestInteractionTime(G));
  return tree;
}
function installPeriodicPhysics(physics, getBounds) {
  const theta = () => physics.forceMode === "exact" || physics.particles.length < 128 ? 0 : physics.theta;
  physics.computeForces = () => {
    physics.forcesDirty = false;
    physics.tree = periodicTree(physics.particles, getBounds());
    for (let i = 0; i < physics.particles.length; i++) {
      const p = physics.particles[i];
      p.acceleration = physics.tree.accelerationOn(i, physics.G, theta());
      p.netForce = p.acceleration.mult(p.mass);
    }
  };
  physics.accelerationsAt = (positions) => {
    const tree = periodicTree(physics.particles, getBounds(), positions);
    return positions.map((_, i) => tree.accelerationOn(i, physics.G, theta()));
  };
  physics.updateField = (view) => {
    const tree = periodicTree(physics.particles, getBounds());
    physics.vectorField.update(physics.particles, physics.G, view, tree, theta());
  };
  const resolve = physics.resolveCollisions.bind(physics);
  physics.resolveCollisions = (previous) => {
    let events = resolve(previous);
    const ps = physics.particles, { width: w, height: h } = getBounds();
    const tree = QuadTree.build(ps.map((p, i) => {
      const a = previous?.[i] || p.position, dx = p.position.x - a.x, dy = p.position.y - a.y;
      return { x: a.x + dx / 2, y: a.y + dy / 2, mass: p.mass, radius: p.radius + Math.hypot(dx, dy) / 2, vx: p.velocity.x, vy: p.velocity.y };
    }));
    const consumed = /* @__PURE__ */ new Set();
    for (let i = 0; i < ps.length; i++) {
      if (consumed.has(i)) continue;
      const a = ps[i], start = previous?.[i] || a.position;
      const centre = start.add(a.position).div(2), reach = a.radius + a.position.sub(start).magnitude() / 2;
      const candidates = [];
      for (const sx of [-w, 0, w]) for (const sy of [-h, 0, h]) if (sx || sy) tree.withinContact(centre.x + sx, centre.y + sy, reach, candidates);
      for (const j of new Set(candidates)) {
        if (j <= i || consumed.has(j)) continue;
        const b = ps[j];
        const dx = periodicDelta(b.position.x - a.position.x, w), dy = periodicDelta(b.position.y - a.position.y, h);
        const shift = new Vector2D(a.position.x + dx - b.position.x, a.position.y + dy - b.position.y);
        if (!shift.x && !shift.y) continue;
        const original = b.position;
        b.position = b.position.add(shift);
        const contact = a.radius + b.radius;
        const hit = dx * dx + dy * dy < contact * contact || previous && sweptContactTime(a, previous[i], b, previous[j].add(shift)) !== null;
        if (!hit) {
          b.position = original;
          continue;
        }
        const heavy = a.mass >= b.mass ? i : j, light = heavy === i ? j : i;
        ps[heavy].absorb(ps[light]);
        const p = ps[heavy];
        p.position = new Vector2D(periodicDelta(p.position.x, w), periodicDelta(p.position.y, h));
        if (previous) previous[heavy] = p.position.copy();
        consumed.add(light);
        physics.collisionCount++;
        events++;
        if (light === i) break;
      }
    }
    for (const i of [...consumed].sort((a, b) => b - a)) {
      ps.splice(i, 1);
      previous?.splice(i, 1);
    }
    if (consumed.size) {
      physics.tree = null;
      physics.forcesDirty = true;
    }
    return events;
  };
}
export {
  Particle,
  PhysicsEngine,
  Renderer,
  Vector2D,
  installPeriodicPhysics,
  periodicDelta,
  periodicTree
};
