"""Reproducible P-101 educational asset. Blender 5.x, meters, X shaft / Z up."""
import bpy, math, os, json
from mathutils import Vector
from math import sin, cos, pi
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)

def material(name, color, metal=0, rough=.4):
    m=bpy.data.materials.new('MAT_'+name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
    return m
teal=material('CAST_TEAL',(.075,.20,.21),.32,.4)
graphite=material('MOTOR_GRAPHITE',(.105,.12,.13),.62,.32)
steel=material('MACHINED_STEEL',(.38,.42,.44),.72,.36)
dark=material('BASE_STEEL',(.12,.145,.15),.7,.42)
yellow=material('GUARD_OCHRE',(.72,.46,.065),.35,.34)
black=material('ELASTOMER',(.025,.032,.033),0,.63)
section=material('SECTION_OCHRE',(.64,.32,.09),.3,.44)
sensor=material('SENSOR_STEEL',(.5,.55,.54),.7,.25)
blue=material('SENSOR_HEAD',(.045,.14,.18),.4,.28)
wear=material('WEAR_DARK',(.13,.105,.07),.65,.6)
root=bpy.data.objects.new('P101_ROOT',None); bpy.context.collection.objects.link(root)
assemblies={}
for key in ['base','motor','coupling','bearing','casing','impeller','shaft','suction','discharge','sensors']:
    o=bpy.data.objects.new('ASM_'+key.upper(),None); bpy.context.collection.objects.link(o); o.parent=root; o['componentId']=key; assemblies[key]=o

def finish(o,name,mat,comp,role='always',bevel=0):
    o.name=name; o.data.materials.append(mat); o.parent=assemblies[comp]; o['componentId']=comp; o['role']=role
    if bevel:
        b=o.modifiers.new('Manufactured edges','BEVEL'); b.width=bevel; b.segments=2
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=b.name)
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
        if bevel:
            n=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL'); n.keep_sharp=True
            bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=n.name)
    return o

def box(name,loc,scale,mat,comp,role='always',bevel=.006):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.dimensions=scale; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,mat,comp,role,bevel)
def cyl(name,loc,r,depth,mat,comp,axis='X',role='always',vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc);o=bpy.context.object
    if axis=='X':o.rotation_euler[1]=pi/2
    if axis=='Y':o.rotation_euler[0]=pi/2
    bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    return finish(o,name,mat,comp,role,.002)
def mesh(name,v,f,mat,comp,role='always'):
    m=bpy.data.meshes.new(name);m.from_pydata(v,[],f);m.update();o=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(o);return finish(o,name,mat,comp,role)
def ring(name,loc,outer,inner,length,mat,comp,axis='X',role='always',start=0,end=2*pi):
    v=[];f=[];N=64
    for a in range(N+1):
        t=start+(end-start)*a/N
        for axial,r in [(-length/2,outer),(length/2,outer),(-length/2,inner),(length/2,inner)]:
            p=(axial,r*cos(t),r*sin(t)) if axis=='X' else (r*cos(t),r*sin(t),axial)
            v.append(tuple(loc[k]+p[k] for k in range(3)))
    for a in range(N):
        q=a*4;n=q+4
        for i,j in [(0,1),(2,0),(1,3),(3,2)]:f.append((q+i,n+i,n+j,q+j))
    f.extend([(0,2,3,1),(N*4,N*4+1,N*4+3,N*4+2)])
    o=mesh(name,v,f,mat,comp,role)
    for k,p in enumerate(o.data.polygons):p.use_smooth=(k<N*4 and k%4 in [0,3])
    if end-start<2*pi-.01:
        o.data.materials.append(section)
        for p in list(o.data.polygons)[-2:]:p.material_index=1
    return o
def pipe(name,loc,outer,inner,length,mat,comp,axis='X'):
    a,b=(-pi/2,pi/2) if axis=='X' else (0,pi)
    ring(name+'_REAR',loc,outer,inner,length,mat,comp,axis,'always',a,b)
    ring(name+'_SECTION',loc,outer,inner,length,mat,comp,axis,'pipe_cover',b,a+2*pi)
def flange(name,loc,r,bore,comp,axis='X',role='always'):
    ring(name,loc,r,bore,.033,steel,comp,axis,role)
    for i in range(8):
        a=i*pi/4;r1=r*.81
        p=(loc[0]+.029,loc[1]+r1*cos(a),loc[2]+r1*sin(a)) if axis=='X' else (loc[0]+r1*cos(a),loc[1]+r1*sin(a),loc[2]+.029)
        cyl(name+'_BOLT_%02d'%i,p,.012,.035,steel,comp,axis,role,6)
