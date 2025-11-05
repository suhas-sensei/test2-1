import { Vector3, Raycaster, Object3D } from 'three';
import type { Intersection } from 'three';

/**
 * Unified car physics configuration
 * All cars (player and AI) use these same parameters
 */
export const CAR_PHYSICS = {
  // Movement (reduced by 100x to match scaled down car/map)
  maxSpeed: 0.5,
  acceleration: 0.0065,
  deceleration: 0.96, // Applied when not accelerating
  brakeForce: 0.85,

  // Steering
  maxSteerAngle: 0.03,
  steerSpeed: 0.0015,
  steerFriction: 0.93,

  // Grip and friction
  lateralFriction: 0.85, // Tire grip - prevents sliding sideways
  forwardFriction: 0.97, // Rolling resistance

  // Physical properties
  carHeightOffset: 0.0226, // Adjusted for car scale (scaled down 100x)

  // Speed-dependent steering (less steering at high speeds)
  minSteerFactor: 0.6, // At max speed
  maxSteerFactor: 1.0, // At zero speed

  // Vertical (suspension) physics - NEW
  verticalStiffness: 0.20, // How quickly car moves toward ground (spring strength)
  verticalDamping: 0.60, // Reduces bouncing (shock absorber)
  maxVerticalSpeed: 1.0, // Maximum vertical velocity (prevents extreme jumps)
};

export interface CarState {
  velocity: Vector3;
  angularVelocity: number;
  position: Vector3;
  rotation: number;
  verticalVelocity: number; // For smooth terrain following (now required)
}

/**
 * Apply physics update to a car
 */
export function updateCarPhysics(
  state: CarState,
  controls: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  },
  deltaMultiplier: number = 1
): CarState {
  const { velocity, angularVelocity, position, rotation } = state;
  const { forward, backward, left, right } = controls;

  let newVelocity = velocity.clone();
  let newAngularVelocity = angularVelocity;
  let newRotation = rotation;

  // Calculate current speed
  const currentSpeed = Math.sqrt(
    newVelocity.x * newVelocity.x + newVelocity.z * newVelocity.z
  );

  // Speed-dependent steering factor (less steering at high speeds)
  const speedFactor =
    CAR_PHYSICS.maxSteerFactor -
    ((currentSpeed / CAR_PHYSICS.maxSpeed) *
      (CAR_PHYSICS.maxSteerFactor - CAR_PHYSICS.minSteerFactor));
  const effectiveMaxSteer = CAR_PHYSICS.maxSteerAngle * speedFactor;

  // Steering (angular velocity)
  if (left) {
    newAngularVelocity += CAR_PHYSICS.steerSpeed * deltaMultiplier;
    if (newAngularVelocity > effectiveMaxSteer) {
      newAngularVelocity = effectiveMaxSteer;
    }
  } else if (right) {
    newAngularVelocity -= CAR_PHYSICS.steerSpeed * deltaMultiplier;
    if (newAngularVelocity < -effectiveMaxSteer) {
      newAngularVelocity = -effectiveMaxSteer;
    }
  } else {
    // Apply steering friction when not turning
    newAngularVelocity *= CAR_PHYSICS.steerFriction;
  }

  // Apply rotation
  newRotation += newAngularVelocity;

  // Forward/Backward acceleration
  if (forward) {
    newVelocity.x -= Math.sin(newRotation) * CAR_PHYSICS.acceleration * deltaMultiplier;
    newVelocity.z -= Math.cos(newRotation) * CAR_PHYSICS.acceleration * deltaMultiplier;
  }
  if (backward) {
    newVelocity.x += Math.sin(newRotation) * CAR_PHYSICS.acceleration * 0.5 * deltaMultiplier; // Reverse is slower
    newVelocity.z += Math.cos(newRotation) * CAR_PHYSICS.acceleration * 0.5 * deltaMultiplier;
  }

  // Calculate forward and lateral vectors
  const forwardDir = new Vector3(-Math.sin(newRotation), 0, -Math.cos(newRotation));
  const rightDir = new Vector3(Math.cos(newRotation), 0, -Math.sin(newRotation));

  // Project velocity onto forward and lateral directions
  const forwardVelocity = newVelocity.dot(forwardDir);
  const lateralVelocity = newVelocity.dot(rightDir);

  // Apply lateral friction (tire grip - resist sideways sliding)
  const adjustedLateralVelocity = lateralVelocity * CAR_PHYSICS.lateralFriction;

  // Reconstruct velocity with reduced lateral component
  newVelocity.copy(
    forwardDir
      .clone()
      .multiplyScalar(forwardVelocity)
      .add(rightDir.clone().multiplyScalar(adjustedLateralVelocity))
  );

  // Recalculate speed after lateral friction
  const adjustedSpeed = Math.sqrt(
    newVelocity.x * newVelocity.x + newVelocity.z * newVelocity.z
  );

  // Cap speed at maximum
  if (adjustedSpeed > CAR_PHYSICS.maxSpeed) {
    newVelocity.multiplyScalar(CAR_PHYSICS.maxSpeed / adjustedSpeed);
  }

  // Apply forward friction (rolling resistance)
  if (backward && currentSpeed > 0.01) {
    // Braking
    newVelocity.multiplyScalar(CAR_PHYSICS.brakeForce);
  } else if (!forward && !backward) {
    // Natural deceleration when not accelerating
    newVelocity.multiplyScalar(CAR_PHYSICS.deceleration);
  } else {
    // Normal rolling friction
    newVelocity.multiplyScalar(CAR_PHYSICS.forwardFriction);
  }

  // Update position
  const newPosition = position.clone();
  newPosition.x += newVelocity.x;
  newPosition.z += newVelocity.z;

  return {
    velocity: newVelocity,
    angularVelocity: newAngularVelocity,
    position: newPosition,
    rotation: newRotation,
    verticalVelocity: state.verticalVelocity, // Preserve vertical velocity
  };
}

