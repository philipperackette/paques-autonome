/* global gregorianEaster, julianEaster, weekdayGregorian, marchEquinoxJDE, astronomicalFullMoonAndEasterUTC */
import { test, expect } from "@playwright/test";
import { adresse, surveiller } from "./outils.js";

// Dates publiées de Pâques (calendrier grégorien civil).
const OCCIDENT = {
  2000: "4-23", 2001: "4-15", 2002: "3-31", 2003: "4-20", 2004: "4-11", 2005: "3-27", 2006: "4-16",
  2007: "4-8", 2008: "3-23", 2009: "4-12", 2010: "4-4", 2011: "4-24", 2012: "4-8", 2013: "3-31",
  2014: "4-20", 2015: "4-5", 2016: "3-27", 2017: "4-16", 2018: "4-1", 2019: "4-21", 2020: "4-12",
  2021: "4-4", 2022: "4-17", 2023: "4-9", 2024: "3-31", 2025: "4-20", 2026: "4-5", 2027: "3-28",
  2028: "4-16", 2029: "4-1", 2030: "4-21",
};
const ORIENT = {
  2010: "4-4", 2011: "4-24", 2017: "4-16", 2019: "4-28", 2020: "4-19", 2021: "5-2", 2022: "4-24",
  2023: "4-16", 2024: "5-5", 2025: "4-20", 2026: "4-12", 2027: "5-2",
};

test.beforeEach(async ({ page }) => {
  await page.goto(adresse("index.html"));
});

test("dates ecclésiastiques grégoriennes et juliennes connues", async ({ page }) => {
  const r = await page.evaluate(([occ, ori]) => ({
    occ: Object.keys(occ).map((y) => { const d = gregorianEaster(+y); return [y, `${d.month}-${d.day}`]; }),
    ori: Object.keys(ori).map((y) => { const d = julianEaster(+y); return [y, `${d.month}-${d.day}`]; }),
  }), [OCCIDENT, ORIENT]);
  expect(Object.fromEntries(r.occ)).toEqual(OCCIDENT);
  expect(Object.fromEntries(r.ori)).toEqual(ORIENT);
});

test("de 1900 à 3000 : toujours un dimanche, entre le 22 mars et le 25 avril", async ({ page }) => {
  const ecarts = await page.evaluate(() => {
    const out = [];
    for (let y = 1900; y <= 3000; y++) {
      const g = gregorianEaster(y), j = julianEaster(y);
      if (weekdayGregorian(g) !== 6) out.push(`grégorien ${y} pas un dimanche`);
      if (weekdayGregorian(j) !== 6) out.push(`julien ${y} pas un dimanche`);
      const q = g.month * 100 + g.day;
      if (q < 322 || q > 425) out.push(`grégorien ${y} hors limites`);
      if (j.month * 100 + j.day < g.month * 100 + g.day) out.push(`julien avant grégorien en ${y}`);
    }
    return out;
  });
  expect(ecarts).toEqual([]);
});

test("Pâques astronomique : équinoxe 2026 et cas de 2019", async ({ page }) => {
  const r = await page.evaluate(() => ({
    equinoxe2026: marchEquinoxJDE(2026),
    a2019: astronomicalFullMoonAndEasterUTC(2019),
    a2026: astronomicalFullMoonAndEasterUTC(2026),
  }));
  // 20 mars 2026 à 14 h 46 UTC (JD 2461120.115), à 15 minutes près.
  expect(Math.abs(r.equinoxe2026 - 2461120.115)).toBeLessThan(0.01);
  // 2019 : pleine lune le 21 mars, juste après l'équinoxe : Pâques astronomique le 24 mars,
  // un mois avant la date ecclésiastique (21 avril).
  expect(r.a2019.fullMoonDateUTC).toEqual({ year: 2019, month: 3, day: 21 });
  expect(r.a2019.easterUTC).toEqual({ year: 2019, month: 3, day: 24 });
  expect(r.a2026.easterUTC).toEqual({ year: 2026, month: 4, day: 5 });
});

test("interface : 2026 au chargement, puis 2019", async ({ page }) => {
  const suivi = surveiller(page);
  const valeur = (k) => page.locator("#summaryGrid .stat", { hasText: k }).locator(".v");
  await expect(valeur("Pâques ecclésiastique grégorienne")).toHaveText("5 avril 2026");
  await page.locator("#yearInput").fill("2019");
  await page.click("#computeBtn");
  await expect(valeur("Pâques ecclésiastique grégorienne")).toHaveText("21 avril 2019");
  await expect(valeur("Pâques ecclésiastique julienne")).toHaveText("28 avril 2019");
  await expect(valeur("Pâques astronomique UTC")).toHaveText("24 mars 2019");
  expect(await page.locator("#tzGroups details").count()).toBeGreaterThan(0);
  suivi.verifier();
});
