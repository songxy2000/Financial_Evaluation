"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { apiPost } from "@/data/http";
import type { ApplicationFormInput } from "@/types/application";
import styles from "./ApplicationForm.module.css";

type FormErrors = Partial<Record<keyof ApplicationFormInput, string>>;

const initialData: ApplicationFormInput = {
  companyName: "",
  productName: "",
  productCategory: "",
  coreScenario: "",
  intro: "",
  contactName: "",
  contactTitle: "",
  contactPhone: "",
  contactEmail: "",
  attachments: "",
  agreementAccepted: false,
};

function validate(data: ApplicationFormInput): FormErrors {
  const errors: FormErrors = {};

  if (!data.companyName.trim()) errors.companyName = "请填写公司名称";
  if (!data.productName.trim()) errors.productName = "请填写产品名称";
  if (!data.productCategory.trim()) errors.productCategory = "请选择产品类型";
  if (!data.coreScenario.trim()) errors.coreScenario = "请填写核心业务场景";
  if (!data.intro.trim()) errors.intro = "请填写产品简介";
  if (!data.contactName.trim()) errors.contactName = "请填写联系人";
  if (!data.contactTitle.trim()) errors.contactTitle = "请填写职位";

  if (!/^1\d{10}$/.test(data.contactPhone.trim())) {
    errors.contactPhone = "请输入 11 位手机号";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail.trim())) {
    errors.contactEmail = "请输入有效邮箱地址";
  }

  if (!data.agreementAccepted) {
    errors.agreementAccepted = "请先同意条款";
  }

  return errors;
}

export default function ApplicationForm() {
  const [form, setForm] = useState<ApplicationFormInput>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitResult, setSubmitResult] = useState<{
    id: string;
    status: string;
    submittedAt: string;
  } | null>(null);

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    const name = target.name as keyof ApplicationFormInput;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const result = await apiPost<{
        id: string;
        status: string;
        submittedAt: string;
      }>("/api/v1/applications", form);

      setSubmitResult(result);
      setSubmitted(true);
      setForm(initialData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "提交失败，请稍后重试";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <h3>报名提交成功</h3>
        <p>我们已收到你的报名信息，评测团队将在 2 个工作日内与你联系。</p>
        {submitResult ? (
          <p>
            报名编号：<strong>{submitResult.id}</strong>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.grid}>
        <label>
          公司名称
          <input name="companyName" value={form.companyName} onChange={onChange} />
          {errors.companyName ? <span className={styles.error}>{errors.companyName}</span> : null}
        </label>

        <label>
          产品名称
          <input name="productName" value={form.productName} onChange={onChange} />
          {errors.productName ? <span className={styles.error}>{errors.productName}</span> : null}
        </label>

        <label>
          产品类型
          <select name="productCategory" value={form.productCategory} onChange={onChange}>
            <option value="">请选择</option>
            <option value="金融大模型">金融大模型</option>
            <option value="金融智能体">金融智能体</option>
            <option value="MCP">MCP</option>
            <option value="Skill">Skill</option>
            <option value="其他">其他</option>
          </select>
          {errors.productCategory ? <span className={styles.error}>{errors.productCategory}</span> : null}
        </label>

        <label>
          核心业务场景
          <input name="coreScenario" value={form.coreScenario} onChange={onChange} placeholder="如：智能客服、风控辅助分析" />
          {errors.coreScenario ? <span className={styles.error}>{errors.coreScenario}</span> : null}
        </label>

        <label>
          联系人
          <input name="contactName" value={form.contactName} onChange={onChange} />
          {errors.contactName ? <span className={styles.error}>{errors.contactName}</span> : null}
        </label>

        <label>
          职位
          <input name="contactTitle" value={form.contactTitle} onChange={onChange} />
          {errors.contactTitle ? <span className={styles.error}>{errors.contactTitle}</span> : null}
        </label>

        <label>
          手机号
          <input name="contactPhone" value={form.contactPhone} onChange={onChange} inputMode="numeric" />
          {errors.contactPhone ? <span className={styles.error}>{errors.contactPhone}</span> : null}
        </label>

        <label>
          邮箱
          <input name="contactEmail" value={form.contactEmail} onChange={onChange} type="email" />
          {errors.contactEmail ? <span className={styles.error}>{errors.contactEmail}</span> : null}
        </label>

        <label>
          附件链接（可选）
          <input name="attachments" value={form.attachments} onChange={onChange} placeholder="可填网盘/资料链接" />
        </label>
      </div>

      <label className={styles.full}>
        产品简介
        <textarea name="intro" value={form.intro} onChange={onChange} rows={5} />
        {errors.intro ? <span className={styles.error}>{errors.intro}</span> : null}
      </label>

      <label className={styles.checkbox}>
        <input type="checkbox" name="agreementAccepted" checked={form.agreementAccepted} onChange={onChange} />
        <span>我已阅读并同意评测条款与隐私说明</span>
      </label>
      {errors.agreementAccepted ? <span className={styles.error}>{errors.agreementAccepted}</span> : null}

      {submitError ? <p className={styles.error}>{submitError}</p> : null}

      <button type="submit" className="btn btnPrimary" disabled={submitting}>
        {submitting ? "提交中..." : "提交报名"}
      </button>
    </form>
  );
}