/**
 * Get the ground/road height at the car's position using downward raycast
 * Returns the Y position where the car should be placed to follow terrain
 */
export function getGroundHeight(
  position: Vector3,
  mapObjects: Object3D[],
  maxRayDistance: number = 1000
): number | null {
  const raycaster = new Raycaster();

  // Cast ray downward from high above the car's current position
  const rayOrigin = new Vector3(position.x, position.y + 100, position.z);
  const rayDirection = new Vector3(0, -1, 0); // Straight down

  raycaster.set(rayOrigin, rayDirection);
  raycaster.far = maxRayDistance;

  // Check intersections with all map objects
  const intersections: Intersection[] = [];
  for (const obj of mapObjects) {
    const hits = raycaster.intersectObject(obj, true);
    intersections.push(...hits);
  }

  // Find the closest (highest) ground point below the car
  if (intersections.length > 0) {
    // Sort by distance (closest first)
    intersections.sort((a, b) => a.distance - b.distance);

    // Return the Y position of the ground + car height offset
    return intersections[0].point.y + CAR_PHYSICS.carHeightOffset;
  }

  return null;
}

/**
 * Update vertical position with velocity-based physics for smooth terrain following
 * Keeps car locked at base height (21.9) unless gradual elevation change detected (ramps/bridges)
 *
 * @param currentY - Current Y position of the car
 * @param targetY - Target ground height from raycasting
 * @param currentVerticalVelocity - Current vertical velocity
 * @param deltaMultiplier - Delta time multiplier (normalized to 60fps)
 * @returns Updated { y: number, verticalVelocity: number }
 */
export function updateVerticalPhysics(
  currentY: number,
  targetY: number,
  currentVerticalVelocity: number,
  deltaMultiplier: number = 1
): { y: number; verticalVelocity: number } {
  // Base road height - lock car to this height on flat roads
  const BASE_HEIGHT = 21.9 + CAR_PHYSICS.carHeightOffset;
  const HEIGHT_THRESHOLD = 3.0; // Minimum height difference to trigger elevation change

  // Calculate the actual ground height (without car offset)
  const groundY = targetY - CAR_PHYSICS.carHeightOffset;

  // Calculate height difference
  const heightDifference = targetY - currentY;
  const absHeightDiff = Math.abs(heightDifference);

  // Check if we're significantly above base road level (on a bridge/elevated road)
  const isElevated = groundY > (21.9 + 5.0);

  // Check if we're on a gradual elevation change (ramp, bridge approach, subway entrance)
  const isGradualChange = absHeightDiff > HEIGHT_THRESHOLD;

  if (isElevated || isGradualChange) {
    // On elevated surface or gradual change - use smooth physics
    let newVerticalVelocity = currentVerticalVelocity +
      (heightDifference * CAR_PHYSICS.verticalStiffness * deltaMultiplier);

    // Apply damping (reduces oscillation - like shock absorbers)
    newVerticalVelocity *= CAR_PHYSICS.verticalDamping;

    // Clamp vertical velocity to prevent extreme movements
    if (newVerticalVelocity > CAR_PHYSICS.maxVerticalSpeed) {
      newVerticalVelocity = CAR_PHYSICS.maxVerticalSpeed;
    } else if (newVerticalVelocity < -CAR_PHYSICS.maxVerticalSpeed) {
      newVerticalVelocity = -CAR_PHYSICS.maxVerticalSpeed;
    }

    // Update Y position based on velocity
    const newY = currentY + newVerticalVelocity * deltaMultiplier;

    return {
      y: newY,
      verticalVelocity: newVerticalVelocity,
    };
  } else {
    // On regular flat road - lock to base height (21.9), no bobbing
    return {
      y: BASE_HEIGHT,
      verticalVelocity: 0,
    };
  }
}
