import { Accessor } from "solid-js";
import { createMemo } from "solid-js/types/server/signals.js";
import * as THREE from "three";
import { Coordinates, SideKind, Sides } from "./types";

const SNAP_DIST = 10.0;
const SNAP_DIST_SQUARED = SNAP_DIST * SNAP_DIST;

type Edge = "North" | "South" | "East" | "West";

export function createResizeController(params: {
  mousePos: Accessor<THREE.Vector2>,
  screenToWorld: (pt: THREE.Vector2, out?: THREE.Vector2) => THREE.Vector2,
  worldToScreen: (pt: THREE.Vector2, out?: THREE.Vector2) => THREE.Vector2,
  sides: Sides,
  coordinates: Accessor<Coordinates>,
}): {
  cursor: Accessor<string | undefined>,
} {
  let mouseWorldPos: Accessor<THREE.Vector2> = createMemo(() =>
    params.screenToWorld(params.mousePos())
  );
  let edgeUnderMouse = createMemo(() => {
    let mouseWorldPos2 = mouseWorldPos();
    let coordinates = params.coordinates();
    let pt = new THREE.Vector2();
    let pt2 = new THREE.Vector2();
    let closestEdge: {
      sideKind: SideKind,
      edge: Edge,
    } | undefined;
    let closestDist: number | undefined = undefined;
    for (let kind in params.sides) {
      let sideKind = kind as SideKind;
      let coordinate = coordinates[sideKind];
      // test west side
      {
        pt.setX(coordinate.x);
        pt.setY(Math.max(coordinate.y, Math.min(coordinate.y + mouseWorldPos2.y)));
        params.worldToScreen(pt, pt2);
        let dist = pt2.distanceToSquared(mouseWorldPos2);
        if (dist > SNAP_DIST_SQUARED) {
          continue;
        }
        if (closestDist === undefined || dist < closestDist) {
          closestDist = dist;
          closestEdge = {
            sideKind,
            edge: "West",
          };
        }
      }
      // test east side
      pt.setX(coordinate.x + params.sides[sideKind].width);
      pt.setY(Math.max(coordinate.y, Math.min(coordinate.y + mouseWorldPos2.y)));
      params.worldToScreen(pt, pt2);

    }
  });
  let cursor = () => undefined;
  return {
    cursor,
  };
}

