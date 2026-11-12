// The types of tools/monster_packs.mjs (for the tests, which make packs with it and read them as the game does).
export const PACK_TAIL: string;
export function packName(name: string): string;
export function packFigure(file: { figure: string; sheets: string[] } & Record<string, unknown>, sheets: Uint8Array[]): Uint8Array<ArrayBuffer>;
export function readPack(buf: Uint8Array): { file: Record<string, unknown> & { packed: [number, number][] }; sheets: Uint8Array<ArrayBuffer>[] };
export function packFromBake(dir: string, name: string): Uint8Array<ArrayBuffer>;
