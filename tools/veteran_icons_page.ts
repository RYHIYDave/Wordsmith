// (a page for the picture only: the Brawler's buttons showing the Veteran's three icons and his three names, the Veteran
// not being in this branch)
import { SKILLS } from '../src/game/defs';
import '../src/main';
const s = SKILLS as unknown as Record<string, { icon: string; name: string; verb: string }>;
Object.assign(s.jab, { icon: 'vetpunch', name: 'Punch', verb: 'PUNCH' });
Object.assign(s.cross, { icon: 'vetkick', name: 'Kick', verb: 'KICK' });
Object.assign(s.slip, { icon: 'vetjump', name: 'Jump', verb: 'JUMP' });
