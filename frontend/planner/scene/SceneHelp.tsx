// "Moving around": a collapsed list of the 3D view's mouse, trackpad and keyboard controls.
export default function SceneHelp() {
  return (
    <details className="text-xs">
      <summary className="cursor-pointer">Moving around (works like Blender)</summary>
      <ul className="mt-2 mb-0 grid gap-1 ps-[1.2em]">
        <li>
          <b>Orbit:</b> drag empty ground, middle-drag, or Option/Alt + drag anywhere. On a trackpad, Option + two-finger swipe.
        </li>
        <li>
          <b>Pan:</b> Shift + drag, right-drag, Shift + scroll, or drag the hand button.
        </li>
        <li>
          <b>Zoom:</b> scroll, pinch, Ctrl + middle-drag, + and −, or drag the magnifier.
        </li>
        <li>
          <b>Views</b> (click the yard first): 1 front, 3 right, 7 top, Option/Ctrl + 1 or 3 for back or left, 5 perspective or orthographic, 2 4
          6 8 to orbit in steps, H to see the whole yard, F or . to zoom to the selected item. Or click an X, Y or Z ball in the corner.
        </li>
        <li>
          <b>Axes:</b> X (red) runs across the plan, Y (green) toward the top of the plan, Z (blue) is up.
        </li>
        <li>
          <b>Beds:</b> click one to select it, drag it to move it, arrow keys to nudge one grid square (Shift for five), Delete to remove.
        </li>
        <li>
          <b>Turning:</b> select a bed or shade source, then use the turn buttons in the corner, or press R to turn it 15° clockwise (Shift + R
          the other way). The editor&apos;s Rotation box takes an exact angle.
        </li>
        <li>
          <b>Snap to grid:</b> with it on, dragged and nudged items line their top-left corner up with the grid. Hold Ctrl while dragging to do
          the opposite. Positions you type in the editor are kept as typed.
        </li>
      </ul>
    </details>
  );
}
