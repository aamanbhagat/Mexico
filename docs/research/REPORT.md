# The 20 best international SEO build opportunities

*Prepared 2026-10-12 from the nine keyword CSVs and 22 Google Keyword Planner screenshots in this repository, plus live web research. Every metric below traces to a screenshot row or a cited URL. Nothing is estimated beyond what the evidence shows.*

Files: [`top20_seo_opportunities.xlsx`](top20_seo_opportunities.xlsx) (main database) · [`top20.csv`](top20.csv) · [`candidates_scored.csv`](candidates_scored.csv) · [`top20_keyword_clusters.csv`](top20_keyword_clusters.csv) · [`keyword_metrics_extracted.csv`](keyword_metrics_extracted.csv) · [`serp_evidence.csv`](serp_evidence.csv) · [`discovery_list.csv`](discovery_list.csv) · [`screenshot_audit.csv`](screenshot_audit.csv) · [`scripts/`](scripts/)

---

## Bottom line

1. **There are no easy wins in this dataset.** The first pass of search results suggested many weak SERPs. Re-checking every finalist with a deeper search reversed most of those verdicts. Nearly every utility query here already has 5–10 small, often AI-built tools ranking for it, many on exact-match domains. "Low competition" in Keyword Planner meant nothing about organic difficulty. Almost every keyword was rated "Low" by advertisers.
2. **What still makes an opportunity winnable** is a SERP made up of small sites with no brand or government tool, *plus* documented accuracy or coverage defects in those sites, *plus* validated demand. The top of the list meets all three:
   - **#1 Brazilian alqueire ↔ hectare converter.** Ranking pages contradict each other on regional values.
   - **#2 Mexican aguinaldo/finiquito suite.** Competitors use inconsistent 2026 UMA values, and aguinaldo season is 4–8 weeks away.
   - **#3 Brazil NFS-e national service-code finder.** The SERP is mostly articles that contradict each other.
   - **#4 Javanese weton calculator and calendar.** It has the biggest validated demand, but it is ads-only.
3. **Positions #5–#20 are close calls.** Scores fall between 73 and 69, a band about the size of the scoring uncertainty. Treat them as a pool to confirm with geo-located SERP data before committing development time.
4. **Germany and Spain are weaker than the volumes suggest.** German calculator networks (deutschland-rechner, smart-rechner, rechner-portal, calcforlife) cover almost every German query. Spain's best ideas run into official tools or entrenched specialists. **Turkey cannot be ranked.** It has 1,277 keywords and no Keyword Planner data.
5. **The most valuable thing to build is a parameter registry, not a single page.** This is a shared, dated, sourced store of rates, indices and thresholds. Across six markets I found competitors showing stale or wrong parameters: UMA 2026, Basiszinssatz, child-care levy rate, UDI values and Shopee fees. Being reliably correct on the day rules change is the repeatable edge.

---

## How to read the evidence

| Evidence class | What it is | Reliability |
|---|---|---|
| **KP screenshot (OCR-extracted)** | Keyword Planner "Saved keywords" rows read from the screenshots by OCR and matched to the CSV keywords. 76 rows were checked by eye: 76/76 identical. | High for what is shown. Volumes are **bucketed ranges** (10–100, 100–1K, 1K–10K, 10K–100K…), so one bucket spans a factor of 10. |
| **"—" in a screenshot** | Keyword Planner shows no data. | Treated as **unknown**, never zero. |
| **Not visible** | The keyword is in the CSV but falls in a gap between stitched captures, or is in Turkey (no screenshot). | No metric. |
| **Proxy SERP** | Web search with the native-language query, in standard and extended modes. Direct Google/Bing/DuckDuckGo fetches were blocked (HTTP 403). | Medium. It shows *who* competes, not exact Google positions in that country. |
| **Ads competition** | Advertiser competition (Low/Medium/High). | Reported, **never** used as organic difficulty. |

---

## A. Evidence audit

**Inspected:** all 9 CSVs (11,238 keywords) and all 22 PNG screenshots (3840 px wide, 4,000–22,000 px tall).

| market | screenshots | CSV_keywords | visible_in_screenshots | coverage_% | with_volume | shown_as_dash | not_visible | vol_10K_plus | vol_1K_10K | vol_100_1K | with_bids |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BR | 4 | 2096 | 1689 | 80.6 | 1374 | 315 | 407 | 141 | 306 | 454 | 815 |
| DE | 2 | 1046 | 831 | 79.4 | 483 | 348 | 215 | 12 | 47 | 127 | 232 |
| ES | 3 | 1437 | 1126 | 78.4 | 939 | 187 | 311 | 64 | 211 | 320 | 413 |
| ID | 4 | 1586 | 1339 | 84.4 | 963 | 376 | 247 | 28 | 124 | 315 | 234 |
| JP | 2 | 845 | 691 | 81.8 | 476 | 215 | 154 | 4 | 34 | 116 | 38 |
| JP_EN | 1 | 105 | 89 | 84.8 | 55 | 34 | 16 | 0 | 0 | 6 | 5 |
| MX | 3 | 1540 | 1269 | 82.4 | 1062 | 207 | 271 | 66 | 194 | 349 | 497 |
| PL | 3 | 1306 | 1090 | 83.5 | 813 | 277 | 216 | 57 | 186 | 256 | 352 |
| TR | 0 | 1277 | 0 | 0.0 | 0 | 0 | 1277 | 0 | 0 | 0 | 0 |


Totals: 11,238 CSV keywords; 8,124 visible with a matched row; 6,165 with a volume range; 1,959 shown as '—'; 3,114 not visible (incl. all 1,277 TR).

**Settings found in the screenshots** (read from each plan header):
- Location is the market country. **The `jp_en` plan also uses Japan**, so English searches made from outside Japan are excluded.
- Language: All languages. Network: Google. Date range: **Sep 2025 – Aug 2026**. View: "Saved keywords".
- Top-of-page bids are in **Indian Rupees (₹)**, the Ads account currency. They are comparable between keywords but are not local-currency CPCs.

**What is usable**
- 8,124 keywords have a matched Keyword Planner row. 6,165 of those carry a volume range: 372 at ≥10K–100K, 1,102 at 1K–10K and 1,943 at 100–1K.
- Ads competition is shown for most rows. 2,586 rows have bid estimates.

**Gaps and inconsistencies**
1. **Turkey has no screenshot.** None of its 1,277 keywords has a metric, so Turkey is scored "no KP data" and cannot enter the Top 20 on evidence.
2. **About 18% of non-Turkey keywords are invisible.** Each screenshot is about 12 stitched viewport captures of about 35 rows, and about 7 rows are skipped between captures. Each file covers an alphabetical span of about 500 keywords but shows about 424. That leaves 1,837 non-TR keywords (18.4%) without a metric, including the "uma 2026" family (MX) and most "validador cnpj alfanumérico" variants (BR).
3. **The CSVs contain no metrics.** Every file is one campaign ("Research xx"), one ad group ("All keywords"), broad match, sorted A–Z, with no in-file duplicates.
4. **Keyword Planner normalises punctuation.** "nfs-e" appears as "nfs e", "pró-labore" as "pró labore" and "wa.me" as "wa me". After normalisation, **no screenshot keyword is missing from the CSV**. Sort order differs slightly for accented and upper-case words.
5. **Overlapping captures were consistent.** ES1/ES2 and some DE/JP/PL files overlap (99 duplicate rows). The 8 apparent conflicts are all truncated keywords ("…") whose identity was inferred from order.
6. **Japanese OCR is weaker.** 33 JP rows had their identity inferred from alphabetical order and 26 low-volume JP rows could not be matched. All JP finalist rows were verified by eye. Some JP keywords carry a dotted underline in the UI; the tooltip was not captured, so its meaning is unknown.
7. **Change columns need caution.** Values of +900%, +9,900%, −90%, −99% and "+∞" (zero in the earlier period) are common. They are reliable for year-tagged keywords ("2026") and suspicious for evergreen heads. Several evergreen heads show −90% YoY: *verzugszinsen berechnen, hektar przeliczeniowy, calculadora modalidad 40, 1 mayam berapa gram, calculadora de liquidación*. I reduced their reliability score rather than guess the cause.
8. **The lists are noisy.** Examples:
   - Off-market language: the BR list contains "calculadora uala/upao/utm"; the ES list contains Peruvian SUNAT and "días hábiles argentina/colombia".
   - Physical products: "gerador a diesel", "conversor hdmi", "generador honda 6500 watts".
   - Navigational/official queries: "simulador caixa", "ksef gov", "irpf 2026 download", "hoy no circula".
   - Head terms owned by giants or Google features: "calculadora científica", "converter pdf em word", "conversor de moeda", "kalkulator bmi", "kalkulator brutto netto".
   All were excluded from candidate clusters.

---

## B. Discovery report: what the lists missed

How the gaps were found:
- I looked for whole families absent from each CSV.
- I mapped the inputs and outputs around each finalist tool.
- I noted sub-intents that showed up on competitor pages.
- I tracked regulatory changes that create new demand.

**None of the discoveries below has Keyword Planner metrics.** They need validation before they can compete with the scored candidates.

Main findings:
- **Germany:** the list misses Grundsteuer (2025 reform), Elterngeld, Wohngeld and Bürgergeld calculators. These are high-demand families, but official or brand calculators dominate them.
- **Japan:** 和暦/西暦 conversion and 年齢早見表 are missing (evergreen), as is a Japanese ふるさと納税 limit simulator (portal-dominated). **住所 正規化** is under-weighted: advertisers bid ₹347.67–₹1,363.37 (and up to ₹2,485.18 for "住所 正規化 api"). B2B address normalisation is the monetisation angle for JP-01.
- **Mexico:** tenencia 2026 by state, verificación vehicular calendar, prima de antigüedad, SDI, and the 40-hour-week reform's effect on overtime.
- **Indonesia:** UMR/UMK 2026 by city, gaji bersih (PPh 21 TER + BPJS), Hijri↔Gregorian conversion.
- **Poland:** property tax 2026, income per converted hectare for social-benefit tests, KSeF offline/2027 deadlines.
- **Brazil:** 13º salário, ITBI, NCM/CEST lookup (feeds BR-02), and land price per alqueire (feeds BR-01).
- **Cross-market families with one engine and many locales:** traditional land units (alqueire, tumbak/bata, 坪/反, fanega/marjal, morga, dönüm), amounts in words (7 languages), and date/calendar engines (Javanese, Hijri, workday counters with national holidays).

| Market | Keyword / family (native) | Gloss | How found | Why it matters | Validation status |
|---|---|---|---|---|---|
| BR | preço do alqueire / valor do alqueire por região | Land price per alqueire (normalise to per-hectare) | Gap analysis around BR-01 inputs/outputs | Natural follow-up task to the alqueire converter; monetisable (land listings) | NOT IN CSV – unvalidated |
| BR | tarefa baiana / tarefa sergipana em m² | Regional "tarefa" variants | SERP research (value conflicts) | Extends BR-01 with distinct regional units | Partly in CSV ("1 tarefa em hectare" 10–100); variants unvalidated |
| BR | consulta NCM 2026 / tabela NCM | NCM code lookup | Competitor research (buscadorncm.com.br, contabildescomplica) | Entry point that feeds BR-02 cClassTrib pages | NOT IN CSV as standalone – unvalidated |
| BR | CEST por NCM | CEST code lookup | Competitor research | Same fiscal-lookup engine as BR-02/BR-03 | NOT IN CSV – unvalidated |
| BR | alíquota de referência IBS CBS 2026 simulador por produto | IBS/CBS test-rate simulator | Regulatory change (LC 214/2025 transition) | New demand created by the reform timeline 2026–2033 | Partly in CSV ("simulador aliquota efetiva" 1K–10K); specific queries unvalidated |
| BR | calculadora 13º salário 2026 | 13th-salary calculator | Gap analysis (payroll family) | Big seasonal (Nov–Dec) payroll query absent from list | NOT IN CSV – unvalidated |
| BR | calculadora ITBI | Property-transfer tax by municipality | Gap analysis (property) | Municipal rate tables = data moat | NOT IN CSV – unvalidated |
| BR | pensão alimentícia atrasada com correção (calcular débito) | Child-support arrears with monetary correction | SERP research | Deterministic sub-intent of BR-07 | In CSV (100–1K family) |
| BR | validador CNPJ alfanumérico em lote (CSV) | Batch validation for dev teams | SERP research (cnpj-alpha batch tools) | Dev/B2B sub-intent | In CSV but NOT visible in screenshots |
| DE | Grundsteuer-Rechner 2025 (Bundesmodell / Ländermodelle) | Property-tax reform calculator | Gap analysis | Large post-reform topic absent from list; state-model complexity is a moat | NOT IN CSV – unvalidated |
| DE | Elterngeld-Rechner | Parental allowance calculator | Gap analysis | High demand family absent from list (official BMFSFJ calculator exists) | NOT IN CSV – unvalidated |
| DE | Wohngeld-Rechner 2026 | Housing benefit calculator | Gap analysis | Absent from list; official calculators by Länder | NOT IN CSV – unvalidated |
| DE | Forderungsaufstellung / Mahnbescheid Zinsen PDF | Claim statement generator | Follow-up task of DE-07 | Converts Verzugszinsen users into document generation | NOT IN CSV – unvalidated |
| DE | Prozesskostenrechner / Gerichtskosten GKG | Litigation-cost calculator | Follow-up task of DE-03 | Sibling to RVG calculator | NOT IN CSV – unvalidated |
| DE | Brennholz Preis pro kWh / Festmeter Gewicht | Firewood price per kWh / weight | SERP research (rechner-portal pages) | Extends DE-09 if pursued | NOT IN CSV – unvalidated |
| ES | calculadora pensión de viudedad | Widow pension calculator | Gap analysis | Absent; Social Security simulators exist | NOT IN CSV – unvalidated |
| ES | calculadora ITP vivienda por comunidad autónoma | Transfer tax by region | Gap analysis | 17 regional rate sets = data moat | NOT IN CSV – unvalidated |
| ES | calculadora plusvalía municipal (método objetivo vs real) | Municipal capital-gains tax | Gap analysis | Post-2021 dual-method rule; municipal coefficients | In CSV partly ("plusvalia" terms); validate |
| ES | calculadora bono social luz | Electricity social-bonus eligibility | Gap analysis | Eligibility rules (IPREM-based) tie into IPREM cluster | NOT IN CSV – unvalidated |
| ES | hanegada/fanega por provincia | Regional land units | CSV + SERP | Localisation of BR-01 engine; tiny demand (10–100) | In CSV (low volume) |
| ID | UMR / UMK 2026 per kota | Regional minimum wages by city | Gap analysis | Yearly high-demand table + gaji bersih converter | NOT IN CSV – unvalidated |
| ID | kalkulator gaji bersih (PPh 21 TER + BPJS) | Net salary calculator | Gap analysis | Combines ID-05 tax and BPJS keywords present in list | Partly in CSV (BPJS/PPh terms); unvalidated as a head |
| ID | konversi tanggal hijriah ↔ masehi | Hijri ↔ Gregorian conversion | CSV (hijriah, 12 keywords) + gap | Shares date engine with ID-01/ID-09 | In CSV (validate volumes) |
| ID | hari baik pernikahan menurut weton 2027 | Auspicious wedding dates | SERP research (katadata wedding-date articles) | High-intent sub-intent of ID-01; wedding-vendor monetisation | Partly in CSV ("kalkulator tanggal pernikahan jawa 2026" 100–1K) |
| ID | satuan tanah Sunda vs Jawa (tumbak, bata, ru, bau) | Regional land-unit variants | SERP research (conflicting values) | Localisation of BR-01 engine | In CSV (1K–10K heads) |
| JP | 和暦 西暦 変換 / 年齢早見表 2026 | Japanese era ↔ Gregorian conversion / age table | Gap analysis | Evergreen high-demand family absent from list (keisan etc. compete) | NOT IN CSV – unvalidated |
| JP | ふるさと納税 上限 シミュレーション | Furusato-nozei limit simulator (JP) | Gap analysis (EN version exists in jp_en.csv) | Very large but portal-dominated (affiliate giants) | NOT IN jp.csv – unvalidated |
| JP | 住所 正規化 / エクセル 住所 分割 | Address normalisation / split in Excel | CSV (100–1K) + SERP | B2B extension of JP-01 and JP-TXT | In CSV (100–1K) |
| JP | 年金 繰り下げ 受給 計算 | Deferred pension calculator | Gap analysis | High-value retiree audience (pairs with JP-07) | NOT IN CSV – unvalidated |
| JP | パスポート ローマ字 氏名 変換 | Passport name romanisation | CSV + SERP (prefecture rule pages) | Feature of JP-01 romanisation engine | In CSV (100–1K) |
| JP_EN | japanese name to katakana converter | Name → katakana | Gap analysis | Natural sibling for English-speaking audience | NOT IN CSV – unvalidated |
| JP_EN | japan postal code lookup english | English postcode lookup | Gap analysis | Reuses JP-01 dataset | NOT IN CSV – unvalidated |
| JP_EN | japan resident tax calculator / furusato nozei calculator english | Resident-tax & furusato limits in English | CSV | Needs KP with non-Japan locations to size | In CSV; KP location Japan only (10–100) |
| MX | tenencia 2026 calculadora (CDMX / Edomex) | Vehicle ownership tax by state | Gap analysis | State-specific rules; seasonal (Jan–Mar) | NOT IN CSV – unvalidated |
| MX | verificación vehicular calendario 2026 | Emissions-test calendar by plate | Gap analysis (sibling of "hoy no circula") | Daily-use utility; news-heavy SERP | NOT IN CSV – unvalidated |
| MX | calculadora prima de antigüedad | Seniority premium | Gap analysis (LFT suite) | Sibling of MX-01 (Art. 162 LFT) | NOT IN CSV – unvalidated |
| MX | calculadora salario diario integrado (SDI) | Integrated daily wage | Gap analysis | Input to IMSS/Modalidad 40 and MX-01 | NOT IN CSV – unvalidated |
| MX | jornada laboral 40 horas calculadora horas extra | 40-hour-week reform impact on overtime | Regulatory change (phased reform) | New demand as the reform phases in — verify timeline | NOT IN CSV – unvalidated |
| MX | uma 2026 diaria / mensual / anual | UMA values | CSV (in list) but not visible in screenshots | Feeds MX-01 and MX-03 | In CSV but NOT visible in screenshots |
| PL | kalkulator podatku od nieruchomości 2026 | Property-tax calculator after 2025 definition changes | Gap analysis | Municipal rates; recurring | NOT IN CSV – unvalidated |
| PL | dochód z 1 ha przeliczeniowego 2026 (GUS) – progi świadczeń | Farm income per converted ha for benefits | Follow-up task of PL-08 | Social-benefit eligibility (rodzinne, stypendia) | NOT IN CSV – unvalidated |
| PL | KSeF tryb offline / limit faktur od 2027 | KSeF offline mode and micro-business deadlines | CSV (100–1K) + regulatory timeline | Demand spike around Jan 2027 for smallest taxpayers (verify dates) | In CSV partly |
| PL | odmiana imion w wołaczu (zaproszenia, kartki) | Vocative first names | CSV + SERP | Feature of PL-02 | In CSV (100–1K) |
| PL | liczebniki słownie (daty, ułamki) | Numerals in words beyond money | Gap analysis | Extends NUM engine for school use | NOT IN CSV – unvalidated |
| TR | dönüm metrekare hesaplama | Turkish land unit converter | CSV (10 keywords, no metrics) | Localisation of BR-01 engine | In CSV; NO KP data (no TR screenshot) |
| TR | kira artış oranı hesaplama (TÜFE 12 aylık ortalama) | Rent increase by CPI average | CSV (46 kira keywords, no metrics) | Monthly TÜİK update; very common query family | In CSV; NO KP data |
| TR | rakamı yazıya çevirme (TL) | Number to words (TRY) | CSV (25 keywords, no metrics) | NUM engine locale | In CSV; NO KP data |
| TR | asgari ücret 2027 net hesaplama | Minimum wage net calculator | Gap analysis | Huge seasonal spike (Dec–Jan) | NOT IN CSV – unvalidated |
| ALL | Parameter registry (rates, thresholds, indices with effective dates & sources) | Cross-market data layer | Red-team finding: competitors repeatedly show stale/wrong parameters | The single most reusable competitive advantage across MX-01, BR-08, DE-07, JP-07, PL-04/08, JP-13 | Internal capability – not a keyword |


