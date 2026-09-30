"""Rename 'mixamorig1:' (or mixamorigN:) bones/vertex groups to 'mixamorig:' and re-export the FBX.
Run: blender -b -P fix_mixamo_prefix.py -- in.fbx out.fbx"""
import re, sys
import bpy

src, dst = sys.argv[-2:]
pat = re.compile(r"^mixamorig\d+:")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=src)
nb = nv = 0
for o in bpy.data.objects:
    if o.type == "ARMATURE":
        for b in o.data.bones:
            if pat.match(b.name):
                b.name = pat.sub("mixamorig:", b.name); nb += 1
    elif o.type == "MESH":
        for vg in o.vertex_groups:
            if pat.match(vg.name):
                vg.name = pat.sub("mixamorig:", vg.name); nv += 1
print(f"FIXPREFIX renamed bones={nb} vertex_groups={nv}")
bpy.ops.export_scene.fbx(filepath=dst, use_selection=False, add_leaf_bones=False,
                         bake_anim=False, path_mode="COPY", embed_textures=True)
print("FIXPREFIX wrote", dst)
