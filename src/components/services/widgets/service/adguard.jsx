import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function AdGuard({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: adguardData, error: adguardError } = useSWR(formatApiUrl(config, "stats"));

  if (adguardError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!adguardData) {
    return (
      <Widget>
        <Block label={t("adguard.queries")} />
        <Block label={t("adguard.blocked")} />
        <Block label={t("adguard.filtered")} />
        <Block label={t("adguard.latency")} />
      </Widget>
    );
  }

  const filtered =
    adguardData.num_replaced_safebrowsing + adguardData.num_replaced_safesearch + adguardData.num_replaced_parental;

  return (
    <Widget>
      <Block label={t("adguard.queries")} value={t("common.number", { value: adguardData.num_dns_queries })} />
      <Block label={t("adguard.blocked")} value={t("common.number", { value: adguardData.num_blocked_filtering })} />
      <Block label={t("adguard.filtered")} value={t("common.number", { value: filtered })} />
      <Block
        label={t("adguard.latency")}
        value={t("common.ms", { value: adguardData.avg_processing_time * 1000, style: "unit", unit: "millisecond" })}
      />
    </Widget>
  );
}
