"""
Blender: import CGTrader dining FBX + textures → packed GLB for web.
Usage:
  Blender --background --python fbx_to_glb_dining.py -- <fbx> <textures_dir> <out.glb>
"""
import sys
from pathlib import Path

import bpy

argv = sys.argv
argv = argv[argv.index("--") + 1 :] if "--" in argv else []
if len(argv) < 3:
    raise SystemExit("Need: fbx textures_dir out.glb")

fbx_path = Path(argv[0]).resolve()
tex_dir = Path(argv[1]).resolve()
out_glb = Path(argv[2]).resolve()

# Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)

bpy.ops.import_scene.fbx(
    filepath=str(fbx_path),
    automatic_bone_orientation=True,
    use_image_search=True,
)

# Point missing images at textures/
for img in bpy.data.images:
    name = Path(img.filepath or img.name).name
    if not name:
        continue
    candidates = [
        tex_dir / name,
        tex_dir / Path(name).name,
    ]
    # try case-insensitive / alternate extensions
    existing = {p.name.lower(): p for p in tex_dir.iterdir() if p.is_file()}
    hit = None
    for c in candidates:
        if c.is_file():
            hit = c
            break
        key = c.name.lower()
        if key in existing:
            hit = existing[key]
            break
        stem = Path(key).stem
        for k, p in existing.items():
            if Path(k).stem == stem:
                hit = p
                break
        if hit:
            break
    if hit:
        img.filepath = str(hit)
        img.reload()
        print("linked", name, "->", hit.name)
    else:
        print("MISSING texture for", name)

# Apply flat scale / ensure origin near floor
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

# Export GLB (embedded textures)
out_glb.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(out_glb),
    export_format="GLB",
    export_texcoords=True,
    export_normals=True,
    export_materials="EXPORT",
    export_image_format="JPEG",
    export_jpeg_quality=80,
    export_yup=True,
    export_apply=True,
)
print("Wrote", out_glb, "size", out_glb.stat().st_size)
