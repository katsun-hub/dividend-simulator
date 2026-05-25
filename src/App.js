import { useState, useMemo } from "react";

const formatYen = (n) =>
  n >= 100000000
    ? `${(n / 100000000).toFixed(2)}億円`
    : `${Math.round(n / 10000).toLocaleString()}万円`;

const MILESTONES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const GROWTH_RATE = 0.05;

function simulate({ initialInvestment, monthlyDeposit, dividendYield, stopYear }) {
  const allYears = [];
  const baseRate = dividendYield / 100;
  const annualDeposit = monthlyDeposit * 12;
  const cohorts = [];

  if (initialInvestment > 0) {
    cohorts.push({ principal: initialInvestment, startYear: 0 });
  }

  let cumulativeDividend = 0;
  let capital = initialInvestment;

  for (let year = 1; year <= 50; year++) {
    if (annualDeposit > 0 && year <= stopYear) {
      cohorts.push({ principal: annualDeposit, startYear: year });
      capital += annualDeposit;
    }

    let annualDividend = 0;
    for (const c of cohorts) {
      const held = year - c.startYear;
      const rate = baseRate * Math.pow(1 + GROWTH_RATE, held);
      annualDividend += c.principal * rate;
    }

    cumulativeDividend += annualDividend;
    allYears.push({ year, capital, annualDividend, cumulativeDividend });
  }

  const milestones = allYears.filter(r => MILESTONES.includes(r.year));
  return { milestones, allYears };
}

