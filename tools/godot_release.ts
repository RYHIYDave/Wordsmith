// THE GODOT PORT: the build's switches the released game is made with (tools/lib.mjs RELEASE_DEFINES: the Warlock, the Tinkerer,
// the Ranger's companions, the Brawler), put on here for a tool run under tsx, where nothing defines them: imported FIRST by a
// tool, before anything of the game's, so that every module reads them as the release does as it is first evaluated (game/
// talents.ts lays the Ranger's tree by COMPANIONS as it loads).
const g = globalThis as unknown as Record<string, boolean>;
g.__WARLOCK__ = true;
g.__TINKERER__ = true;
g.__COMPANIONS__ = true;
g.__BRAWLER__ = true;
export {};
