export type View = "assembly" | "cutaway" | "exploded" | "sensors";
export type Condition =
  | "normal"
  | "cavitation"
  | "bearing"
  | "impeller"
  | "restriction";
export const views: { id: View; label: string }[] = [
  { id: "assembly", label: "Assembly" },
  { id: "cutaway", label: "Cutaway" },
  { id: "exploded", label: "Exploded" },
  { id: "sensors", label: "Sensors" },
];
export const components = [
  {
    id: "motor",
    name: "Electric Motor",
    short: "Provides rotational power to drive the pump.",
    detail:
      "Electrical input creates torque at the motor shaft. Cooling fins release heat. The motor shaft is separate from the pump shaft.",
  },
  {
    id: "coupling",
    name: "Coupling",
    short: "Connects the motor and pump shafts.",
    detail:
      "Two steel hubs and a flexible element transmit torque while accommodating limited misalignment. The yellow guard belongs in place during actual operation.",
  },
  {
    id: "shaft",
    name: "Shaft",
    short: "Transmits rotational power to the impeller.",
    detail:
      "Bearings support this shaft; the mechanical seal limits leakage where the shaft enters the wet casing. Select Cutaway to inspect these relationships.",
  },
  {
    id: "casing",
    name: "Pump Casing",
    short: "Collects flow in a growing volute passage.",
    detail:
      "The impeller adds energy to water. The expanding volute collects flow and converts part of its velocity into pressure before discharge.",
  },
  {
    id: "impeller",
    name: "Impeller",
    short: "Rotating blades transfer energy to water.",
    detail:
      "Water enters the central eye, turns outward through six backward-curved blade passages, and enters the volute. In Cutaway, the front shroud is removed for teaching.",
  },
  {
    id: "suction",
    name: "Suction Inlet",
    short: "Fluid enters axially at the impeller eye.",
    detail:
      "The larger suction line supplies water to the pump. A visible strainer at its outer end supports the restriction lesson. Pressure is measured downstream of the strainer.",
  },
  {
    id: "discharge",
    name: "Discharge Outlet",
    short: "Delivers the pressurized fluid.",
    detail:
      "Flow leaves through the vertical discharge. Its pressure tapping and inline flow meter represent distinct measurements. The short pipe run is compressed for this exhibit.",
  },
  {
    id: "bearing",
    name: "Bearing Housing",
    short: "Supports the rotating shaft and its bearings.",
    detail:
      "Two rolling-element bearing positions support the shaft. Rigid housing surfaces carry temperature and axial/radial vibration sensors. The upper housing lifts away in teaching views.",
  },
  {
    id: "base",
    name: "Base Frame",
    short: "Maintains support and machine alignment.",
    detail:
      "Mounting pads, rails, feet and anchor bolts support the motor and pump. Alignment and a sound foundation matter to reliable operation.",
  },
];
export const sensors = [
  {
    id: "PT-101S",
    name: "Suction pressure",
    component: "suction",
    point: [1.04, 0.7, 0],
    description:
      "Static pressure tapping downstream of the strainer. Low suction pressure can indicate inlet losses; pressure alone does not establish cavitation.",
    unit: "Pressure · inlet",
  },
  {
    id: "PT-101D",
    name: "Discharge pressure",
    component: "discharge",
    point: [0.58, 1.07, -0.263],
    description:
      "A static tapping on the discharge spool. Interpret with suction pressure, flow, speed and the pump/system curves.",
    unit: "Pressure · outlet",
  },
  {
    id: "FT-101",
    name: "Flow sensor",
    component: "discharge",
    point: [0.58, 1.35, -0.15],
    description:
      "An inline discharge meter tracks delivered flow. A real installation needs the selected meter’s full-pipe and straight-run requirements.",
    unit: "Volume flow",
  },
  {
    id: "PWR-101",
    name: "Motor current / power",
    component: "motor",
    point: [-0.81, 0.59, 0.3],
    description:
      "Electrical input is measured in the feeder or drive. This marker at the terminal box is a diagram anchor, not a sensor on the rotating shaft.",
    unit: "Electrical input",
  },
  {
    id: "TT-101M",
    name: "Motor temperature",
    component: "motor",
    point: [-0.75, 0.81, 0],
    description:
      "A surface sensor tracks motor housing temperature. It does not measure the winding temperature directly.",
    unit: "Housing temperature",
  },
  {
    id: "TT-101B",
    name: "Bearing temperature",
    component: "bearing",
    point: [0.07, 0.69, 0],
    description:
      "Local housing temperature near a bearing seat. A thermal rise may lag early vibration evidence of a damaged bearing.",
    unit: "Housing temperature",
  },
  {
    id: "VA-101A",
    name: "Axial vibration",
    component: "bearing",
    point: [-0.13, 0.59, 0.055],
    description:
      "Rigid housing measurement parallel to the shaft axis. The orange axis indicator shows the measurement direction.",
    unit: "Acceleration · axial X",
  },
  {
    id: "VA-101R",
    name: "Radial vibration",
    component: "bearing",
    point: [0.16, 0.55, 0.107],
    description:
      "Rigid housing measurement perpendicular to the shaft. Impulsive and broadband changes support different diagnostic hypotheses.",
    unit: "Acceleration · radial",
  },
];
export const conditions: Record<
  Condition,
  {
    label: string;
    title: string;
    physical: string;
    signal: string;
    interpretation: string;
    trends: string[];
    focus: string;
  }
