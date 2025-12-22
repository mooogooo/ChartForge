import React, { useState, useEffect } from "react";
import "./App.css";
import { sendMsgToPlugin, UIMessage } from "@messages/sender";

import {
  MIN_HEIGHT,
  HEIGHT_RANGE_MIN,
  HEIGHT_RANGE_MAX,
  FLUCTUATION_MIN,
  INCREMENT_MIN,
  INCREMENT_MAX,
  UI_WIDTH,
  UI_HEIGHT,
} from "../lib/constants";

function App() {
  // 按钮配置数组 - 将按钮数据与渲染逻辑分离
  // 这样可以更方便地管理和扩展按钮功能
  const buttonConfig = [
    {
      text: "随机高度",
      description: "随机加减50%",
      onClick: () => {
        sendMsgToPlugin({
          type: UIMessage.RANDOMIZE_HEIGHT_FLUCTUATE,
          data: null,
        });
      },
    },
    {
      text: "增量随机",
      description: "随机加20%-50%",
      onClick: () => {
        sendMsgToPlugin({
          type: UIMessage.RANDOMIZE_HEIGHT_INCREMENT,
          data: null,
        });
      },
    },
    {
      text: "范围随机",
      description: `${HEIGHT_RANGE_MIN}px-${HEIGHT_RANGE_MAX}px内随机切换`,
      onClick: () => {
        sendMsgToPlugin({
          type: UIMessage.RANDOMIZE_HEIGHT_RANGE,
          data: null,
        });
      },
    },
  ];

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
        <div className="w-5 h-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="rgba(255,255,255,0.5)"
          >
            <path d="M12 22C6.47715 22 2 17.5228 2 12 2 6.47715 6.47715 2 12 2 17.5228 2 22 6.47715 22 12 22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12 20 7.58172 16.4183 4 12 4 7.58172 4 4 7.58172 4 12 4 16.4183 7.58172 20 12 20ZM13 10.5V15H14V17H10V15H11V12.5H10V10.5H13ZM13.5 8C13.5 8.82843 12.8284 9.5 12 9.5 11.1716 9.5 10.5 8.82843 10.5 8 10.5 7.17157 11.1716 6.5 12 6.5 12.8284 6.5 13.5 7.17157 13.5 8Z"></path>
          </svg>
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
                  data: null,
                });
              }}
            />
          </div>
          <div className="h-full flex flex-col gap-2 w-1/3 text-xs">
            <input
              className="text-[#C8C8c8]  text-center w-full h-full rounded-lg text-md bg-[#2c2c2c] flex items-center justify-center placeholder:text-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-number-spin-box]:appearance-none"
              placeholder="299"
              type="number"
            />

            <input
              className="text-[#C8C8c8]  text-center w-full h-full rounded-lg text-md bg-[#2c2c2c] flex items-center justify-center placeholder:text-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-number-spin-box]:appearance-none"
              placeholder="0"
              type="number"
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
            <RenderButton text="生成点" onClick={() => {}} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm ">饼图</div>
        <div className="flex  gap-2  h-16 ">
          <RenderButton text="随机" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
}
export default App;
