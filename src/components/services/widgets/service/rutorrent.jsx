import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Rutorrent({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: statusData, error: statusError } = useSWR(formatApiUrl(config));

  if (statusError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!statusData) {
    return (
      <Widget>
        <Block label={t("rutorrent.active")} />
        <Block label={t("rutorrent.upload")} />
        <Block label={t("rutorrent.download")} />
      </Widget>
    );
  }

  const upload = statusData.reduce((acc, torrent) => acc + parseInt(torrent["d.get_up_rate"], 10), 0);

  const download = statusData.reduce((acc, torrent) => acc + parseInt(torrent["d.get_down_rate"], 10), 0);

  const active = statusData.filter((torrent) => torrent["d.get_state"] === "1");

  return (
    <Widget>
      <Block label={t("rutorrent.active")} value={active.length} />
      <Block label={t("rutorrent.upload")} value={t("common.bitrate", { value: upload })} />
      <Block label={t("rutorrent.download")} value={t("common.bitrate", { value: download })} />
    </Widget>
  );
}
