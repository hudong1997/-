<template>
  <div class="edgeStyleContainer"> 
    <!-- 工具栏 -->
    <div width="15%" class="toolbarContainer">
      <el-row class="dragItems">
        <el-col>
          <!-- 拖拽元素 -->
          <ul>
            <li v-for="item in toolbarItems" :key="item['name']" ref="dragItem">
              {{item['title']}}
              <!-- <img src=item.imgPath> -->
            </li>
          </ul>
        </el-col>
      </el-row>
      
      <!-- 节点或者连线参数显示 -->
      <el-row>
        <el-col :span="24">
          <div class="paramters">
            <el-form class="Parameters" ref="Parameters" :model="Parameters" width = "10%">
              <div v-if="curNodeType === 3">
                <el-form-item label="管径：" v-model="Parameters.pipeDiameter" style="margin-bottom:0px">
                  {{Parameters.pipeDiameter}}
                </el-form-item>
                <el-form-item label="管长：" v-model="Parameters.pipeLong" style="margin-bottom:0px" >
                  {{Parameters.pipeLong}}
                </el-form-item>
              </div>
              <div v-else-if="curNodeType === 2">
                <el-form-item label="PWL：" v-model="Parameters.nodePWL" style="margin-bottom:0px">
                  {{Parameters.nodePWL}}
                </el-form-item>
              </div>
              <div v-else-if="curNodeType === 1">
                <el-form-item label="上游压力：" v-model="Parameters.startPressureUp" style="margin-bottom:0px">
                  {{Parameters.startPressureUp}}
                </el-form-item>
                <el-form-item label="下游压力：" v-model="Parameters.startPressureDown" style="margin-bottom:0px">
                  {{Parameters.startPressureDown}}
                </el-form-item>
                <el-form-item label="质量流量：" v-model="Parameters.startMassFlowRate" style="margin-bottom:0px">
                  {{Parameters.startMassFlowRate}}
                </el-form-item>
                <el-form-item label="上游温度：" v-model="Parameters.startTemperatureUp" style="margin-bottom:0px">
                  {{Parameters.startTemperatureUp}}
                </el-form-item>
                <el-form-item label="气体分子量：" v-model="Parameters.startMOL" style="margin-bottom:0px"> 
                  {{Parameters.startMOL}}
                </el-form-item>
                <el-form-item label="SFF：" v-model="Parameters.startSFF" style="margin-bottom:0px">
                  {{Parameters.startSFF}}
                </el-form-item>
                <el-form-item label="PWL：" v-model="Parameters.nodePWL" style="margin-bottom:0px">
                  {{Parameters.nodePWL}}
                </el-form-item>
              </div>
            </el-form>
          </div>
        </el-col>
      </el-row>

      <!-- 导入与导出 -->
      <div class="uplodes">

      <el-row class="quCalculate">
        <el-col :span="9">
            <el-button type="primary" @click="Export2File">导出</el-button>
        </el-col>
        <el-col :span="6"></el-col>
        <el-col :span="9">
          
          <el-upload :auto-upload="false" :show-file-list="false" action="" :on-change="ImportFromFile">
            <!-- <a class="text-btn">Import</a> -->
             <!-- <el-button type="primary" @click="Export2File">导出</el-button> -->
             <template>
                  <el-button type="primary" @click="ImportFromFile">导入</el-button>
             </template>
            <!-- <el-button type="primary" @click="ImportFromFile">导入</el-button> -->
          </el-upload>
        </el-col>
      </el-row>

      <!-- 确认提交计算 -->
      <el-row class="quCalculate">
        <el-col :span="9">
          <el-button type="primary" @click="calculate">计算</el-button>
        </el-col>
      </el-row>
      
      </div>
    </div>
    
    <!-- 绘图区域、计算结果 -->
    <div  class="mainContainer">
      <!-- 绘图区域 -->
      <div class="graphContainer" ref="container"></div>
      <!-- 计算结果 -->
      <div class="resultTable">
        <!-- 实例格式[{id: 1, pwl: 122}, {}] -->
        <el-table
          :data="tableData"
          height= "250"
          border
          style="width: 100%">
          <el-table-column
            prop="id"
            label="节点">
          </el-table-column>
          <el-table-column
            prop="PWL"
            label="PWL">
          </el-table-column>
        </el-table>
      </div>
    </div>
    

    <!-- 对话框 -->
    <change-status-dialog ref="dialog"/>
  
      <!-- 连线状态设置
      <div class="legendContainer">
        <ul>
          <li v-for="key in Object.keys(status)" :key="key">
            {{key}}
            <div class="legendColor" :style="{ background: status[key]}"></div>
          </li>
        </ul>
      </div> -->
  </div>
