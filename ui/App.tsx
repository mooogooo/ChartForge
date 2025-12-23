import "./App.css";
import { useState } from "react";
import { sendMsgToPlugin, UIMessage } from "@messages/sender";

function App() {
  const [rangeMax, setRangeMax] = useState(299);
  const [rangeMin, setRangeMin] = useState(60);

  function RenderButton(button: { text: string; onClick: () => void }) {
    return (
      <div
        className="text-gray-300/60 w-full h-full rounded-lg text-sm bg-[#2c2c2c] flex items-center justify-center cursor-pointer hover:bg-[#3a3a3a] transition-colors hover:text-[#fff]"
        onClick={button.onClick}
      >
        {button.text}
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E] px-3 py-4 gap-4 flex flex-col w-[260px] h-[500px]  text-white  select-none">
      <div className=" flex items-center justify-between w-full">
        <div className="">
          图表锻造<span className="ml-3 text-xs opacity-60">Chart Forge</span>
        </div>
        <div className="w-5 h-5 relative group">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="rgba(255,255,255,0.5)"
            >
              <path d="M12 22C6.47715 22 2 17.5228 2 12 2 6.47715 6.47715 2 12 2 17.5228 2 22 6.47715 22 12 22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12 20 7.58172 16.4183 4 12 4 7.58172 4 4 7.58172 4 12 4 16.4183 7.58172 20 12 20ZM13 10.5V15H14V17H10V15H11V12.5H10V10.5H13ZM13.5 8C13.5 8.82843 12.8284 9.5 12 9.5 11.1716 9.5 10.5 8.82843 10.5 8 10.5 7.17157 11.1716 6.5 12 6.5 12.8284 6.5 13.5 7.17157 13.5 8Z"></path>
            </svg>
          </div>
          <div className="absolute right-0 top-6 w-48 p-4 bg-[#272727]/90 text-xs text-gray-400 rounded-lg z-50 flex gap-2 flex-col transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0">
           <div className="font-bold">Tips</div>
            <div>高度：每个对象底边不动，高度增加20%-50%</div>
            <div>增量：高度增加10%-30%</div>
            <div>范围：在默认值或用户指定范围内随机高度</div>
            <div>折线：每个点的高度随机增加-20%至+50%之间</div>
            <div>生成点：在节点上生成8px的点，建议在容器内使用</div>
            <div>饼图：多选圆形后，点击可随机分配弧度</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm">柱状图</div>
        <div className="flex gap-2 h-16 ">
          <RenderButton
            text="高度随机"
            onClick={() => {
              sendMsgToPlugin({
                type: UIMessage.RANDOMIZE_HEIGHT_FLUCTUATE,
                data: null,
              });
            }}
          />
          <RenderButton
            text="增量随机"
            onClick={() => {
              sendMsgToPlugin({
                type: UIMessage.RANDOMIZE_HEIGHT_INCREMENT,
                data: null,
              });
            }}
          />
        </div>
        <div className="flex gap-2  h-16 ">
          <div className="w-2/3">
            <RenderButton
              text="范围随机"
              onClick={() => {
                sendMsgToPlugin({
                  type: UIMessage.RANDOMIZE_HEIGHT_RANGE,
                  data: { rangeMin, rangeMax },
                });
              }}
            />
          </div>
          <div className="h-full flex flex-col gap-2 w-1/3 text-xs">
            <input
              className="text-[#C8C8c8]  text-center w-full h-full rounded-lg text-md bg-[#2c2c2c] flex items-center justify-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-number-spin-box]:appearance-none"
              type="number"
              value={rangeMax}
              onChange={(e) => setRangeMax(Number(e.target.value) || 299)}
            />

            <input
              className="text-[#C8C8c8]  text-center w-full h-full rounded-lg text-md bg-[#2c2c2c] flex items-center justify-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-number-spin-box]:appearance-none"
              type="number"
              value={rangeMin}
              onChange={(e) => setRangeMin(Number(e.target.value) || 60)}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm ">折线图</div>
        <div className="flex  gap-2  h-16 ">
          <div className="w-2/3">
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
          <div className="w-1/3">
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
        <div className="text-sm ">饼图</div>
        <div className="flex  gap-2  h-16 ">
          <RenderButton
            text="随机"
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
