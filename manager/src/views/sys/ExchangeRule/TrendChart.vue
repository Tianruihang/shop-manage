<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="平价区最低价格" prop="minUsualPrice">
            <Input type="text" v-model="searchForm.minUsualPrice" placeholder="请输入平价区最低价格" clearable
                   style="width: 200px"/>
          </Form-item>

          <Form-item label="平价区最高价格" prop="maxUsualPrice">
            <Input type="text" v-model="searchForm.maxUsualPrice" placeholder="请输入平价区最高价格" clearable
                   style="width: 200px"/>
          </Form-item>

          <Form-item label="溢价区最低价格" prop="mobile">
            <Input type="text" v-model="searchForm.minOverPrice" placeholder="请输入溢价区最低价格" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="溢价区最高价格" prop="mobile">
            <Input type="text" v-model="searchForm.maxOverPrice" placeholder="请输入溢价区最低价格" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="手续费" prop="mobile">
            <Input type="text" v-model="searchForm.charge" placeholder="请输入手续费" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="一级返利" prop="mobile">
            <Input type="text" v-model="searchForm.receiptRebateFir" placeholder="请输入一级返利" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="二级返利" prop="mobile">
            <Input type="text" v-model="searchForm.receiptRebateSec" placeholder="请输入二级返利" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="三级返利" prop="mobile">
            <Input type="text" v-model="searchForm.receiptRebateThi" placeholder="请输入三级返利" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="充币返利" prop="mobile">
            <Input type="text" v-model="searchForm.payRebate" placeholder="请输入充币返利" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="提现返利" prop="mobile">
            <Input type="text" v-model="searchForm.cashRebate" placeholder="请输入提现返利" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="返利" prop="mobile">
            <Input type="text" v-model="searchForm.rebate" placeholder="请输入返利" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="开始时间" prop="mobile">
            <Input type="text" v-model="searchForm.startTime" placeholder="请输入开始时间" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="结束时间" prop="mobile">
            <Input type="text" v-model="searchForm.endTime" placeholder="请输入结束时间" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="交易类型" prop="mobile">
            <select v-model="searchForm.type" style="width: 200px">
              <option value="1" >平价区交易</option>
              <option value="2">溢价区交易</option>
            </select>
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
import * as API_Rule from "@/api/exchangeRule.js";
import ossManage from "@/views/sys/oss-manage/ossManage";

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
      API_Rule.getLastExchangeRule().then((res) => {
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
    updateRuleSubmit() {
      this.$refs.searchForm.validate((valid) => {
        if (valid) {
          //string转double
          this.searchForm.minUsualPrice = parseFloat(this.searchForm.minUsualPrice);
          this.searchForm.maxUsualPrice = parseFloat(this.searchForm.maxUsualPrice);
          this.searchForm.minOverPrice = parseFloat(this.searchForm.minOverPrice);
          this.searchForm.maxOverPrice = parseFloat(this.searchForm.maxOverPrice);
          this.searchForm.charge = parseFloat(this.searchForm.charge);
          this.searchForm.receiptRebateFir = parseFloat(this.searchForm.receiptRebateFir);
          this.searchForm.receiptRebateSec = parseFloat(this.searchForm.receiptRebateSec);
          this.searchForm.receiptRebateThi = parseFloat(this.searchForm.receiptRebateThi);
          this.searchForm.payRebate = parseFloat(this.searchForm.payRebate);
          this.searchForm.cashRebate = parseFloat(this.searchForm.cashRebate);
          this.searchForm.rebate = parseFloat(this.searchForm.rebate);

          API_Rule.updateExchangeRule(this.searchForm).then((res) => {
            if (res.result) {
              this.getData();
              this.$Message.success("修改成功！");
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
