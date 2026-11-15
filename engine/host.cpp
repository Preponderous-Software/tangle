// Tangle's engine: a small Strata web-kit host (strata_kit.h, from the Strata release tarball).
//
// The page builds the house and hands it over in pieces it can replace at any time: textures and
// meshes by slot, and per-frame-free lists of primitives, glow points and point lights. Each
// frame the page only moves the eye. Everything handed over is kept here, so a lost WebGL context
// is rebuilt from it (strata_kit_engine_ready runs again after sk_restore).
//
// Camera: first person. The page writes the eye position to the kit camera's target, and the
// look direction as yaw and pitch, using the kit's orbit convention (the eye looks along
// -(cos p cos y, sin p, cos p sin y)). The build hook replaces the kit's orbit camera and its sun
// lighting with an indoor setup: point lights over a flat ambient level.
//
// Draw order: Strata draws meshes in the order they were added. Big surfaces (walls, floors,
// ceilings) are flagged as background by the page and kept after everything else, so on a software
// renderer the pixels other meshes cover fail the depth test before they are shaded.
//
// MIT licensed (see LICENSE).
#define STRATA_KIT_MAIN
#include "strata_kit.h"

#include <map>
#include <vector>

namespace {

constexpr uint32_t kBackground = 0x10000u;  // the page's flag: draw this mesh after the others

struct Texture {
    int w = 0, h = 0;
    uint32_t flags = 0;
    std::vector<uint8_t> rgba;
    uint32_t id = 0;  // in the current engine; 0 = not uploaded
};

struct Mesh {
    std::vector<float> positions, normals, colors, uvs;
    std::vector<uint32_t> indices;
    int texture = -1;
    uint32_t flags = 0;       // Strata's mesh flags (unlit, translucent)
    bool background = false;  // kept after the other meshes
    uint32_t id = 0;
    bool added = false;
};

std::map<int, Texture> gTextures;
std::map<int, Mesh> gMeshes;
std::vector<StrataRenderItem> gItems;
std::vector<StrataPoint> gPoints;
std::vector<StrataPointLight> gLights;
float gAmbient = 0.45f;
float gFov = 66.0f;
bool gAntialias = true;
bool gPreserve = false;

uint32_t upload(strata_kit::Host& h, Texture& t) {
    uint32_t id = 0;
    if (strata_create_texture_rgba8(h.engine, t.w, t.h, t.rgba.data(), t.flags, &id) != STRATA_OK) {
        std::fprintf(stderr, "tangle: texture: %s\n", strata_last_error());
        return 0;
    }
    return id;
}

// Adds the mesh to the engine (removing an older copy first). Returns whether it is in.
bool place(strata_kit::Host& h, Mesh& m) {
    if (m.added) strata_remove_mesh(h.engine, m.id);
    m.added = false;
    if (m.positions.empty() || m.indices.empty()) return false;
    StrataTexturedMesh tm{};
    tm.mesh.positions = m.positions.data();
    tm.mesh.normals = m.normals.empty() ? nullptr : m.normals.data();
    tm.mesh.colors = m.colors.empty() ? nullptr : m.colors.data();
    tm.mesh.indices = m.indices.data();
    tm.mesh.vertex_count = static_cast<int32_t>(m.positions.size() / 3);
    tm.mesh.index_count = static_cast<int32_t>(m.indices.size());
    for (float& c : tm.mesh.color) c = 1.0f;
    tm.uvs = m.uvs.empty() ? nullptr : m.uvs.data();
    const auto tex = m.texture >= 0 ? gTextures.find(m.texture) : gTextures.end();
    tm.texture = tex != gTextures.end() ? tex->second.id : 0;
    tm.flags = m.flags;
    if (strata_add_textured_mesh(h.engine, &tm, &m.id) != STRATA_OK) {
        std::fprintf(stderr, "tangle: mesh: %s\n", strata_last_error());
        return false;
    }
    m.added = true;
    return true;
}

void count(strata_kit::Host& h) {
    int n = 0;
    for (const auto& kv : gMeshes) n += kv.second.added ? 1 : 0;
    h.meshes = n;
}

// Puts the background meshes back at the end of the draw order.
void backgroundLast(strata_kit::Host& h) {
    for (auto& kv : gMeshes)
        if (kv.second.background && kv.second.added) place(h, kv.second);
}

}  // namespace