</template>

<script>
// import {
//   mxGraph as MxGraph,
//   mxUtils as MxUtils,
//   mxEvent as MxEvent,
//   mxCodec as MxCodec,
//   mxRubberband as MxRubberBand,
//   mxGraphHandler as MxGraphHandler,
//   mxUndoManager as MxUndoManager,
//   mxKeyHandler as MxKeyHandler,
//   mxFastOrganicLayout as MxFastOrganicLayout
// } from 'mxgraph/javascript/mxClient'

import mxgraph from "../../graph/index";
const {
  mxGraph,
  // mxClient,
  // mxDragSource,
  // mxCell,
  // mxRubberband,
  // mxVertexHandler,
  // mxConstants,
  // mxCellState,
  // mxPerimeter,
  // mxCellEditor,
  mxGraphHandler,
  mxEvent,
  // mxEdgeHandler,
  // mxShape,
  mxPoint,
  // mxEventObject,
  mxCodec,
  //mxObjectCodec,
  mxUtils,
  // mxImageExport,
  // mxXmlCanvas2D,
  // mxClipboard,
  // mxCodecRegistry,
  mxKeyHandler,
  mxUndoManager,
  // mxPoint,
  mxStyleRegistry,
  mxConstants,
  mxEdgeStyle,
  // mxShape,
  // mxConnectionConstraint,
} = mxgraph;

import { nodeType } from './constants';
import ChangeStatusDialog from '@/views/viberation/changeStatusDialog'

