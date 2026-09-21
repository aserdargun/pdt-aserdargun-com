export type View = "assembly" | "cutaway" | "exploded" | "sensors";
export type Locale = "en" | "tr";
export const contentVersion = "2026-09-21.1";
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
    unit: "Pressure · inlet · Pa or bar (no reading)",
  },
  {
    id: "PT-101D",
    name: "Discharge pressure",
    component: "discharge",
    point: [0.58, 1.07, -0.263],
    description:
      "A static tapping on the discharge spool. Interpret with suction pressure, flow, speed and the pump/system curves.",
    unit: "Pressure · outlet · Pa or bar (no reading)",
  },
  {
    id: "FT-101",
    name: "Flow sensor",
    component: "discharge",
    point: [0.58, 1.35, -0.15],
    description:
      "An inline discharge meter tracks delivered flow. A real installation needs the selected meter’s full-pipe and straight-run requirements.",
    unit: "Volume flow · m³/h (no reading)",
  },
  {
    id: "PWR-101",
    name: "Motor current / power",
    component: "motor",
    point: [-0.81, 0.59, 0.3],
    description:
      "Electrical input is measured in the feeder or drive. This marker at the terminal box is a diagram anchor, not a sensor on the rotating shaft.",
    unit: "Electrical input · A / kW (no reading)",
  },
  {
    id: "TT-101M",
    name: "Motor temperature",
    component: "motor",
    point: [-0.75, 0.81, 0],
    description:
      "A surface sensor tracks motor housing temperature. It does not measure the winding temperature directly.",
    unit: "Housing temperature · °C (no reading)",
  },
  {
    id: "TT-101B",
    name: "Bearing temperature",
    component: "bearing",
    point: [0.07, 0.69, 0],
    description:
      "Local housing temperature near a bearing seat. A thermal rise may lag early vibration evidence of a damaged bearing.",
    unit: "Housing temperature · °C (no reading)",
  },
  {
    id: "VA-101A",
    name: "Axial vibration",
    component: "bearing",
    point: [-0.13, 0.59, 0.055],
    description:
      "Rigid housing measurement parallel to the shaft axis. The orange axis indicator shows the measurement direction.",
    unit: "Acceleration · axial X · m/s² (no reading)",
  },
  {
    id: "VA-101R",
    name: "Radial vibration",
    component: "bearing",
    point: [0.16, 0.55, 0.107],
    description:
      "Rigid housing measurement perpendicular to the shaft. Impulsive and broadband changes support different diagnostic hypotheses.",
    unit: "Acceleration · radial · m/s² (no reading)",
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

// Translations describe the same authored inputs; IDs, geometry and scenario logic stay shared.
const componentTr: Record<
  string,
  Pick<(typeof components)[number], "name" | "short" | "detail">
> = {
  motor: {
    name: "Elektrik motoru",
    short: "Pompayı tahrik eden dönme gücünü sağlar.",
    detail:
      "Elektrik girdisi motor milinde tork oluşturur. Soğutma kanatçıkları ısıyı dışarı verir. Motor mili ile pompa mili birbirinden ayrıdır.",
  },
  coupling: {
    name: "Kaplin",
    short: "Motor ve pompa millerini birbirine bağlar.",
    detail:
      "İki çelik göbek ve esnek bir eleman, sınırlı hizasızlığı karşılayarak tork aktarır. Gerçek çalışmada sarı koruyucunun yerinde olması gerekir.",
  },
  shaft: {
    name: "Mil",
    short: "Dönme gücünü çarka iletir.",
    detail:
      "Rulmanlar bu mili taşır; mekanik salmastra, milin sıvı içeren gövdeye girdiği yerde sızıntıyı sınırlar. Bu ilişkileri incelemek için Kesit görünümünü seçin.",
  },
  casing: {
    name: "Pompa gövdesi",
    short: "Akışı giderek genişleyen salyangoz kanalında toplar.",
    detail:
      "Çark suya enerji kazandırır. Genişleyen salyangoz gövde akışı toplar ve basma çıkışından önce hız enerjisinin bir bölümünü basınca dönüştürür.",
  },
  impeller: {
    name: "Çark",
    short: "Dönen kanatlar suya enerji aktarır.",
    detail:
      "Su merkezdeki çark gözüne girer, geriye eğimli altı kanat kanalından dışarı yönelir ve salyangoz gövdeye ulaşır. Kesit görünümünde ön disk eğitim amacıyla kaldırılmıştır.",
  },
  suction: {
    name: "Emiş girişi",
    short: "Sıvı çark gözüne eksenel yönde girer.",
    detail:
      "Daha geniş emiş hattı pompaya su sağlar. Dış uçtaki görünür süzgeç, emiş kısıtlaması dersini destekler. Basınç, süzgecin akış yönündeki devamında ölçülür.",
  },
  discharge: {
    name: "Basma çıkışı",
    short: "Basınçlandırılmış sıvıyı iletir.",
    detail:
      "Akış dikey basma çıkışından ayrılır. Basınç bağlantısı ve hat üzerindeki debimetre farklı ölçümleri temsil eder. Kısa boru hattı bu sergi için sıkıştırılmıştır.",
  },
  bearing: {
    name: "Rulman yatağı",
    short: "Dönen mili ve rulmanlarını taşır.",
    detail:
      "İki yuvarlanmalı rulman konumu mili taşır. Rijit yatak yüzeylerinde sıcaklık ve eksenel/radyal titreşim sensörleri bulunur. Eğitim görünümlerinde üst yatak kapağı kaldırılır.",
  },
  base: {
    name: "Taban şasisi",
    short: "Makineyi destekler ve hizasını korur.",
    detail:
      "Montaj pabuçları, profiller, ayaklar ve ankraj cıvataları motoru ve pompayı taşır. Doğru hizalama ve sağlam temel, güvenilir çalışma için önemlidir.",
  },
};
const sensorTr: Record<
  string,
  Pick<(typeof sensors)[number], "name" | "description" | "unit">
> = {
  "PT-101S": {
    name: "Emiş basıncı",
    description:
      "Süzgecin akış yönündeki devamında yer alan statik basınç bağlantısı. Düşük emiş basıncı giriş kayıplarına işaret edebilir; tek başına basınç kavitasyonu kanıtlamaz.",
    unit: "Basınç · giriş · Pa veya bar (ölçüm yok)",
  },
  "PT-101D": {
    name: "Basma basıncı",
    description:
      "Basma borusundaki statik basınç bağlantısı. Emiş basıncı, debi, devir ve pompa/sistem eğrileriyle birlikte yorumlanır.",
    unit: "Basınç · çıkış · Pa veya bar (ölçüm yok)",
  },
  "FT-101": {
    name: "Debi sensörü",
    description:
      "Basma hattındaki debimetre iletilen debiyi izler. Gerçek kurulumda seçilen sayacın tam dolu boru ve düz boru uzunluğu gereksinimleri karşılanmalıdır.",
    unit: "Hacimsel debi · m³/h (ölçüm yok)",
  },
  "PWR-101": {
    name: "Motor akımı / gücü",
    description:
      "Elektrik girdisi besleme devresinde veya sürücüde ölçülür. Klemens kutusundaki bu işaret şematik bir konumdur; dönen mil üzerindeki bir sensör değildir.",
    unit: "Elektrik girdisi · A / kW (ölçüm yok)",
  },
  "TT-101M": {
    name: "Motor sıcaklığı",
    description:
      "Yüzey sensörü motor gövdesinin sıcaklığını izler. Sargı sıcaklığını doğrudan ölçmez.",
    unit: "Gövde sıcaklığı · °C (ölçüm yok)",
  },
  "TT-101B": {
    name: "Rulman sıcaklığı",
    description:
      "Rulman yuvası yakınındaki yerel gövde sıcaklığı. Hasarlı bir rulmanda sıcaklık artışı, ilk titreşim belirtilerinden sonra ortaya çıkabilir.",
    unit: "Yatak sıcaklığı · °C (ölçüm yok)",
  },
  "VA-101A": {
    name: "Eksenel titreşim",
    description:
      "Rijit yatakta mil eksenine paralel ölçüm. Turuncu eksen göstergesi ölçüm yönünü belirtir.",
    unit: "İvme · eksenel X · m/s² (ölçüm yok)",
  },
  "VA-101R": {
    name: "Radyal titreşim",
    description:
      "Rijit yatakta mile dik ölçüm. Darbeli ve geniş bantlı değişimler farklı tanı varsayımlarını destekler.",
    unit: "İvme · radyal · m/s² (ölçüm yok)",
  },
};
const conditionTr: Record<
  Condition,
  Omit<(typeof conditions)[Condition], "focus">
> = {
  normal: {
    label: "Normal",
    title: "Sağlıklı çalışma referansı",
    physical:
      "Dolu kanallar, sağlam yüzeyler ve çark ile salyangoz gövdeden geçen kararlı akış.",
    signal:
      "Debi ve basınç kararlıdır. Titreşim referans düzeyine yakın kalır ve rulman sıcaklığı dengelenmiştir.",
    interpretation:
      "Bunlar kurgulanmış eğitim sinyalleridir; canlı tesis ölçümü veya evrensel çalışma sınırı değildir.",
    trends: [
      "Kararlı debi",
      "Kararlı artış",
      "Düşük referans düzeyi",
      "Dengelenmiş",
    ],
  },
  cavitation: {
    label: "Kavitasyon",
    title: "Su buhara dönüştüğünde",
    physical:
      "Çark gözü ve kanat girişleri yakınında buhar boşlukları oluşur; basınç yeniden yükselince çökerler. Görmek için Kesit görünümünü açın.",
    signal:
      "Geniş bantlı titreşim ve basınç dalgalanmaları artar. Bu senaryoda gelişmiş kavitasyon hidrolik performansı düşürür.",
    interpretation:
      "Buhar kavitasyonu, boruya hava girmesinden farklıdır. Emiş basıncı, sıvı sıcaklığı ve çalışma noktası gerekli bağlamı sağlar.",
    trends: [
      "Azalmış / kararsız",
      "Azalmış / dalgalı",
      "Geniş bantlı artış",
      "Referansa yakın",
    ],
  },
  bearing: {
    label: "Rulman aşınması",
    title: "Küçük bir kusur, tekrarlayan darbeler",
    physical:
      "Yerel yuvarlanma yolu hasarı, üst rulman kesitinde büyütülmüş aşınma işaretiyle gösterilir. Sıcak renk bir ısıl gösterim katmanıdır.",
    signal:
      "Titreşim izinde tekrarlayan darbeler görülür. Bu ileri evre örneğinde yatak sıcaklığı da yükselir.",
    interpretation:
      "Erken rulman hasarı sıcaklık artışından önce görülebilir. Zarf spektrumu ve devir bilgisi, kaynağını ayırt etmeye yardımcı olur.",
    trends: [
      "Referansa yakın",
      "Referansa yakın",
      "Darbeli artış",
      "Yükseliyor",
    ],
  },
  impeller: {
    label: "Çark aşınması",
    title: "Verimi azalan kanat kanalları",
    physical:
      "Sağlıklı geometrinin yerini aşınmış kanat kenarları alır. Kesit, değişen hidrolik yüzeyleri açığa çıkarır.",
    signal:
      "Seçilen sentetik senaryoda debi ve basınç artışı azalır. Asimetrik malzeme kaybı, dönmeye bağlı titreşim de oluşturabilir.",
    interpretation:
      "Hidrolik etkinlik kaybı ve dengesizlik farklı etkilerdir. Hasarlı çark, her sistemde aynı akım değişimine yol açmaz.",
    trends: [
      "Azalmış debi",
      "Azalmış kapasite",
      "Orta düzey artış",
      "Referansa yakın",
    ],
  },
  restriction: {
    label: "Emiş kısıtlaması",
    title: "Sorun giriş hattında başlar",
    physical:
      "Birikintiler giriş süzgecini kısmen tıkar. Emiş yolundan daha az akış işaretçisi geçer.",
    signal:
      "Tıkanıklığın akış yönündeki devamında emiş basıncı ve iletilen debi azalır. Titreşim başlangıçta referansa yakın kalır.",
    interpretation:
      "Kısıtlama kavitasyona yol açabilir; ancak bunlar ayrı durumlardır. Bu örnek bilinçli olarak buhar oluşmadan önce durur.",
    trends: [
      "Azalmış debi",
      "Sisteme bağlı",
      "Referansa yakın",
      "Referansa yakın",
    ],
  },
};
export function exhibitContent(locale: Locale) {
  return {
    views: views.map((v) => ({
      ...v,
      label:
        locale === "tr"
          ? {
              assembly: "Montaj",
              cutaway: "Kesit",
              exploded: "Ayrıştırılmış",
              sensors: "Sensörler",
            }[v.id]
          : v.label,
    })),
    components: components.map((c) => ({
      ...c,
      ...(locale === "tr" ? componentTr[c.id] : {}),
    })),
    sensors: sensors.map((s) => ({
      ...s,
      ...(locale === "tr" ? sensorTr[s.id] : {}),
    })),
    conditions: Object.fromEntries(
      Object.entries(conditions).map(([id, c]) => [
        id,
        { ...c, ...(locale === "tr" ? conditionTr[id as Condition] : {}) },
      ]),
    ) as typeof conditions,
  };
}
