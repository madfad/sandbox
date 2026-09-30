"""Print nodes / skins / animations in .glb files: python3 inspect_glb.py file.glb [...]"""
import json, struct, sys
for p in sys.argv[1:]:
    d = open(p, "rb").read()
    n, _ = struct.unpack("<II", d[12:20])
    j = json.loads(d[20:20 + n])
    anims = [(a.get("name"), len(a["channels"])) for a in j.get("animations", [])]
    print(f"{p}\n  MB={len(d)/1e6:.1f} nodes={len(j['nodes'])} skins={len(j.get('skins', []))} "
          f"meshes={len(j.get('meshes', []))} animations={anims}")
