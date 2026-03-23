import type { AwardItem } from "@/types/evaluation";

const awards: AwardItem[] = [
  {
    year: 2026,
    awardName: "年度最佳金融AI产品",
    winner: "AntFinGLM 财富助手",
    organization: "蚂蚁集团",
    category: "金融大模型",
  },
  {
    year: 2026,
    awardName: "最佳风控AI",
    winner: "天机认知风控大模型",
    organization: "网商银行",
    category: "金融大模型",
  },
  {
    year: 2026,
    awardName: "最佳客服AI",
    winner: "问财 HithinkGPT 客服版",
    organization: "同花顺",
    category: "金融大模型",
  },
  {
    year: 2026,
    awardName: "最佳营销AI",
    winner: "平安智能投顾",
    organization: "平安科技",
    category: "金融智能体",
  },
  {
    year: 2026,
    awardName: "最具创新AI",
    winner: "LongPort MCP",
    organization: "长桥证券",
    category: "MCP",
  },
  {
    year: 2026,
    awardName: "年度新锐AI",
    winner: "盈米MCP",
    organization: "盈米基金",
    category: "MCP",
  },
];

export function getAwardsByYear(year?: number): AwardItem[] {
  if (!year) return awards;
  return awards.filter((award) => award.year === year);
}

export function getAwardYears(): number[] {
  return Array.from(new Set(awards.map((award) => award.year))).sort((a, b) => b - a);
}
