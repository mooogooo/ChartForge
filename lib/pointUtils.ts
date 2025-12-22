// 在PenNode位置生成EllipseNode的工具函数

export interface PointConfig {
  size?: number; // 椭圆大小
  strokeWidth?: number; // 描边宽度
}

export function generatePointsAtPenNodes(selection: readonly any[], config: PointConfig = {}) {
  if (selection.length === 0) {
    return { success: false, message: '请先选择一个路径物体' };
  }

  const defaultSize = 8;
  const defaultStrokeWidth = 2;
  
  const ellipseSize = config.size || defaultSize;
  const strokeWidth = config.strokeWidth || defaultStrokeWidth;
  
  var createdEllipses: any[] = [];

  for (var i = 0; i < selection.length; i++) {
    var element = selection[i];
    
    // 检查是否是路径物体（PenNode）
    if (element.type === 'PEN' && element.penNetwork !== undefined) {
      var penNetwork = element.penNetwork;
      
      // 检查是否包含nodes数组
      if (penNetwork.nodes && penNetwork.nodes.length > 0) {
        // 遍历每个node并在该位置创建EllipseNode
        for (var j = 0; j < penNetwork.nodes.length; j++) {
          var node = penNetwork.nodes[j];
          
          if (node.x !== undefined && node.y !== undefined) {
            try {
              // 计算椭圆的实际位置（中心对齐）
              const ellipseX = element.x + node.x;
              const ellipseY = element.y + node.y;
              
              // 使用MasterGo API创建新的椭圆节点
              if (typeof mg.createEllipse === 'function') {
                var newEllipse = mg.createEllipse();
                
                // 设置位置和大小（中心对齐）
                newEllipse.x = ellipseX - ellipseSize / 2;
                newEllipse.y = ellipseY - ellipseSize / 2;
                newEllipse.width = ellipseSize;
                newEllipse.height = ellipseSize;
                
                // 设置样式：填充白色，描边蓝色
                newEllipse.fills = [{
                  type: 'SOLID',
                  color: { r: 1, g: 1, b: 1, a: 1 } // 白色
                }];
                
                newEllipse.strokes = [{
                  type: 'SOLID',
                  color: { r: 0, g: 0.5, b: 1, a: 1 } // 蓝色
                }];
                newEllipse.strokeWeight = strokeWidth;
                
                // 添加到页面
                if (mg.document.currentPage.appendChild) {
                  mg.document.currentPage.appendChild(newEllipse);
                }
                
                // 添加到创建的数组中
                createdEllipses.push(newEllipse);
                
              } else {
                return { success: false, message: '当前环境不支持创建新的椭圆节点。请升级MasterGo或检查插件权限。' };
              }
              
            } catch (e) {
              return { success: false, message: '创建椭圆节点失败: ' + e };
            }
          }
        }
      } else {
        return { success: false, message: '选择的路径物体不包含nodes数组' };
      }
    } else {
      return { success: false, message: '选择的物体不是路径物体或不包含penNetwork' };
    }
  }
  
  // 如果成功创建了椭圆节点
  if (createdEllipses.length > 0) {
    try {
      // 提交到撤销历史
      if (typeof mg !== 'undefined' && mg.commitUndo) {
        mg.commitUndo();
      }
      
      return { success: true, message: `成功创建 ${createdEllipses.length} 个椭圆节点` };
      
    } catch (e) {
      return { success: false, message: '创建椭圆节点时发生错误: ' + e };
    }
  }
  
  return { success: true, message: `成功创建 ${createdEllipses.length} 个椭圆节点` };
}