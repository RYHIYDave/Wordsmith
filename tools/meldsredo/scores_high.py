# How much each meld's twists show in play: 3 a new thing seen happen, 2 a change to something already there, 1 numbers only.
# Score = front x2 + behind + on enemies (front is the Strike, used most). Round 2 after round 1's 20 were redone.
S = {
'impaler':(3,3,2),'stinger':(1,3,2),'icelance':(2,3,2),'sunspear':(3,3,3),'stormlance':(3,3,2),'dart':(1,3,1),'batteringram':(3,3,2),
'pitchfork':(2,3,2),'bloodlance':(1,2,2),'fuse':(3,3,3),'bodkin':(1,2,1),'barrage':(1,2,2),'spearwall':(1,3,1),'longspear':(2,2,1),
'flicker':(2,1,1),'broadspear':(2,2,2),'gaff':(3,3,2),'trident':(3,3,3),'witchpin':(3,2,3),'sundial':(2,2,1),'skewer':(2,2,2),
'gore':(2,2,1),'gangrene':(3,2,2),'rimeblood':(3,2,1),'bloodboil':(3,2,1),'galvanic':(2,3,1),'lacerate':(1,3,1),'mangle':(2,2,1),
'fangs':(2,2,1),'bloodfeast':(3,3,2),'bloodburst':(3,3,1),'artery':(3,3,2),'bloodrage':(1,3,1),'thornshield':(3,3,2),'hemorrhage':(3,2,2),
'papercut':(3,3,1),'bramble':(2,2,1),'fishhook':(3,2,2),'thornspray':(1,3,1),'bloodhex':(2,2,2),'clot':(2,2,1),'briar':(2,2,1),
'wraithstep':(1,2,2),'tombstone':(3,2,3),'revenants':(1,3,3),'ghoul':(3,2,2),'soulburst':(3,3,2),'deadeye':(3,3,2),'macabre':(3,2,2),
'gravewarden':(3,3,2),'undying':(1,3,1),'fetch':(3,3,3),'legion':(3,2,1),'gravewell':(3,3,2),'poltergeist':(3,3,2),'haunting':(2,1,1),
'limbo':(2,2,2),'gravebind':(2,2,2),'guillotine':(3,3,2),'nightshade':(2,2,1),'coldcut':(3,3,2),'cremate':(3,2,1),'smite':(3,3,3),
'coup':(1,1,2),'crusher':(3,2,2),'scissors':(3,2,1),'bloodprice':(3,3,2),'deathburst':(2,2,1),'mercy':(2,2,2),'massacre':(1,2,1),
'lastrites':(3,2,2),'deathwatch':(2,1,1),'quietus':(2,2,2),'purge':(1,2,3),'gallows':(3,2,1),'decimate':(3,3,1),'condemn':(2,2,1),
'finalhour':(2,2,1),'noose':(2,2,1),'upheaval':(3,1,2),'pestilence':(2,2,1),'blizzard':(3,3,1),'nova':(3,3,2),'thunderclap':(3,3,1),
'rush':(3,2,2),'seismic':(3,3,2),'tremor':(2,2,2),'heartbeat':(3,3,2),'overload':(3,2,2),'lens':(3,3,1),'crescendo':(2,2,1),
'bastion':(3,3,2),'resonance':(3,2,2),'spark':(2,1,1),'tsunami':(3,2,2),'undertow':(3,2,2),'ricochet':(3,3,3),'hexwave':(2,2,1),
'lull':(2,2,1),'tangle':(3,2,1),'harrow':(1,3,1),'wraithspear':(3,3,3),'deathblow':(2,2,1),'breakthrough':(3,3,2),
'bloodharvest':(3,2,3),'butcher':(3,2,1),'bloodwave':(3,2,2),'harvest':(1,3,1),'soulstorm':(3,3,2),'deathknell':(3,3,1),
}
ROUND1 = ['impaler','witchpin','artery','hemorrhage','papercut','gangrene','bloodfeast','thornshield','bloodhex','ghoul','deadeye',
          'macabre','gravewarden','fetch','bloodprice','mercy','lastrites','heartbeat','bastion','bloodharvest']
assert len(S) == 110
tot = {k: f*2+b+e for k,(f,b,e) in S.items()}
order = sorted(S, key=lambda k: (tot[k], S[k][0], k))
for k in order[:24]:
    print(tot[k], S[k], k, '(round 1)' if k in ROUND1 else '')
