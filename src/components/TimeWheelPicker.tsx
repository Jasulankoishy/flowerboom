import { Clock } from "lucide-react";
import { getMinDeliveryTime, isDeliveryTimeAllowed } from "../utils/deliveryTime";

interface TimeWheelPickerProps {
  value: string;
  deliveryDate: string;
  onChange: (value: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

const getParts = (value: string) => {
  const [hour = "", minute = ""] = value.split(":");
  return {
    hour: /^\d{2}$/.test(hour) ? hour : "12",
    minute: /^\d{2}$/.test(minute) ? minute : "00",
  };
};

export default function TimeWheelPicker({ value, deliveryDate, onChange }: TimeWheelPickerProps) {
  const { hour, minute } = getParts(value);
  const minTime = getMinDeliveryTime(deliveryDate);

  const chooseTime = (nextHour: string, nextMinute: string) => {
    const nextValue = `${nextHour}:${nextMinute}`;
    if (isDeliveryTimeAllowed(deliveryDate, nextValue)) {
      onChange(nextValue);
    }
  };

  const renderColumn = (items: string[], selected: string, type: "hour" | "minute") => (
    <div className="relative h-44 flex-1 overflow-y-auto rounded-2xl border border-slate-600 bg-slate-900/70 p-2 [scrollbar-width:none]">
      <div className="pointer-events-none sticky top-[4.4rem] z-10 h-10 rounded-xl border border-sky/40 bg-sky/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]" />
      <div className="space-y-1 py-16">
        {items.map((item) => {
          const nextHour = type === "hour" ? item : hour;
          const nextMinute = type === "minute" ? item : minute;
          const nextValue = `${nextHour}:${nextMinute}`;
          const disabled = !isDeliveryTimeAllowed(deliveryDate, nextValue);
          const isSelected = selected === item;

          return (
            <button
              key={item}
              type="button"
              disabled={disabled}
              onClick={() => chooseTime(nextHour, nextMinute)}
              className={`block h-10 w-full rounded-xl text-center text-lg font-black transition ${
                isSelected
                  ? "bg-sky text-ink"
                  : disabled
                    ? "cursor-not-allowed text-slate-700"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white-alt"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-sky" />
          <p className="text-sm font-black uppercase tracking-widest text-white-alt">Время доставки</p>
        </div>
        <span className="rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-xs font-black text-sky">
          {value || "--:--"}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {renderColumn(HOURS, hour, "hour")}
        <span className="text-2xl font-black text-sky">:</span>
        {renderColumn(MINUTES, minute, "minute")}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Доставим в течение 2 часов: для сегодняшней доставки выберите время не раньше {minTime}.
      </p>
    </div>
  );
}