void strata_kit_configure(strata_kit::Options& o) {
    o.name = "tangle";
    o.nearPlane = 0.05f;
    o.farPlane = 80.0f;
    o.fog = false;
    o.antialias = gAntialias;
    o.preserveDrawingBuffer = gPreserve;
    // Indoors: no sun shadows; the tiers trade point lights.
    o.tiers[0] = {0, 1024, 6, true};
    o.tiers[1] = {0, 1024, 12, false};
    o.tiers[2] = {0, 1024, 24, false};
}

void strata_kit_engine_ready(strata_kit::Host& h) {
    for (auto& kv : gTextures) kv.second.id = upload(h, kv.second);
    for (int pass = 0; pass < 2; ++pass)
        for (auto& kv : gMeshes) {
            if (kv.second.background != (pass == 1)) continue;
            kv.second.added = false;
            place(h, kv.second);
        }
    count(h);
}

void strata_kit_build(strata_kit::Host& h, double) {
    // First person: the eye is where the page put the target.
    const float cp = std::cos(h.pitch);
    const float look[3] = {-cp * std::cos(h.yaw), -std::sin(h.pitch), -cp * std::sin(h.yaw)};
    for (int i = 0; i < 3; ++i) h.eye[i] = h.target[i];
    const float at[3] = {h.eye[0] + look[0], h.eye[1] + look[1], h.eye[2] + look[2]};
    const float up[3] = {0.0f, 1.0f, 0.0f};
    StrataCamera camera{};
    strata_camera_look_at(h.eye, at, up, gFov, static_cast<float>(h.width) / std::max(h.height, 1), h.opts.nearPlane,
                          h.opts.farPlane, &camera);
    strata_set_camera(h.engine, &camera);
    strata_kit::mul4(camera.projection, camera.view, h.viewProj);

    StrataLighting lighting{};
    strata_lighting_defaults(STRATA_LIGHTING_SPACE, &lighting);
    lighting.legacy_ambient = gAmbient;
    strata_set_lighting(h.engine, &lighting);

    h.items.insert(h.items.end(), gItems.begin(), gItems.end());
    for (const StrataPoint& p : gPoints)
        h.point(p.position[0], p.position[1], p.position[2], p.size_pixels, p.world_diameter,
                {p.color[0], p.color[1], p.color[2]}, p.color[3], p.flags);
    // The first two lights fill the rooms and always stay; the rest are kept nearest first.
    for (size_t i = 0; i < gLights.size(); ++i) {
        const StrataPointLight& l = gLights[i];
        const float dx = l.position[0] - h.eye[0], dz = l.position[2] - h.eye[2];
        const int priority = i < 2 ? 1000000 : -static_cast<int>(std::sqrt(dx * dx + dz * dz) * 100.0f);
        h.light(l, priority);
    }
}

// ------------------------------------------------------------------ the page's calls

// Before StrataKit.create (sk_init): multisampling, and whether frames are kept for reading back.
STRATA_KIT_EXPORT void tangle_configure(int antialias, int preserve) {
    gAntialias = antialias != 0;
    gPreserve = preserve != 0;
}

// The ambient level (0..1) and the vertical field of view in degrees.
STRATA_KIT_EXPORT void tangle_view(float ambient, float fovDegrees) {
    gAmbient = std::clamp(ambient, 0.0f, 1.0f);
    gFov = std::clamp(fovDegrees, 20.0f, 110.0f);
}

