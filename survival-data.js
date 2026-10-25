// =============================================
// SURVIVAL SCREEN DATA (shown on the survival screen's About tab)
// Stored locally so the game works offline. No live data, no internet.
//
// Two kinds of values live here, and the game always labels them:
//   REAL  -> copied from a published NASA source (listed with each value)
//   GAME  -> invented for the fictional planet or for gameplay
// To add more verified data later, add an entry to SURVIVAL_REAL_DATA with
// its source. Never put an invented number in SURVIVAL_REAL_DATA.
// =============================================

const SURVIVAL_SOURCES = {
  bvad: "NASA Life Support Baseline Values and Assumptions Document (BVAD), " +
        "NASA/TP-2015-218570/REV1, Anderson, Ewert & Keener, January 2018",
  marsFactSheet: "NASA Mars Fact Sheet, NASA Space Science Data Coordinated Archive " +
                 "(nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html)"
};

// REAL measurements / reference values (with their source and table)
const SURVIVAL_REAL_DATA = {
  // What one astronaut needs per day (BVAD Table 3-33, "Summary of Nominal
  // Human Metabolic Interface Values", nominal values per crewmember-day)
  oxygenPerDay: { value: 0.816, unit: "kg / day", source: "bvad", where: "Table 3-33" },
  carbonDioxidePerDay: { value: 1.04, unit: "kg / day", source: "bvad", where: "Table 3-33" },
  waterPerDay: { value: 2.5, unit: "kg / day (drinking water)", source: "bvad", where: "Table 3-33" },
  foodPerDay: { value: 1.51, unit: "kg / day (without packaging)", source: "bvad", where: "Table 3-33" },
  foodEnergyPerDay: { value: 12.59, unit: "MJ / day", source: "bvad", where: "Table 3-33" },

  // A healthy spacecraft cabin (BVAD Table 4-1, "Typical Steady-State
  // Values for Vehicle Atmospheres", nominal column)
  cabinPressure: { value: 101, unit: "kPa", source: "bvad", where: "Table 4-1" },
  cabinOxygenPressure: { value: 21.2, unit: "kPa (oxygen partial pressure)", source: "bvad", where: "Table 4-1" },
  cabinTemperature: { value: 296, unit: "K (about 23 °C)", source: "bvad", where: "Table 4-1" },
  cabinHumidity: { value: 40, unit: "% relative humidity", source: "bvad", where: "Table 4-1" },

  // Mars, as a real comparison for an alien world (NASA Mars Fact Sheet)
  marsPressure: { value: 6.36, unit: "mb (millibars) at mean radius", source: "marsFactSheet", where: "Atmosphere" },
  marsTemperature: { value: 214, unit: "K average (about -59 °C)", source: "marsFactSheet", where: "Atmosphere" },
  marsCarbonDioxide: { value: 95.1, unit: "% carbon dioxide", source: "marsFactSheet", where: "Atmosphere" },
  marsOxygen: { value: 0.16, unit: "% oxygen", source: "marsFactSheet", where: "Atmosphere" },
  marsGravity: { value: 3.73, unit: "m/s² surface gravity", source: "marsFactSheet", where: "Bulk parameters" }
};

// GAME values: the planet in this game is fictional, so these are made up.
// They are shown with a "GAME" label and are NOT real measurements.
const SURVIVAL_GAME_DATA = {
  planetName: "Unknown alien planet",
  planetAir: "Not breathable - Laika needs her oxygen tank",
  planetTemperature: "-18 °C (made up)",
  planetGravity: "About 0.8 x Earth (made up)",
  planetWater: "Liquid water found in a lake",
  shipCabin: "Pressurized and breathable - no oxygen is used inside the ship"
};