export default function App() {
  const [initial, setInitial] = useState("1000000");
  const [monthly, setMonthly] = useState("50000");
  const [yieldPct, setYieldPct] = useState("3.5");
  const [stopYear, setStopYear] = useState("30");
  const [submitted, setSubmitted] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const results = useMemo(() => {
    if (!submitted) return null;
    const i = parseFloat(initial) || 0;
    const m = parseFloat(monthly) || 0;
    const y = parseFloat(yieldPct) || 0;
    const s = Math.min(Math.max(parseInt(stopYear) || 30, 1), 50);
    if (i <= 0 && m <= 0) return null;
    return simulate({ initialInvestment: i, monthlyDeposit: m, dividendYield: y, stopYear: s });
  }, [submitted, initial, monthly, yieldPct, stopYear]);

  const handleRun = () => setSubmitted(true);
  const handleReset = () => { setSubmitted(false); setShowTable(false); };

  const inputChange = (setter) => (e) => {
    setter(e.target.value);
    setSubmitted(false);
    setShowTable(false);
  };

  const inputFields = [
    { label: "初期投資額", unit: "円", value: initial, setter: setInitial, placeholder: "1000000" },
    { label: "月々の積立額", unit: "円", value: monthly, setter: setMonthly, placeholder: "50000" },
    { label: "配当利回り", unit: "%", value: yieldPct, setter: setYieldPct, placeholder: "3.5" },
    { label: "積立終了年", unit: "年目", value: stopYear, setter: setStopYear, placeholder: "30", note: "この年まで積立。以降は増配のみ継続。" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8d5b0",
    }}>
      <div style={{
        borderBottom: "1px solid rgba(212,175,55,0.3)",
        padding: "32px 40px 24px",
        background: "rgba(0,0,0,0.3)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#d4af37", marginBottom: 8, textTransform: "uppercase" }}>
            Investment Simulator
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: "normal", color: "#f5e6c8", letterSpacing: 2 }}>
            高配当株シミュレーション
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#8a9bb0", letterSpacing: 1 }}>
            増配率 5% ／ 毎年の積立元本に対して配当が積み上がる複利シミュレーション
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 2,
          padding: "32px",
          marginBottom: 32,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
            {inputFields.map(({ label, unit, value, setter, placeholder, note }) => (
              <div key={label}>
                <label style={{
                  display: "block", fontSize: 11, letterSpacing: 3,
                  color: "#d4af37", marginBottom: note ? 6 : 10, textTransform: "uppercase",
                }}>
                  {label}
                </label>
                {note && (
                  <div style={{ fontSize: 11, color: "#6a7a8a", marginBottom: 8 }}>{note}</div>
                )}
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={value}
                    onChange={inputChange(setter)}
                    placeholder={placeholder}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      borderRadius: 1,
                      padding: "14px 56px 14px 16px",
                      color: "#f5e6c8", fontSize: 18,
                      fontFamily: "'Courier New', monospace",
                      outline: "none", transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#d4af37"}
                    onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.3)"}
                  />
                  <span style={{
                    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                    color: "#8a9bb0", fontSize: 13, pointerEvents: "none",
                  }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", gap: 24, marginBottom: 28,
            padding: "14px 18px",
            background: "rgba(212,175,55,0.05)",
            border: "1px solid rgba(212,175,55,0.1)", borderRadius: 1,
          }}>
            <span style={{ fontSize: 12, color: "#8a9bb0" }}>固定設定：</span>
            <span style={{ fontSize: 12, color: "#b8a070" }}>増配率 <strong style={{ color: "#d4af37" }}>5%</strong></span>
            <span style={{ fontSize: 12, color: "#b8a070" }}>株価上昇 <strong style={{ color: "#d4af37" }}>なし（元本のみ）</strong></span>
          </div>

          <button
            onClick={handleRun}
            style={{
              width: "100%", padding: "16px",
              background: submitted ? "rgba(212,175,55,0.15)" : "linear-gradient(90deg, #b8960c, #d4af37, #b8960c)",
              border: submitted ? "1px solid rgba(212,175,55,0.4)" : "none",
              borderRadius: 1,
              color: submitted ? "#d4af37" : "#0a0f1e",
              fontSize: 14, fontWeight: "bold", letterSpacing: 4, textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit",
            }}
          >
            {submitted ? "✓  計算済み" : "シミュレーション開始"}
          </button>
        </div>

        {results && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 5, color: "#d4af37", marginBottom: 20, textTransform: "uppercase" }}>
              — シミュレーション結果 —
            </div>

            {(() => {
              const sy = Math.min(Math.max(parseInt(stopYear) || 30, 1), 50);
              const duringMilestones = results.milestones.filter(r => r.year <= sy);
              const afterMilestones = results.milestones.filter(r => r.year > sy);

              const CardGrid = ({ items }) => (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {items.map(({ year, capital, annualDividend, cumulativeDividend }) => {
                    const isHighlight = year === 50;
                    return (
                      <div key={year} style={{
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${isHighlight ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.15)"}`,
                        borderRadius: 2, padding: "20px",
                        position: "relative", overflow: "hidden",
                      }}>
                        <div style={{
                          position: "absolute", top: 0, right: 0,
                          background: isHighlight ? "#d4af37" : "rgba(212,175,55,0.15)",
                          color: isHighlight ? "#0a0f1e" : "#d4af37",
                          fontSize: 11, fontWeight: "bold", padding: "5px 14px", letterSpacing: 2,
                        }}>
                          {year}年後
                        </div>
                        <div style={{ marginTop: 8 }}>
                          {[
                            { label: "投資元本累計", value: formatYen(capital), highlight: true },
                            { label: "年間配当金", value: formatYen(annualDividend) },
                            { label: "累計配当金", value: formatYen(cumulativeDividend) },
                          ].map(({ label, value, highlight }) => (
                            <div key={label} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ fontSize: 10, letterSpacing: 2, color: "#8a9bb0", marginBottom: 4, textTransform: "uppercase" }}>{label}</div>
                              <div style={{
                                fontSize: highlight ? 18 : 15,
                                fontFamily: "'Courier New', monospace",
                                color: highlight ? "#f5e6c8" : "#c8b882",
                                fontWeight: highlight ? "bold" : "normal", letterSpacing: 1,
                              }}>
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );

              return (
                <>
                  {duringMilestones.length > 0 && (
                    <>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "#6a8a6a", marginBottom: 10, textTransform: "uppercase" }}>▸ 積立期間中</div>
                      <CardGrid items={duringMilestones} />
                    </>
                  )}
                  {afterMilestones.length > 0 && (
                    <>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "#8a6a4a", marginBottom: 10, marginTop: 8, textTransform: "uppercase" }}>▸ 積立終了後（増配のみ継続）</div>
                      <CardGrid items={afterMilestones} />
                    </>
                  )}
                </>
              );
            })()}

            <div style={{
              marginBottom: 24, padding: "18px 24px",
              background: "rgba(212,175,55,0.05)",
              border: "1px solid rgba(212,175,55,0.2)", borderRadius: 1,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: 12,
            }}>
              <span style={{ fontSize: 12, color: "#8a9bb0" }}>
                総投資元本：
                <strong style={{ color: "#d4af37", marginLeft: 8 }}>
                  {formatYen(parseFloat(initial) + parseFloat(monthly) * 12 * Math.min(parseInt(stopYear) || 30, 50))}
                </strong>
              </span>
              <span style={{ fontSize: 12, color: "#8a9bb0" }}>
                50年後の年間配当金：
                <strong style={{ color: "#f5e6c8", marginLeft: 8 }}>
                  {formatYen(results.milestones[results.milestones.length - 1].annualDividend)}
                </strong>
              </span>
              <button onClick={handleReset} style={{
                background: "transparent",
                border: "1px solid rgba(138,155,176,0.3)",
                color: "#8a9bb0", padding: "7px 18px", fontSize: 11,
                letterSpacing: 2, cursor: "pointer", borderRadius: 1, fontFamily: "inherit",
              }}>
                再入力
              </button>
            </div>

            <button
              onClick={() => setShowTable(v => !v)}
              style={{
                width: "100%", padding: "14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(212,175,55,0.25)", borderRadius: 1,
                color: "#d4af37", fontSize: 13, letterSpacing: 3,
                cursor: "pointer", fontFamily: "inherit",
                marginBottom: showTable ? 0 : 24,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              <span>{showTable ? "▲" : "▼"}</span>
              <span>{showTable ? "詳細テーブルを閉じる" : "1〜50年の詳細テーブルを表示"}</span>
            </button>

            {showTable && (
              <div style={{ marginBottom: 24, border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Courier New', monospace" }}>
                    <thead>
                      <tr style={{ background: "rgba(212,175,55,0.12)", borderBottom: "1px solid rgba(212,175,55,0.3)" }}>
                        {["年数", "投資元本累計", "年間配当金", "累計配当金"].map(h => (
                          <th key={h} style={{
                            padding: "12px 16px", textAlign: "right",
                            fontSize: 10, letterSpacing: 2, color: "#d4af37",
                            fontWeight: "normal", textTransform: "uppercase", whiteSpace: "nowrap",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.allYears.map(({ year, capital, annualDividend, cumulativeDividend }) => {
                        const sy = Math.min(Math.max(parseInt(stopYear) || 30, 1), 50);
                        const isMilestone = MILESTONES.includes(year);
                        const isStopYear = year === sy;
                        const isAfterStop = year > sy;
                        return (
                          <tr key={year} style={{
                            background: isStopYear ? "rgba(212,175,55,0.12)" : isMilestone ? "rgba(212,175,55,0.07)" : "transparent",
                            borderBottom: isStopYear ? "2px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.04)",
                          }}>
                            <td style={{
                              padding: "10px 16px", textAlign: "right",
                              color: isAfterStop ? "#8a6a4a" : isMilestone ? "#d4af37" : "#8a9bb0",
                              fontWeight: isMilestone || isStopYear ? "bold" : "normal", whiteSpace: "nowrap",
                            }}>
                              {year}年後{isStopYear ? " ⛳" : isMilestone ? " ★" : ""}
                            </td>
                            <td style={{ padding: "10px 16px", textAlign: "right", color: isAfterStop ? "#7a8a7a" : "#f5e6c8", whiteSpace: "nowrap" }}>{formatYen(capital)}</td>
                            <td style={{ padding: "10px 16px", textAlign: "right", color: "#c8b882", whiteSpace: "nowrap" }}>{formatYen(annualDividend)}</td>
                            <td style={{ padding: "10px 16px", textAlign: "right", color: "#b0a070", whiteSpace: "nowrap" }}>{formatYen(cumulativeDividend)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(212,175,55,0.15)", fontSize: 11, color: "#4a5a6a" }}>
                  ★ 5年ごとの節目　⛳ 積立終了年
                </div>
              </div>
            )}

            <p style={{ fontSize: 11, color: "#4a5568", marginTop: 8, textAlign: "center", lineHeight: 1.8 }}>
              ※ 本シミュレーションは参考値です。実際の投資成果を保証するものではありません。<br />
              配当金への課税（約20%）は考慮していません。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
