# All 325 melds scored on how much each twist shows in play: 3 a new thing seen happen, 2 a change to something already there,
# 1 numbers only. Score = front x2 + behind + on enemies. The High City's from scores.py, its 40 redone now (3,3,3).
import importlib.util, sys, os
A = {
# the game's own (words.json melds): ten, volt, eight
'eruption':(3,3,3),'avalanche':(3,1,1),'thunder':(3,3,3),'blight':(1,1,1),'scald':(3,3,3),'wildfire':(3,3,3),'fumes':(3,3,3),
'hailstorm':(2,3,3),'frostbite':(1,2,1),'contagion':(2,2,3),'demolition':(3,2,2),'powderkeg':(3,3,3),'shatter':(3,3,3),
'chainreaction':(3,3,3),'rupture':(3,3,3),'siphon':(1,1,1),'cauterize':(1,1,2),'forking':(3,2,3),'shiver':(2,2,2),'sunder':(1,1,1),
'fervor':(1,1,1),'rimeward':(2,1,2),'implode':(3,2,3),
# the 98 (Twin's, floors 6-10's)
'onslaught':(2,1,2),'viper':(2,3,1),'flashfreeze':(3,3,2),'rekindle':(2,2,2),'flurry':(3,1,1),'aftershock':(3,3,3),'bloodlust':(1,2,1),
'coldblood':(1,2,1),'conduit':(2,2,2),'secondwind':(1,2,1),'marrow':(1,2,1),'quickfuse':(2,2,2),'concussion':(2,3,2),'duelist':(1,1,1),
'needle':(1,1,1),'brand':(2,2,2),'seeker':(2,2,1),'quickdraw':(1,1,1),'pressurepoint':(1,2,1),'berserk':(1,1,1),'fever':(1,1,1),
'whiteout':(1,3,1),'overcharge':(2,3,2),'blur':(1,1,2),'juggernaut':(1,2,2),'bulwark':(1,1,1),'hemlock':(2,2,2),'cinderward':(3,3,3),
'static':(3,3,2),'windward':(1,1,1),'fortress':(1,2,1),'momentum':(1,1,1),'canker':(1,1,1),'permafrost':(1,2,1),'smoulder':(3,1,3),
'tempest':(3,1,3),'tailwind':(1,1,1),'bedrock':(1,2,1),'haymaker':(1,1,1),'bloat':(3,3,3),'coldsnap':(2,3,1),'flashfire':(3,1,3),
'jolt':(2,3,2),'blink':(1,1,2),'daze':(1,2,1),'cataclysm':(1,1,2),'miasma':(1,2,3),'glacier':(3,2,3),'inferno':(3,2,3),
'stormfront':(3,2,1),'gale':(3,1,2),'earthquake':(3,2,2),'onrush':(1,1,1),'hornet':(1,2,1),'glide':(1,1,1),'firewalk':(2,3,3),
'quicksilver':(1,3,1),'charge':(1,2,2),'mire':(1,2,1),'icebreaker':(3,2,3),'anvil':(1,3,3),'fulgurite':(2,3,3),'lamprey':(1,1,1),
'cluster':(3,3,3),'doubletap':(1,2,1),'tempo':(1,1,1),'redoubt':(2,3,2),'reverb':(1,1,1),'staccato':(1,2,1),'ripple':(3,2,2),
'bloodbloom':(1,2,2),'lancet':(1,1,1),'feedingfrenzy':(1,2,1),'carapace':(2,2,1),'transfusion':(1,1,1),'lifeline':(1,2,1),
'bloodtide':(1,1,2),'detonator':(3,2,3),'mayhem':(1,2,2),'minefield':(2,2,2),'timebomb':(2,2,2),'hairtrigger':(3,2,3),
'blastwave':(3,2,2),'rapier':(1,1,1),'riposte':(1,1,1),'vendetta':(1,1,1),'ambush':(1,1,1),'bullseye':(1,2,1),'shieldwall':(2,1,2),
'fury':(1,1,1),'spree':(1,1,2),'rampage':(2,2,2),'sanctuary':(1,1,2),'parry':(2,1,1),'aegis':(2,2,3),'hourglass':(1,1,1),
'aftermath':(3,2,3),'whipcrack':(1,2,1),
# the city's 45
'maw':(3,3,2),'sump':(2,2,1),'drift':(3,3,2),'firewhirl':(3,2,2),'lodestone':(3,2,1),'riptide':(2,3,2),'gravity':(3,2,2),
'splinter':(2,1,1),'spore':(1,3,3),'sleet':(3,3,3),'embers':(3,3,1),'fractal':(2,3,3),'scatter':(2,3,1),'rubble':(2,3,2),
'doom':(1,1,1),'plague':(3,2,1),'hoarfrost':(1,2,1),'brimstone':(1,2,1),'jinx':(2,2,1),'whisper':(1,2,1),'burden':(1,2,1),
'stasis':(3,1,1),'stagnation':(1,2,1),'frostlock':(1,2,1),'slowburn':(1,2,1),'stormglass':(3,2,1),'timeslip':(1,1,1),
'standstill':(1,2,1),'shackle':(1,2,1),'strangler':(1,2,1),'icebound':(1,2,1),'firetrap':(1,3,1),'tether':(3,3,2),'lasso':(1,3,1),
'anchor':(1,2,2),'confluence':(3,3,2),'beckon':(1,2,1),'horizon':(2,2,1),'reel':(2,2,1),'coven':(1,3,1),'constellation':(3,3,1),
'web':(1,3,1),'torpor':(1,2,1),'witchknot':(1,2,1),'amber':(1,2,1),
# the city's with the wilds' 44
'backwash':(2,2,1),'gullet':(1,2,1),'harpoon':(2,2,1),'whirlpool':(2,2,1),'haven':(1,2,1),'eddy':(2,2,2),'whiplash':(2,3,1),
'maelstrom':(2,2,1),'hydra':(2,3,1),'swarm':(1,2,1),'shellburst':(3,3,2),'pinpoint':(2,2,1),'riot':(2,1,1),'phalanx':(1,3,2),
'rebound':(2,2,1),'flechette':(1,2,1),'starburst':(2,2,2),'refrain':(1,2,1),'bloodcurse':(1,2,1),'hexblast':(3,3,2),'evileye':(1,1,1),
'delirium':(1,1,1),'talisman':(2,2,2),'grudge':(1,1,1),'omen':(1,3,1),'pall':(1,2,1),'rewind':(1,2,1),'sap':(1,2,1),'slowfuse':(2,3,2),
'stillpoint':(1,1,1),'quickening':(1,1,1),'respite':(2,2,1),'eternity':(1,1,1),'stutter':(2,3,1),'doldrums':(2,2,1),'fetters':(1,2,1),
'thrall':(1,2,1),'tripwire':(2,3,1),'pin':(1,1,1),'mauler':(1,1,1),'stockade':(1,2,1),'manacle':(1,1,1),'snag':(1,2,1),'dragnet':(2,2,1),
# the Reaping creatures' 5
'cinderbrood':(3,3,3),'wintergrave':(3,3,3),'stormwake':(3,3,3),'bogborn':(3,3,3),'charnel':(1,3,3),
}
sp = importlib.util.spec_from_file_location('h', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scores_high.py'))
src = open(sp.origin).read().split('assert len(S)')[0]
ns = {}; exec(src, ns)
H = dict(ns['S'])
REDONE = ['impaler','witchpin','artery','hemorrhage','papercut','gangrene','bloodfeast','thornshield','bloodhex','ghoul','deadeye',
  'macabre','gravewarden','fetch','bloodprice','mercy','lastrites','heartbeat','bastion','bloodharvest','bodkin','coup','massacre',
  'barrage','bloodlance','bloodrage','dart','harrow','harvest','lacerate','spearwall','thornspray','undying','wraithstep','deathwatch',
  'flicker','haunting','spark','purge','stinger']
for k in REDONE: H[k] = (3, 3, 3)
A.update(H)
assert len(A) == 325, len(A)
tot = {k: f * 2 + b + e for k, (f, b, e) in A.items()}
order = sorted(A, key=lambda k: (tot[k], A[k][0], k))
if __name__ == '__main__':
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 45
    import collections
    print(sorted(collections.Counter(tot.values()).items()))
    for k in order[:n]:
        print(tot[k], A[k], k)
