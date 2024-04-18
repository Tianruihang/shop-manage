<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="矿机名称" prop="name">
            <Input type="text" v-model="searchForm.name" placeholder="请输入矿机名" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="矿机价格" prop="price">
            <Input type="text" v-model="searchForm.price" placeholder="请输入矿机价格" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="限制购买数量" prop="limitNum">
            <Input type="text" v-model="searchForm.limitNum" placeholder="请输入限制购买数量" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="矿机有效时长" prop="limitHours">
            <Input type="text" v-model="searchForm.limitHours" placeholder="请输入矿机有效时长" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="每小时产出" prop="hourPoints">
            <Input type="text" v-model="searchForm.hourPoints" placeholder="请输入每小时产出" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="算力" prop="power">
            <Input type="text" v-model="searchForm.power" placeholder="请输入算力" clearable
                   style="width: 200px"/>
          </Form-item>
          <!-- 提交 -->
          <Form-item>
            <Button type="primary" @click="updateRuleSubmit">更新规则</Button>
          </Form-item>
        </Form>
      </Row>
    </Card>
  </div>
</template>
<script>
import multipleMap from "@/components/map/multiple-map";
import * as API_Rule from "@/api/atmMingMachine.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import {getAtmMingMachineInfo, insertAtmMingMachine, updateAtmMingMachine} from "../../../api/atmMingMachine";

export default {
  name: "TrendChart",
  components: {
    multipleMap,
    ossManage,
  },
  data() {
    return {
      defaultPic: require('@/assets/default.png'),
      descTitle: "", // modal标题
      descFlag: false, //编辑查看框
      loading: true, // 表单加载状态
      addFlag: false, // modal显隐控制
      visible: false,
      searchForm: {
        // 请求参数
        pageNumber: 1,
        pageSize: 10,
        order: "desc",
        username: "",
        mobile: "",
        disabled: "OPEN",
        id: "",
      },
      sendForm: {
        id: "",
      },
      previewImage: "",
      picModelFlag: false, // 选择图片
      form: {}, // 表单数据
      ruleValidate: {}, //修改验证
      data: [], // 表单数据
      total: 0, // 表单数据总数
      selectMember: [], //保存选中的用户
    };
  },
  props: {
    // 是否为选中模式
    selectedMember: {
      type: Boolean,
      default: false,
    },
    // 已选择用户数据
    selectedList: {
      type: null,
      default: () => {
        return [];
      },
    },
  },
  watch: {
    selectedList: {
      handler(val) {
        this.$set(this, "selectMember", JSON.parse(JSON.stringify(val)));
        this.init(this.data);
        // 将父级数据与当前组件数据进行匹配
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 回调给父级
    callback(val, index) {
      this.selectMember.forEach(item => {
        item.___selected = false
      })
      this.$set(val, "___selected", !val.___selected);
      console.log(val.___selected);
      console.log(this.selectMember);
      let findUser = this.selectMember.find((item) => {
        return item.id == val.id;
      });
      // 如果没有则添加
      if (!findUser) {
        this.selectMember.push(val);
      } else {
        // 有重复数据就删除
        this.selectMember.map((item, index) => {
          if (item.id == findUser.id) {
            this.selectMember.splice(index, 1);
          }
        });
      }

      this.$emit("callback", val);
    },

    // 初始化信息
    init(data) {
      this.searchForm.id = this.$route.query.id;
      data.forEach((item) => {
        if (this.selectMember.length != 0) {
          this.selectMember.forEach((member) => {
            if (member.id == item.id) {
              this.$set(item, "___selected", true);
            }
          });
        } else {
          this.$set(item, "___selected", false);
        }
      });
      this.data = data;
    },

    //查询规则列表
    getData() {
      API_Rule.getAtmMingMachineInfo(this.searchForm.id).then((res) => {
        this.searchForm = res.result;
        if (res.result.records) {
          this.loading = false;
          this.init(res.result.records);
          this.total = res.result.total;
        }
      });
    },
    orderStatusList2 (val) {
      let orderStatusList = {
        1: "平价区交易",
        2: "溢价区交易",
      };
      return orderStatusList[val];
    },
    // 根据订单状态查询订单码
    orderStatusList3 (val) {
      let orderStatusList = {
        "已创建": 0,
        "已完成": 1,
        "已取消": 2,
        "待付款": 3,
      };
      return orderStatusList[val];
    },
    //添加会员提交
    insertRuleSubmit() {
      this.$refs.searchForm.validate((valid) => {
        if (valid) {
          this.searchForm.name = this.searchForm.name;
          this.searchForm.price = parseFloat(this.searchForm.price);
          this.searchForm.limitHours = this.searchForm.limitHours;
          this.searchForm.limitNum = this.searchForm.limitNum;
          this.searchForm.hourPoints = parseFloat(this.searchForm.hourPoints);
          this.searchForm.sumPoints = parseFloat(this.searchForm.sumPoints);
          this.searchForm.power = this.searchForm.power;
          API_Rule.insertAtmMingMachine(this.searchForm).then((res) => {
            if (res.result) {
              this.$Message.success("新增成功！");
              //返回上一页
              this.$router.go(-1);
            }
          });
        }
      });
    },
    updateRuleSubmit() {
      this.$refs.searchForm.validate((valid) => {
        if (valid) {
          this.sendForm.id = this.searchForm.id;
          this.sendForm.name = this.searchForm.name;
          this.sendForm.price = parseFloat(this.searchForm.price);
          this.sendForm.limitHours = this.searchForm.limitHours;
          this.sendForm.limitNum = this.searchForm.limitNum;
          this.sendForm.hourPoints = parseFloat(this.searchForm.hourPoints);
          this.sendForm.sumPoints = parseFloat(this.searchForm.sumPoints);
          this.sendForm.power = this.searchForm.power;

          API_Rule.updateAtmMingMachine(this.sendForm).then((res) => {
            if (res.result) {
              this.$Message.success("修改成功！");
              //返回上一页
              this.$router.go(-1);
            }
          });
        }
      });
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
<style lang="scss" scoped>
/deep/ .ivu-table-wrapper {
  width: 100%;
}

/deep/ .ivu-card {
  width: 100%;
}

.face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
</style>
