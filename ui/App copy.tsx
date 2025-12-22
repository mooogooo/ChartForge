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

  return (
    <div
      className={`bg-[#1E1E1E] p-4 flex flex-col items-center w-[260px] h-[500px] pt-[16px] `}
    >
      <div className=" text-base font-bold w-full  bg-gradient-to-r pt-3 pb-4 from-blue-50 to-blue-500 bg-clip-text text-transparent flex items-center gap-2 ">
        <div className="w-5 h-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="rgba(70,146,221,1)"
          >
            <path d="M2 13H8V21H2V13ZM9 3H15V21H9V3ZM16 8H22V21H16V8Z"></path>
          </svg>
        </div>
        高度
      </div>

      <div className="flex flex-col gap-3 text-sm  w-full">
        {buttonConfig.map((button, index) => (
          <div key={index} className="flex flex-col gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-full "
              onClick={button.onClick}
            >
              {button.text}
            </button>
            <span className="text-gray-600 text-xs">{button.description}</span>
          </div>
        ))}
      </div>

      <div className=" text-base font-bold w-full  bg-gradient-to-r pt-3 pb-4 from-blue-50 to-blue-500 bg-clip-text text-transparent flex items-center gap-2 ">
        折线
      </div>
      <div className="flex flex-col gap-2">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-full  text-sm  "
          onClick={() => {
            sendMsgToPlugin({
              type: UIMessage.RANDOMIZE_PATH_POINTS,
              data: null,
            });
          }}
        >
          折线图随机
        </button>
      </div>

      <div className="text-white flex   items-center justify-between w-full">
        <div  className="text-sm font-bold">
          图表锻造<span className=" text-xs">Chart Forge</span>
        </div>
        <div className="w-5 h-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="rgba(173,184,194,1)"
          >
            <path d="M12 22C6.47715 22 2 17.5228 2 12 2 6.47715 6.47715 2 12 2 17.5228 2 22 6.47715 22 12 22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12 20 7.58172 16.4183 4 12 4 7.58172 4 4 7.58172 4 12 4 16.4183 7.58172 20 12 20ZM13 10.5V15H14V17H10V15H11V12.5H10V10.5H13ZM13.5 8C13.5 8.82843 12.8284 9.5 12 9.5 11.1716 9.5 10.5 8.82843 10.5 8 10.5 7.17157 11.1716 6.5 12 6.5 12.8284 6.5 13.5 7.17157 13.5 8Z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
export default App;
