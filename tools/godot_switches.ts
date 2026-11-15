// THE GODOT PORT: the switches the game puts on as it starts (src/main.ts, at the foot: "A SWITCH PUT ON HERE IS PUT ON IN THE
// FLOORS' MONSTERS' BAKE TOO"), put on here the same way, so that what the export tools make is the game as it is played: the
// new enemy moves; the first five floors' new looks (floor 1 THE KING'S TOMB, the town THE CASTLE'S HALL, ...); the High City.
// Each tools/godot_*.ts calls this before it makes a Game or paints a picture.
import { ENEMY_MOVES, useEnemyMoves } from '../src/game/enemy_moves';
import { FLOOR_LOOKS, useFloorLooks } from '../src/game/floor_looks';
import { ALL_OF_IT, useAllOfIt } from '../src/game/all_of_it';

export function gameSwitches(): void {
  useEnemyMoves(ENEMY_MOVES.on);
  useFloorLooks(FLOOR_LOOKS.on);
  useAllOfIt(ALL_OF_IT.on);
}