# Skid, feet, mounting hardware
for y in [-.25,.25]:
    box('GEO_BASE_RAIL',(-.18,y,.1),(1.98,.085,.13),dark,'base')
    box('GEO_BASE_FLANGE',(-.18,y,.037),(2.06,.15,.016),steel,'base')
for x in [-1.08,-.4,.42,.78]:
    box('GEO_CROSS_MEMBER',(x,0,.12),(.065,.55,.1),dark,'base')
for x in [-.96,-.55,.19,.64]:
    for y in [-.195,.195]:
        box('GEO_MOUNT_PAD',(x,y,.185),(.19,.16,.035),steel,'base')
        cyl('GEO_ANCHOR',(x,y,.217),.019,.025,steel,'base','Z',vertices=6)
# Motor body and fins
cyl('GEO_MOTOR_BODY',(-.78,0,.48),.205,.54,graphite,'motor')
for x in [-1.085,-.495]:cyl('GEO_MOTOR_END', (x,0,.48),.219,.055,graphite,'motor')
cyl('GEO_MOTOR_FAN_COVER',(-1.14,0,.48),.213,.065,steel,'motor')
for i in range(28):
    a=i*2*pi/28
    o=box('GEO_MOTOR_FIN_%02d'%i,(-.79,.214*cos(a),.48+.214*sin(a)),(.52,.036,.009),graphite,'motor',bevel=.002);o.rotation_euler[0]=a
for y in [-.15,.15]:
    for x in [-.98,-.57]:box('GEO_MOTOR_FOOT',(x,y,.273),(.105,.14,.14),graphite,'motor')
box('GEO_MOTOR_TERMINAL_BOX',(-.81,-.224,.48),(.2,.105,.17),graphite,'motor',bevel=.012)
box('GEO_MOTOR_PLATE',(-.81,-.281,.48),(.14,.003,.085),steel,'motor',bevel=.001)
cyl('GEO_MOTOR_SHAFT',(-.415,0,.48),.035,.13,steel,'motor')
# Coupling and perforated half-cylinder safety guard
for x in [-.35,-.22]:cyl('GEO_COUPLING_HUB',(x,0,.48),.078,.055,steel,'coupling',role='rotating')
cyl('GEO_COUPLING_ELASTOMER',(-.286,0,.48),.069,.083,black,'coupling',role='rotating')
for i in range(14):
    a=i*pi/13
    box('GEO_GUARD_BAR',(-.286,.128*cos(a),.48+.128*sin(a)),(.245,.008,.008),yellow,'coupling','guard',.002)
for x in [-.407,-.36,-.31,-.26,-.21,-.165]:
    ring('GEO_GUARD_RIB',(x,0,.48),.136,.125,.008,yellow,'coupling',role='guard',start=0,end=pi)
for y in [-.13,.13]:box('GEO_GUARD_LEG',(-.286,y,.345),(.245,.014,.265),yellow,'coupling','guard')
# Bearing housing with upper removable half
ring('GEO_BEARING_HOUSING_LOWER',(.055,0,.48),.105,.076,.36,graphite,'bearing',start=pi,end=2*pi)
ring('GEO_BEARING_HOUSING_UPPER',(.055,0,.48),.105,.076,.36,graphite,'bearing','X','cover',0,pi)
box('GEO_BEARING_PEDESTAL',(.07,0,.285),(.27,.20,.2),graphite,'bearing')
for x in [-.075,.185]:
    ring('GEO_BEARING_OUTER_RACE',(x,0,.48),.076,.062,.038,steel,'bearing')
    ring('GEO_BEARING_INNER_RACE',(x,0,.48),.047,.031,.042,steel,'bearing')
    for i in range(10):
        a=i*2*pi/10;bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=.012,location=(x,.055*cos(a),.48+.055*sin(a)));finish(bpy.context.object,'GEO_BEARING_BALL',steel,'bearing')
for i in range(7):
    a=2.45+i*.045;bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.006,location=(.182,.062*cos(a),.48+.062*sin(a)));finish(bpy.context.object,'GEO_RACEWAY_PIT',wear,'bearing','bearing_fault')