---

## C. Final ranked Top 20

### Scoring framework (defined before ranking)

| Code | Criterion | Max | Rule summary |
|---|---|---|---|
| A | Organic opportunity & SERP weakness | 25 | 19–23 ≤1 dedicated tool and no brand/official tool · 14–18 several small tools with documented gaps · 10–13 ≥6 small tools or exact-match domains or one mid-authority brand · 8–9 calculator networks or a strong specialist · **<8 = gate: excluded** (brand- or official-tool-dominated). Capped at 23 because all SERPs are proxies. Ads competition is not used. |
| B | Demand & evidence reliability | 20 | Demand 0–14 from the cluster's Keyword Planner buckets, plus reliability 0–6 (6 = visible and verified; −1 for a decaying/year-tagged or −90% YoY head; 2–3 for a location mismatch; 0 for no data). |
| C | Tool fit | 20 | Deterministic, fully answers the query 18–20 · lookup or linguistic engine 15–17 · estimator under legal discretion 11–14 · informational ≤10. |
| D | Intent & site relevance | 10 | Utility intent 9–10 · mixed 6–8 · informational/product/navigational ≤5. |
| E | Cluster traffic potential | 10 | Breadth of validated keywords, sibling and programmatic pages, evergreen or recurring demand. |
| F | Monetisation | 10 | B2B/legal/finance lead-gen or high bids 9–10 · consumer finance/property 6–8 · ads plus light affiliates 3–5 · ads only in a low-RPM market 1–2. |
| G | Feasibility & localisation | 5 | Static rules 5 · annual updates or linguistic work 3–4 · regulatory churn or liability 1–2. |

Tie-break order: total → A → F → B → E. Missing organic evidence is never read as low difficulty.

### Comparison table

| # | ID | Opportunity | Market | Primary keyword | KP avg. monthly (range) | Kw ≥10K | Kw 1K–10K | Kw 100–1K | A /25 | B /20 | C /20 | D /10 | E /10 | F /10 | G /5 | Score | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | BR-01 | Alqueire ↔ hectare & agrarian-unit converter | BR | alqueire em hectare | 1K – 10K | 0 | 5 | 13 | 14 | 16 | 19 | 10 | 8 | 6 | 5 | 78 | Medium-High |
| 2 | MX-01 | Aguinaldo / finiquito / liquidación suite | MX | calculadora aguinaldo | 10K – 100K | 4 | 5 | 8 | 10 | 20 | 19 | 10 | 9 | 6 | 4 | 78 | Medium |
| 3 | BR-03 | NFS-e Código de Tributação Nacional finder | BR | código de tributação nacional | 10K – 100K | 1 | 3 | 7 | 12 | 18 | 17 | 10 | 9 | 8 | 3 | 77 | Medium |
| 4 | ID-01 | Weton calculator & Javanese calendar | ID | hitung weton | 10K – 100K | 5 | 11 | 16 | 12 | 20 | 17 | 9 | 10 | 2 | 4 | 74 | Medium |
| 5 | JP-TXT | Japanese text toolkit (全角半角/旧字体/機種依存) | JP | 全角 半角 変換 | 10K – 100K | 1 | 4 | 15 | 10 | 19 | 19 | 10 | 8 | 2 | 5 | 73 | Medium |
| 6 | MX-03 | UDIS ↔ pesos converter (Banxico) | MX | udis a pesos | 10K – 100K | 1 | 0 | 5 | 9 | 17 | 20 | 10 | 7 | 5 | 5 | 73 | Medium |
| 7 | PL-05 | Słowa z liter word finder | PL | słowa z liter | 10K – 100K | 1 | 2 | 3 | 10 | 18 | 18 | 10 | 9 | 3 | 4 | 72 | Medium-Low |
| 8 | ID-09 | Indonesian date tools (umur/hari/jadian) | ID | kalkulator umur | 10K – 100K | 4 | 2 | 3 | 10 | 19 | 19 | 10 | 7 | 2 | 5 | 72 | Medium-Low |
| 9 | NUM | Amount-in-words engine (7 locales) | PL,BR,MX,ID,DE,ES,TR | kwota słownie | 10K – 100K | 2 | 3 | 22 | 8 | 18 | 19 | 10 | 8 | 5 | 4 | 72 | Medium-Low |
| 10 | DE-02 | HOAI fee calculator | DE | hoai rechner | 10K – 100K | 1 | 1 | 3 | 11 | 16 | 17 | 10 | 5 | 9 | 3 | 71 | Medium-Low |
| 11 | PL-02 | Odmiana nazwisk/imion + invitations | PL | odmiana nazwisk | 10K – 100K | 1 | 2 | 10 | 11 | 18 | 16 | 10 | 9 | 4 | 3 | 71 | Medium |
| 12 | JP-01 | 住所 英語 変換 (JP + EN) | JP,JP_EN | 住所 英語 変換 | 10K – 100K | 1 | 3 | 6 | 9 | 18 | 17 | 10 | 8 | 5 | 4 | 71 | Medium |
| 13 | BR-08 | IRRF / IR 2026–27 calculator | BR | calculadora irrf 2026 | 10K – 100K | 1 | 9 | 7 | 9 | 18 | 19 | 10 | 7 | 5 | 3 | 71 | Low-Medium |
| 14 | PL-04 | Staż pracy / urlop calculator | PL | kalkulator stażu pracy | 10K – 100K | 1 | 6 | 5 | 8 | 19 | 18 | 10 | 7 | 6 | 3 | 71 | Medium-Low |
| 15 | BR-02 | cClassTrib / CST IBS-CBS lookup | BR | cclasstrib | 10K – 100K | 1 | 2 | 12 | 9 | 16 | 16 | 9 | 9 | 9 | 2 | 70 | Medium-Low |
| 16 | JP-07 | 退職金 tax & take-home calculator | JP | 退職金 税金 計算 | 1K – 10K | 0 | 4 | 7 | 9 | 15 | 19 | 9 | 6 | 8 | 4 | 70 | Medium-Low |
| 17 | DE-03 | RVG fee & court-cost calculator | DE | rvg rechner | 10K – 100K | 1 | 2 | 3 | 8 | 17 | 18 | 10 | 5 | 9 | 3 | 70 | Low-Medium |
| 18 | DE-07 | Verzugszinsen calculator | DE | verzugszinsen berechnen | 10K – 100K | 1 | 2 | 3 | 8 | 16 | 19 | 10 | 5 | 8 | 4 | 70 | Low-Medium |
| 19 | PL-08 | Hektar przeliczeniowy & podatek rolny | PL | hektar przeliczeniowy | 1K – 10K | 0 | 1 | 6 | 18 | 12 | 18 | 9 | 4 | 4 | 4 | 69 | Medium |
| 20 | BR-09 | Shopee/marketplace fee calculator | BR | calculadora shopee | 1K – 10K | 0 | 2 | 2 | 10 | 13 | 19 | 10 | 7 | 8 | 2 | 69 | Medium-Low |


