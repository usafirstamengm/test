import useSWR from "swr";
import { useState } from "react";
import { BiError } from "react-icons/bi";
import { WiCloudDown } from "react-icons/wi";
import { MdLocationDisabled, MdLocationSearching } from "react-icons/md";
import { useTranslation } from "react-i18next";

import Icon from "./icon";

function Widget({ options }) {
  const { t, i18n } = useTranslation();

  const { data, error } = useSWR(
    `/api/widgets/openweathermap?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`
  );

  if (error || data?.cod === 401 || data?.error) {
    return (
      <div className="flex flex-col justify-center first:ml-0 ml-4">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-col items-center">
            <BiError className="w-8 h-8 text-theme-800 dark:text-theme-200" />
            <div className="flex flex-col ml-3 text-left">
              <span className="text-theme-800 dark:text-theme-200 text-sm">{t("widget.api_error")}</span>
              <span className="text-theme-800 dark:text-theme-200 text-xs">-</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col justify-center first:ml-0 ml-4">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-col items-center">
            <WiCloudDown className="w-8 h-8 text-theme-800 dark:text-theme-200" />
          </div>
          <div className="flex flex-col ml-3 text-left">
            <span className="text-theme-800 dark:text-theme-200 text-sm">{t("weather.updating")}</span>
            <span className="text-theme-800 dark:text-theme-200 text-xs">{t("weather.wait")}</span>
          </div>
        </div>
      </div>
    );
  }

  const unit = options.units === "metric" ? "celsius" : "fahrenheit";

  return (
    <div className="flex flex-col justify-center first:ml-0 ml-4">
      <div className="flex flex-row items-center justify-end">
        <div className="flex flex-col items-center">
          <Icon
            condition={data.weather[0].id}
            timeOfDay={data.dt > data.sys.sunrise && data.dt < data.sys.sundown ? "day" : "night"}
          />
        </div>
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-sm">
            {options.label && `${options.label}, `}
            {t("common.number", { value: data.main.temp, style: "unit", unit })}
          </span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">{data.weather[0].description}</span>
        </div>
      </div>
    </div>
  );
}

export default function OpenWeatherMap({ options }) {
  const { t } = useTranslation();
  const [location, setLocation] = useState(false);
  const [requesting, setRequesting] = useState(false);

  if (!location && options.latitude && options.longitude) {
    setLocation({ latitude: options.latitude, longitude: options.longitude });
  }

  const requestLocation = () => {
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setRequesting(false);
      },
      () => {
        setRequesting(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000 * 60 * 60 * 3,
        timeout: 1000 * 30,
      }
    );
  };

  if (!requesting && !location) requestLocation();

  if (!location) {
    return (
      <button type="button" onClick={() => requestLocation()} className="flex flex-col justify-center first:ml-0 ml-4">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-col items-center">
            {requesting ? (
              <MdLocationSearching className="w-6 h-6 text-theme-800 dark:text-theme-200 animate-pulse" />
            ) : (
              <MdLocationDisabled className="w-6 h-6 text-theme-800 dark:text-theme-200" />
            )}
          </div>
          <div className="flex flex-col ml-3 text-left">
            <span className="text-theme-800 dark:text-theme-200 text-sm">{t("weather.current")}</span>
            <span className="text-theme-800 dark:text-theme-200 text-xs">{t("weather.allow")}</span>
          </div>
        </div>
      </button>
    );
  }

  return <Widget options={{ ...location, ...options }} />;
}