export default {
  name: 'viberation',
  components: {ChangeStatusDialog},
  data() {
    return {
      rubberBand: null,
      status: {
        success: '#008000',
        failed: '#ff0000',
      },
      tableData: [],
      toolbarItems: [
        {name: 'start', title: '起点', defaultStatus: 'success', imgPath: 'pipe/起点.png'},
        //{name: 'end', title: '结束节点', defaultStatus: 'success'},
        {
          name: 'node',
          title: '节流阀',
          defaultStatus: 'success',
          imgPath: 'pipe/节流阀.png',
          OptionalStatus: ['success', 'waiting', 'running', 'failed']
        },
        {
          name: 'node',
          title: '三通',
          defaultStatus: 'success',
          imgPath: 'pipe/三通.png',
          OptionalStatus: ['success', 'waiting', 'running', 'failed']
        }
      ],
      //拓扑图的参数传递
      statusMap: {},
      Graph: null,
      NodeId: 1,
      StartId: 1,
      curNodeType: nodeType.startNode,
      resultPWL: new Map(),
      //数据双向绑定，显示参数
      Parameters: {
        pipeLong: null,
        pipeDiameter: null,
        nodePWL: null,
        startPressureUp:null,
        startPressureDown:null,
        startMassFlowRate:null,
        startTemperatureUp:null,
        startMOL:null,
        startSFF:null,
      },
    }
  },
  methods: {
    setEdgeColor(edge, color) {
      const style = this.R.prop('style', this.graph.view.getState(edge, true))

      style['strokeColor'] = color
      let styleStr = ''

      this.R.forEachObjIndexed((value, key) => {
        styleStr += `${key}=${value};`
      }, style)
      edge.setStyle(styleStr);

      this.graph.refresh(edge)
    },

    createGraph() {
      this.graph = new mxGraph(this.$refs.container);
      this.$refs.container.style.background = 'url("./mxgraph/images/grid.gif")'
    },

    initGraph() {
      if (this.R.isNil(this.graph)) {
        return
      }
      //this.rubberBand = new mxRubberBand(this.graph)
      //撤销与还原的初始化
      this.undoMng = new mxUndoManager();
      let listener = (sender, evt) => {
        this.undoMng.undoableEditHappened(evt.getProperty('edit'));
      };
      this.graph.getModel().addListener(mxEvent.UNDO, listener);
      this.graph.getView().addListener(mxEvent.UNDO, listener);
      
      this.keyHandler = new mxKeyHandler(this.graph)
      this.keyHandler.bindControlKey(90, () => {
        this.undoMng.undo()
      })
      this.keyHandler.bindControlKey(89, () => {
        this.undoMng.redo()
      })

      //test anchors可连接节点
      // mxGraph.prototype.getAllConnectionConstraints = function(terminal,source) {
      //   if (terminal != null && terminal.shape != null) {
      //       if (terminal.shape.stencil != null) {
      //           if (terminal.shape.stencil != null) {
      //               return terminal.shape.stencil.constraints;
      //           }
      //       } else if (terminal.shape.constraints != null) {
      //           return terminal.shape.constraints;
      //       }
      //   }
      //   return null;
      // };
      // //设置节点位置、数量、可编辑状态
      // mxShape.prototype.constraints = [
      //   //new mxConnectionConstraint(new mxPoint(0.25, 0), true),
      //   new mxConnectionConstraint(new mxPoint(0.5, 0), true),
      //   //new mxConnectionConstraint(new mxPoint(0.75, 0), true),
      //  // new mxConnectionConstraint(new mxPoint(0, 0.25), true),
      //   new mxConnectionConstraint(new mxPoint(0, 0.5), true),
      //   // new mxConnectionConstraint(new mxPoint(0, 0.75), true),
      //   // new mxConnectionConstraint(new mxPoint(1, 0.25), true),
      //   new mxConnectionConstraint(new mxPoint(1, 0.5), true),
      //   // new mxConnectionConstraint(new mxPoint(1, 0.75), true),
      //   // new mxConnectionConstraint(new mxPoint(0.25, 1), true),
      //   new mxConnectionConstraint(new mxPoint(0.5, 1), true)
      //   // new mxConnectionConstraint(new mxPoint(0.75, 1), true)
      // ];
      //test

      //其他初始化操作
      this.graph.setTooltips(true)
      this.graph.setConnectable(true)
      this.graph.setCellsEditable(false)
      this.graph.setAllowDanglingEdges(false)
      this.graph.setConnectableEdges(false);
      //this.graph.setEnabled(false);
      this.graph.setCellsResizable(false);//节点不可改变大小 

      //连线90度拐弯
      this.style = this.graph.getStylesheet().getDefaultEdgeStyle();
      this.style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
      mxEdgeStyle.MyStyle = function(state, source, target, points, result)
      {
        if (source != null && target != null)
        {
          if(Math.abs(source.getCenterX()-target.getCenterX()) <= 
            Math.abs(target.x-target.getCenterX())){
            return;
          }

          if(Math.abs(source.getCenterY()-target.getCenterY()) <= 
            Math.abs(target.y-target.getCenterY())){
            return;
          }

          if(points){
            var pt = new mxPoint(source.getCenterX(),target.getCenterY());
            // if(points[0].x === source.getCenterX()){
            //   //console.log(result)
            //   console.log('------->>'+points[0].x);
            //   console.log('------->>>'+source.getCenterX());
            //   pt = new mxPoint(target.getCenterX(), source.getCenterY());
            // }else{
            //   console.log('-------'+points[0].x);
            //   console.log('-------'+source.getCenterX());
            //   pt = new mxPoint(source.getCenterX(),target.getCenterY());
            // }
            if (mxUtils.contains(source, pt.x, pt.y))
            {
              pt.x = source.x + source.width;
            }
            result.push(pt);
            return;
          }

          pt = new mxPoint(target.getCenterX(), source.getCenterY());
          if (mxUtils.contains(source, pt.x, pt.y))
          {
            pt.y = source.y + source.height;           
          }
          result.push(pt);
        }
      };
      mxStyleRegistry.putValue('myEdgeStyle', mxEdgeStyle.MyStyle);
      this.style[mxConstants.STYLE_EDGE] = mxEdgeStyle.MyStyle;


      mxGraphHandler.prototype.guidesEnabled = true
      this.graph.convertValueToString = (cell) => {
        return this.R.prop('customerTitle', cell)
      }
      // 监听双击事件
      this.graph.addListener(mxEvent.DOUBLE_CLICK, (graph, evt) => { 
        let cell = this.R.pathOr([], ['properties', 'cell'], evt)
        //双击连线
        if(cell && cell.source){
          this.$refs.dialog.openDialog(cell,graph,this.Parameters)
          this.curNodeType = nodeType.line
        }
        //双击起点
        if (this.R.equals('start', cell['customerName'])) {
          this.$refs.dialog.openDialogStart(cell,graph,this.Parameters)
          this.curNodeType = nodeType.startNode
        }
        if (this.R.equals('Node', cell['customerName'])) {
          this.curNodeType = nodeType.normalNode
        }
      })

      //监听单击事件
      this.graph.addListener(mxEvent.CLICK, (graph, evt) => { 
        let cell = this.R.pathOr([], ['properties', 'cell'], evt)
        //单击连线
        if(cell && cell.source){
          this.Parameters.pipeLong = null;
          this.Parameters.pipeDiameter = null;
          if(cell.value){
            this.Parameters.pipeLong = cell.value.pipeLong;
            this.Parameters.pipeDiameter = cell.value.pipeDiameter;
          }
          this.curNodeType = nodeType.line
        }
        //单击起点
        if (this.R.equals('start', cell['customerName'])) {
          this.Parameters.startPressureUp = null;
          this.Parameters.startPressureDown = null;
          this.Parameters.startMassFlowRate = null;
          this.Parameters.startTemperatureUp = null;
          this.Parameters.startMOL = null;
          this.Parameters.startSFF = null;
          this.Parameters.nodePWL = null;
          if(cell.value){
            this.Parameters.startPressureUp = cell.value.PressureUp;
            this.Parameters.startPressureDown = cell.value.PressureDown;
            this.Parameters.startMassFlowRate = cell.value.MassFlowRate;
            this.Parameters.startTemperatureUp = cell.value.TemperatureUp;
            this.Parameters.startMOL = cell.value.MOL;
            this.Parameters.startSFF = cell.value.SFF;
            if(this.resultPWL.get(cell['customerTitle'])){
              this.Parameters.nodePWL = this.resultPWL.get(cell['customerTitle']);
            }
          }
          this.curNodeType = nodeType.startNode
        }
        //普通节点
        if (this.R.equals('Node', cell['customerName'])) {
          this.Parameters.nodePWL = null;
          if(this.resultPWL.get(cell['customerTitle'])){
            this.Parameters.nodePWL = this.resultPWL.get(cell['customerTitle']);
          }
          this.curNodeType = nodeType.normalNode
        }
      })

      //连接是否合法
      this.graph.connectionHandler.validateConnection = (source, target) => {
        const sourceName = source['customerName']
        const targetName = target['customerName']

        if (source === target) {
          return false
        }
        if (this.R.equals('end', sourceName)) {
          return false
        }
        if (this.R.equals('start', targetName)) {
          return false
        }
        if (this.R.equals('parallel', targetName) && ((target['edges'] instanceof Array && target['edges'].length >= 1) || this.R.equals('start', sourceName))) {
          return false
        }
        if (this.R.equals('branch', targetName) && this.R.equals('start', sourceName)) {
          return false
        }
        if (this.R.equals('Aggregation', targetName) && this.R.equals('start', sourceName)) {
          return false
        }
        return null
      }

      //对创建连线之后的连接线进行设置
      this.graph.connectionHandler.addListener(mxEvent.CONNECT, (sender, evt) => {
        // const edge = evt.getProperty('cell')
        // const source = edge['source']
        // const target = edge['target']
        //const status = source['customerStatus'] || 'default'
        // const status = 'success';
        // // console.log('--------->>>'+status);
        // // console.log(source);
        // const sourceName = source['customerName']
        // const targetName = target['customerName']

        //this.setEdgeColor(edge, this.status[status]);

        // this.style = this.graph.getStylesheet().getDefaultEdgeStyle();
        // this.style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
        //console.log(this.status+'------------->>'+this.status[status]);

        // if (sourceName === 'branch') {
        //   const targetStatus = ('success' === target['customerStatus'] || 'running' === target['customerStatus']) ? 'success' : 'waiting'

        //   this.setEdgeColor(edge, this.status[targetStatus])
        // }
        // if (targetName === 'Aggregation') {
        //   const edges = this.R.filter(this.R.propEq('target', target), this.R.propOr([], 'edges', target))
        //   const nodeStatus = this.R.map(this.R.path(['source', 'customerStatus']), edges)

        //   if (this.R.includes('waiting', nodeStatus) || this.R.includes('failed', nodeStatus)) {
        //     target['customerStatus'] = 'waiting'
        //   } else {
        //     target['customerStatus'] = 'success'
        //   }
        // }
      })
      this.Graph = this.graph;
    },

    makeItemDraggable() {
      this.$nextTick(() => {
        const domArray = this.$refs.dragItem

        if (!(domArray instanceof Array) || domArray.length <= 0 || this.R.isNil(this.graph)) {
          return
        }
        domArray.forEach((dom, domIndex) => {
          const toolItem = this.toolbarItems[domIndex]
          //在指定位置插入cell
          const dragHandler = (graph, evt, cell, x, y) => {
            this.instanceGraph(toolItem, x, y)
          }
          const createDragPreview = () => {
            const elt = document.createElement('div')

            elt.style.border = '2px dotted black'
            elt.style.width = '50px'
            elt.style.height = '50px'
            return elt
          }
          //构建拖动源，鼠标拖动实现向graph图中添加图形
          mxUtils.makeDraggable(dom, this.graph, dragHandler, createDragPreview(), 0, 0, false, true)
          //mxUtils.makeDraggable(img, graph, funct);
        })
      })
    },

    instanceGraph(toolItem, x, y) {
      const parent = this.graph.getDefaultParent()

      this.graph.getModel().beginUpdate()
      try {
        const statusMap = this.statusMap;
        var tmpId = toolItem['name'] + this.NodeId
        //let img1 = '';
        if(toolItem['name'] == "start"){
          tmpId = toolItem['name'] + this.StartId
          //img1 = 'image=./pipe/起点.png;';
        }else{
          // if(toolItem['title'] == "节流阀"){
          //   img1 = 'image=./pipe/节流阀.png;';
          // }else{
          //   img1 = 'image=./pipe/三通.png;';
          // }
        }
        // const disabledStyle='shape=image;\
        //   verticalLabelPosition=bottom;\
        //   verticalAlign=top;';
        //const vertex = this.graph.insertVertex(parent, tmpId, null, x, y, 60, 60,disabledStyle+img1)
        const vertex = this.graph.insertVertex(parent, tmpId, null, x, y, 40, 40)
        const changeStatusHandler = this.changeStatusHandler
        vertex.customerOptionalStatus = toolItem['OptionalStatus'];
        vertex.customerName = toolItem['name'];
        if(toolItem['name'] == "start"){
          vertex.customerTitle = toolItem['name'] + this.StartId;
          ++this.StartId;
        }else{
          vertex.customerTitle = toolItem['name'] + this.NodeId;
          ++this.NodeId;
        }
        statusMap[vertex['id']] = toolItem['defaultStatus']
        vertex.customer = true

        Reflect.defineProperty(vertex, 'customerStatus', {
          set(value) {
            statusMap[vertex['id']] = value
            changeStatusHandler(vertex)
          },
          get() {
            return statusMap[vertex['id']]
          }
        })
        //console.log(statusMap[vertex['id']])
      } finally {
        this.graph.getModel().endUpdate()
      }
    },

    changeStatusHandler(cell) {
      const status = cell['customerStatus']

      this.R.propOr([], 'edges', cell).forEach((edge) => {
          console.log('-------------')
          console.log(this.status[status]);
          console.log('-------------')
        if (edge['source'] === cell) {
          this.setEdgeColor(edge, this.status[status])

          const nextCell = edge['target']
          const nextCellType = nextCell['customerName']
          // console.log('-------------')
          // console.log(this.status[status]);
          // console.log('-------------')
          // 下一个节点为普通节点
          if (this.R.equals('Node', nextCellType)) {
            if ('failed' === status) {
              nextCell['customerStatus'] = 'failed'
            }
            if ('waiting' === status || 'running' === status) {
              nextCell['customerStatus'] = 'waiting'
            }
          }
          // 下一个节点为聚合节点
          if (this.R.equals('Aggregation', nextCellType)) {
            const edges = this.R.filter(this.R.propEq('target', nextCell), this.R.propOr([], 'edges', nextCell))
            const nodeStatus = this.R.map(this.R.path(['source', 'customerStatus']), edges)

            if (this.R.includes('waiting', nodeStatus) || this.R.includes('failed', nodeStatus)) {
              nextCell['customerStatus'] = 'waiting'
            } else {
              nextCell['customerStatus'] = 'success'
            }
          }
          // 下一个节点为并行节点
          if (this.R.equals('parallel', nextCellType)) {
            if ('running' === status) {
              nextCell['customerStatus'] = 'waiting'
            } else {
              nextCell['customerStatus'] = status
            }
          }
        } else {
          const lastCell = edge['source']
          const lastCellType = lastCell['customerName']

          // 上一个节点为分支节点
          if (this.R.equals('branch', lastCellType)) {
            this.setEdgeColor(edge, this.status[('success' === status || 'running' === status) ? 'success' : 'waiting'])
          }
        }
      })
    },

    //导出拓扑图到文件中
    Export2File(){
      const encoder = new mxCodec();
      const curGraph = encoder.encode(this.graph.getModel());
      const xml = mxUtils.getPrettyXml(curGraph);

      const downLink = document.createElement('a');
      downLink.style.display = "none"; 
      downLink.download = 'graph.xml';
      const blob = new Blob([xml]);
      downLink.href = URL.createObjectURL(blob);

      document.body.appendChild(downLink);
      downLink.click();
      document.body.removeChild(downLink);
    },
    //从文件中导入拓扑图
    ImportFromFile(file){
      // var xml = '<diagram id="" tcn=""><mxGraphModel><root><Workflow value="Diagram" id="0"><mxCell/></Workflow><Layer value="Default Layer" id="1"><mxCell parent="0"/></Layer><mxCell id="2" value="Hello, World!" parent="1" vertex="1"><mxGeometry x="120" y="90" width="80" height="40" as="geometry"/></mxCell></root></mxGraphModel></diagram>';
      // var doc = mxUtils.parseXml(xml);
      // var codec = new mxCodec(doc);
      var path = URL.createObjectURL(file.raw)
      var req = mxUtils.load(path)
      var root = req.getDocumentElement()
      var codec = new mxCodec(root.ownerDocument)
      this.graph.getModel().beginUpdate()
      try {
        codec.decode(root, this.graph.getModel());
      } finally {
        this.graph.getModel().endUpdate()
      }
      //更新this.StartId，this.NodeId
      this.StartId = 1;
      this.NodeId = 1;
      var parent = this.Graph.getDefaultParent();
      var parentChildren = parent.children;
      for (var i = 0; i < parentChildren.length; i++) {
        var child = parentChildren[i];
        if (!child.isVisible()) {
          continue;
        }
        //区分连接线、节点
        if(child.isVertex()){
          if(child.customerName == "start"){
            ++this.StartId;
          }else{
            ++this.NodeId;
          }
        }
      }
    },

    DFS(startID,arrEdge,curStartMap){
      for(var index=0;index<arrEdge.length;++index){//遍历边
        if(arrEdge[index].SourceID == startID){
          var curStartId = arrEdge[index].SourceID;
          var curTargetId = arrEdge[index].TargetID;
          var curPipeLong = arrEdge[index].pipeLong;
          var curPipeDiameter = arrEdge[index].pipeDiameter;
          var PWLvalue = curStartMap.get(curStartId) - 60*curPipeLong/curPipeDiameter;
          // var values = [];
          // if(curStartMap.get(curTargetId)){//非第一次遍历到该节点
          //   values = curStartMap.get(curTargetId);
          // }
          // values.push(PWLvalue);
          curStartMap.set(curTargetId,PWLvalue);
          this.DFS(curTargetId,arrEdge,curStartMap);
        }
      }
    },
    calculate() {
      this.tableData = [];
      //console.log(this.Graph);
      var parent = this.Graph.getDefaultParent();
      var parentChildren = parent.children;
      var arrEdge = [];   //连接线
      var arrStart = []; //起点节点
      var AllStartsMapArr = [];//中间结果
      var MapIdPWL = new Map();//最终结果

      //获取所有cell信息
      for (var i = 0; i < parentChildren.length; i++) {
        var child = parentChildren[i];
        if (!child.isVisible()) {
          continue;
        }
        //区分连接线、节点
        if (child.isEdge()) {
          //值的完整性检查
          if (child.value === null){
            window.alert('请设双击' + child.source.id + "至" + child.target.id + '之间连接线，并设置参数');
            return;
          }
          var obj = new Object();
          obj.ID = child.id;
          obj.SourceID = child.source.id;
          obj.TargetID = child.target.id;
          obj.pipeDiameter = child.value.pipeDiameter;
          obj.pipeLong = child.value.pipeLong;
          arrEdge.push(obj)
        } else if (child.isVertex()) {
          if(child.customerName == "start"){//起点
            //值的完整性检查
            // if (child.value === null){
            //   window.alert('请双击' + child.id + '设置参数');
            //   return;
            // }
            var obj1 = new Object();
            obj1.ID = child.id;
            obj1.Name = child.customerName;
            // obj1.PressureUp = child.value.PressureUp;
            // obj1.PressureDown = child.value.PressureDown;
            // obj1.MassFlowRate = child.value.MassFlowRate;
            // obj1.TemperatureUp = child.value.TemperatureUp;
            // obj1.MOL = child.value.MOL;
            // obj1.SFF = child.value.SFF;

            obj1.PressureUp = parseFloat(55.52);
            obj1.PressureDown = parseFloat(2.5);
            obj1.MassFlowRate = parseFloat(157500);
            obj1.TemperatureUp = parseFloat(39);
            obj1.MOL = parseFloat(25.51);
            obj1.SFF = parseFloat(0);

            arrStart.push(obj1);
            var tmp1 = Math.pow((obj1.PressureUp-obj1.PressureDown)/obj1.PressureUp,3.6);
            var tmp2 = Math.pow(obj1.MassFlowRate/3600,2);
            var tmp3 = Math.pow((obj1.TemperatureUp+273.15)/obj1.MOL,1.2);
            var StartPWL = 10*Math.log(tmp1*tmp2*tmp3)/Math.log(10)+126.1+obj1.SFF;
            // console.log("-----------PWL-------------")
            // console.log(StartPWL);
            // console.log("-----------PWL-------------")
            MapIdPWL.set(child.id,StartPWL);
          }else{
            MapIdPWL.set(child.id,child.value);
          }
        }
      }
      //打印测试
      console.log("边：")
      console.log(arrEdge);
      console.log("起点：");
      console.log(arrStart);
      console.log("节点：");
      console.log(MapIdPWL);
      
      //遍历计算
      for(var j=0;j<arrStart.length;++j){
        var startID = arrStart[j].ID;
        var curStartMap = new Map();
        curStartMap.set(startID,MapIdPWL.get(startID));
        //console.log(start);
        //dfs遍历开始
        this.DFS(startID,arrEdge,curStartMap);
        AllStartsMapArr.push(curStartMap);
      }
      console.log("---------------------")
      console.log(AllStartsMapArr);
      //计算最终结果
      for (let curNodeID of MapIdPWL.keys()){
        var NodeValue = 0;
        for(let i=0;i<arrStart.length;++i){
           if(AllStartsMapArr[i].get(curNodeID)){
             NodeValue += Math.pow(10,AllStartsMapArr[i].get(curNodeID));
           }
        }
        MapIdPWL.set(curNodeID,Math.log(NodeValue)/Math.log(10));
        //[{id: 1, pwl: 122}, {}]
        this.tableData.push({id: curNodeID, PWL: Math.log(NodeValue)/Math.log(10)});
      }
      console.log("最终结果---------------------")
      console.log(MapIdPWL);
      this.resultPWL = MapIdPWL;
    }
  },
  
  mounted() {
    this.createGraph()
    this.initGraph()
    this.makeItemDraggable()
  }
}
</script>

