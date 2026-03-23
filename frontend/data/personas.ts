export interface UserPersona {
  code: string;
  label: string;
  scenario: string;
  riskLevel: "C" | "B" | "A";
  experience: "J" | "M" | "S";
  asset: "S" | "M" | "L";
}

const userPersonas: UserPersona[] = [
  { code: "C-J-S", label: "保守型+初级+小额", scenario: "退休老人，存款为主", riskLevel: "C", experience: "J", asset: "S" },
  { code: "C-J-M", label: "保守型+初级+中等", scenario: "工薪家庭，求稳", riskLevel: "C", experience: "J", asset: "M" },
  { code: "C-J-L", label: "保守型+初级+大额", scenario: "富裕但保守", riskLevel: "C", experience: "J", asset: "L" },
  { code: "C-M-S", label: "保守型+中级+小额", scenario: "稳健理财者", riskLevel: "C", experience: "M", asset: "S" },
  { code: "C-M-M", label: "保守型+中级+中等", scenario: "中产稳健型", riskLevel: "C", experience: "M", asset: "M" },
  { code: "C-M-L", label: "保守型+中级+大额", scenario: "富裕稳健型", riskLevel: "C", experience: "M", asset: "L" },
  { code: "C-S-S", label: "保守型+高级+小额", scenario: "专业但保守", riskLevel: "C", experience: "S", asset: "S" },
  { code: "C-S-M", label: "保守型+高级+中等", scenario: "专家级稳健", riskLevel: "C", experience: "S", asset: "M" },
  { code: "C-S-L", label: "保守型+高级+大额", scenario: "资深富裕保守", riskLevel: "C", experience: "S", asset: "L" },

  { code: "B-J-S", label: "平衡型+初级+小额", scenario: "年轻白领", riskLevel: "B", experience: "J", asset: "S" },
  { code: "B-J-M", label: "平衡型+初级+中等", scenario: "普通家庭", riskLevel: "B", experience: "J", asset: "M" },
  { code: "B-J-L", label: "平衡型+初级+大额", scenario: "年轻富裕", riskLevel: "B", experience: "J", asset: "L" },
  { code: "B-M-S", label: "平衡型+中级+小额", scenario: "成长型投资者", riskLevel: "B", experience: "M", asset: "S" },
  { code: "B-M-M", label: "平衡型+中级+中等", scenario: "典型中产", riskLevel: "B", experience: "M", asset: "M" },
  { code: "B-M-L", label: "平衡型+中级+大额", scenario: "中产偏进取", riskLevel: "B", experience: "M", asset: "L" },
  { code: "B-S-S", label: "平衡型+高级+小额", scenario: "有经验但谨慎", riskLevel: "B", experience: "S", asset: "S" },
  { code: "B-S-M", label: "平衡型+高级+中等", scenario: "专业平衡型", riskLevel: "B", experience: "S", asset: "M" },
  { code: "B-S-L", label: "平衡型+高级+大额", scenario: "资深中产", riskLevel: "B", experience: "S", asset: "L" },

  { code: "A-J-S", label: "激进型+初级+小额", scenario: "年轻激进投资者", riskLevel: "A", experience: "J", asset: "S" },
  { code: "A-J-M", label: "激进型+初级+中等", scenario: "大胆新手", riskLevel: "A", experience: "J", asset: "M" },
  { code: "A-J-L", label: "激进型+初级+大额", scenario: "富裕新手", riskLevel: "A", experience: "J", asset: "L" },
  { code: "A-M-S", label: "激进型+中级+小额", scenario: "进取型", riskLevel: "A", experience: "M", asset: "S" },
  { code: "A-M-M", label: "激进型+中级+中等", scenario: "典型进取", riskLevel: "A", experience: "M", asset: "M" },
  { code: "A-M-L", label: "激进型+中级+大额", scenario: "富裕进取", riskLevel: "A", experience: "M", asset: "L" },
  { code: "A-S-S", label: "激进型+高级+小额", scenario: "专业投资者", riskLevel: "A", experience: "S", asset: "S" },
  { code: "A-S-M", label: "激进型+高级+中等", scenario: "高手", riskLevel: "A", experience: "S", asset: "M" },
  { code: "A-S-L", label: "激进型+高级+大额", scenario: "顶级客户", riskLevel: "A", experience: "S", asset: "L" },
];

export function getUserPersonas(): UserPersona[] {
  return userPersonas;
}