cyl('GEO_PUMP_SHAFT',(.2,0,.48),.031,.72,steel,'shaft',role='rotating')
ring('GEO_SEAL_STATIONARY',(.35,0,.48),.065,.033,.028,black,'shaft')
ring('GEO_SEAL_ROTATING',(.383,0,.48),.058,.032,.026,steel,'shaft')
# Volute is a variable-area annular passage, split at its axial midplane.
for half,(lo,hi) in enumerate([(pi/2,3*pi/2),(-pi/2,pi/2)]):
    v=[];f=[];N=96;M=12
    for i in range(N+1):
        t=2*pi*i/N; major=.252+.032*i/N;tube=.047+.040*i/N
        for j in range(M+1):
            p=lo+(hi-lo)*j/M;v.append((.58+.10*cos(p),(major+tube*sin(p))*cos(t),.48+(major+tube*sin(p))*sin(t)))
    for i in range(N):
        for j in range(M):
            a=i*(M+1)+j;f.append((a,a+M+1,a+M+2,a+1))
    o=mesh('GEO_VOLUTE_'+('REAR' if half==0 else 'FRONT'),v,f,teal,'casing','always' if half==0 else 'cover')
    o.data.materials.append(section);sol=o.modifiers.new('Capped casting wall','SOLIDIFY');sol.thickness=.009;sol.material_offset_rim=1;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=sol.name)
ring('GEO_CASING_BACKPLATE',(.474,0,.48),.278,.055,.025,teal,'casing')
ring('GEO_CASING_FRONTPLATE',(.686,0,.48),.28,.092,.025,teal,'casing',role='cover')
for i in range(12):
    a=i*2*pi/12;cyl('GEO_CASING_BOLT',(.718,.286*cos(a),.48+.286*sin(a)),.014,.034,steel,'casing',role='cover',vertices=6)
for y in [-.16,.16]:box('GEO_PUMP_FOOT',(.56,y,.215),(.24,.10,.07),teal,'casing')
# Impeller variants, shared semantic identity. Curved backward-swept blades.
for damaged in [False,True]:
    role='worn' if damaged else 'healthy';suffix='WORN' if damaged else 'HEALTHY'
    cyl('GEO_IMPELLER_BACK_'+suffix,(.511,0,.48),.224,.015,steel,'impeller',role=role)
    ring('GEO_IMPELLER_SHROUD_'+suffix,(.64,0,.48),.224,.083,.012,steel,'impeller',role=role+'_shroud')
    for b in range(6):
        v=[];f=[]
        for i in range(21):
            t=i/20;r=.068+.148*t;a=b*2*pi/6-.78*t
            if damaged:r-=.012*t*(.5+.5*sin(i*2.3+b))
            for x,w in [(.524,-.005),(.627,-.005),(.524,.005),(.627,.005)]:v.append((x,r*cos(a+w/r),.48+r*sin(a+w/r)))
        for i in range(20):
            q=i*4;n=q+4
            for j,k in [(0,1),(1,3),(3,2),(2,0)]:f.append((q+j,n+j,n+k,q+k))
        f.extend([(0,2,3,1),(80,81,83,82)])
        mesh('GEO_IMPELLER_BLADE_'+suffix+'_%02d'%b,v,f,steel,'impeller',role)
    cyl('GEO_IMPELLER_NUT_'+suffix,(.65,0,.48),.043,.033,steel,'impeller',role=role,vertices=6)
# Suction and discharge hollow piping
pipe('GEO_SUCTION_NECK',(.78,0,.48),.10,.082,.17,teal,'suction')
flange('GEO_SUCTION_FLANGE',(.86,0,.48),.15,.082,'suction')
pipe('GEO_SUCTION_PIPE',(1.04,0,.48),.089,.08,.34,steel,'suction')
flange('GEO_STRAINER_FLANGE',(1.20,0,.48),.14,.08,'suction')
pipe('GEO_STRAINER_BODY',(1.31,0,.48),.097,.08,.19,graphite,'suction')
for i in range(-5,6):
    z=i*.012;length=2*math.sqrt(max(.0001,.075**2-z*z))
    box('GEO_STRAINER_SCREEN',(1.412,0,.48+z),(.003,length,.002),steel,'suction',bevel=0)
for i in range(16):
    a=i*2.4;r=.02+(i%4)*.013
    box('GEO_STRAINER_DEBRIS',(1.417,r*cos(a),.48+r*sin(a)),(.006,.024,.018),wear,'suction','restriction',.002)
