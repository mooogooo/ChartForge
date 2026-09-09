import "./App.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sendMsgToPlugin, UIMessage } from "@messages/sender";

import qrCodeUrl from "../public/qr.png";

function notifyError(message: string) {
  sendMsgToPlugin({ type: UIMessage.NOTIFY_ERROR, data: message });
}

// Define outside App so parent renders never remount a focused input.
function ConfirmInput({
  label,
  value,
  onConfirm,
}: {
  label: string;
  value: number;
  onConfirm: (value: number) => boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const cancel = () => {
      setDraft(null);
      inputRef.current?.blur();
    };
    window.addEventListener("blur", cancel);
    return () => window.removeEventListener("blur", cancel);
  }, []);
  return (
    <input
      ref={inputRef}
      className="cf-input min-w-0 min-h-0 text-center w-full h-full rounded-[6px] border border-transparent"
      type="text"
      inputMode="numeric"
      aria-label={label}
      title="回车确认；Esc 或点击别处取消"
      value={draft ?? String(value)}
      onFocus={(e) => {
        setDraft(String(value));
        e.currentTarget.select();
      }}
      onClick={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => setDraft(null)}
      onKeyDown={(e) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setDraft(null);
          e.currentTarget.blur();
        } else if (e.key === "Enter") {
          e.preventDefault();
          const text = e.currentTarget.value.trim();
          if (!text) {
            notifyError(`请填写${label}`);
            return;
          }
          const number = Number(text);
          if (!Number.isSafeInteger(number) || number < 1) {
            notifyError("高度请输入大于 0 的整数");
            return;
          }
          if (onConfirm(number)) {
            setDraft(null);
            e.currentTarget.blur();
          }
        }
      }}
    />
  );
}

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = appRef.current;
    if (!element) return;
    let lastHeight = 0;
    const syncHeight = () => {
      // 测量内容本身，不使用随窗口变化的 body/scrollHeight，避免尺寸循环。
      const height = Math.ceil(element.getBoundingClientRect().height);
      if (height > 0 && height !== lastHeight) {
        lastHeight = height;
        sendMsgToPlugin({ type: UIMessage.RESIZE_UI, data: { height } });
      }
    };
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // Only confirmed values are used by chart actions.
  const [rangeMax, setRangeMax] = useState(299);
  const [rangeMin, setRangeMin] = useState(60);

  function randomizeRange() {
    sendMsgToPlugin({
      type: UIMessage.RANDOMIZE_HEIGHT_RANGE,
      data: { rangeMin, rangeMax },
    });
  }

  function RenderButton(button: { text: string; onClick: () => void }) {
    return (
      <div
        className="cf-button w-full h-full rounded-[6px] text-sm flex items-center justify-center cursor-pointer transition-colors"
        onClick={button.onClick}
      >
        {button.text}
      </div>
    );
  }

  return (
    <div
      ref={appRef}
      className="cf-app px-3 py-4 gap-4 flex flex-col w-[260px] h-auto select-none"
    >
      <div className=" flex items-center justify-between w-full">
        <div className="">
          图表锻造<span className="ml-3 text-xs opacity-60">chartForge</span>
        </div>
        <div className="w-4 h-4 relative group">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="cf-info-icon"
            >
              <path d="M12 22C6.47715 22 2 17.5228 2 12 2 6.47715 6.47715 2 12 2 17.5228 2 22 6.47715 22 12 22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12 20 7.58172 16.4183 4 12 4 7.58172 4 4 7.58172 4 12 4 16.4183 7.58172 20 12 20ZM13 10.5V15H14V17H10V15H11V12.5H10V10.5H13ZM13.5 8C13.5 8.82843 12.8284 9.5 12 9.5 11.1716 9.5 10.5 8.82843 10.5 8 10.5 7.17157 11.1716 6.5 12 6.5 12.8284 6.5 13.5 7.17157 13.5 8Z"></path>
            </svg>
          </div>
          <div className="cf-tooltip absolute right-0 top-6 w-48 p-4 text-xs rounded-lg z-50 flex gap-2 flex-col  transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0">
            <div className="font-bold">Tips</div>
            <div>高度：每个对象底边不动，高度改变</div>
            <div>范围：在设置的最大最小值内改变</div>
            <div>饼图：随机占比，白色或初始颜色时，自动添加蓝色填充</div>
            <br />
            <div>免费使用，随意打赏 ：）</div>
            <img
              src={qrCodeUrl}
              alt="qr"
              width={72}
              height={72}
              className="self-start shrink-0 bg-white rounded-[6px]"
              draggable={false}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-xs">柱状图</div>
        <div className="grid grid-cols-[2fr_1fr] gap-2 h-[130px]">
          <div className="min-w-0">
            <RenderButton
              text="随机高度"
              onClick={() => {
                sendMsgToPlugin({
                  type: UIMessage.RANDOMIZE_HEIGHT_FLUCTUATE,
                  data: null,
                });
              }}
            />
          </div>
          <div className="min-w-0 grid grid-rows-[1fr_1.6fr_1fr] gap-2 text-xs">
            <ConfirmInput
              label="随机高度上限"
              value={rangeMax}
              onConfirm={(value) => {
                if (value < rangeMin) {
                  notifyError("上限不能小于已确认的下限");
                  return false;
                }
                setRangeMax(value);
                return true;
              }}
            />

            <RenderButton text="范围随机" onClick={randomizeRange} />
            <ConfirmInput
              label="随机高度下限"
              value={rangeMin}
              onConfirm={(value) => {
                if (value > rangeMax) {
                  notifyError("下限不能大于已确认的上限");
                  return false;
                }
                setRangeMin(value);
                return true;
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-xs">折线图</div>
        <div className="grid grid-cols-[2fr_1fr] gap-2 h-12">
          <div className="min-w-0">
            <RenderButton
              text="随机折线"
              onClick={() => {
                sendMsgToPlugin({
                  type: UIMessage.RANDOMIZE_PATH_POINTS,
                  data: null,
                });
              }}
            />
          </div>
          <div className="min-w-0">
            <RenderButton
              text="生成点"
              onClick={() => {
                sendMsgToPlugin({
                  type: UIMessage.GENERATE_POINTS,
                  data: null,
                });
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-xs">饼图</div>
        <div className="flex gap-2 h-12 ">
          <RenderButton
            text="随机占比"
            onClick={() => {
              sendMsgToPlugin({
                type: UIMessage.RANDOMIZE_ARC_DATA,
                data: null,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
export default App;
