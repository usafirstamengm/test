import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Portainer({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: containersData, error: containersError } = useSWR(formatApiUrl(config, `docker/containers/json?all=1`));

  if (containersError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!containersData) {
    return (
      <Widget>
        <Block label={t("portainer.running")} />
        <Block label={t("portainer.stopped")} />
        <Block label={t("portainer.total")} />
      </Widget>
    );
  }

  if (containersData.error) {
    return <Widget error={t("widget.api_error")} />;
  }

  const running = containersData.filter((c) => c.State === "running").length;
  const stopped = containersData.filter((c) => c.State === "exited").length;
  const total = containersData.length;

  return (
    <Widget>
      <Block label={t("portainer.running")} value={running} />
      <Block label={t("portainer.stopped")} value={stopped} />
      <Block label={t("portainer.total")} value={total} />
    </Widget>
  );
}
