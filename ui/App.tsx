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
      className={`bg-[#1E1E1E] p-4 flex flex-col items-center w-[${UI_WIDTH}px] h-[${UI_HEIGHT}px] pt-[16px] `}
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
      <div className="w-full h-[2px] mt-4 bg-gray-600"></div>
      <div className=" text-base font-bold w-full  bg-gradient-to-r pt-3 pb-4 from-blue-50 to-blue-500 bg-clip-text text-transparent flex items-center gap-2 ">
         <div className="w-5 h-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(70,146,221,1)"><path d="M5 3V19H21V21H3V3H5ZM19.9393 5.93934L22.0607 8.06066L16 14.1213L13 11.121L9.06066 15.0607L6.93934 12.9393L13 6.87868L16 9.879L19.9393 5.93934Z"></path></svg>
          </div>
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
           <div className="w-full h-[2px] mt-4 bg-gray-600"></div>

      <div className=" text-base font-bold w-full  bg-gradient-to-r pt-3 pb-4 from-blue-50 to-blue-500 bg-clip-text text-transparent flex items-center gap-2 ">
         <div className="w-5 h-5">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(70,146,221,1)"><path d="M16 16C17.6569 16 19 17.3431 19 19C19 20.6569 17.6569 22 16 22C14.3431 22 13 20.6569 13 19C13 17.3431 14.3431 16 16 16ZM6 12C8.20914 12 10 13.7909 10 16C10 18.2091 8.20914 20 6 20C3.79086 20 2 18.2091 2 16C2 13.7909 3.79086 12 6 12ZM14.5 2C17.5376 2 20 4.46243 20 7.5C20 10.5376 17.5376 13 14.5 13C11.4624 13 9 10.5376 9 7.5C9 4.46243 11.4624 2 14.5 2Z"></path></svg>
          </div>
        点
      </div>
      <div className="flex gap-2  text-sm ">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-full ">
          X 随机
        </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-full ">
         Y 随机
        </button>
      </div>
    </div>
  );
}
export default App;