pipe('GEO_DISCHARGE_NECK',(.58,.263,.835),.073,.06,.25,teal,'discharge','Z')
flange('GEO_DISCHARGE_FLANGE',(.58,.263,.952),.12,.06,'discharge','Z')
pipe('GEO_DISCHARGE_PIPE',(.58,.263,1.10),.067,.059,.28,steel,'discharge','Z')
ring('GEO_FLOW_METER_BODY',(.58,.263,1.23),.085,.059,.13,blue,'discharge','Z')
box('GEO_FLOW_METER_HEAD',(.58,.15,1.23),(.12,.11,.08),blue,'discharge')
# Physical instrument bodies and exportable anchors
specs=[('PT-101S',(1.04,0,.59)),('PT-101D',(.58,.352,1.05)),('FT-101',(.58,.15,1.29)),('PWR-101',(-.81,-.30,.53)),('TT-101M',(-.75,0,.725)),('TT-101B',(.07,0,.603)),('VA-101A',(-.13,-.055,.51)),('VA-101R',(.16,-.107,.48))]
owners={'PT-101S':'suction','PT-101D':'discharge','FT-101':'discharge','PWR-101':'motor','TT-101M':'motor','TT-101B':'bearing','VA-101A':'bearing','VA-101R':'bearing'}
for sid,p in specs:
    owner=owners[sid]
    if sid not in ['PWR-101','FT-101']:
        axis='Y' if sid in ['PT-101D','VA-101R'] else 'X' if sid=='VA-101A' else 'Z'
        shift=(.031,0,0) if axis=='X' else (0,-.031 if sid=='VA-101R' else .031,0) if axis=='Y' else (0,0,.031)
        sensor_role='cover' if sid in ['TT-101B','VA-101A'] else 'always'
        cyl('SNS_'+sid+'_STEM',p,.013,.045,sensor,owner,axis,role=sensor_role)
        cyl('SNS_'+sid+'_HEAD',tuple(p[i]+shift[i] for i in range(3)),.022,.029,blue,owner,axis,role=sensor_role,vertices=12)
    o=bpy.data.objects.new('ANCHOR_'+sid,None);bpy.context.collection.objects.link(o);o.location=(p[0],p[1],p[2]+.063);o.parent=assemblies[owner];o['sensorId']=sid
# camera presets and rendering studio; excluded from web geometry export
for name,loc,target,lens in [('HERO',(2.9,-4.6,2.0),(0,0,.55),57),('CUTAWAY',(2.6,-3.3,1.9),(.30,0,.50),65),('SENSORS',(2.3,-4.2,2.5),(0,0,.55),55),('CAVITATION',(1.65,-1.3,1.15),(.6,0,.5),65),('BEARING',(.65,-1.1,1.04),(.06,0,.48),70)]:
    bpy.ops.object.camera_add(location=loc);cam=bpy.context.object;cam.name='CAM_'+name;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens
bpy.context.scene.camera=bpy.data.objects['CAM_HERO']
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
    if o==root or o.parent==root or o.type=='MESH' or o.name.startswith('ANCHOR_'):o.select_set(True)
bpy.ops.export_scene.gltf(filepath=ROOT+'/public/models/p101-teaching.glb',export_format='GLB',use_selection=True,export_extras=True,export_cameras=False,export_yup=True)
for o in bpy.data.objects:
    if o.get('role') in ['worn','worn_shroud','bearing_fault','restriction']:o.select_set(False)
bpy.ops.export_scene.gltf(filepath=ROOT+'/public/models/p101.glb',export_format='GLB',use_selection=True,export_extras=True,export_cameras=False,export_yup=True)
# Hide optional meshes in default master scene, retaining export metadata.
for o in bpy.data.objects:
    if o.get('role') in ['worn','worn_shroud','bearing_fault','restriction']:o.hide_render=True;o.hide_set(True)
for name,loc,power,size in [('KEY',(0,-3,5),650,4),('FILL',(-3,1,2),420,3),('RIM',(2,3,4),850,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name='LIGHT_'+name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,.4))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.name='STUDIO_FLOOR';floor.data.materials.append(material('STUDIO',(.72,.70,.65),0,.85))
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.65,.62,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.4
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/source/p101_master.blend')
scene.render.filepath=ROOT+'/public/p101-poster.png';bpy.ops.render.render(write_still=True)
print('P101_ASSET_COMPLETE')
