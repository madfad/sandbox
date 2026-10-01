"""Render a front-view picture of each character FBX (Cycles, CPU; works headless).
Run: blender -b -P render_characters.py -- OUT_DIR name1=path1.fbx name2=path2.fbx ..."""
import math, os, sys
import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
out_dir, items = args[0], [a.split("=", 1) for a in args[1:]]
os.makedirs(out_dir, exist_ok=True)

for i, (name, path) in enumerate(items, 1):
    try:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.fbx(filepath=path)
        meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
        if not meshes:
            print(f"RENDER [{i}/{len(items)}] {name}: no mesh, skipped"); continue
        pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
        lo = Vector([min(p[k] for p in pts) for k in range(3)])
        hi = Vector([max(p[k] for p in pts) for k in range(3)])
        center, size = (lo + hi) / 2, hi - lo
        scene = bpy.context.scene
        cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
        scene.collection.objects.link(cam); scene.camera = cam
        cam.data.type = "ORTHO"
        cam.data.ortho_scale = max(size.z, size.x * 1.5) * 1.1
        cam.location = (center.x, lo.y - 10 * max(size), center.z)   # in front (-Y), looking +Y
        cam.rotation_euler = (math.radians(90), 0, 0)
        cam.data.clip_end = 100 * max(size)
        sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
        sun.data.energy = 3; sun.rotation_euler = (math.radians(60), 0, math.radians(-30))
        scene.collection.objects.link(sun)
        world = bpy.data.worlds.new("w"); scene.world = world
        world.use_nodes = True
        world.node_tree.nodes["Background"].inputs[0].default_value = (0.8, 0.8, 0.8, 1)
        scene.render.engine = "CYCLES"; scene.cycles.device = "CPU"; scene.cycles.samples = 16
        scene.render.resolution_x, scene.render.resolution_y = 320, 480
        scene.render.filepath = os.path.join(out_dir, f"{name}.png")
        bpy.ops.render.render(write_still=True)
        print(f"RENDER [{i}/{len(items)}] {name}: ok")
    except Exception as e:  # keep going on a bad file
        print(f"RENDER [{i}/{len(items)}] {name}: failed ({e})")
