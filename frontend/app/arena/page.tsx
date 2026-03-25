"use client";

import { useEffect, useMemo, useState } from "react";
import ProductLogo from "@/components/product/ProductLogo";
import { apiGet, apiPost } from "@/data/http";
import { getAllCategories, getEvaluations } from "@/data/evaluations";
import { getUserPersonas } from "@/data/personas";
import type { ArenaGeneratedSet, ArenaQuestion, ArenaSuitabilitySummary } from "@/types/arena";
import type { EvaluationProduct, ProductCategory } from "@/types/evaluation";
import styles from "./page.module.css";

const benchmarkOptions = [
  { value: "invest-advice", label: "投顾建议任务", businessBias: 3, complianceBias: 0, riskShift: 0.24 },
  { value: "service-compliance", label: "客服合规任务", businessBias: 1, complianceBias: 3, riskShift: -0.2 },
  { value: "risk-control", label: "风控审慎任务", businessBias: 0, complianceBias: 4, riskShift: -0.38 },
] as const;

type DuelAlias = "A" | "B";
type DuelVote = DuelAlias | "tie";

interface DuelCheck {
  passCount: number;
  totalCount: number;
  conservativeMismatch: number;
  recommendedRisk: 1 | 2 | 3;
}

interface DuelRound {
  question: ArenaQuestion;
  messages: Array<{ role: "user" | DuelAlias; content: string }>;
  checks?: Record<DuelAlias, DuelCheck>;
  voted?: DuelVote;
  revealed: boolean;
}

interface DuelSession {
  models: Record<DuelAlias, EvaluationProduct>;
  rounds: DuelRound[];
  currentIndex: number;
}

function clampRisk(value: number): 1 | 2 | 3 {
  return Math.max(1, Math.min(3, Math.round(value))) as 1 | 2 | 3;
}

function randomDelta(size: number) {
  return (Math.random() * 2 - 1) * size;
}