**Market mix:**
- Brazil 5 (#1, #3, #13, #15, #20)
- Poland 4 plus the PL-led NUM engine (#7, #11, #14, #19; #9)
- Japan 3 (#5, #12, #16)
- Germany 3 (#10, #17, #18)
- Mexico 2 (#2, #6)
- Indonesia 2 (#4, #8)
- Spain 0, Turkey 0

These shares come from the evidence; no country quotas were applied.

### Detailed justification for each selection

### 1. Agrarian land-unit converter: alqueire (paulista/mineiro/goiano/baiano/do Norte), tarefa, litro de terra, quadra ↔ hectare/m², by state  
`BR-01` · **Market:** BR · **Language:** Portuguese (pt-BR) · **Score 78/100** · **Confidence: Medium-High**

| Field | Detail |
|---|---|
| Primary keyword | **alqueire em hectare**: 1K – 10K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid ₹1.69–₹96.93 |
| Related keywords / intent cluster | alqueire em hectare (1K – 10K); alqueire goiano (1K – 10K); alqueire para hectare (1K – 10K); hectare para alqueire (1K – 10K); quantos hectares tem um alqueire (1K – 10K); 1 alqueire em hectares (100 – 1K); 1 litro de terra (100 – 1K); 1 litro de terra equivale a quantos hectares (100 – 1K) |
| Keyword Planner demand & source | Cluster: 60 keywords with volume (0 at ≥10K–100K, 5 at 1K–10K, 13 at 100–1K); sum of bucket lower bounds = 6,720/month (indicative floor; may double-count close variants); 21 cluster keywords are in the CSV but not visible in any screenshot. Source: BR1-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 14/25) | >=8 small converters, no brand or official tool; ranking pages contradict each other on regional values (baiano 9.68 vs 4.84 ha; do Norte 2.72 vs 9.68 ha). |
| SERP evidence | S04 (standard, "alqueire para hectare calculadora"): [1](https://aegro.com.br/blog/hectare/), [2](https://comprerural.com/hectare-ou-alqueire-qual-medida-de-terra-usar/), [3](https://calculacentro.com/calculadora/conversor-area)<br>S05 (extended, "conversor alqueire hectare calculadora alqueire paulista mineiro goiano baiano"): [1](https://reland.com.br/en/tools/area-converter/alqueire-paulista-to-hectare), [2](https://calculadorarural.com.br/ferramentas/conversor-medidas), [3](https://calculadorarural.com.br/blog/tabela-alqueire-hectare-estados), [4](https://www.vivamei.com.br/agro/calculadoras/alqueire-hectare), [5](https://calculacentro.com/ferramenta/conversor-area), [6](https://www.calculeonline.com/calculadora-conversao-alqueires), [7](https://pt.360calc.com/conversao/area), [8](https://credited.com.br/ferramentas/conversoes/hectares/) |
| Competitors & weaknesses | calculadorarural.com.br, calculeonline.com, vivamei.com.br, calculacentro.com, reland.com.br, 360calc, credited.com.br, onlinetoolkit.co, plus Aegro tag pages. Weaknesses: conflicting regional values with no sources, thin tag pages, few cover tarefa/litro de terra by state. |
| Why this beats other candidates | The cleanest combination in the study: validated demand (5 keywords at 1K–10K), small-site-only SERP, deterministic tool, near-zero liability, and an engine that is reused for traditional land units in ID/JP/ES/PL/TR. |
| URL / page structure | /pt-br/conversor-alqueire-hectare/ (hub) → /alqueire-paulista/, /alqueire-mineiro-goiano/, /alqueire-baiano/, /alqueire-do-norte/, /tarefa-em-hectare/, /litro-de-terra/, /hectare-para-alqueire/; later /id/konversi-satuan-tanah/, /ja/tsubo-heibei/, /es-es/fanega-metros-cuadrados/, /pl/morga-hektar/, /tr/donum-metrekare/ |
| Minimum viable functionality | Two-way converter (alqueire, tarefa, litro de terra, quadra, braça² ↔ ha, m², acre); state/region selector that shows the value used and its source; per-state reference table; price-per-alqueire ↔ price-per-hectare normaliser; shareable result URL; printable table; FAQ that explains why sites disagree. |
| Localisation | pt-BR decimal comma and thousands dot; state names and regional unit names; cite INCRA/Embrapa/state agencies for each value; flag that official documents (CAR/ITR/cartório) use hectares. |
| Monetisation | Agro display ads; rural-land listing and agri-credit/insurance affiliates; GIS/area-measurement app partners. Advertisers already bid up to ₹121.40 on "hectare para alqueire". |
| Score explanation | A 14: >=8 small converters, no brand or official tool; ranking pages contradict each other on regional values (baiano 9.68 vs 4.84 ha; do Norte 2.72 vs 9.68 ha).<br>B 16: 5 keywords at 1K–10K + 13 at 100–1K, all visible in BR screenshots and visually verified (demand 10 + reliability 6).<br>C 19: Deterministic conversion; fully satisfies the query in-page.<br>D 10: Pure tool intent.<br>E 8: 60 keywords with volume; per-unit/per-state pages; engine reusable for ID/JP/ES/PL/TR traditional units.<br>F 6: Agri audience; top-of-page bid up to ₹121.40 on "hectare para alqueire"; rural land/credit/insurance affiliates.<br>G 5: Static data, low liability. |
| Validate before development | Geo SERP (google.com.br) for the 5 core terms; authoritative per-state values for alqueire/tarefa/litro de terra; KP volume for "preço/valor do alqueire". |

### 2. Ley Federal del Trabajo payout suite: aguinaldo, finiquito, liquidación, prima vacacional, vacaciones (2026 UMA/SM, ISR exempt)  
`MX-01` · **Market:** MX · **Language:** Spanish (es-MX) · **Score 78/100** · **Confidence: Medium**

| Field | Detail |
|---|---|
| Primary keyword | **calculadora aguinaldo**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid ₹0.46–₹10.28 |
| Related keywords / intent cluster | calculadora aguinaldo (10K – 100K); calculadora de finiquito (10K – 100K); calculadora de liquidación (10K – 100K); calculadora finiquito (10K – 100K); calculadora finiquito 2026 (1K – 10K); calculadora liquidacion (1K – 10K); calculadora liquidacion mexico (1K – 10K); calculadora prima vacacional (1K – 10K) |
| Keyword Planner demand & source | Cluster: 28 keywords with volume (4 at ≥10K–100K, 5 at 1K–10K, 8 at 100–1K); sum of bucket lower bounds = 45,910/month (indicative floor; may double-count close variants); 13 cluster keywords are in the CSV but not visible in any screenshot. Source: MX1(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 10/25) | >=9 third-party calculators incl. exact-match domains; no official PROFEDET calculator surfaced; documented parameter errors (UMA 113.14 vs 117.31; ISR-exempt 3,394.20 vs 3,519.30). |
| SERP evidence | S70 (standard, "calculadora finiquito y liquidación 2026 México"): [1](https://elconta.mx/calculadora-gratuita-de-finiquito-y-liquidacion-laboral/), [2](https://hacecuentas.com/calculadora-finiquito-liquidacion-mexico-2026), [3](https://cotizadorhipotecario.mx/laboral/calculadora-finiquito), [4](https://calcuris.com/es/mexico/laboral/calculo-liquidacion/), [5](https://sdv.com.mx/herramientas/calculadora-liquidacion/)<br>S71 (extended, "calculadora finiquito liquidación México gratis PROFEDET calculadora oficial"): [1](https://calculadorade-finiquito.com.mx/), [2](https://calculolaboral.mx/), [3](https://www.calculadorasat.org/calculadoras/nomina/calculadora-finiquito-liquidacion), [4](https://calculadoraliquidacion.com/), [5](https://www.tucalculadorasat.com/calculadora_finiquito.html), [6](https://tucalculolaboral.com/finiquito/mexico/), [7](https://tucalculadora.com/laboral/finiquito-liquidacion/), [8](https://cifrasnet.com/tools/finiquito-liquidacion/)<br>S72 (standard, "calculadora aguinaldo 2026 PROFEDET"): [1](https://calcforlife.com/?p=2051), [2](https://cotizadorhipotecario.mx/laboral/calculadora-aguinaldo), [3](https://calcuris.com/es/mexico/laboral/como-calcular-aguinaldo/), [4](https://www.excelsior.com.mx/finanzas/cuando-paga-aguinaldo-2026-puedes-calcular-cuanto-toca) |
| Competitors & weaknesses | calculadorade-finiquito.com.mx, calculolaboral.mx, calculadorasat.org, calculadoraliquidacion.com, tucalculolaboral.com, tucalculadora.com, cifrasnet.com, elconta.mx, cotizadorhipotecario.mx, calcuris.com. Weaknesses: inconsistent 2026 parameters (UMA 113.14 vs 117.31; ISR-exempt 3,394.20 vs 3,519.30), single-purpose pages, weak sourcing. |
| Why this beats other candidates | Largest validated demand among winnable clusters (4 heads at 10K–100K). No official calculator surfaced, and competitors have documented parameter errors. Aguinaldo demand peaks in Nov–Dec, so this should be live by mid-November 2026. |
| URL / page structure | /es-mx/calculadora-aguinaldo/, /es-mx/calculadora-finiquito/, /es-mx/calculadora-liquidacion/, /es-mx/calculadora-prima-vacacional/, /es-mx/calculadora-vacaciones/ (shared LFT engine; /es-mx/uma-salario-minimo-2026/ parameters page) |
| Minimum viable functionality | Inputs: daily/monthly salary, start/end dates, aguinaldo days (≥15), pending vacation days (2023 "vacaciones dignas" table), vacation premium %, separation cause. Outputs: breakdown per concept with LFT article (48, 50, 76, 80, 87, 162), ISR-exempt portion with the UMA in force, estimated withholding, net; dated parameter registry citing DOF/INEGI/CONASAMI; PDF export; northern-border minimum wage. |
| Localisation | es-MX currency format, LFT/LISR article references, UMA vs salario mínimo distinction, ZLFN. |
| Monetisation | Labour-lawyer lead-gen (high value), payroll/HR SaaS affiliates, finance ads. Keyword bids are low (₹0.44–₹53.72), so ads alone underperform. |
| Score explanation | A 10: >=9 third-party calculators incl. exact-match domains; no official PROFEDET calculator surfaced; documented parameter errors (UMA 113.14 vs 117.31; ISR-exempt 3,394.20 vs 3,519.30).<br>B 20: 4 heads at 10K–100K (aguinaldo, finiquito x2, liquidación) + 5 at 1K–10K; verified (14 + 6).<br>C 19: Deterministic LFT/LISR formulas.<br>D 10: Tool intent.<br>E 9: Five sibling calculators + seasonal aguinaldo peak (Nov–Dec) + PTU (May).<br>F 6: Bids low (₹4–₹54) but labour-lawyer lead-gen and payroll SaaS affiliates.<br>G 4: Annual UMA/SM updates; legal review needed. |
| Validate before development | Labour-law review, including whether the prima de antigüedad cap is based on salario mínimo or UMA (tools differ); geo SERP; check whether PROFEDET/gob.mx publishes a calculator; 12-month KP trend for seasonality. |

### 3. Código de Tributação Nacional (cTribNac) finder for NFS-e Nacional — search by service, CNAE, LC 116 item, NBS  
`BR-03` · **Market:** BR · **Language:** Portuguese (pt-BR) · **Score 77/100** · **Confidence: Medium**

| Field | Detail |
|---|---|
| Primary keyword | **código de tributação nacional**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid ₹27.47–₹103.18 |
| Related keywords / intent cluster | código de tributação nacional (10K – 100K); código de tributação nacional mei (1K – 10K); código de tributação nacional mei prestação de serviços (1K – 10K); código de tributação nacional prestação de serviços (1K – 10K); código de tributação nacional como saber (100 – 1K); código de tributação nacional entregador shopee (100 – 1K); código de tributação nacional mei como saber (100 – 1K); código de tributação nacional nfse (100 – 1K) |
| Keyword Planner demand & source | Cluster: 46 keywords with volume (1 at ≥10K–100K, 3 at 1K–10K, 7 at 100–1K); sum of bucket lower bounds = 14,050/month (indicative floor; may double-count close variants); 10 cluster keywords are in the CSV but not visible in any screenshot. Source: BR2-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 12/25) | A handful of small searchable lists (338 codes) and one CNAE->code tool; most results are fintech/ERP articles that contradict each other; no official CNAE->code tool found. |
| SERP evidence | S08 (standard, "código de tributação nacional NFS-e MEI consulta"): [1](https://meutudo.com.br/blog/codigo-de-tributacao-nacional-para-mei/), [2](https://nfe.io/blog/?p=14452), [3](https://blog.tecnospeed.com.br/nfs-e-nacional-como-consultar-o-codigo-de-tributacao/), [4](https://neon.com.br/aprenda/mei/codigo-de-tributacao-nacional-para-mei/), [5](https://conteudo.fiscal.io/nfse-como-consultar-o-codigo-de-tributacao-nacional-do-mei)<br>S09 (extended, "consultar código de tributação nacional NFS-e por CNAE ferramenta busca"): [1](https://github.com/transformax2205-droid/codigo-tributacao-nacional-nfse), [2](https://www.nfsedownloader.com.br/codigo-tributacao-nacional), [3](https://notafiscalafiliados.com.br/guia/codigo-tributacao-nacional-nfse-lista), [4](https://maquinadecartaoboa.com/codigo-de-tributacao-nacional/), [5](https://buscadorncm.com.br/), [6](https://consultorestributarios.com.br/codigo-de-tributacao-nacional-para-mei/), [7](https://dicas.autenticacertificado.com.br/codigo-de-tributacao-nacional-para-mei/) |
| Competitors & weaknesses | nfsedownloader.com.br, notafiscalafiliados.com.br, maquinadecartaoboa.com (CNAE→code), GitHub dataset, buscadorncm.com.br, plus fintech/ERP articles (meutudo, nfe.io, tecnospeed, neon, fiscal.io). Weaknesses: articles contradict each other (CFOP vs NBS, 198 vs 338 codes), lists are thin, CNAE mapping is mostly heuristic. |
| Why this beats other candidates | A 10K–100K B2B head term where most ranking pages are articles and only small lists exist. It fits a Brazil SME fiscal hub with BR-02. |
| URL / page structure | /pt-br/codigo-tributacao-nacional/ (search) → /pt-br/codigo-tributacao-nacional/{codigo}-{slug}/ (338) → /pt-br/codigo-tributacao-nacional/cnae/{cnae}/ (only where an official correlation exists) |
| Minimum viable functionality | Instant search by code, description, CNAE, LC 116 item and NBS; one page per code with the official description, NBS correlation, ISS notes and MEI suitability; copy button; dated data versions with source; "how to fill in the Emissor Nacional" walkthrough. |
| Localisation | pt-BR; MEI/ISS/NBS/CNAE terms; municipal caveats; no CFOP confusion. |
| Monetisation | NFS-e issuing software, ERP and digital-certificate affiliates; accounting lead-gen; cluster bids up to ₹307. |
| Score explanation | A 12: A handful of small searchable lists (338 codes) and one CNAE->code tool; most results are fintech/ERP articles that contradict each other; no official CNAE->code tool found.<br>B 18: 1 head at 10K–100K + 3 at 1K–10K + 7 at 100–1K; verified (12 + 6).<br>C 17: Lookup/database tool; edge cases need municipal caveats.<br>D 10: Task intent (fill the NFS-e field).<br>E 9: 338 code pages + ~1,300 CNAE pages possible.<br>F 8: Cluster bids up to ₹307; NFS-e/ERP/certificado digital affiliates, accounting leads.<br>G 3: Correlation data must be kept in sync with national tables. |
| Validate before development | Whether an official CNAE × cTribNac correlation exists and how it may be reused; update cadence of national NFS-e tables; geo SERP. |

### 4. Weton & Javanese calendar: cek weton/neptu, weton jodoh, weton hari ini, kalender Jawa 2026/2027  
`ID-01` · **Market:** ID · **Language:** Indonesian (+ Javanese terms) · **Score 74/100** · **Confidence: Medium**

| Field | Detail |
|---|---|
| Primary keyword | **hitung weton**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid nan |
| Related keywords / intent cluster | hitung weton (10K – 100K); hitung weton jawa (10K – 100K); hitung weton jodoh (10K – 100K); kalender jawa 2026 (10K – 100K); weton hari ini (10K – 100K); cek weton lahir online (1K – 10K); hitung weton jodoh jawa (1K – 10K); hitung weton online (1K – 10K) |
| Keyword Planner demand & source | Cluster: 51 keywords with volume (5 at ≥10K–100K, 11 at 1K–10K, 16 at 100–1K); sum of bucket lower bounds = 62,790/month (indicative floor; may double-count close variants); 5 cluster keywords are in the CSV but not visible in any screenshot. Source: ID1-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 12/25) | >=8 weton tools (two exact-match domains) + news; tools disagree on neptu/pasaran tables and division methods; calendar intent served by monthly news articles. |
| SERP evidence | S36 (standard, "hitung weton jodoh online"): [1](https://kabar24.bisnis.com/read/20250919/243/1912062/perhitungan-weton-jodoh-dan-tafsir-lengkap-online), [2](https://www.detik.com/jateng/budaya/d-8165445/cara-cek-kecocokan-jodoh-berdasarkan-weton-dan-primbon-jawa-untuk-pernikahan), [3](https://www.popbela.com/relationship/married/cek-perhitungan-weton-jodoh-online-00-kc27c-dzr6kb)<br>S37 (extended, "hitung weton jodoh kalkulator weton online neptu"): [1](https://kalenderindo.id/weton-jodoh), [2](https://hitunganweton.id/), [3](https://www.suara.com/lifestyle/2026/07/23/131855/kalkulator-weton-online-cek-hari-lahir-menurut-penanggalan-jawa), [4](https://jalinjanji.com/tools/cek-weton/), [5](https://hitungweton.com/weton-jodoh-online), [6](https://javasenseapp.com/id/cek-jodoh-menurut-weton/), [7](https://www.itungin.com/kalkulator-weton), [8](https://se-hari.com/tools/kalkulator-weton-jawa)<br>S38 (standard, "kalender jawa 2026 lengkap dengan weton pasaran"): [1](https://katadata.co.id/lifestyle/varia/6a39f918dddc9/kalender-jawa-juli-2026-lengkap-dengan-weton-dan-pasarannya), [2](https://www.metrotvnews.com/read/kewCjRY2-kalender-jawa-januari-2026-lengkap-dengan-weton-pasaran-dan-neptu), [3](https://www.goodnewsfromindonesia.id/2026/04/24/cek-weton-kalender-jawa-hari-ini-24-april-2026) |
| Competitors & weaknesses | kalenderindo.id, hitunganweton.id, hitungweton.com, jalinjanji.com, javasenseapp.com, itungin.com, se-hari.com, wedding.manggala.cloud; monthly calendars from katadata/metrotvnews. Weaknesses: inconsistent neptu tables and methods with no sources; no interactive year calendar. |
| Why this beats other candidates | Biggest validated demand in the dataset outside giant SERPs (5 heads at 10K–100K plus 11 at 1K–10K). Evergreen with a yearly refresh. The main weakness is monetisation, not traffic. |
| URL / page structure | /id/weton/ (cek weton by birth date) → /id/weton/jodoh/, /id/weton/hari-ini/, /id/weton/{hari}-{pasaran}/ (35 pages), /id/kalender-jawa/2026/, /id/kalender-jawa/2027/, /id/kalender-jawa/2026/{bulan}/ |
| Minimum viable functionality | Date → day, pasaran, neptu, wuku, Javanese date (year/windu), Hijri date; jodoh with selectable methods (remainder-of-8 Pegat…Pesthi and others) that cite the primbon source used; daily "weton hari ini"; printable annual calendar; share card. |
| Localisation | Bahasa Indonesia with Javanese terms; respectful cultural framing (tradition, not prediction); Kemenag Hijri alignment. |
| Monetisation | Ads only (low RPM in Indonesia); wedding-vendor affiliates; printable-calendar products. |
| Score explanation | A 12: >=8 weton tools (two exact-match domains) + news; tools disagree on neptu/pasaran tables and division methods; calendar intent served by monthly news articles.<br>B 20: 5 heads at 10K–100K + 11 at 1K–10K + 16 at 100–1K; verified (14 + 6).<br>C 17: Deterministic calendar maths; interpretation text is cultural content.<br>D 9: Mostly tool intent; some informational.<br>E 10: Largest validated cluster outside giant SERPs; yearly refresh (2027).<br>F 2: Ads only in a low-RPM market; wedding-vendor affiliates.<br>G 4: Algorithm + careful cultural copy. |
| Validate before development | Algorithm check against authoritative Javanese-calendar references; AdSense policy for astrology-adjacent content; geo SERP; RPM assumption. |

### 5. Japanese text-normalisation toolkit: 全角/半角, 半角カナ, 旧字体/異体字, 機種依存文字・環境依存文字 checker  
`JP-TXT` · **Market:** JP · **Language:** Japanese · **Score 73/100** · **Confidence: Medium**

| Field | Detail |
|---|---|
| Primary keyword | **全角 半角 変換**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid nan |
| Related keywords / intent cluster | 全角 半角 変換 (10K – 100K); 半角かな 変換 (1K – 10K); 半角カナ 変換 (1K – 10K); 旧字体 変換 (1K – 10K); 機種依存文字 チェッカー (1K – 10K); 全角 半角 変換 エクセル (100 – 1K); 全角 半角 変換 キーボード (100 – 1K); 全角 半角 変換 ショートカット (100 – 1K) |
| Keyword Planner demand & source | Cluster: 51 keywords with volume (1 at ≥10K–100K, 4 at 1K–10K, 15 at 100–1K); sum of bucket lower bounds = 15,810/month (indicative floor; may double-count close variants); 7 cluster keywords are in the CSV but not visible in any screenshot. Source: JP1(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 10/25) | Fragmented: extension listings, small tools, 2000s-era checkers; no brand. |
| SERP evidence | S53 (standard, "全角 半角 変換 ツール オンライン"): [1](https://www.luft.co.jp/cgi/category-text-editing.php), [2](https://uravation.com/tools/zenkaku-hankaku/), [3](https://zenn.dev/kojimaru/articles/785480cf51d8e4), [4](https://chromeboard.com/extension/全角半角変換ツール-kfmmgidbicnfkokngkelgdkceddbdcoh)<br>S54 (standard, "機種依存文字 チェッカー オンライン 環境依存文字 チェック"): [1](https://atmarkit.itmedia.co.jp/ait/articles/2112/13/news018.html), [2](https://allabout.co.jp/gm/gc/23869/2/), [3](https://www.pref.osaka.lg.jp/documents/101375/kinshimoji.pdf) |
| Competitors & weaknesses | uravation.com, LUFT tools, Chrome extensions, さぶみっと! 機種依存文字チェッカー, Akita University checker, dev articles. Weaknesses: fragmented single-purpose tools, several dated, few handle CSV in-browser. |
| Why this beats other candidates | A broad validated cluster (1 head at 10K–100K plus 4 at 1K–10K) of deterministic, privacy-sensitive utilities with no brand incumbent. Cheap to build. |
| URL / page structure | /ja/text-tools/ hub → /ja/zenkaku-hankaku/, /ja/hankaku-kana/, /ja/kyujitai-henkan/, /ja/kishu-izon-moji-checker/ |
| Minimum viable functionality | Granular conversion toggles (alphanumeric/symbols/space/katakana, dakuten composition); Shift_JIS/CP932/JIS X 0208/0213 checks with highlights and suggested replacements; 旧字体/異体字 conversion with a reversible table; batch paste and in-browser CSV processing (no upload); Excel ASC/JIS function equivalents. |
| Localisation | Native Japanese UI; encoding nuances (CP932 vs Shift_JIS); 戸籍統一文字 references for 旧字体. |
| Monetisation | Low ad value; possible paid batch/API for business data cleaning. |
| Score explanation | A 10: Fragmented: extension listings, small tools, 2000s-era checkers; no brand.<br>B 19: 1 head 10K–100K + 4 at 1K–10K + ~15 at 100–1K; verified (13 + 6).<br>C 19: Deterministic, client-side.<br>D 10: Tool intent.<br>E 8: 4 tools under one hub; Excel/CSV/e-Tax data-prep variants.<br>F 2: Low ad value; possible B2B batch/API upsell.<br>G 5: Easy; data tables open. |
| Validate before development | Geo SERP; licence of the 異体字 data source (e.g. 文字情報基盤 MJ data); RPM. |

### 6. UDIS ↔ pesos converter with official Banxico values by date (+ UMA, history tables)  
`MX-03` · **Market:** MX · **Language:** Spanish (es-MX) · **Score 73/100** · **Confidence: Medium**

| Field | Detail |
|---|---|
| Primary keyword | **udis a pesos**: 10K – 100K avg. monthly searches; 3-mo +900%; YoY 0%; Ads competition Low; top-of-page bid ₹0.43–₹0.78 |
| Related keywords / intent cluster | udis a pesos (10K – 100K); calculadora udis (100 – 1K); calculadora udis a pesos (100 – 1K); udis a pesos calculadora (100 – 1K); udis a pesos hoy (100 – 1K); udis a pesos mexicanos (100 – 1K); conversor de udis (10 – 100); conversor de udis a pesos (10 – 100) |
| Keyword Planner demand & source | Cluster: 14 keywords with volume (1 at ≥10K–100K, 0 at 1K–10K, 5 at 100–1K); sum of bucket lower bounds = 10,580/month (indicative floor; may double-count close variants); 7 cluster keywords are in the CSV but not visible in any screenshot. Source: MX3-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 9/25) | Live converters incl. two exact-match domains (valorudi.com, calculadora-udi.com) + Banxico SIE; tools show different values for the same day. |
| SERP evidence | S75 (standard, "udis a pesos calculadora hoy"): [1](https://www.arqfinance.com/es-MX/blog/your-money/que-son-udis), [2](https://calcforlife.com/es/calculadora-de-udis/), [3](https://www.tusbuenasnoticias.com/noticias/economia/2026/01/07/55382-calculadora-de-pesos-a-udis-convierte-pesos-y-protege-tu-dinero)<br>S76 (extended, "convertir udis a pesos valor udi hoy banxico calculadora"): [1](https://www.elcontribuyente.mx/indicadores/udi/), [2](https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?sector=8&accion=consultarCuadro&idCuadro=CP150&locale=es), [3](https://prestamoya.mx/herramientas/calculadora-udi), [4](https://senhub.mx/herramientas/valor-udi), [5](https://valorudi.com/), [6](https://calculadora-udi.com/), [7](https://calculadora-udi.com/udi/2026) |
| Competitors & weaknesses | valorudi.com, calculadora-udi.com, elcontribuyente.mx, prestamoya.mx, senhub.mx, Banxico SIE. Weaknesses: stale caching (different values for the same day), thin pages. |
| Why this beats other candidates | Pure data tool with a 10K–100K head, zero legal liability and a free official API. Low effort, evergreen. |
| URL / page structure | /es-mx/udis-a-pesos/ → /es-mx/udis-a-pesos/historico/{year}/, /es-mx/pesos-a-udis/, /es-mx/uma-2026/ |
| Minimum viable functionality | Converter with date picker (historical values); today's value plus Banxico publication schedule; monthly/yearly tables and chart; values auto-updated from the Banxico SIE API with source and timestamp; UDI-mortgage helper. |
| Localisation | es-MX; cite Banxico/DOF. |
| Monetisation | Mortgage and udibono/Cetes affiliates; finance ads (bids only ₹0.43–₹0.78). |
| Score explanation | A 9: Live converters incl. two exact-match domains (valorudi.com, calculadora-udi.com) + Banxico SIE; tools show different values for the same day.<br>B 17: 1 head at 10K–100K + 5 at 100–1K; UMA terms in CSV not visible in screenshots (11 + 6).<br>C 20: Pure data conversion.<br>D 10: Tool intent.<br>E 7: UDI history/year pages, UMA, pesos→UDIS.<br>F 5: Bids very low (₹0.78); mortgage/udibono affiliates.<br>G 5: Free Banxico SIE API. |
| Validate before development | Banxico SIE API terms; volumes for the "uma 2026" family (in the CSV, not visible in screenshots); geo SERP. |

### 7. Word finder from letters (słowa z liter) with Scrabble/Literaki scoring and anagrams  
`PL-05` · **Market:** PL · **Language:** Polish · **Score 72/100** · **Confidence: Medium-Low**

| Field | Detail |
|---|---|
| Primary keyword | **słowa z liter**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid nan |
| Related keywords / intent cluster | słowa z liter (10K – 100K); układanie słów z liter (1K – 10K); układanie słów z liter gra (1K – 10K); słowa z literą ź (100 – 1K); układanie słów z liter gra online (100 – 1K); układanie słów z liter gra po polsku (100 – 1K); słowa z liter gra (10 – 100); słowa z literą h (10 – 100) |
| Keyword Planner demand & source | Cluster: 17 keywords with volume (1 at ≥10K–100K, 2 at 1K–10K, 3 at 100–1K); sum of bucket lower bounds = 12,410/month (indicative floor; may double-count close variants); 1 cluster keywords are in the CSV but not visible in any screenshot. Source: PL-3(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 10/25) | Programmatic word-finder (poocoo.pl) + game sites; not re-checked in extended mode. |
| SERP evidence | S88 (standard, "słowa z liter układanie wyrazów z liter"): [1](https://poocoo.pl/scrabble-literaki-slowa-z-liter/szyfruj), [2](https://geekweek.interia.pl/styl-zycia/news-najlepsze-slowa-w-scrabble-duzo-punktow-i-mistrz-dla-ciebie,nId,6715101) |
| Competitors & weaknesses | poocoo.pl (programmatic per-word pages) and game sites. Weakness: unknown, because this was not re-checked with extended search. |
| Why this beats other candidates | A 10K–100K head with a deterministic tool and programmatic long tail. Low value per visit. |
| URL / page structure | /pl/slowa-z-liter/ → /pl/slowa-z-liter/{litery}/ (only for high-frequency letter sets), /pl/anagramy/ |
| Minimum viable functionality | Letters input with blanks/wildcards; filters (length, starts with, ends with, contains); Scrabble and Literaki scoring; validity flags against a licensed Polish word list; fast mobile UI. |
| Localisation | Polish diacritics; Literaki vs Scrabble letter values. |
| Monetisation | Ads (games/entertainment). |
| Score explanation | A 10: Programmatic word-finder (poocoo.pl) + game sites; not re-checked in extended mode.<br>B 18: 1 head at 10K–100K + 2 at 1K–10K; verified (12 + 6).<br>C 18: Deterministic dictionary search.<br>D 10: Tool intent.<br>E 9: Programmatic long tail.<br>F 3: Ads only.<br>G 4: Needs licensed Polish word list. |
| Validate before development | Extended/geo SERP (not done); licence of the Polish word list (e.g. SJP.pl game dictionary terms). |

### 8. Indonesian date tools: kalkulator umur, selisih hari/tanggal, kalkulator jadian, hari kerja (with libur nasional & cuti bersama)  
`ID-09` · **Market:** ID · **Language:** Indonesian · **Score 72/100** · **Confidence: Medium-Low**

| Field | Detail |
|---|---|
| Primary keyword | **kalkulator umur**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid ₹14.51–₹123.82 |
| Related keywords / intent cluster | kalkulator hari (10K – 100K); kalkulator jadian (10K – 100K); kalkulator tanggal (10K – 100K); kalkulator umur (10K – 100K); kalkulator bulan (1K – 10K); kalkulator umur online (1K – 10K); hitung hari kerja (100 – 1K); kalkulator hari kerja (100 – 1K) |
| Keyword Planner demand & source | Cluster: 16 keywords with volume (4 at ≥10K–100K, 2 at 1K–10K, 3 at 100–1K); sum of bucket lower bounds = 42,370/month (indicative floor; may double-count close variants); 1 cluster keywords are in the CSV but not visible in any screenshot. Source: ID2-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 10/25) | Many tools incl. exact-match domain for jadian; generic age tools + spam pages for umur. |
| SERP evidence | S46 (standard, "kalkulator jadian hitung hari jadian online"): [1](https://www.popbela.com/relationship/dating/kalkulator-hitung-jadian-00-ck827-1wb2hw), [2](https://miniwebtool.com/id/kalkulator-hari-jadi/), [3](https://kalenderku.id/kalkulator)<br>S47 (extended, "kalkulator jadian online hitung hari jadian pacaran"): [1](https://kalkulatorjadian.net/), [2](https://teknogram.id/tools/kalkulator-jadian/), [3](https://rabiyuk.com/tools/kalkulator-hari-jadian/), [4](https://www.ajakteman.com/p/jadian.html), [5](https://bacartikel.id/kalkulator-tanggal-jadian/), [6](https://www.idntimes.com/life/relationship/kalkulator-jadian-online-00-dfnzv-cxjxnm)<br>S48 (standard, "kalkulator umur online hitung umur dari tanggal lahir"): [1](https://kalenderku.id/kalkulator-umur), [2](https://everycalculators.com/kalkulator-umur-online-gratis.html), [3](https://miniwebtool.com/id/kalkulator-usia/), [4](https://freetoolonline.com/guides/id/age-calculator-step-by-step.html) |
| Competitors & weaknesses | kalkulatorjadian.net, teknogram.id, rabiyuk.com, ajakteman.com, kalenderku.id, everycalculators.com, miniwebtool. Weakness: generic translated tools and spam pages rank for "kalkulator umur". |
| Why this beats other candidates | 4 heads at 10K–100K with weak, generic competition. Shares its date engine with ID-01. |
| URL / page structure | /id/kalkulator-umur/, /id/kalkulator-hari/ (selisih tanggal), /id/kalkulator-jadian/, /id/hari-kerja/2026/ |
| Minimum viable functionality | Age at a reference date (school/CPNS registration cut-offs), date difference, add/subtract days, working days excluding national holidays and cuti bersama (SKB 3 Menteri), anniversary countdown with share card. |
| Localisation | Bahasa Indonesia; official holiday lists per year. |
| Monetisation | Ads only (low RPM). |
| Score explanation | A 10: Many tools incl. exact-match domain for jadian; generic age tools + spam pages for umur.<br>B 19: 4 heads at 10K–100K + 2 at 1K–10K; verified, but "kalkulator tanggal" intent ambiguous (13 + 6).<br>C 19: Deterministic.<br>D 10: Tool intent.<br>E 7: Shares date engine with ID-01.<br>F 2: Ads only, low RPM.<br>G 5: Easy. |
| Validate before development | Intent of "kalkulator tanggal" (may mean pregnancy due date); geo SERP; RPM. |

### 9. Amount-in-words engine: kwota słownie, número/valor por extenso, cantidad con letra, terbilang, Zahl in Worten (cheque/invoice formats)  
`NUM` · **Market:** PL,BR,MX,ID,DE,ES,TR · **Language:** Polish, Portuguese, Spanish, Indonesian, German, Turkish · **Score 72/100** · **Confidence: Medium-Low**

| Field | Detail |
|---|---|
| Primary keyword | **kwota słownie**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid nan |
| Related keywords / intent cluster | kwota słownie (10K – 100K); número por extenso (10K – 100K); cantidad con letra (1K – 10K); terbilang rupiah (1K – 10K); zahl in worten (1K – 10K); angka terbilang (100 – 1K); angka terbilang online (100 – 1K); cantidad con letra y numero (100 – 1K) |
| Keyword Planner demand & source | Cluster: 85 keywords with volume (2 at ≥10K–100K, 3 at 1K–10K, 22 at 100–1K); sum of bucket lower bounds = 25,770/month (indicative floor; may double-count close variants); 34 cluster keywords are in the CSV but not visible in any screenshot. Source: PL-2 (result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 8/25) | Saturated in PL (>=9 generators) and BR (>=8 incl. 4devs); differentiation limited to formats/grammar correctness. |
| SERP evidence | S11 (standard, "número por extenso conversor online"): [1](https://valorfinal.com.br/calculadora-numero-por-extenso), [2](https://calculacentro.com/calculadora/numeros-por-extenso), [3](https://miniwebtool.com/br/conversor-de-número-para-palavra/)<br>S12 (extended, "escrever número por extenso online valor em reais conversor"): [1](https://valorfinal.com.br/calculadora-numero-por-extenso), [2](https://ferramentagratis.com.br/conversores/numero-por-extenso/), [3](https://numerosaletras.org/pt/), [4](https://www.utilaria.com.br/numero-por-extenso/), [5](https://calculadora24.com/numero-por-extenso-online/), [6](https://geraronline.com/valor-por-extenso/), [7](https://www.4devs.com.br/numero_por_extenso), [8](https://ferramentas.qmix.com.br/numero-por-extenso)<br>S49 (standard, "terbilang rupiah online konversi angka ke huruf"): [1](https://everycalculators.com/kalkulator-terbilang-rupiah.html), [2](https://www.idntimes.com/tech/trend/rumus-terbilang-excel-1-00-2k3g7-431gxm), [3](https://fanruan.com/id/blog/panduan-lengkap-download-terbilang-excel)<br>S84 (standard, "kwota słownie online zamiana liczby na słowa"): [1](https://rankomat.pl/finanse/?p=7959), [2](https://fakturownia.pl/firma-w-praktyce/kwota-slownie-jak-prawidlowo-ja-zapisywac)<br>S85 (extended, "kwota słownie generator online złotych groszy"): [1](https://www.czerwona-skarbonka.pl/kwota-slownie-generator/), [2](https://bizneskalkulator.pl/kwota-slownie/), [3](https://wyliczanie.pl/kwota-slownie), [4](https://e-kursy-walut.pl/warto-wiedziec/generator-kwoty-slownie/), [5](https://minikalkulator.pl/kwota-slownie), [6](https://bankmoney.pl/generator-kwoty-slownie/) |
| Competitors & weaknesses | PL: czerwona-skarbonka, bizneskalkulator, wyliczanie, minikalkulator, bankmoney and others. BR: 4devs, valorfinal, utilaria, numerosaletras, calculadora24, qmix. ID: everycalculators. Weakness: commoditised, and some grammar choices are disputed. |
| Why this beats other candidates | Two validated 10K–100K heads (PL, BR) and three 1K–10K heads (MX, ID, DE) from a single small engine. Ranks here on demand and effort, not on SERP weakness. |
| URL / page structure | /pl/kwota-slownie/, /pt-br/numero-por-extenso/, /es-mx/cantidad-con-letra/, /id/terbilang/, /de/zahl-in-worten/, /es-es/numeros-a-letras/, /tr/rakami-yaziya-cevirme/ |
| Minimum viable functionality | Number and currency modes; locale cheque/invoice formats (PL "45/100", BR cheque wording, MX "pesos 50/100 M.N.", ID "rupiah"); case options; copy; downloadable Excel/Sheets formula; grammar test suite with cited rules. |
| Localisation | Per-language grammar (Polish numeral declension, Portuguese "mil" rules, Indonesian "se-" prefixes). |
| Monetisation | Ads; invoicing-software affiliates. |
| Score explanation | A 8: Saturated in PL (>=9 generators) and BR (>=8 incl. 4devs); differentiation limited to formats/grammar correctness.<br>B 18: 2 heads at 10K–100K (PL, BR) + 3 at 1K–10K (MX, ID, DE); verified (12 + 6).<br>C 19: Deterministic.<br>D 10: Tool intent.<br>E 8: 7 locales from one engine.<br>F 5: Ads + invoicing affiliates.<br>G 4: Grammar per locale. |
| Validate before development | Geo SERPs per market; MX "M.N." conventions; whether Google answers the query directly. |

### 10. HOAI 2021 fee calculator (Honorarzonen, Leistungsphasen, Umbauzuschlag, Nebenkosten) per Leistungsbild  
`DE-02` · **Market:** DE · **Language:** German · **Score 71/100** · **Confidence: Medium-Low**

| Field | Detail |
|---|---|
| Primary keyword | **hoai rechner**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid ₹1.16–₹147.98 |
| Related keywords / intent cluster | hoai rechner (10K – 100K); hoai rechner online (1K – 10K, Medium); hoai rechner kostenlos (100 – 1K, Medium); hoai rechner kostenlos online (100 – 1K, Medium); hoai rechner online kostenlos (100 – 1K, Medium); hoai rechner excel kostenlos (10 – 100); hoai rechner kostenlos bauer (10 – 100, Medium); hoai rechner kostenlos download (10 – 100, High) |
| Keyword Planner demand & source | Cluster: 13 keywords with volume (1 at ≥10K–100K, 1 at 1K–10K, 3 at 100–1K); sum of bucket lower bounds = 11,380/month (indicative floor; may double-count close variants); 7 cluster keywords are in the CSV but not visible in any screenshot. Source: DE1-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 11/25) | Old-fashioned calculators + hoai.de authority + a paid publisher tool; the German calculator networks are not dominant here. |
| SERP evidence | S21 (standard, "HOAI Rechner online kostenlos 2021"): [1](https://www.steuerschroeder.de/Steuerrechner/HOAI-Rechner.html), [2](https://www.sanier.de/architekt/hoai), [3](https://greenox-group.de/hoai-rechner/), [4](https://www.wolterskluwer.com/de-de/solutions/wolters-kluwer-online/hoai2021), [5](https://www.baunetzwissen.de/drucken/hoai-rechner-8515301) |
| Competitors & weaknesses | hoai.de/BauNetz tool, steuerschroeder.de, sanier.de, greenox-group.de, Wolters Kluwer (paid). Weaknesses: dated UX, partial Leistungsbilder. |
| Why this beats other candidates | The one German cluster where the big calculator networks are not dominant, and the audience is high-value B2B. |
| URL / page structure | /de/hoai-rechner/ → /de/hoai-rechner/{leistungsbild}/ (Gebäude §35, Freianlagen §40, Ingenieurbauwerke §44, Tragwerksplanung §52, TGA §56…), /de/hoai-honorartafel/ |
| Minimum viable functionality | Anrechenbare Kosten, Honorarzone I–V, Honorarsatz (Basis/oberer), editable LP1–9 percentages, Umbauzuschlag, Nebenkosten, MwSt; linear interpolation per Honorartafel; PDF Honorarberechnung. |
| Localisation | German legal terms and § references; HOAI 2021 tables. |
| Monetisation | B2B: architect software, professional liability insurance, AVA tools. Bids up to ₹187.88. |
| Score explanation | A 11: Old-fashioned calculators + hoai.de authority + a paid publisher tool; the German calculator networks are not dominant here.<br>B 16: 1 head 10K–100K + 1 at 1K–10K (Medium ad competition) + 3 at 100–1K; verified (10 + 6).<br>C 17: Deterministic table interpolation; many Leistungsbilder.<br>D 10: Tool intent (professionals).<br>E 5: Narrow but deep (Leistungsbilder).<br>F 9: B2B: bids up to ₹187.88 on "hoai rechner online"; architect software/insurance.<br>G 3: Tables static until next HOAI amendment. |
| Validate before development | Geo SERP; status of any HOAI amendment that would change tables; demand beyond the head (only 5 keywords with volume). |

### 11. Surname & first-name declension (odmiana nazwisk/imion) + wedding-invitation wording generator  
`PL-02` · **Market:** PL · **Language:** Polish · **Score 71/100** · **Confidence: Medium**

| Field | Detail |
|---|---|
| Primary keyword | **odmiana nazwisk**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid nan |
| Related keywords / intent cluster | odmiana nazwisk (10K – 100K); odmiana nazwisk online (1K – 10K); odmiana nazwisk przez przypadki (1K – 10K); odmiana imion (100 – 1K); odmiana imion i nazwisk (100 – 1K); odmiana imion i nazwisk online (100 – 1K); odmiana imion przez przypadki (100 – 1K); odmiana nazwisk do zaproszeń (100 – 1K) |
| Keyword Planner demand & source | Cluster: 27 keywords with volume (1 at ≥10K–100K, 2 at 1K–10K, 10 at 100–1K); sum of bucket lower bounds = 13,140/month (indicative floor; may double-count close variants); 1 cluster keywords are in the CSV but not visible in any screenshot. Source: PL-3(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 11/25) | >=6 tools incl. invitation generators; several warn their output fails on foreign/unusual surnames -> quality gap. |
| SERP evidence | S82 (standard, "odmiana nazwisk przez przypadki online"): [1](https://akademia.tvp.pl/84080880/nazwiska-odmieniac-czy-nie-odmieniac-oto-jest-pytanie), [2](https://nck.pl/projekty-kulturalne/projekty/ojczysty-dodaj-do-ulubionych/ciekawostki-jezykowe/kiedy-apostrof-w-odmianie-nazwisk-.ajax)<br>S83 (extended, "odmiana nazwisk online generator odmiana przez przypadki narzędzie"): [1](https://meetly.com.pl/narzedzia/odmiana-nazwisk), [2](https://szukajnazwiska.pl/odmiana-nazwisk), [3](https://eodmiany.pl/nazwiska/odmiana-przez-przypadki-nazwisk), [4](https://odmiana.net/odmiana-przez-przypadki-rzeczownika-nazwisko), [5](https://www.odmiana-nazwisk.waw.pl/), [6](https://kalmarry.pl/narzedzia/odmiana-nazwisk), [7](https://portal.janachowska.pl/jak-odmieniac-nazwiska-na-zaproszeniach/) |
| Competitors & weaknesses | meetly.com.pl, szukajnazwiska.pl, eodmiany.pl, odmiana.net, odmiana-nazwisk.waw.pl, kalmarry.pl. Weakness: tools admit failures on foreign and unusual surnames. |
| Why this beats other candidates | A 10K–100K head where linguistic quality is a real moat. A programmatic long tail of surnames is possible from open data. |
| URL / page structure | /pl/odmiana-nazwisk/ → /pl/odmiana-nazwisk/{nazwisko}/ (top surnames from open PESEL frequency data), /pl/odmiana-imion/{imie}/, /pl/odmiana-nazwisk/zaproszenia/ |
| Minimum viable functionality | Full 7-case tables in singular and plural; masculine, feminine and couple forms ("Państwo Nowakowie"); invitation wording generator; foreign-surname rules; explanation of the rule used for each surname, citing RJP/PWN guidance. |
| Localisation | Polish morphology; RJP/PWN guidance. |
| Monetisation | Wedding stationery affiliates; ads. |
| Score explanation | A 11: >=6 tools incl. invitation generators; several warn their output fails on foreign/unusual surnames -> quality gap.<br>B 18: 1 head 10K–100K + 2 at 1K–10K + 10 at 100–1K; verified (12 + 6).<br>C 16: Morphology engine; edge cases need rules + dictionary.<br>D 10: Tool intent.<br>E 9: Programmatic surname pages from open surname-frequency data.<br>F 4: Wedding stationery affiliates + ads.<br>G 3: Linguistic engineering + dictionary licence. |
| Validate before development | Licences for the morphological dictionary (SGJP/Morfeusz) and the surname list (dane.gov.pl); geo SERP. |

### 12. Japanese address → English converter (postcode lookup, 番地/建物 handling, Amazon/PayPal/EMS formats) with JP/EN page pair  
`JP-01` · **Market:** JP,JP_EN · **Language:** Japanese + English · **Score 71/100** · **Confidence: Medium**

| Field | Detail |
|---|---|
| Primary keyword | **住所 英語 変換**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid ₹5.55–₹116.57 |
| Related keywords / intent cluster | 住所 英語 変換 (10K – 100K); 住所 英語 変換 サイト (1K – 10K); 住所 英語表記 変換 (1K – 10K); 英語 住所 変換 (1K – 10K); エクセル 住所 分割 市区町村以下 (100 – 1K); エクセル 住所 分割 番地 以降 (100 – 1K); 住所 正規化 (100 – 1K); 住所 英語 変換 一括 (100 – 1K) |
| Keyword Planner demand & source | Cluster: 47 keywords with volume (1 at ≥10K–100K, 3 at 1K–10K, 6 at 100–1K); sum of bucket lower bounds = 13,970/month (indicative floor; may double-count close variants); 10 cluster keywords are in the CSV but not visible in any screenshot. Source: JP1(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 9/25) | >=9 converters; several already use Japan Post romaji data and multi-format output. English SERP weaker. |
| SERP evidence | S50 (standard, "住所 英語 変換 ツール"): [1](https://toolsbase.dev/ja/text/address-romanizer), [2](https://gori.me/it/26088), [3](https://developers.google.com/maps/documentation/address-validation/convert-addresses-english?hl=ja)<br>S51 (extended, "住所 英語表記 変換 サイト 郵便番号 自動"): [1](https://judress.tsukuenoue.com/), [2](https://www.haradaeigo.com/address-english-converter/), [3](https://jptools.jp/address), [4](https://address.lomdesign.jp/), [5](https://www.mulchar.co.jp/blog/japanese-to-english-address-converter), [6](https://benritools.org/english-address), [7](https://toolnavi.net/src/tools/utility/address-en/), [8](https://finance-media.jp/tools/address-converter/)<br>S52 (standard, "japanese address in english converter"): [1](https://gigazine.net/gsc_news/en/20130128-judress), [2](https://developers.google.com/maps/documentation/address-validation/convert-addresses-english), [3](https://cotoacademy.com/?p=100516) |
| Competitors & weaknesses | judress.tsukuenoue.com, haradaeigo.com, jptools.jp, address.lomdesign.jp, mulchar.co.jp, benritools.org, toolnavi.net, finance-media.jp. Weakness: crowded, and quality varies on building names. |
| Why this beats other candidates | A 10K–100K head plus a bilingual extension. Crowded, so it only works if the conversion quality is clearly better. |
| URL / page structure | /ja/jusho-eigo-henkan/ ⇄ /en/japanese-address-in-english/ (hreflang pair) → /ja/jusho-eigo-henkan/{amazon|paypal|ems}/ |
| Minimum viable functionality | Postcode lookup from the Japan Post KEN_ALL and romaji files; 番地/号 parsing; building and room ordering; Hepburn options; 3+ output formats (one line, international mail, overseas web form); bulk CSV; copy buttons. |
| Localisation | JP + EN pages; Japan Post romaji conventions; passport-style Hepburn as an option. |
| Monetisation | Cross-border shopping, forwarding and remittance affiliates (bid up to ₹116.57 on the head). B2B upsell: "住所 正規化" (100–1K, bids ₹347.67–₹1,363.37) and "住所 正規化 api" (10–100, Medium, ₹424.80–₹2,485.18) show strong advertiser value for address normalisation APIs. |
| Score explanation | A 9: >=9 converters; several already use Japan Post romaji data and multi-format output. English SERP weaker.<br>B 18: 1 head 10K–100K + 3 at 1K–10K + 6 at 100–1K; EN terms only 10–100 because KP location = Japan (12 + 6).<br>C 17: Data + parsing; building names need user input.<br>D 10: Tool intent.<br>E 8: JP + EN + bulk/正規化 variants.<br>F 5: Bid up to ₹116.57; forwarding/cross-border affiliates.<br>G 4: Japan Post data free; parsing work. |
| Validate before development | Global English demand (KP location for JP_EN was Japan only); geo SERP; quality benchmark against haradaeigo/JuDress. |

### 13. IRRF/IR calculator under Lei 15.270/2025 (exemption to R$5,000, reducer to R$7,350), 2026→2027 tables  
`BR-08` · **Market:** BR · **Language:** Portuguese (pt-BR) · **Score 71/100** · **Confidence: Low-Medium**

| Field | Detail |
|---|---|
| Primary keyword | **calculadora irrf 2026**: 10K – 100K avg. monthly searches; 3-mo -90%; YoY +900%; Ads competition Low; top-of-page bid ₹0.37–₹0.82 |
| Related keywords / intent cluster | calculadora irrf 2026 (10K – 100K); calculadora imposto de renda 2026 (1K – 10K); calculadora irpf (1K – 10K); calculadora irpf 2026 (1K – 10K); calculadora irpf mensal (1K – 10K); isenção imposto de renda 5 mil (1K – 10K); simulador imposto de renda (1K – 10K); simulador imposto de renda 2026 (1K – 10K) |
| Keyword Planner demand & source | Cluster: 31 keywords with volume (1 at ≥10K–100K, 9 at 1K–10K, 7 at 100–1K); sum of bucket lower bounds = 19,840/month (indicative floor; may double-count close variants); 6 cluster keywords are in the CSV but not visible in any screenshot. Source: BR1-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 9/25) | Many calculators and finance portals; they disagree on the simplified deduction. |
| SERP evidence | S14 (standard, "calculadora IRRF 2026 isenção 5 mil simulador"): [1](https://meutudo.com.br/blog/calculadoras/calculo-irrf/), [2](https://caltrab.com/calculadoras/calculadora-do-imposto-de-renda-2026/), [3](https://calculadorabrasil.com.br/?p=66), [4](https://www.marraclt.com.br/salario/calculadora-novo-irrf-2026-quanto-desconta-folha), [5](https://www.transp.net/calculadora-irrf-2026), [6](https://numerando.com.br/calculadoras/trabalhista/calculadora-isencao-ir) |
| Competitors & weaknesses | meutudo, caltrab, calculadorabrasil, marraclt, transp.net, numerando plus finance portals. Weakness: disagreements on the simplified deduction. |
| Why this beats other candidates | A new law created a recalculation need. The head term is year-tagged and decaying (3-month change -90%), so time it for January 2027 table changes. |
| URL / page structure | /pt-br/calculadora-irrf/ (evergreen URL; year in title) → /pt-br/calculadora-irrf/2027/ when tables change |
| Minimum viable functionality | Gross salary, dependants, 2026 INSS table, alimony, full deductions vs simplified deduction, Lei 15.270 reducer; monthly and annual results; 2025 vs 2026 comparison; sources. |
| Localisation | pt-BR; Receita Federal references. |
| Monetisation | Ads/fintech; bids very low. |
| Score explanation | A 9: Many calculators and finance portals; they disagree on the simplified deduction.<br>B 18: 1 head 10K–100K + 9 at 1K–10K; head is year-tagged and its 3-month change is -90% (13 + 5).<br>C 19: Deterministic.<br>D 10: Tool intent.<br>E 7: Annual refresh.<br>F 5: Bids ₹0.37–₹0.82.<br>G 3: Annual tables. |
| Validate before development | Geo SERP (big portals likely); whether Receita has an official calculator; 2027 tables. |

### 14. Length-of-service calculator 2026 (staż pracy incl. umowa zlecenie/JDG periods) + annual-leave and ekwiwalent calculators  
`PL-04` · **Market:** PL · **Language:** Polish · **Score 71/100** · **Confidence: Medium-Low**

| Field | Detail |
|---|---|
| Primary keyword | **kalkulator stażu pracy**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid nan |
| Related keywords / intent cluster | kalkulator stażu pracy (10K – 100K); kalkulator ekwiwalentu za urlop (1K – 10K); kalkulator ekwiwalentu za urlop 2026 (1K – 10K); kalkulator lat pracy (1K – 10K); kalkulator stażu pracy gofin (1K – 10K); kalkulator urlopu (1K – 10K); kalkulator urlopu macierzyńskiego (1K – 10K); kalkulator stażu pracy do nagrody jubileuszowej (100 – 1K) |
| Keyword Planner demand & source | Cluster: 21 keywords with volume (1 at ≥10K–100K, 6 at 1K–10K, 5 at 100–1K); sum of bucket lower bounds = 16,590/month (indicative floor; may double-count close variants); 8 cluster keywords are in the CSV but not visible in any screenshot. Source: PL-2 (result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 8/25) | GOFIN (strong legal publisher, two tools) + HR SaaS + several small tools. |
| SERP evidence | S86 (standard, "kalkulator stażu pracy 2026 umowy zlecenia"): [1](https://www.ordio.com/pl/tools/kalkulator-stazu-pracy), [2](https://calcforlife.com/?p=3724), [3](https://hrappka.pl/?p=61155), [4](https://www.podatki.biz/artykuly/staz-pracy-na-nowych-zasadach-pytania-i-odpowiedzi_10_60860.htm)<br>S87 (extended, "kalkulator stażu pracy online gofin urlop jubileusz"): [1](https://kalkulatory.gofin.pl/kalkulatory/kalkulator-stazu-pracy-1), [2](https://kalkulatory.gofin.pl/kalkulatory/kalkulator-stazu-urlopowego), [3](https://www.kalkulator-pracy.pl/), [4](https://pancaro.pl/narzedzia/kalkulator-stazu-pracy/), [5](https://webp.pl/kalkulator-stazu-pracy), [6](https://dobrykalkulator.pl/kalkulator-stazu-pracy-ze-szkola-oblicz-urlop/) |
| Competitors & weaknesses | kalkulatory.gofin.pl (two tools), ordio.com/pl, kalkulator-pracy.pl, pancaro.pl, webp.pl, dobrykalkulator.pl, bankmoney.pl. |
| Why this beats other candidates | A 10K–100K head with fresh 2026 rule changes. GOFIN is strong, so quality on the new rules is the only angle. |
| URL / page structure | /pl/kalkulator-stazu-pracy/, /pl/kalkulator-urlopu/, /pl/kalkulator-ekwiwalentu-za-urlop/ |
| Minimum viable functionality | Multiple periods with overlap handling (art. 302¹ KP); education periods; 2026 categories (umowa zlecenie, JDG) with the documentation note (ZUS US-P); outputs for general, holiday and jubilee service; holiday entitlement (20/26 days); ekwiwalent. |
| Localisation | Polish labour-code terms. |
| Monetisation | HR/payroll SaaS affiliates; ads. |
| Score explanation | A 8: GOFIN (strong legal publisher, two tools) + HR SaaS + several small tools.<br>B 19: 1 head 10K–100K + 6 at 1K–10K; verified (13 + 6).<br>C 18: Deterministic period arithmetic with overlap rules.<br>D 10: Tool intent.<br>E 7: Urlop/ekwiwalent/jubileusz siblings.<br>F 6: HR/payroll SaaS affiliates.<br>G 3: New 2026 rules need legal review. |
| Validate before development | Legal review of the 2026 rules (public employers 01.01.2026, others 01.05.2026); geo SERP. |

### 15. cClassTrib / CST IBS-CBS lookup by NCM/NBS with legal basis and reductions (tax reform)  
`BR-02` · **Market:** BR · **Language:** Portuguese (pt-BR) · **Score 70/100** · **Confidence: Medium-Low**

| Field | Detail |
|---|---|
| Primary keyword | **cclasstrib**: 10K – 100K avg. monthly searches; 3-mo +900%; YoY +900%; Ads competition Low; top-of-page bid ₹20.25–₹68.20 |
| Related keywords / intent cluster | cclasstrib (10K – 100K); cclasstrib tabela (1K – 10K); split payment reforma tributária (1K – 10K); calculadora ibs cbs (100 – 1K); calculadora ibs e cbs receita federal (100 – 1K); cclasstrib ibs e cbs (100 – 1K); cclasstrib o que é (100 – 1K); cclasstrib por ncm (100 – 1K) |
| Keyword Planner demand & source | Cluster: 39 keywords with volume (1 at ≥10K–100K, 2 at 1K–10K, 12 at 100–1K); sum of bucket lower bounds = 13,430/month (indicative floor; may double-count close variants); 17 cluster keywords are in the CSV but not visible in any screenshot. Source: BR2-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 9/25) | Official SEFAZ-RS lookup exists + GitHub mirror + >=7 tools incl. paid SaaS. |
| SERP evidence | S06 (standard, "cclasstrib tabela consulta por NCM"): [1](https://triviumcontabil.com.br/?p=17191), [2](https://portalspedbrasil.com.br/?p=20675), [3](https://taxradar.app/blog/ncm/cclasstrib-como-mapear-ncm-regime-ibs-cbs), [4](https://conteudo.fiscal.io/?p=2940)<br>S07 (extended, "consulta cClassTrib por NCM ferramenta online CST IBS CBS"): [1](https://github.com/silvioalbqrq/cst-cclasstrib), [2](https://dfe-portal.svrs.rs.gov.br/CFF/ClassificacaoTributaria), [3](https://consultareformait.lovable.app/), [4](https://reforma33.com.br/), [5](https://www.usetribumap.com.br/), [6](https://cclasstrib-app-two.vercel.app/), [7](https://www.contabildescomplica.com.br/consultar-ncm), [8](https://mvsistema.com/BuscaNCM/) |
| Competitors & weaknesses | Official SEFAZ-RS Portal da Conformidade Fácil, GitHub mirror, TribuMap (paid), Consulta Reforma, Reforma33, ClassTrib, Contábil Descomplica, mvsistema. |
| Why this beats other candidates | The fastest-growing B2B cluster (+900% YoY) with years of reform runway. It ranks only #15 because an official lookup exists and maintenance is heavy. |
| URL / page structure | /pt-br/cclasstrib/ (search) → /pt-br/cclasstrib/{codigo}/ → /pt-br/ncm/{ncm}/ (programmatic) → /pt-br/cst-ibs-cbs/ |
| Minimum viable functionality | Search by NCM, NBS, code or description; per-code page with CST, description, LC 214 article and reduction; NCM page listing allowed cClassTribs; CSV batch; dated change log from technical notes. |
| Localisation | pt-BR; LC 214/2025 references; IBS/CBS terminology. |
| Monetisation | ERP/fiscal software affiliates; accounting lead-gen; paid API. |
| Score explanation | A 9: Official SEFAZ-RS lookup exists + GitHub mirror + >=7 tools incl. paid SaaS.<br>B 16: 1 head 10K–100K (+900% YoY) + 2 at 1K–10K + 12 at 100–1K (11 + 5: emerging term).<br>C 16: Lookup; heavy data.<br>D 9: Partly informational ("o que é").<br>E 9: ~10k NCM pages possible.<br>F 9: B2B; bids ₹15–₹68 on heads, ERP/fiscal affiliates, paid API potential.<br>G 2: Frequent technical-note updates; liability. |
| Validate before development | Data-reuse rights and update cadence of official tables (NT 2025.002+); geo SERP. |

### 16. Retirement-allowance tax & take-home calculator (退職所得控除, 役員/短期, 住民税, iDeCo一時金調整)  
`JP-07` · **Market:** JP · **Language:** Japanese · **Score 70/100** · **Confidence: Medium-Low**

| Field | Detail |
|---|---|
| Primary keyword | **退職金 税金 計算**: 1K – 10K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid ₹1.16–₹3.70 |
| Related keywords / intent cluster | 退職所得 計算 (1K – 10K); 退職金 税金 シミュレーション (1K – 10K); 退職金 税金 計算 (1K – 10K); 退職金 税金 計算 シミュレーション (1K – 10K); 退職所得 計算ツール (100 – 1K); 退職所得 計算方法 (100 – 1K); 退職所得控除 計算式 (100 – 1K); 退職金 年金 税金 シミュレーション (100 – 1K) |
| Keyword Planner demand & source | Cluster: 24 keywords with volume (0 at ≥10K–100K, 4 at 1K–10K, 7 at 100–1K); sum of bucket lower bounds = 4,830/month (indicative floor; may double-count close variants); 5 cluster keywords are in the CSV but not visible in any screenshot. Source: JP2(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 9/25) | MoneyForward dominates + several finance blogs. |
| SERP evidence | S56 (standard, "退職金 税金 計算 シミュレーション 退職所得控除"): [1](https://biz.moneyforward.com/payroll/basic/discharge-allowance-income-tax/), [2](https://sum.money/jp/taishokukin-zei/), [3](https://financial-field.com/oldage/entry-267546), [4](https://www.invest-concierge.com/posts/about-retirement-income-deduction) |
| Competitors & weaknesses | biz.moneyforward.com (4 URLs), sum.money, invest-concierge, financial-field, atsoho, m-assets. |
| Why this beats other candidates | A high-value audience and deterministic rules. MoneyForward is a strong brand, so expect a slow climb. |
| URL / page structure | /ja/taishokukin-zeikin/ → /ja/taishoku-shotoku-kojo/, /ja/taishokukin-ideco/ |
| Minimum viable functionality | Years of service (rounded up), disability addition, officer/short-term rules, income tax + reconstruction tax + resident tax, with/without the declaration (20.42%), iDeCo lump-sum adjustment, lump sum vs pension comparison. |
| Localisation | Japanese tax terms; NTA references. |
| Monetisation | Wealth-management and asset-management affiliates (high value). |
| Score explanation | A 9: MoneyForward dominates + several finance blogs.<br>B 15: 4 at 1K–10K + 7 at 100–1K; verified (9 + 6).<br>C 19: Deterministic.<br>D 9: Tool intent with some how-to.<br>E 6: Moderate.<br>F 8: High-value audience (wealth management).<br>G 4: Rules stable; reform watch. |
| Validate before development | Geo SERP (keisan.casio and NTA likely present); pending changes to 退職所得控除. |

### 17. RVG lawyer-fee + court-cost (GKG) calculator after KostBRÄG 2025  
`DE-03` · **Market:** DE · **Language:** German · **Score 70/100** · **Confidence: Low-Medium**

| Field | Detail |
|---|---|
| Primary keyword | **rvg rechner**: 10K – 100K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid ₹1.17–₹2.35 |
| Related keywords / intent cluster | rvg rechner (10K – 100K); rvg rechner 2025 (1K – 10K); rvg rechner 2026 (1K – 10K); rvg rechner 2024 (100 – 1K); rvg rechner soldan (100 – 1K); rvg rechner strafrecht (100 – 1K) |
| Keyword Planner demand & source | Cluster: 6 keywords with volume (1 at ≥10K–100K, 2 at 1K–10K, 3 at 100–1K); sum of bucket lower bounds = 12,300/month (indicative floor; may double-count close variants); 7 cluster keywords are in the CSV but not visible in any screenshot. Source: DE2-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 8/25) | Entrenched dedicated site (rvg-rechner.de) + calculator networks + legal publishers. |
| SERP evidence | S22 (standard, "RVG Rechner 2025 Gebühren"): [1](https://www.rvg-rechner.de/Downloads/RVG-Tabelle-34GKG-28FamGKG_2025.pdf), [2](https://www.smart-rechner.de/anwaltskosten/ratgeber/tabelle_anwaltskosten.php), [3](https://calcforlife.com/de/rvg-rechner/), [4](https://rechner-portal.de/finanzen/recht-gebuehren/rvg-rechner), [5](https://www.haufe.de/recht/rvg-anpassung-was-sich-durch-das-kostbraeg2025-aendert_226_649996.html) |
| Competitors & weaknesses | rvg-rechner.de (entrenched), smart-rechner.de, calcforlife.com, rechner-portal.de, haufe.de. |
| Why this beats other candidates | A 10K–100K head with high-value monetisation, but an entrenched specialist. Low-medium confidence. |
| URL / page structure | /de/rvg-rechner/ → /de/prozesskostenrechner/, /de/rvg-tabelle/ |
| Minimum viable functionality | Gegenstandswert → 1.0 fee; VV numbers (2300, 3100, 3104, 1000) with multipliers; Auslagen 7002; VAT; GKG court fees; litigation-cost risk across instances; PDF. |
| Localisation | German legal terms; KostBRÄG 2025 tables. |
| Monetisation | Legal-expenses insurance affiliates (high value); lawyer marketplaces. |
| Score explanation | A 8: Entrenched dedicated site (rvg-rechner.de) + calculator networks + legal publishers.<br>B 17: 1 head 10K–100K + 2 at 1K–10K + 3 at 100–1K; verified (11 + 6).<br>C 18: Deterministic tables.<br>D 10: Tool intent.<br>E 5: Narrow.<br>F 9: Legal-insurance affiliates; bids up to ₹113.90.<br>G 3: Table updates. |
| Validate before development | Geo SERP (anwalt.de, foris and others); maintenance effort. |

### 18. Late-payment interest calculator (Verzugszinsen) with Basiszinssatz history, partial payments, B2B 40 € flat fee  
`DE-07` · **Market:** DE · **Language:** German · **Score 70/100** · **Confidence: Low-Medium**

| Field | Detail |
|---|---|
| Primary keyword | **verzugszinsen berechnen**: 10K – 100K avg. monthly searches; 3-mo -90%; YoY -90%; Ads competition Low; top-of-page bid ₹58.71–₹262.78 |
| Related keywords / intent cluster | verzugszinsen berechnen (10K – 100K); basiszinssatz 2026 (1K – 10K); verzugszinsen rechner (1K – 10K); basiszinssatz 2026 rechner (100 – 1K); verzugszinsen berechnen formel (100 – 1K); verzugszinsen berechnen online (100 – 1K); basiszinssatz 2026 ezb (10 – 100); basiszinssatz 2026 prognose (10 – 100) |
| Keyword Planner demand & source | Cluster: 18 keywords with volume (1 at ≥10K–100K, 2 at 1K–10K, 3 at 100–1K); sum of bucket lower bounds = 12,420/month (indicative floor; may double-count close variants); 6 cluster keywords are in the CSV but not visible in any screenshot. Source: DE2-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 8/25) | Calculator networks + invoicing SaaS; one network shows a stale base rate (freshness gap). |
| SERP evidence | S29 (standard, "Verzugszinsen Rechner Basiszinssatz 2026"): [1](https://jurawelt.com/verzugszinsen-berechnen/), [2](https://www.steuerschroeder.de/Steuerrechner/Basiszins.html), [3](https://www.selbststaendig.de/verzugszinsen-rechner), [4](https://kostenlose-erechnung.de/ratgeber/verzugszinsen-b2b-40-euro-pauschale/), [5](https://www.deutschland-rechner.de/verzugszinsen-rechner), [6](https://rechner-hub.de/verzugszinsen-rechner/), [7](https://rechner-portal.de/finanzen/recht-gebuehren/verzugszinsen-berechnen) |
| Competitors & weaknesses | deutschland-rechner.de (still shows the stale 1.27% rate), rechner-hub.de, rechner-portal.de, steuerschroeder.de, selbststaendig.de, kostenlose-erechnung.de, jurawelt.com. |
| Why this beats other candidates | Commercially valuable B2B intent, and a demonstrated freshness gap at a large competitor. |
| URL / page structure | /de/verzugszinsen-rechner/ → /de/basiszinssatz/ (history), /de/verzugszinsen-rechner/b2b/ |
| Minimum viable functionality | Multiple claims and partial payments; periods spanning base-rate changes (§§ 247, 288 BGB); B2C +5 pp, B2B +9 pp; €40 flat fee; exact day counts; PDF claim statement for a Mahnbescheid. |
| Localisation | German; Bundesbank base-rate source. |
| Monetisation | Debt-collection and legal SaaS affiliates; bids up to ₹1,468.42 (highest among the finalists). |
| Score explanation | A 8: Calculator networks + invoicing SaaS; one network shows a stale base rate (freshness gap).<br>B 16: 1 head 10K–100K + 2 at 1K–10K; head shows -90% YoY (11 + 5).<br>C 19: Deterministic.<br>D 10: Tool intent.<br>E 5: Narrow.<br>F 8: Bids up to ₹1,468.42 on "verzugszinsen rechner" (visually verified).<br>G 4: Rate updates twice a year. |
| Validate before development | The -90% YoY on the head term (12-month trend needed); geo SERP. |

### 19. Converted-hectare (hektar przeliczeniowy) & agricultural-tax calculator by gmina/okręg, land class  
`PL-08` · **Market:** PL · **Language:** Polish · **Score 69/100** · **Confidence: Medium**

| Field | Detail |
|---|---|
| Primary keyword | **hektar przeliczeniowy**: 1K – 10K avg. monthly searches; 3-mo 0%; YoY -90%; Ads competition Low; top-of-page bid nan |
| Related keywords / intent cluster | hektar przeliczeniowy (1K – 10K); hektar przeliczeniowy 2024 (100 – 1K); hektar przeliczeniowy 2025 (100 – 1K); hektar przeliczeniowy 2026 (100 – 1K); hektar przeliczeniowy tabela (100 – 1K); kalkulator hektar przeliczeniowy (100 – 1K); morga ile to hektarów (100 – 1K); hektar fizyczny a przeliczeniowy kalkulator (10 – 100) |
| Keyword Planner demand & source | Cluster: 18 keywords with volume (0 at ≥10K–100K, 1 at 1K–10K, 6 at 100–1K); sum of bucket lower bounds = 1,710/month (indicative floor; may double-count close variants); 1 cluster keywords are in the CSV but not visible in any screenshot. Source: PL-result google ads keyword planner.png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 18/25) | Only one dedicated web calculator (agrimetra) + a municipal spreadsheet: the weakest SERP found in the study. |
| SERP evidence | S91 (standard, "hektar przeliczeniowy 2026 kalkulator"): [1](https://www.infor.pl/wskazniki/podatki/podatek-rolny/50,Podatek-rolny.html), [2](https://www.podatki.biz/artykuly/przeliczanie-hektarow-dla-potrzeb-podatku-rolnego-interpretacja-ogolna-mf_59_36842.htm)<br>S92 (extended, "kalkulator hektar przeliczeniowy online podatek rolny klasa gruntu okręg podatkowy"): [1](https://agrimetra.com/pl/poradniki/jak-obliczyc-hektary-przeliczeniowe/), [2](https://www.bip.krakow.pl/zalacznik.php?zid=66493&wer=0&new=t&mode=shw), [3](https://arslege.pl/podstawa-opodatkowania-podatkiem-rolnym-okregi-podatkowe-przeliczniki-powierzchni-uzytkow-rolnych/k74/a16834/), [4](https://blog.ongeo.pl/podatek-rolny), [5](https://i-rolnik.pl/podatek-rolny-2025-terminy-stawki-zwolnienia/) |
| Competitors & weaknesses | agrimetra.com (only dedicated calculator), bip.krakow.pl spreadsheet, articles (infor, pitax, i-rolnik, ongeo). |
| Why this beats other candidates | The most realistic ranking target in the study: only one dedicated competitor. Demand is small. |
| URL / page structure | /pl/hektar-przeliczeniowy/ → /pl/podatek-rolny-kalkulator/, /pl/dochod-z-hektara-przeliczeniowego/ |
| Minimum viable functionality | Gmina → okręg podatkowy; land use × class × area table input; output: converted hectares, 2026 agricultural tax (rye 66.42 zł/dt → 166.05 zł per converted ha), income per converted ha for social-benefit tests (GUS); sources; PDF. |
| Localisation | Polish tax terms; Dz.U. references. |
| Monetisation | Agri ads and insurance; low. |
| Score explanation | A 18: Only one dedicated web calculator (agrimetra) + a municipal spreadsheet: the weakest SERP found in the study.<br>B 12: 1 head 1K–10K (-90% YoY) + 6 at 100–1K (7 + 5).<br>C 18: Deterministic table lookup.<br>D 9: Tool intent.<br>E 4: Narrow; gmina pages possible.<br>F 4: Agri ads.<br>G 4: Annual GUS price update. |
| Validate before development | Source for the gmina → okręg mapping; 12-month trend (-90% YoY on head); geo SERP. |

### 20. Marketplace seller fee & profit calculator (Shopee 2026 price-band fees; Mercado Livre next)  
`BR-09` · **Market:** BR · **Language:** Portuguese (pt-BR) · **Score 69/100** · **Confidence: Medium-Low**

| Field | Detail |
|---|---|
| Primary keyword | **calculadora shopee**: 1K – 10K avg. monthly searches; 3-mo 0%; YoY 0%; Ads competition Low; top-of-page bid ₹17.32–₹76.72 |
| Related keywords / intent cluster | calculadora shopee (1K – 10K); calculadora shopee 2026 (1K – 10K); código de tributação nacional entregador shopee (100 – 1K); simulador venda mercado livre (100 – 1K); conversor na shopee (10 – 100, High); código de tributação nacional shopee (10 – 100); código de tributação nacional shopee entregador (10 – 100) |
| Keyword Planner demand & source | Cluster: 7 keywords with volume (0 at ≥10K–100K, 2 at 1K–10K, 2 at 100–1K); sum of bucket lower bounds = 2,230/month (indicative floor; may double-count close variants); 2 cluster keywords are in the CSV but not visible in any screenshot. Source: BR1-(result google ads keyword planner).png; location = market, All languages, Sep 2025 – Aug 2026. |
| Organic competition (A = 10/25) | >=7 small tools; fee tables disagree across tools. |
| SERP evidence | S15 (standard, "calculadora taxas shopee 2026 vendedor"): [1](https://ecommercenapratica.com/blog/taxa-shopee/), [2](https://ecomcalctools.com/pt-br/shopee/calculadora-taxas/), [3](https://gosmarter.com.br/?p=14467), [4](https://www.actana.com.br/blog/mudancas-na-shopee-em-2026)<br>S16 (extended, "calculadora shopee 2026 taxas comissão lucro vendedor ferramenta"): [1](https://precificacertoecommerce.com.br/), [2](https://vendedorlucrativo.com.br/blog/comissao-shopee-2026), [3](https://calculadora.dbcdatastudio.com/shopee), [4](https://www.deveccom.com/shopee/), [5](https://www.appmodu.com/blog/calculadora-comissao-shopee-2026.html), [6](https://calculadoravirtual.com/blog/calculadora-shopee) |
| Competitors & weaknesses | precificacertoecommerce.com.br, vendedorlucrativo.com.br, dbcdatastudio, deveccom, appmodu, calculadoravirtual, ecomcalctools. Weakness: fee tables disagree. |
| Why this beats other candidates | High-intent B2B seller audience. It is #20 because demand is modest and fee rules change often. |
| URL / page structure | /pt-br/calculadora-taxas-shopee/ → /pt-br/calculadora-taxas-mercado-livre/, /pt-br/calculadora-precificacao-marketplace/ |
| Minimum viable functionality | 2026 price-band commission + fixed fee, CPF vs CNPJ, Pix subsidy, freight, ads (ROAS), MEI/Simples taxes; outputs: profit, margin, break-even price; fee tables dated and sourced. |
| Localisation | pt-BR; marketplace-specific terms. |
| Monetisation | Seller SaaS (ERP/hub) affiliates; bids ₹17–₹77. |
| Score explanation | A 10: >=7 small tools; fee tables disagree across tools.<br>B 13: 2 at 1K–10K + 2 at 100–1K; verified (7 + 6).<br>C 19: Deterministic once fees are known.<br>D 10: Tool intent.<br>E 7: Other marketplaces.<br>F 8: Seller SaaS affiliates; bids ₹17–₹77.<br>G 2: Fee rules change often. |
| Validate before development | Official 2026 fee schedule source; geo SERP; Mercado Livre volumes (few in CSV). |


---

## Red-team review (Phase 7) and the revisions it forced

| Question | Finding | Revision made |
|---|---|---|
| Did we confuse advertiser competition with organic difficulty? | ~82% of rows with a competition value are "Low" Ads competition (4,855 of 5,941), including saturated SERPs. | Ads competition is excluded from A. A is based only on SERP evidence. |
| Did weak first-pass SERPs mislead us? | **Yes.** Standard-mode search missed 6+ dedicated tools for plazos procesales, alqueire, UDIS, kwota słownie, weton, odmiana nazwisk, aksara, 住所 英語, KSeF, modalidad 40, cClassTrib and CNPJ. | Every finalist was re-checked in extended mode. A scores fell by 6–12 points. ES-03 dropped out (calculadoraplazos.es, Sepin). PL-01 KSeF dropped out (≥6 free visualisers launched in 2026). |
| Did broad ranges inflate demand? | 1K–10K can mean 1,000. Sums of bucket bounds double-count variants. | Demand is scored on keyword counts per bucket, not summed volumes. Floors are shown only as indicative. Year-tagged and −90% YoY heads lose reliability points. |
| Are we relying on weak translations? | No. Every keyword is native and comes from the supplied CSVs. JP_EN demand was measured with location = Japan. | JP_EN candidates are capped at reliability 2–3. The JP address tool carries the English page as a sibling instead of a separate entry. |
| Are any queries navigational or official-service-led? | ksef gov, simulador caixa, irpf 2026 download, consulta curp, renta wdowia (ZUS/KRUS calculators), 育児休業給付金 (MHLW simulator), cClassTrib (SEFAZ-RS lookup). | Those are excluded or gated. BR-02 stays at #15 only because of its B2B depth, and is flagged. |
| Is the intent better served by an incumbent we can't beat? | Pfändung (AOK), Fator R (accounting brands), odsetki (bankier/infor/gofin), CNPJ (4devs) and others. | **Organic gate (A<8) excluded them**, including PL-11 odsetki, which scored 75 on raw points. |
| Are multiple candidates the same tool? | ID tumbak and JP 坪 use the BR-01 engine. PL-02 and NUM share Polish morphology. ID-01 and ID-09 share a date engine. BR-02 and BR-03 share a fiscal-lookup engine. | ID-04 and JP-05 were folded into BR-01 as localisations. Shared engines were turned into build dependencies (roadmap), not separate wins. |
| Does each fit one website? | Yes, as a locale-foldered "everyday & business calculators" site. The weakest fits are PL-05 (word game) and ID-09 (generic dates). | Kept on score, but flagged as RPM-weak. If revenue per visit matters more than traffic, swap them for the higher-RPM alternatives MX-02 (Modalidad 40) or PL-01 (KSeF). |
| Have we been honest about insufficient evidence? | Organic difficulty is proxy-only for every market. TR has no data. JP_EN volumes are structurally under-measured. | Confidence labels are capped at Medium-High. The Validation checklist (G) lists the evidence that could reorder the list. |
| Did we overlook a stronger opportunity elsewhere? | ES-01 PAU (69), ID-02 aksara (69) and MX-02 Modalidad 40 (69) sit just below #20. TR rent-increase and dönüm families could qualify with data. | Listed first in Rejected alternatives with their exact deficit. |

---

## D. Downloadable research database

[`top20_seo_opportunities.xlsx`](top20_seo_opportunities.xlsx) sheets:

- **README:** method, settings and caveats.
- **Top20:** comparison view with metrics, scores and confidence.
- **Top20_Detail:** all 16 required fields per opportunity, including SERP URLs.
- **Top20_Keyword_Clusters:** 1,053 cluster keywords with range, 3-month and YoY change, Ads competition, bids (₹), period, location, source CSV and screenshot, and validation status.
- **All_Candidates_Scored:** 60 candidates with A–G, total, gate result and decision.
- **Scoring_Rubric.**
- **SERP_Evidence:** 99 queries and 429 URLs.
- **Discovery_List:** 49 discovered families with validation status.
- **Roadmap.**
- **Validation_Checklist.**
- **Screenshot_Audit:** per screenshot: rows, capture segments, alphabetical range, skipped rows.
- **KP_All_Keywords:** all 11,238 CSV keywords with extracted metrics or explicit "not visible" status.

Each sheet is also exported as CSV. The OCR and matching scripts are in `scripts/` so the extraction can be re-run.

---

## E. Development roadmap

| Batch | When | Build | Why this order / dependencies | Effort |
|---|---|---|---|---|
| **0 Foundation** | Weeks 0–2 | Locale folders + hreflang (/pt-br/, /es-mx/, /es-es/, /id/, /ja/, /en/, /pl/, /de/, /tr/); calculator UI kit; **parameter registry** (value, effective date, source URL, reviewer); analytics events; Search Console property per folder; WebApplication/FAQ schema; Core Web Vitals budget. | Everything depends on it. The registry is the cross-market moat. | Medium |
| **1 Fast, low-liability, high-evidence** | Weeks 2–6 | **MX-01** (live by mid-Nov for aguinaldo season), **BR-01** (+ land-unit engine), **MX-03** (Banxico API), **ID-01** + **ID-09** (shared Javanese/Gregorian date engine; publish *kalender jawa 2027* before December), **JP-TXT** | Highest evidence, lowest legal exposure, two hard deadlines (aguinaldo, 2027 calendar). MX-01 needs a labour-law review. | 2–6 dev-days each |
| **2 Linguistic/data engines** | Weeks 6–12 | **BR-03**, **PL-02** + **NUM** (shared Polish morphology), **JP-01** (Japan Post data; add 住所正規化 B2B angle), **PL-05** | Need data licences: SGJP/word list, Japan Post, CNAE×LC116 correlation. | Medium–High |
| **3 Regulated B2B calculators** | Weeks 10–20 | **DE-02**, **DE-07**, **DE-03** (one German "Recht & Kosten" hub), **PL-04**, **JP-07**, **BR-02** (reuses BR-03 search), **BR-09** | Professional review plus update discipline. This is the group most exposed to SERP-validation risk, so validate before building. | Medium–High |
| **4 Timed/niche** | Dec 2026 – Jan 2027 | **BR-08** (January 2027 tables), **PL-08** (before agricultural-tax season) | Calendar-driven demand. | Low–Medium |
| **Expansions** | After Batch 1 KPIs | BR-01 engine → ID/JP/ES/PL/TR land units; NUM → MX/ID/DE/ES/TR | Expand only where the lead market proves out. | Low |

**How to measure each launch.** Set up one Search Console property per locale folder and track page-level events.

| Window | Goal | What to measure | Action if missed |
|---|---|---|---|
| Days 0–14 | Indexation | Page indexed; first impressions on the primary and long-tail queries | Check technical SEO |
| Days 15–60 | Early signal | Impressions growth; average position on the 3–5 cluster terms; CTR vs position benchmark | Rewrite title/meta if CTR is below benchmark at a given position |
| Days 60–120 | Traction | Top-20 position for at least one 1K–10K term in the cluster; organic sessions; tool completion rate (calculate events ÷ sessions, aim >40%); copy/share/PDF events; return-visitor rate | Do not expand to more locales until the lead page hits these targets |
| Ongoing | Revenue | RPM per page; affiliate CTR and conversions; lead volume and quality (B2B tools) | — |
| Ongoing | Freshness | Parameter-registry SLA: rates updated within 24–72 h of official publication; error reports per 1,000 uses | — |

**Kill or iterate rule:** if a page has fewer than ~100 impressions per day after 120 days and an average position worse than 30 on its primary term, stop investing and redeploy to the next pool candidate.

---

## F. Rejected alternatives

The strongest candidates that missed are listed first, with the exact reason. Entries that "FAIL organic gate" scored well on points but rank against a brand or an official tool.

| ID | Market | Candidate | Primary keyword | KP range | Score | A | Why it missed |
|---|---|---|---|---|---|---|---|
| PL-11 | PL | Odsetki ustawowe / podatkowe calculator | kalkulator odsetek ustawowych | 10K – 100K | 75 | 7 | 75 pts but FAILS organic gate (A<8): bankier.pl, infor.pl, fakturownia.pl, gofin. |
| ES-01 | ES | Nota PAU / nota de corte calculator by community & degree | calculadora nota pau | 10K – 100K | 69 | 10 | 69 pts: yaq.es specialist + universities; 17 regional rule sets; seasonal (May–Jul). |
| ID-02 | ID | Aksara Jawa/Sunda/Bali/Pegon transliterator | translate aksara jawa | 10K – 100K | 69 | 10 | 69 pts: >=6 tools incl. photo-scan OCR; ads-only low-RPM; misses top 20 on tie-break (F). |
| MX-02 | MX | Modalidad 40 / pensión IMSS Ley 73 calculator | calculadora modalidad 40 | 1K – 10K | 69 | 8 | 69 pts: >=10 dedicated calculators; head shows -90% YoY. |
| ID-04 | ID | Traditional land units (tumbak/bata/ru/bau) | 1 tumbak berapa meter | 1K – 10K | 68 | 13 | 68 pts: folded into BR-01 as a localisation (same engine). |
| JP-05 | JP | 坪・反・畳 land-unit converter | 一反 何坪 | 1K – 10K | 68 | 8 | 68 pts: >=7 converters + real-estate majors; folded into BR-01 engine as optional locale. |
| PL-01 | PL | KSeF XML invoice visualiser / validator / numer KSeF | wizualizacja faktury ksef | 1K – 10K | 67 | 9 | 67 pts: >=6 free in-browser visualisers launched in 2026; head term "ksef gov" is navigational. |
| ES-03 | ES | Plazos procesales / días hábiles calculator | calculadora plazos procesales | 1K – 10K | 67 | 8 | 67 pts: extended search found >=6 Spanish tools incl. Sepin; "calculadora cgpj/poder judicial" suggests navigational demand. |
| DE-01 | DE | IHK Notenschlüssel / Punkte→Note | ihk notenschlüssel | 10K – 100K | 67 | 8 | 67 pts: fixed nationwide key; calculator networks own it; low value. |
| BR-07 | BR | Pensão alimentícia calculator (incl. atrasada) | calculadora de pensão alimentícia | 1K – 10K | 66 | 12 | 66 pts: judicial discretion limits tool fit; legal YMYL. |
| DE-06 | DE | Silbentrennung | silben trennen | 10K – 100K | 66 | 11 | 66 pts: silbentrennung24/Duden; low value. |
| ES-02 | ES | Letra DNI/NIE/NIF calculator & validator | calculadora letra dni | 10K – 100K | 66 | 11 | 66 pts: trivial, low value, -90% YoY on head. |
| JP-08 | JP | 傷病手当金 calculator | 傷病手当金 計算ツール | 1K – 10K | 66 | 10 | 66 pts: >=5 tools + insurer brand; small cluster. |
| ID-03 | ID | Gold unit & price calculator (mayam/suku/gram→Rp) | 1 mayam berapa gram | 10K – 100K | 66 | 10 | 66 pts: factoid answer (zero-click), Pegadaian/Pluang; head -90% YoY. |
| BR-04 | BR | CNPJ alfanumérico validator/generator | cnpj alfanumérico | 10K – 100K | 66 | 7 | 66 pts and FAILS organic gate (A<8): >=9 validators incl. 4devs. |
| BR-12 | BR | ABNT reference generator | gerador de referência abnt | 10K – 100K | 66 | 7 | 66 pts, FAILS gate: crowded with dedicated generators. |
| BR-05 | BR | Fator R / Simples Nacional calculator | fator r | 1K – 10K | 66 | 6 | 66 pts, FAILS gate: every online-accounting brand runs one. |
| DE-04 | DE | Pfändungsrechner 2026 | pfändungsrechner 2026 | 10K – 100K | 66 | 6 | 66 pts, FAILS gate: AOK + networks. |
| PL-06 | PL | Kalkulator punktów rekrutacyjnych | kalkulator punktów | 10K – 100K | 65 | 13 | 65 pts: ambiguous head intent; seasonal; per-school rules. |
| ES-04 | ES | Actualizar renta alquiler (IPC/IRAV) | actualizar renta alquiler | 1K – 10K | 65 | 8 | 65 pts: official INE/Ministerio tools. |
| JP_EN-02 | JP_EN | Japan pension lump-sum refund calculator (English) | japan pension lump sum withdrawal calculator | 10 – 100 | 64 | 13 | 64 pts: demand unmeasurable (KP location = Japan only: 10–100); >=3 agent-run estimators. |
| DE-09 | DE | Brennholz Festmeter/Raummeter converter | festmeter rechner | 1K – 10K | 64 | 12 | 64 pts: small demand, low value. |
| DE-14 | DE | E-Rechnung viewer/validator | xrechnung viewer | 100 – 1K | 64 | 6 | 64 pts, FAILS gate: SaaS brands; High ad competition. |
| JP_EN-01 | JP_EN | Japan take-home pay calculator (English) | japan take home pay calculator | 10 – 100 | 63 | 13 | 63 pts: demand unmeasurable with Japan-only location. |
| DE-05 | DE | Kündigungsfrist-Rechner | kündigungsfrist rechner | 1K – 10K | 63 | 6 | 63 pts, FAILS gate. |
| MX-05 | MX | Foto tamaño infantil/título print-sheet maker | foto tamaño infantil | 10K – 100K | 62 | 8 | 62 pts: passport-photo.online + print fulfilment moat. |
| JP-11 | JP | ヘボン式/パスポート romaniser | ヘボン式 ローマ字 変換 | 1K – 10K | 61 | 11 | 61 pts: small cluster; becomes a feature of JP-01. |
| JP-06 | JP | 育児休業給付金 calculator | 育児休業給付金 計算 | 1K – 10K | 61 | 7 | 61 pts, FAILS gate: official MHLW simulator. |
| JP-13 | JP | 子ども・子育て支援金 calculator | 子ども子育て支援金 計算方法 | 1K – 10K | 60 | 14 | 60 pts: small cluster; official explanation suffices for most. |
| DE-10 | DE | Sütterlin/Fraktur generator | sütterlin übersetzer | 1K – 10K | 60 | 12 | 60 pts: intent split (generator vs handwriting reading); low value. |
| JP-03 | JP | 原稿用紙 renderer & counter | 原稿用紙 書き方 | 10K – 100K | 60 | 10 | 60 pts: >=5 renderers with PDF; head is how-to intent. |
| ID-06 | ID | Kalkulator waris Islam (faraid) | kalkulator waris islam | 1K – 10K | 59 | 12 | 59 pts: NU Online authority; religious-legal review burden. |
| DE-15 | DE | Aktivrente-Rechner | aktivrente rechner | 1K – 10K | 59 | 8 | 59 pts: 1 head 1K–10K; authority portal + networks. |
| MX-04 | MX | RFC con homoclave / CURP generator | calculadora rfc | 10K – 100K | 58 | 8 | 58 pts: homoclave assigned by SAT (estimate-only); navigational to official CURP/RFC. |
| ID-08 | ID | Coretax Excel→XML converter | simulasi coretax | 1K – 10K | 57 | 8 | 57 pts: official DJP converters; schema churn; liability. |
| MX-07 | MX | USICAMM points calculator | calculadora usicamm | 1K – 10K | 55 | 8 | 55 pts: SERP unverifiable (index gap). |
| JP-04 | JP | 最低賃金 by prefecture + 年収 converter | 最低賃金 2026 | 10K – 100K | 55 | 7 | 55 pts, FAILS gate: MHLW + job portals; informational. |
| TR-01 | TR | 100'lük↔4'lük grade converter (YÖK + university tables) | 100 lük sistem 4 lük sisteme çevirme | not visible | 52 | 10 | 52 pts: NO Keyword Planner data for Turkey; hesaplama networks present. |
| PL-09 | PL | Renta wdowia calculator | renta wdowia 2027 | 1K – 10K | 51 | 4 | 51 pts: official ZUS and KRUS calculators. |
| TR-04 | TR | AGS puan hesaplama | ags puan hesaplama | not visible | 48 | 12 | 48 pts: NO KP data; formula volatility. |


Also excluded before scoring were giant, navigational or product head terms. Examples: *calculadora científica, converter pdf em word, conversor de moeda/dólar, simulador financiamento caixa, irpf 2026, calculadora sueldo neto, hoy no circula, salario mínimo 2026, kalkulator brutto netto, kalkulator kredytu hipotecznego, kalkulator bmi, simulasi tka, generador qr, generador de imágenes ia, gerador a diesel, conversor hdmi*. In these SERPs Google features, banks, governments or global SaaS brands own the results, or the intent is to buy a physical product.

---

## G. Validation checklist (only evidence that could change decisions)

1. **Geo-located SERP snapshots** (SERP API, google.com.br/.mx/.co.id/.co.jp/.pl/.de) for each Top-20 primary keyword and 2 secondary keywords. This could reorder or remove #5–#20. **Highest priority.**
2. **Authority and traffic of the incumbents** that decide A scores: calculadorarural.com.br, valorudi.com, calculadora-udi.com, kalenderindo.id, hitunganweton.id, meetly.com.pl, poocoo.pl, rvg-rechner.de, kalkulatory.gofin.pl, haradaeigo.com.
3. **12-month volume series** for the Top-20 heads, especially the −90% YoY heads (DE-07, PL-08, MX-02) and the year-tagged BR-08.
4. **Turkey Keyword Planner export.** The only route for TR candidates (kira artış, dönüm, 4'lük, rakamı yazıya) to compete.
5. **Non-Japan locations for the English Japan queries.** This would size JP_EN-02 (pension refund), which is under-measured today but strongly monetisable.
6. **The ~1,837 invisible keywords** in finalist clusters (e.g. "uma 2026", "validador cnpj alfanumérico"). Export the plans as CSV with metrics instead of screenshots.
7. **Legal and actuarial sign-off** before launch: MX-01 (including whether the prima de antigüedad cap uses salario mínimo or UMA), BR-03/BR-02 data sources, BR-08, PL-04 (2026 rules), JP-07, DE-02/03/07.
8. **Data licences:** SGJP/Morfeusz (PL-02), Polish word list (PL-05), Japan Post romaji (JP-01), Banxico SIE (MX-03), CNAE×LC116 correlation (BR-03).
9. **Business-model choice.** RPM-led vs lead-gen-led changes the order of #4–#9 (ID-01, ID-09, JP-TXT and PL-05 are traffic-rich but RPM-poor).

---

## Method notes

- **OCR pipeline:** separator-line row detection; per-column Tesseract 5 with language packs; the ₹ glyph blanked before reading bids; keyword alignment to the CSV that is punctuation-normalised and order-aware; Japanese re-OCR at 3× in greyscale. Scripts are in [`scripts/`](scripts/).
- **SERP research:** 99 native-language queries (standard and extended modes) across 9 markets, logged with URLs in `serp_evidence.csv`. All are proxies for the local Google SERP, not geo-located results.
- **No Ahrefs/Semrush/Similarweb data** was available. Third-party keyword-difficulty estimates are therefore absent rather than invented.
