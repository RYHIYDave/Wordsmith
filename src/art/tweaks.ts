// ART TWEAKS TRIED: mock-ups from the art review of 9 Nov 2026 (asked what to do with the review next, the owner's pick:
// "More test pictures (Recommended)"). Each is behind a switch of its own and ALL ARE OFF: nothing here changes the game
// until the main chat puts it in, on his yes (pictures first). A playtest turns one on with `__dbg.tweaks.<name> = true`
// BEFORE the floor it shows is entered (the blocks and the field are painted as their floor is made).
//   bars    a pack-mate's life bar only once it is hurt, hit or locked onto; its pack's name is written as before
//           (render/render.ts drawBars)
//   cast    under what stands, a second soft shadow falling away from the light, so that the shadow of a bulky piece is
//           seen past its foot (today's sits wholly under a cut block, which hides it) (render/render.ts, render/pieces.ts)
//   blocks  floor 6's cut blocks as hewn stone: never a plain cube (each longer one way and turned a little), a corner
//           knocked off, and the seam round the outside in the stone's own deep shade (art/floor6.ts)
//   field   floor 13's corn quieter: a fifth fewer clumps, their ears one tone up and not two, the stubble a tone lower
//           (art/millrace.ts)
//   globe   the life and mana globes as glass in an iron band: the side away from the light shaded, a glint toward it,
//           four rivets; the thin ring that tells what ails the hero kept (ui/hud.ts)
export const ART_TWEAKS = { bars: true, cast: true, blocks: true, field: true, globe: true };