> = {
  normal: {
    label: "Normal",
    title: "A healthy operating baseline",
    physical:
      "Filled passages, intact surfaces and steady flow through the impeller and volute.",
    signal:
      "Flow and pressure remain stable. Vibration stays near its baseline and bearing temperature is settled.",
    interpretation:
      "These are authored learning signals, not live plant measurements or universal operating limits.",
    trends: ["Steady delivery", "Stable rise", "Low baseline", "Settled"],
    focus: "hero",
  },
  cavitation: {
    label: "Cavitation",
    title: "When water becomes vapor",
    physical:
      "Vapor pockets form near the impeller eye and blade inlets, then collapse as pressure recovers. Open Cutaway to see them.",
    signal:
      "Broadband vibration and pressure fluctuations increase. Developed cavitation reduces hydraulic performance in this scenario.",
    interpretation:
      "Vapor cavitation is different from air entering a pipe. Suction pressure, fluid temperature and operating point provide essential context.",
    trends: [
      "Reduced / unsteady",
      "Reduced / fluctuating",
      "Broadband increase",
      "Near baseline",
    ],
    focus: "cavitation",
  },
  bearing: {
    label: "Bearing wear",
    title: "A small defect, repeated impacts",
    physical:
      "Localized raceway damage is shown as a magnified wear indication inside the upper bearing section. The warm tint is a thermal overlay.",
    signal:
      "Repeated impacts appear in the vibration trace. This later-stage example also shows a rising housing temperature.",
    interpretation:
      "Early bearing damage can precede a temperature rise. An envelope spectrum and speed context would help distinguish its source.",
    trends: ["Near baseline", "Near baseline", "Impulsive increase", "Rising"],
    focus: "bearing",
  },
  impeller: {
    label: "Impeller wear",
    title: "Less effective blade passages",
    physical:
      "Worn blade edges replace the healthy geometry. The cutaway exposes the changed hydraulic surfaces.",
    signal:
      "The chosen synthetic scenario delivers less flow and pressure rise. Asymmetric material loss may also add rotational vibration.",
    interpretation:
      "Reduced hydraulic effectiveness and imbalance are different effects. A damaged impeller does not imply the same current change in every system.",
    trends: [
      "Reduced delivery",
      "Reduced capability",
      "Moderate increase",
      "Near baseline",
    ],
    focus: "cavitation",
  },
  restriction: {
    label: "Suction restriction",
    title: "The problem starts upstream",
    physical:
      "Debris blocks part of the inlet strainer. Fewer tracers pass through the suction path.",
    signal:
      "Suction pressure downstream of the blockage and delivered flow decrease. Vibration initially remains close to baseline.",
    interpretation:
      "Restriction can lead to cavitation, but the two conditions are separate. This example intentionally stops before vapor forms.",
    trends: [
      "Reduced delivery",
      "System dependent",
      "Near baseline",
      "Near baseline",
    ],
    focus: "suction",
  },
};