<style lang="scss">
.edgeStyleContainer {
  .resultTable th{
    background: #f9f7f7
  };
  width: 100%;
  height: 100%;
  display: flex;
    .toolbarContainer{
      width: 200px !important;
      background: #f9f7f7;
      padding: 5px;
        .quCalculate{
          margin: 8px 0;
          width: 200px;
         text-align: center;

        }
        .dragItems{
          height: 150px;
          padding: 10px;
          background: #fff;
          ul li{
              float: left;
              border: 1px solid #ccc;
              padding: 5px;
              margin-left: 5px;
              font-size: 14px;
              font-weight: 100 !important;
              border-radius: 5px;
          }
        }
        .paramters{
            margin: 4px 0;
            height: 300px;
            background: #fff;
            padding-left: 10px;
        }
        .uplodes{
            // margin: 5px 0;
            background: #fff;
            padding-left: 4px;
            padding: 1px;
        }
    }
  // .legendContainer {
  //   position: absolute;
    
  //   top: 5%;
  //   right: 5%;
  //   z-index: 2;
  //   background-color: #fff;

  //   ul {
  //     padding: 0;
  //     margin: 0;
  //     height: 30%;
  //     li {
  //       list-style: none;
  //       .legendColor{
  //         display: inline-block;
  //         width: 10px;
  //         height: 10px;
  //       }
  //     }
  //   }
  // }

  .toolbarContainer {
    width: 10%;
    //flex: 1;
    height: 100%;
    .el-row {
      // margin-bottom: 2px;
      // //border:1px solid;
      // &:last-child {
      //   margin-bottom: 0;
      // }
      // &:first-child {
      //   margin-top: 20px;
      // }
      ul {
        height:100%;
        padding-left: 0;
        li {
          font-weight: 600;
          list-style: none;
          //margin-bottom: 5px;
          cursor: pointer;
          transition: all 0.5s;
          &:hover {
            background-color: #B4E1FF;
          }
        }
      }
    }
    
  }
  .mainContainer{
    margin-left: 5px;
    display: flex;
    flex-direction: column;
    width:90%;
    height:100%;
   
    //box-shadow: 12px  rgba(0, 0, 0, .12);
    .graphContainer{
      width: 100%;
      flex: 1;
      overflow: hidden;
      height: 500px;
      margin-bottom: 10px;
      border: 2px solid #f9f7f7;
    }
    .resultTable {
      height: 220px;
      overflow: hidden;
    }
  }

}
</style>

