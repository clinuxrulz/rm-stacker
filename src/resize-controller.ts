import { Accessor, createMemo } from "solid-js";
import * as THREE from "three";
import { Coordinates, SideKind, Sides } from "./types";

const SNAP_DIST = 10.0;
const SNAP_DIST_SQUARED = SNAP_DIST * SNAP_DIST;

type Edge = "North" | "South" | "East" | "West";

export function createResizeController(params: {
  mousePos: Accessor<THREE.Vector2 | undefined>,
  screenToWorld: (pt: THREE.Vector2, out?: THREE.Vector2) => THREE.Vector2,
  worldToScreen: (pt: THREE.Vector2, out?: THREE.Vector2) => THREE.Vector2,
  sides: Accessor<Sides>,
  coordinates: Accessor<Coordinates>,
}): {
  cursor: Accessor<string | undefined>,
} {
  let mouseWorldPos = createMemo(() => {
    let mousePos = params.mousePos();
    if (mousePos === undefined) {
      return undefined;
    }
    return params.screenToWorld(mousePos);
  });
  let edgeUnderMouse = createMemo(() => {
    let mousePos = params.mousePos();
    if (mousePos === undefined) {
      return;
    }
    let mouseWorldPos2 = mouseWorldPos();
    if (mouseWorldPos2 === undefined) {
      return;
    }
    let coordinates = params.coordinates();
    let pt = new THREE.Vector2();
    let pt2 = new THREE.Vector2();
    let closestEdge: {
      sideKind: SideKind,
      edge: Edge,
    } | undefined;
    let closestDist: number | undefined = undefined;
    let sides = params.sides();
    for (let kind in sides) {
      let sideKind = kind as SideKind;
      let coordinate = coordinates[sideKind];
      // test west side
      {
        pt.setX(coordinate.x);
        pt.setY(Math.max(coordinate.y, Math.min(coordinate.y + mouseWorldPos2.y)));
        params.worldToScreen(pt, pt2);
        let dist = pt2.distanceToSquared(mousePos);
        if (dist <= SNAP_DIST_SQUARED) {
          if (closestDist === undefined || dist < closestDist) {
            closestDist = dist;
            closestEdge = {
              sideKind,
              edge: "West",
            };
          }
        }
      }
      // test east side
      {
        pt.setX(coordinate.x + sides[sideKind].width);
        pt.setY(Math.max(coordinate.y, Math.min(coordinate.y + mouseWorldPos2.y)));
        params.worldToScreen(pt, pt2);
        let dist = pt2.distanceToSquared(mousePos);
        if (dist <= SNAP_DIST_SQUARED) {
          if (closestDist === undefined || dist < closestDist) {
            closestDist = dist;
            closestEdge = {
              sideKind,
              edge: "East",
            };
          }
        }
      }
      // test north side
      {
        pt.setX(Math.max(coordinate.x, Math.min(coordinate.x + mouseWorldPos2.x)));
        pt.setY(coordinate.y);
        params.worldToScreen(pt, pt2);
        let dist = pt2.distanceToSquared(mousePos);
        if (dist <= SNAP_DIST_SQUARED) {
          if (closestDist === undefined || dist < closestDist) {
            closestDist = dist;
            closestEdge = {
              sideKind,
              edge: "North",
            };
          }
        }
      }
      // test south side
      {
        pt.setX(Math.max(coordinate.x, Math.min(coordinate.x + mouseWorldPos2.x)));
        pt.setY(coordinate.y + sides[sideKind].height);
        params.worldToScreen(pt, pt2);
        let dist = pt2.distanceToSquared(mousePos);
        if (dist <= SNAP_DIST_SQUARED) {
          if (closestDist === undefined || dist < closestDist) {
            closestDist = dist;
            closestEdge = {
              sideKind,
              edge: "South",
            };
          }
        }
      }
    }
    return closestEdge;
  });
  let cursor = createMemo(() => {
    let edgeUnderMouse2 = edgeUnderMouse();
    if (edgeUnderMouse2 === undefined) {
      return undefined;
    }
    switch (edgeUnderMouse2.edge) {
      case "North":
      case "South":
        return "ns-resize";
      case "East":
      case "West":
        return "ew-resize";
    }
  });
  return {
    cursor,
  };
}