// A texture by the page's slot number, w x h RGBA8 (top row first). The same size again updates
// the texels in place; a new size re-uploads, and every mesh using the slot follows.
STRATA_KIT_EXPORT int tangle_texture(int slot, int w, int h, const uint8_t* rgba, int flags) {
    strata_kit::Host& host = strata_kit::host();
    Texture& t = gTextures[slot];
    const bool sameShape = t.id && t.w == w && t.h == h && t.flags == static_cast<uint32_t>(flags);
    t.w = w;
    t.h = h;
    t.flags = static_cast<uint32_t>(flags);
    t.rgba.assign(rgba, rgba + static_cast<size_t>(w) * h * 4);
    if (!host.engine) return 0;
    if (sameShape) return strata_update_texture_rgba8(host.engine, t.id, 0, 0, w, h, t.rgba.data()) == STRATA_OK ? 0 : 1;
    const uint32_t old = t.id;
    t.id = upload(host, t);
    for (auto& kv : gMeshes)
        if (kv.second.texture == slot) place(host, kv.second);
    if (old) strata_destroy_texture(host.engine, old);
    count(host);
    return t.id ? 0 : 1;
}

// A mesh by the page's slot number; replacing a slot replaces the mesh, and no vertices removes it.
// positions/normals/colors: nv xyz each (colors rgb); uvs: nv uv pairs, or null.
// flags: Strata's mesh flags, plus 0x10000 for a background mesh (drawn after the others).
// Returns 0 when the mesh is in the engine (or there is no engine yet), 1 when Strata refused it.
STRATA_KIT_EXPORT int tangle_mesh(int slot, const float* positions, const float* normals, const float* colors,
                                  const float* uvs, int nv, const uint32_t* indices, int ni, int textureSlot,
                                  int flags) {
    strata_kit::Host& host = strata_kit::host();
    Mesh& m = gMeshes[slot];
    m.positions.assign(positions, positions + static_cast<size_t>(nv) * 3);
    if (normals) m.normals.assign(normals, normals + static_cast<size_t>(nv) * 3); else m.normals.clear();
    if (colors) m.colors.assign(colors, colors + static_cast<size_t>(nv) * 3); else m.colors.clear();
    if (uvs) m.uvs.assign(uvs, uvs + static_cast<size_t>(nv) * 2); else m.uvs.clear();
    m.indices.assign(indices, indices + ni);
    m.texture = textureSlot;
    m.background = (static_cast<uint32_t>(flags) & kBackground) != 0;
    m.flags = static_cast<uint32_t>(flags) & ~kBackground;
    if (!host.engine) return 0;
    const bool in = place(host, m);
    if (in && !m.background) backgroundLast(host);
    count(host);
    return in || nv == 0 ? 0 : 1;
}

// Primitives: rows of 10 floats: kind, x, y, z, sx, sy, sz, r, g, b.
STRATA_KIT_EXPORT void tangle_items(const float* rows, int n) {
    gItems.clear();
    for (int i = 0; i < n; ++i) {
        const float* r = rows + i * 10;
        StrataRenderItem it{};
        it.kind = static_cast<int32_t>(r[0]);
        for (int k = 0; k < 3; ++k) {
            it.position[k] = r[1 + k];
            it.scale[k] = r[4 + k];
            it.color[k] = r[7 + k];
        }
        it.color[3] = 1.0f;
        gItems.push_back(it);
    }
}

// Glow points: rows of 9 floats: x, y, z, size in pixels, world diameter, r, g, b, a.
STRATA_KIT_EXPORT void tangle_points(const float* rows, int n) {
    gPoints.clear();
    for (int i = 0; i < n; ++i) {
        const float* r = rows + i * 9;
        StrataPoint p{};
        for (int k = 0; k < 3; ++k) p.position[k] = r[k];
        p.size_pixels = r[3];
        p.world_diameter = r[4];
        for (int k = 0; k < 4; ++k) p.color[k] = r[5 + k];
        p.flags = STRATA_POINT_SOFT;
        gPoints.push_back(p);
    }
}

// Point lights: rows of 8 floats: x, y, z, range, r, g, b, intensity. The first two fill the rooms.
STRATA_KIT_EXPORT void tangle_lights(const float* rows, int n) {
    gLights.clear();
    for (int i = 0; i < n; ++i) {
        const float* r = rows + i * 8;
        StrataPointLight l{};
        for (int k = 0; k < 3; ++k) {
            l.position[k] = r[k];
            l.color[k] = r[4 + k];
        }
        l.range = r[3];
        l.intensity = r[7];
        gLights.push_back(l);
    }
}
