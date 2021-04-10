<template>
  <div>
    <el-dialog title="管道参数" :visible="dialogVisible" width="30%">
      <!-- <template v-if="!R.isNil(mCell)">
        <el-radio-group v-model="mStatus">
          <el-radio v-for="status in mCell['customerOptionalStatus']" :key="status" :label="status">{{status}}</el-radio>
        </el-radio-group>
      </template> -->
      <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">

        <el-form-item label="管径(m)" prop="pipeDiameter">
          <el-input v-model="ruleForm.pipeDiameter" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="管长(mm)" prop="pipeLong">
          <el-input v-model="ruleForm.pipeLong"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
          <el-button type="primary" @click="submitForm('ruleForm')">确认</el-button>
        </el-form-item>

      </el-form>
    </el-dialog>

    <el-dialog title="起点声源参数" :visible="dialogVisibleStart" width="30%">
      <el-form :model="ruleForm1" status-icon :rules="rules1" ref="ruleForm1" label-width="100px" class="demo-ruleForm1">
        <el-form-item label="上游压力" prop="PressureUp">
          <el-input v-model="ruleForm1.PressureUp"></el-input>
        </el-form-item>

        <el-form-item label="下游压力" prop="PressureDown">
          <el-input v-model="ruleForm1.PressureDown"></el-input>
        </el-form-item>

        <el-form-item label="质量流量" prop="MassFlowRate">
          <el-input v-model="ruleForm1.MassFlowRate"></el-input>
        </el-form-item>

        <el-form-item label="上游温度" prop="TemperatureUp">
          <el-input v-model="ruleForm1.TemperatureUp"></el-input>
        </el-form-item>

        <el-form-item label="气体分子量" prop="MOL">
          <el-input v-model="ruleForm1.MOL"></el-input>
        </el-form-item>

        <el-form-item label="SFF" prop="SFF">
          <el-input v-model="ruleForm1.SFF"></el-input>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleStart = false">取消</el-button>
        <!-- <el-button @click="resetForm('strength')">重置</el-button> -->
        <el-button type="primary" @click="confirmStart('ruleForm1')">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'changeStatusDialog',
    data() {
      var checkDiameter = (rule, value, callback) => {
        if (!/^\d+(?=\.{0,1}\d+$|$)/.test(value)) {
          return callback(new Error('请输入正数'));
        }else{
          return callback();
        }
        // if (!Number.isInteger(value)) {
        //   callback(new Error('请输入数字值'));
        // } 
      };
      var checkLong = (rule, value, callback) => {
        if (!/^\d+(?=\.{0,1}\d+$|$)/.test(value)) {
          return callback(new Error('请输入正数'));
        }else{
          return callback();
        }
      };
      var checkPressureUp = (rule, value, callback) => {
        if (!/^\d+(?=\.{0,1}\d+$|$)/.test(value)) {
          return callback(new Error('请输入正数'));
        }else{
          return callback();
        }
      };
      var checkPressureDown = (rule, value, callback) => {
        if (!/^\d+(?=\.{0,1}\d+$|$)/.test(value)) {
          return callback(new Error('请输入正数'));
        }else{
          return callback();
        }
      };
      var checkMassFlowRate = (rule, value, callback) => {
        if (!/^\d+(?=\.{0,1}\d+$|$)/.test(value)) {
          return callback(new Error('请输入正数'));
        }else{
          return callback();
        }
      };
      var checkTemperatureUp = (rule, value, callback) => {
        if (!/^\d+(?=\.{0,1}\d+$|$)/.test(value)) {
          return callback(new Error('请输入正数'));
        }else{
          return callback();
        }
      };
      var checkMOL = (rule, value, callback) => {
        if (!/^\d+(?=\.{0,1}\d+$|$)/.test(value)) {
          return callback(new Error('请输入正数'));
        }else{
          return callback();
        }
      };
      var checkSFF = (rule, value, callback) => {
        if (!/^\d+(?=\.{0,1}\d+$|$)/.test(value)) {
          return callback(new Error('请输入正数'));
        }else{
          return callback();
        }
      };

      return {
        //传递过来的参数
        graph: null,
        mCell: null,
        //打开dialog
        dialogVisible: false,
        dialogVisibleStart: false,
        //双向绑定显示连接线参数
        Parameters:null,
        //检查双击连线后输入是否合法
        ruleForm: {
            pipeDiameter: '',
            pipeLong: '',
        },
        rules: {
          pipeDiameter: [
            { validator: checkDiameter, trigger: 'blur' }
          ],
          pipeLong: [
            { validator: checkLong, trigger: 'blur' }
          ],
        },
        //检查双击起点之后输入是否合法
        ruleForm1: {
            PressureUp:'',
            PressureDown:'',
            MassFlowRate:'',
            TemperatureUp:'',
            MOL:'',
            SFF:'',
          },

        rules1: {
          PressureUp: [
            { validator: checkPressureUp, trigger: 'blur' }
          ],
          PressureDown: [
            { validator: checkPressureDown, trigger: 'blur' }
          ],
          MassFlowRate: [
            { validator: checkMassFlowRate, trigger: 'blur' }
          ],
          TemperatureUp: [
            { validator: checkTemperatureUp, trigger: 'blur' }
          ],
          MOL: [
            { validator: checkMOL, trigger: 'blur' }
          ],
          SFF: [
            { validator: checkSFF, trigger: 'blur' }
          ],
        },
      }
    },
    methods: {
      //连接线参数dialog展开
      openDialog(cell,graph,Parameters) {
        this.mCell = cell;
        this.graph = graph;
        this.Parameters = Parameters;
        this.dialogVisible = true;
        // this.$nextTick(() => {
        //   this.mStatus = cell['customerStatus']
        // })
      },

      //起点参数dialog展开
      openDialogStart(cell,graph,Parameters) {
        this.mCell = cell
        this.graph = graph;
        this.Parameters = Parameters;
        this.dialogVisibleStart = true
        // this.$nextTick(() => {
        //   this.mStatus = cell['customerStatus']
        // })
      },

      //起点确认逻辑
      confirmStart(formName1) {
         this.$refs[formName1].validate((valid) =>{
           if(valid){
              console.log(this.mCell)
              this.dialogVisibleStart = false
              this.mCell.value = JSON.parse(JSON.stringify(this.ruleForm1));
              this.Parameters.startPressureUp = this.ruleForm1.PressureUp;
              this.Parameters.startPressureDown = this.ruleForm1.PressureDown;
              this.Parameters.startMassFlowRate = this.ruleForm1.MassFlowRate;
              this.Parameters.startTemperatureUp = this.ruleForm1.TemperatureUp;
              this.Parameters.startMOL = this.ruleForm1.MOL;
              this.Parameters.startSFF = this.ruleForm1.SFF;
              this.Parameters.pipeLong = null;
              this.Parameters.pipeDiameter = null;
              this.graph.refresh();
           }else{
             return false;
           }
         });
        //this.mCell['customerStatus'] = this.mStatus
      },

      //连接线确认逻辑
      submitForm(formName) {
          this.$refs[formName].validate((valid) => {

            if (valid) {
              this.dialogVisible = false
              //alert('submit!');
              //console.log(this.graph)
              console.log(this.mCell)
              //this.mCell.value = this.ruleForm;
              this.mCell.value = JSON.parse(JSON.stringify(this.ruleForm));
              this.Parameters.pipeLong = this.ruleForm.pipeLong;
              this.Parameters.pipeDiameter = this.ruleForm.pipeDiameter;
              this.Parameters.startPressureUp = null;
              this.Parameters.startPressureDown = null;
              this.Parameters.startMassFlowRate = null;
              this.Parameters.startTemperatureUp = null;
              this.Parameters.startMOL = null;
              this.Parameters.startSFF = null;
              this.graph.refresh();
            } else {
              console.log('error submit!!');
              return false;
            }
          });
      },
      // resetForm(formName) {
      //     this.$refs[formName].resetFields();
      // }
    }
  }

</script>

<style scoped>

</style>