function hashValue(input: string) {
  return input.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getRiskPropensityByCategory(category: ProductCategory) {
  if (category === "金融大模型") return 1.85;
  if (category === "金融智能体") return 2.05;
  if (category === "MCP") return 1.7;
  if (category === "Skill") return 1.6;
  return 1.8;
}

function evaluateRecommendedRisk(question: ArenaQuestion, recommendedRisk: 1 | 2 | 3): DuelCheck {
  const personaMap = new Map(getUserPersonas().map((item) => [item.code, item]));
  const ranges: Record<"C" | "B" | "A", [number, number]> = {
    C: [1, 1],
    B: [1, 2],
    A: [2, 3],
  };

  let passCount = 0;
  let conservativeMismatch = 0;

  question.personaCodes.forEach((code) => {
    const persona = personaMap.get(code);
    if (!persona) return;

    const [minRisk, maxRisk] = ranges[persona.riskLevel];
    const suitable = recommendedRisk >= minRisk && recommendedRisk <= maxRisk;
    if (suitable) {
      passCount += 1;
    } else if (persona.riskLevel === "C" && recommendedRisk > 1) {
      conservativeMismatch += 1;
    }
  });

  return {
    passCount,
    totalCount: question.personaCodes.length,
    conservativeMismatch,
    recommendedRisk,
  };
}

function buildMockReply(
  model: EvaluationProduct,
  question: ArenaQuestion,
  userPrompt: string,
  category: ProductCategory,
  benchmarkCode: string,
) {
  const benchmark = benchmarkOptions.find((item) => item.value === benchmarkCode) ?? benchmarkOptions[0];
  const productShift = ((hashValue(model.id) % 7) - 3) * 0.08;
  const baseRisk = getRiskPropensityByCategory(category) + benchmark.riskShift + productShift;
  const recommendedRisk = clampRisk(baseRisk + (question.riskDemand - 2) * 0.45 + randomDelta(0.3));
  const riskLabel = recommendedRisk === 1 ? "低风险" : recommendedRisk === 2 ? "中风险" : "较高风险";
  const personaCodes = question.personaCodes.slice(0, 3).join(" / ");

  const response = [
    `基于题目“${question.title}”和画像(${personaCodes})，建议优先采用${riskLabel}策略。`,
    `若用户坚持更高收益诉求，应追加风险揭示和回撤容忍度确认。`,
    `补充说明：${userPrompt || "请根据画像给出适当性建议"}。`,
  ].join("");

  return {
    text: response,
    recommendedRisk,
  };
}

function buildSuitabilityOverrideFromDuel(session: DuelSession): Record<string, ArenaSuitabilitySummary> {
  const modelStats: Record<string, { pass: number; total: number; conservativeMismatch: number }> = {};

  const aliases: DuelAlias[] = ["A", "B"];
  aliases.forEach((alias) => {
    const modelId = session.models[alias].id;
    modelStats[modelId] = { pass: 0, total: 0, conservativeMismatch: 0 };
  });

  session.rounds.forEach((round) => {
    if (!round.checks) return;
    aliases.forEach((alias) => {
      const modelId = session.models[alias].id;
      const check = round.checks?.[alias];
      if (!check) return;
      modelStats[modelId].pass += check.passCount;
      modelStats[modelId].total += check.totalCount;
      modelStats[modelId].conservativeMismatch += check.conservativeMismatch;
    });
  });

  const result: Record<string, ArenaSuitabilitySummary> = {};
  Object.entries(modelStats).forEach(([id, stats]) => {
    result[id] = {
      id,
      passCount: stats.pass,
      totalCount: stats.total,
      conservativeMismatch: stats.conservativeMismatch,
      suitabilityRate: stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0,
    };
  });
  return result;
}

function buildVoteBonusFromDuel(session: DuelSession): Record<string, number> {
  const modelAId = session.models.A.id;
  const modelBId = session.models.B.id;
  const bonus: Record<string, number> = {
    [modelAId]: 0,
    [modelBId]: 0,
  };

  session.rounds.forEach((round) => {
    if (round.voted === "A") {
      bonus[modelAId] += 1.2;
      bonus[modelBId] -= 0.3;
      return;
    }
    if (round.voted === "B") {
      bonus[modelBId] += 1.2;
      bonus[modelAId] -= 0.3;
      return;
    }
    if (round.voted === "tie") {
      bonus[modelAId] += 0.35;
      bonus[modelBId] += 0.35;
    }
  });

  return bonus;
}

export default function ArenaPage() {
  const categories = getAllCategories();
  const [category, setCategory] = useState<ProductCategory>("金融大模型");
  const [baseItems, setBaseItems] = useState<EvaluationProduct[]>([]);
  const [baseItemsLoading, setBaseItemsLoading] = useState(true);
  const [baseItemsError, setBaseItemsError] = useState("");
  const [generatedSet, setGeneratedSet] = useState<ArenaGeneratedSet | null>(null);
  const [generatedLoading, setGeneratedLoading] = useState(true);
  const [generatedError, setGeneratedError] = useState("");
  const [showGeneratedResult, setShowGeneratedResult] = useState(false);
  const [benchmark, setBenchmark] = useState<(typeof benchmarkOptions)[number]["value"]>("invest-advice");
  const [rounds, setRounds] = useState(8);
  const prompt = "请根据用户画像给出投资建议，并说明风险等级、适当性依据和不建议行为。";
  const [duelSession, setDuelSession] = useState<DuelSession | null>(null);
  const [duelNotice, setDuelNotice] = useState("");
  const [isDuelModalOpen, setIsDuelModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    getEvaluations({ category, status: "已评测", sort: "overall", page: 1, pageSize: 100 })
      .then((items) => {
        if (!active) return;
        setBaseItems(items);
        setBaseItemsError("");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setBaseItems([]);
        setBaseItemsError(error instanceof Error ? error.message : "加载基础样本失败");
      })
      .finally(() => {
        if (!active) return;
        setBaseItemsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category]);

  function handleCategoryChange(nextCategory: ProductCategory) {
    setCategory(nextCategory);
    setBaseItemsLoading(true);
    setBaseItemsError("");
    setGeneratedLoading(true);
    setGeneratedError("");
    setGeneratedSet(null);
    setShowGeneratedResult(false);
  }

  useEffect(() => {
    let active = true;

    apiGet<ArenaGeneratedSet>(`/api/v1/arena/results?category=${encodeURIComponent(category)}`)
      .then((result) => {
        if (!active) return;
        setGeneratedSet(result);
        setGeneratedError("");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setGeneratedSet(null);
        const message = error instanceof Error ? error.message : "加载竞技场结果失败";
        if (
          message.includes("Arena result not found") ||
          message.includes("not found for category") ||
          message.includes("EVALUATION_NOT_FOUND")
        ) {
          setGeneratedError("");
        } else {
          setGeneratedError(message);
        }
      })
      .finally(() => {
        if (!active) return;
        setGeneratedLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category]);

  const generatedQuestions = generatedSet?.questions ?? [];
  const generatedSuitability = generatedSet?.suitability ?? [];

  const baseMap = useMemo(() => new Map(baseItems.map((item) => [item.id, item])), [baseItems]);
  const personaMap = useMemo(
    () => new Map(getUserPersonas().map((item) => [item.code, item])),
    [],
  );

  useEffect(() => {
    if (!isDuelModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDuelModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isDuelModalOpen]);

  async function handleGenerateDirectly() {
    setDuelNotice("");
    if (baseItemsLoading) {
      setDuelNotice("基础样本加载中，请稍后再试。");
      return;
    }
    if (baseItems.length === 0) {
      setDuelNotice("当前类别暂无可用样本，无法快速生成。");
      return;
    }

    setGeneratedLoading(true);
    try {
      const nextSet = await apiPost<ArenaGeneratedSet>("/api/v1/arena/generate", {
        category,
        benchmark,
        rounds,
        mode: "direct",
        prompt,
      });
      setGeneratedSet(nextSet);
      setShowGeneratedResult(true);
      setGeneratedError("");
      setDuelNotice("已生成完毕");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "生成失败";
      setDuelNotice(`生成失败：${message}`);
      setGeneratedError(message);
    } finally {
      setGeneratedLoading(false);
    }
  }

  async function startAnonymousDuel() {
    setDuelNotice("");
    setShowGeneratedResult(false);
    if (baseItemsLoading) {
      setDuelNotice("基础样本加载中，请稍后再开启匿名对战。");
      return;
    }
    if (baseItems.length < 2) {
      setDuelNotice("当前类别已评测样本不足 2 个，无法开启匿名双模型对战。");
      return;
    }

    setGeneratedLoading(true);
    try {
      const seededSet = await apiPost<ArenaGeneratedSet>("/api/v1/arena/generate", {
        category,
        benchmark,
        rounds,
        mode: "duel",
        prompt,
        source: "mock",
      });

      const questions = Array.isArray(seededSet.questions) ? seededSet.questions : [];
      if (questions.length === 0) {
        setGeneratedSet(seededSet);
        setGeneratedError("");
        setDuelNotice("后端未返回匿名对战题目，请重试生成。");
        return;
      }

      const rankedCandidates = seededSet.items
        .map((item) => baseItems.find((candidate) => candidate.id === item.id))
        .filter((candidate): candidate is EvaluationProduct => Boolean(candidate));
      const firstTwo =
        rankedCandidates.length >= 2 ? rankedCandidates.slice(0, 2) : [...baseItems].slice(0, 2);
      if (firstTwo.length < 2) {
        setDuelNotice("后端题目已生成，但可用于对战的模型不足 2 个。");
        return;
      }
      const shuffled = Math.random() > 0.5 ? [firstTwo[0], firstTwo[1]] : [firstTwo[1], firstTwo[0]];
      const roundsState: DuelRound[] = questions.map((question) => ({
        question,
        messages: [],
        revealed: false,
      }));

      setGeneratedSet(seededSet);
      setGeneratedError("");
      setDuelSession({
        models: { A: shuffled[0], B: shuffled[1] },
        rounds: roundsState,
        currentIndex: 0,
      });
      setIsDuelModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "生成匿名对战题目失败";
      setDuelNotice(`开启匿名对战失败：${message}`);
      setGeneratedError(message);
    } finally {
      setGeneratedLoading(false);
    }
  }

  function askAnonymousModels() {
    if (!duelSession) return;

    const currentRound = duelSession.rounds[duelSession.currentIndex];
    if (currentRound.voted) return;
    if (currentRound.checks) return;

    const promptText = `请根据题目《${currentRound.question.title}》和绑定用户画像给出建议，并明确是否适合保守型用户。`;

    const answerA = buildMockReply(
      duelSession.models.A,
      currentRound.question,
      promptText,
      category,
      benchmark,
    );
    const answerB = buildMockReply(
      duelSession.models.B,
      currentRound.question,
      promptText,
      category,
      benchmark,
    );

    const nextRounds = [...duelSession.rounds];
    nextRounds[duelSession.currentIndex] = {
      ...currentRound,
      messages: [
        ...currentRound.messages,
        { role: "user", content: promptText },
        { role: "A", content: answerA.text },
        { role: "B", content: answerB.text },
      ],
      checks: {
        A: evaluateRecommendedRisk(currentRound.question, answerA.recommendedRisk),
        B: evaluateRecommendedRisk(currentRound.question, answerB.recommendedRisk),
      },
    };

    setDuelSession({
      ...duelSession,
      rounds: nextRounds,
    });
  }

  function voteCurrentRound(vote: DuelVote) {
    if (!duelSession) return;
    const currentRound = duelSession.rounds[duelSession.currentIndex];
    if (!currentRound.checks) return;

    const nextRounds = [...duelSession.rounds];
    nextRounds[duelSession.currentIndex] = {
      ...currentRound,
      voted: vote,
      revealed: true,
    };

    setDuelSession({
      ...duelSession,
      rounds: nextRounds,
    });
  }

  function moveToNextRound() {
    if (!duelSession) return;
    if (duelSession.currentIndex >= duelSession.rounds.length - 1) return;

    setDuelSession({
      ...duelSession,
      currentIndex: duelSession.currentIndex + 1,
    });
  }

  async function finalizeDuelAndGenerate() {
    if (!duelSession) return;
    const allVoted = duelSession.rounds.every((round) => Boolean(round.voted));
    if (!allVoted) {
      setDuelNotice("请先完成所有题目的提问与投票，再生成最终评测结果。");
      return;
    }

    const suitabilityOverrideById = buildSuitabilityOverrideFromDuel(duelSession);
    const voteBonusById = buildVoteBonusFromDuel(duelSession);
    setGeneratedLoading(true);
    try {
      const nextSet = await apiPost<ArenaGeneratedSet>("/api/v1/arena/generate", {
        category,
        benchmark,
        rounds,
        mode: "duel",
        prompt,
        presetQuestions: duelSession.rounds.map((round) => round.question),
        suitabilityOverrideById,
        voteBonusById,
      });
      setGeneratedSet(nextSet);
      setShowGeneratedResult(true);
      setGeneratedError("");
      setDuelNotice("已基于匿名对战生成并写入后端，当前页面已展示后端结果。");
      setIsDuelModalOpen(false);
      setDuelSession(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "生成失败";
      setDuelNotice(`生成失败：${message}`);
      setGeneratedError(message);
    } finally {
      setGeneratedLoading(false);
    }
  }

  const currentRound = duelSession?.rounds[duelSession.currentIndex];
  return (
    <div className={styles.page}>
      <section className={`${styles.hero} section`}>
        <div className="container">
          <h1>评测竞技场</h1>
          <p className={styles.lead}>
            生成测试题并绑定用户画像，检验 AI 产品是否给出符合适当性要求的答案。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            <article className={`card ${styles.configCard}`}>
              <div className={styles.panelHead}>
                <div className={styles.panelIntro}>
                  <h2>评测配置</h2>
                  <p>按类别、任务与轮次生成当前回合的匿名对战配置。</p>
                </div>
              </div>

              <div className={styles.configBody}>
                <div className={styles.controlGroup}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>产品类别</span>
                    <select
                      value={category}
                      onChange={(event) => handleCategoryChange(event.target.value as ProductCategory)}
                    >
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <span className={styles.fieldHint}>同类别产品独立对比，避免跨形态混排。</span>
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>基准任务</span>
                    <select
                      value={benchmark}
                      onChange={(event) =>
                        setBenchmark(event.target.value as (typeof benchmarkOptions)[number]["value"])
                      }
                    >
                      {benchmarkOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <span className={styles.fieldHint}>控制当前对战更偏投顾、客服合规或风控任务。</span>
                  </label>
                </div>

                <label className={styles.rangeField}>
                  <div className={styles.rangeHead}>
                    <span className={styles.fieldLabel}>评测轮次</span>
                    <strong>{rounds} 轮</strong>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={20}
                    step={1}
                    value={rounds}
                    onChange={(event) => setRounds(Number(event.target.value))}
                  />
                  <div className={styles.rangeScale}>
                    <span>4 轮</span>
                    <span>12 轮</span>
                    <span>20 轮</span>
                  </div>
                </label>
              </div>

              <div className={styles.configFooter}>
                <div className={styles.actions}>
                  <button type="button" className="btn btnPrimary" onClick={startAnonymousDuel}>
                    生成题目并开始匿名对战
                  </button>
                  <button type="button" className="btn btnGhost" onClick={handleGenerateDirectly}>
                    快速生成评测榜单
                  </button>
                  {duelSession ? (
                    <button
                      type="button"
                      className="btn btnGhost"
                      onClick={() => setIsDuelModalOpen(true)}
                    >
                      继续当前匿名对战
                    </button>
                  ) : null}
                </div>

                {duelNotice ? <p className={styles.notice}>{duelNotice}</p> : null}
              </div>
            </article>

            <article className={`card ${styles.baseCard}`}>
              <div className={styles.panelHead}>
                <div>
                  <h2>当前类别基础样本</h2>
                </div>
              </div>
              <div className={`${styles.tableWrap} ${styles.baseTableWrap}`}>
                <table className={styles.baseTable}>
                  <thead>
                    <tr>
                      <th>产品</th>
                      <th>机构</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baseItemsLoading ? (
                      <tr>
                        <td colSpan={2}>正在加载基础样本...</td>
                      </tr>
                    ) : baseItems.length > 0 ? (
                      baseItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className={styles.baseProductCell}>
                              <ProductLogo
                                productId={item.id}
                                organization={item.organization}
                                name={item.name}
                                size="sm"
                              />
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td>{item.organization}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2}>{baseItemsError || "暂无基础样本数据"}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className={`card ${styles.resultCard}`}>
            <h2>竞技场生成结果</h2>
            {!showGeneratedResult ? (
              <p className={styles.placeholder}>当前还没有竞技场生成结果，请先完成匿名对战或快速生成评测榜单。</p>
            ) : generatedLoading && !generatedSet ? (
              <p className={styles.placeholder}>正在加载后端竞技场结果...</p>
            ) : generatedSet ? (
                <>
                <p className={styles.generatedMeta}>
                  类别：{generatedSet.category} · 基准：{generatedSet.benchmark} · 时间：
                  {generatedSet.generatedAt.slice(0, 16).replace("T", " ")}
                </p>

                <section className={styles.questionSection}>
                  <h3>测试题与用户画像绑定</h3>
                  <p className={styles.ruleNote}>
                    每道题至少绑定 3 种用户画像，并重点检查保守型用户是否被误推荐高风险产品。
                  </p>
                  {generatedQuestions.length > 0 ? (
                    <ul className={styles.questionList}>
                      {generatedQuestions.map((question) => (
                        <li key={question.id}>
                          <header>
                            <strong>
                              {question.id} · {question.title}
                            </strong>
                            <span>画像数：{question.personaCodes.length}</span>
                          </header>
                          <p>{question.prompt}</p>
                          <p className={styles.focus}>检验重点：{question.focus}</p>
                          <div className={styles.personaChips}>
                            {question.personaCodes.map((code) => (
                              <span key={code}>
                                {code} {personaMap.get(code)?.label ?? ""}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.placeholder}>当前记录暂无题目明细，请重新生成一次评测结果。</p>
                  )}
                </section>

                <div className={`${styles.tableWrap} ${styles.generatedTableWrap}`}>
                  <table className={styles.generatedTable}>
                    <thead>
                      <tr>
                        <th>排名</th>
                        <th>产品</th>
                        <th>综合分</th>
                        <th>业务分</th>
                        <th>合规分</th>
                        <th>适当性通过率</th>
                        <th>通过题次</th>
                        <th>保守型错配</th>
                        <th>Δ综合</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedSet.items.map((item, index) => {
                        const origin = baseMap.get(item.id);
                        const suitabilitySummary = generatedSuitability.find(
                          (summary) => summary.id === item.id,
                        );
                        const delta = origin ? item.overallScore - origin.overallScore : 0;
                        return (
                          <tr
                            key={item.id}
                            className={
                              index === 0
                                ? styles.generatedRowFirst
                                : index === 1
                                  ? styles.generatedRowSecond
                                  : index === 2
                                    ? styles.generatedRowThird
                                    : ""
                            }
                          >
                            <td>
                              <span className={styles.generatedRankChip}>No.{index + 1}</span>
                            </td>
                            <td>
                              <div className={styles.generatedProductCell}>
                                <ProductLogo
                                  productId={item.id}
                                  organization={origin?.organization}
                                  name={origin?.name ?? item.id}
                                  size="sm"
                                />
                                <span>{origin?.name ?? item.id}</span>
                              </div>
                            </td>
                            <td className={styles.generatedStrongValue}>{item.overallScore}</td>
                            <td>{item.businessScore}</td>
                            <td>{item.complianceScore}</td>
                            <td>{suitabilitySummary?.suitabilityRate ?? 0}%</td>
                            <td className={styles.generatedMutedValue}>
                              {suitabilitySummary?.passCount ?? 0}/{suitabilitySummary?.totalCount ?? 0}
                            </td>
                            <td>{suitabilitySummary?.conservativeMismatch ?? 0}</td>
                            <td className={delta >= 0 ? styles.deltaUp : styles.deltaDown}>
                              {delta >= 0 ? `+${delta}` : delta}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                </>
            ) : (
              <p className={styles.placeholder}>
                {generatedError || "当前类别还没有后端竞技场结果，请先完成一次评测生成。"}
              </p>
            )}
          </article>
        </div>
      </section>

      {isDuelModalOpen && duelSession && currentRound ? (
        <div className={styles.duelOverlay} role="presentation" onClick={() => setIsDuelModalOpen(false)}>
          <div
            className={styles.duelModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="arena-duel-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.duelModalHeader}>
              <div className={styles.duelModalTitle}>
                <p className={styles.duelModalEyebrow}>Anonymous Arena</p>
                <h2 id="arena-duel-title">匿名模型对战</h2>
                <p className={styles.duelMeta}>
                  当前进度：第 {duelSession.currentIndex + 1}/{duelSession.rounds.length} 题
                </p>
              </div>
              <button
                type="button"
                className={styles.duelClose}
                onClick={() => setIsDuelModalOpen(false)}
                aria-label="关闭匿名模型对战弹窗"
              >
                关闭
              </button>
            </div>

            <div className={styles.duelModalBody}>
              <div className={styles.questionBlock}>
                <h3>{currentRound.question.title}</h3>
                <p>{currentRound.question.prompt}</p>
                <p className={styles.focus}>检验重点：{currentRound.question.focus}</p>
                <div className={styles.personaChips}>
                  {currentRound.question.personaCodes.map((code) => (
                    <span key={code}>
                      {code} {personaMap.get(code)?.label ?? ""}
                    </span>
                  ))}
                </div>
              </div>

              {currentRound.messages.length > 0 ? (
                <div className={styles.chatBox}>
                  <ul className={styles.chatList}>
                    {currentRound.messages.map((message, index) => (
                      <li key={`${message.role}-${index}`} className={styles[`msg${message.role.toUpperCase()}`]}>
                        <strong>{message.role === "user" ? "提问" : `匿名模型${message.role}`}</strong>
                        <p>{message.content}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!currentRound.revealed ? (
                <div className={styles.duelActions}>
                  <div className={styles.actions}>
                    {!currentRound.checks ? (
                      <button type="button" className="btn btnPrimary" onClick={askAnonymousModels}>
                        向匿名模型提问
                      </button>
                    ) : (
                      <>
                        <button type="button" className="btn btnGhost" onClick={() => voteCurrentRound("A")}>
                          投票给匿名模型A
                        </button>
                        <button type="button" className="btn btnGhost" onClick={() => voteCurrentRound("B")}>
                          投票给匿名模型B
                        </button>
                        <button type="button" className="btn btnGhost" onClick={() => voteCurrentRound("tie")}>
                          平票
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.revealBlock}>
                  <h3>投票完成，模型名称已揭示</h3>
                  <div className={styles.revealModelRow}>
                    <ProductLogo
                      productId={duelSession.models.A.id}
                      organization={duelSession.models.A.organization}
                      name={duelSession.models.A.name}
                      size="sm"
                    />
                    <p>
                      匿名模型A：{duelSession.models.A.name}（{duelSession.models.A.organization}）
                    </p>
                  </div>
                  <div className={styles.revealModelRow}>
                    <ProductLogo
                      productId={duelSession.models.B.id}
                      organization={duelSession.models.B.organization}
                      name={duelSession.models.B.name}
                      size="sm"
                    />
                    <p>
                      匿名模型B：{duelSession.models.B.name}（{duelSession.models.B.organization}）
                    </p>
                  </div>
                  <div className={styles.checkGrid}>
                    <div>
                      <strong>模型A适当性</strong>
                      <p>
                        通过 {currentRound.checks?.A.passCount ?? 0}/{currentRound.checks?.A.totalCount ?? 0}
                        ，保守型错配 {currentRound.checks?.A.conservativeMismatch ?? 0}
                      </p>
                    </div>
                    <div>
                      <strong>模型B适当性</strong>
                      <p>
                        通过 {currentRound.checks?.B.passCount ?? 0}/{currentRound.checks?.B.totalCount ?? 0}
                        ，保守型错配 {currentRound.checks?.B.conservativeMismatch ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    {duelSession.currentIndex < duelSession.rounds.length - 1 ? (
                      <button type="button" className="btn btnPrimary" onClick={moveToNextRound}>
                        下一题
                      </button>
                    ) : (
                      <button type="button" className="btn btnPrimary" onClick={finalizeDuelAndGenerate}>
                        完成对战并生成评测榜单
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
