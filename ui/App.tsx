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
    <div className=" bg-[#1E1E1E] p-4 flex flex-col items-center w-[180px] h-[320px] pt-[16px]">
      <div className=" text-base font-bold w-full  bg-gradient-to-r pt-3 pb-4 from-blue-50 to-blue-500 bg-clip-text text-transparent flex items-center gap-2 ">
        <div className="w-5 h-5">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(70,146,221,1)"><path d="M2 13H8V21H2V13ZM9 3H15V21H9V3ZM16 8H22V21H16V8Z"></path></svg>

        </div>
        随机高度

        
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
            <span className="text-gray-600 text-xs">
              {button.description} 
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
export default App;